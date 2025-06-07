import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createAdminClient } from "@/lib/appwrite";
import { DATABASE_ID, MEMBERS_ID, TASKS_ID, PROJECTS_ID, WORKSPACES_ID, TEAMS_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { Query } from "node-appwrite";
import { sendAssignEmail } from "@/lib/sendEmail";
import { mapRoleToTeamType } from "@/features/teams/utils/map-role-to-team";

// Fix for inconsistent environment variable naming
const SKILLS_ID = process.env.NEXT_PUBLIC_APPWRITE_Skill_ID || process.env.NEXT_PUBLIC_APPWRITE_SKILLS_ID || "680e59520027d6694ab7"; // Fallback to the actual ID we found in .env.local

// Schema for auto-assign task request
const autoAssignTaskSchema = z.object({
  taskId: z.string().min(1, "Task ID is required")
});

const app = new Hono()
  .post(
    "/auto-assign", // Keep endpoint as "/auto-assign"
    sessionMiddleware,
    zValidator("json", autoAssignTaskSchema),
    async (c) => {
      const { taskId } = c.req.valid("json");
      const user = c.get("user");
      const databases = c.get("databases");
      const { users } = await createAdminClient();

      try {
        // Get the task
        const task = await databases.getDocument(
          DATABASE_ID,
          TASKS_ID,
          taskId
        );
        
        // Verify user has permission to this workspace
        const member = await getMember({
          databases,
          workspaceId: task.workspaceId,
          userId: user.$id
        });

        if (!member) {
          return c.json({ error: "Unauthorized" }, 401);
        }
          // Check if task has preferred role
        if (!task.preferredRole) {
          return c.json({ error: "Task must have a preferred role to use auto-assign" }, 400);
        }

        // Check if task belongs to a project
        if (!task.projectId) {
          return c.json({ error: "Task must belong to a project to use auto-assign" }, 400);
        }
        
        // Get the team type that matches the task's preferred role
        const teamType = mapRoleToTeamType(task.preferredRole);
        
        if (!teamType) {
          return c.json({ error: "No matching team type found for this role" }, 404);
        }
        
        // Find the specific team for this project and team type
        const teams = await databases.listDocuments(
          DATABASE_ID,
          TEAMS_ID,
          [
            Query.equal("projectId", task.projectId),
            Query.equal("teamtype", teamType)
          ]
        );
        
        if (teams.documents.length === 0) {
          return c.json({ 
            error: `No "${teamType}" exists in this project`,
            details: "Please create the required team before using auto-assign"
          }, 404);
        }
        
        const team = teams.documents[0];
        
        // Check if the team has any members
        if (!team.membersId || team.membersId.length === 0) {
          return c.json({ 
            error: `The ${teamType} has no members`,
            details: "Please add team members to the team before using auto-assign"
          }, 404);
        }
          // Get details of all members in the team
        // We need to fetch members one by one since the team membersId array contains member IDs
        const memberPromises = team.membersId.map((memberId: string) => 
          databases.getDocument(DATABASE_ID, MEMBERS_ID, memberId)
            .catch(err => {
              console.error(`Failed to fetch member ${memberId}:`, err);
              return null;
            })
        );
        
        const teamMembersResults = await Promise.all(memberPromises);
        const teamMembers = {
          // Filter out any null results from failed fetches
          documents: teamMembersResults.filter(member => member !== null)
        };
        
        if (teamMembers.documents.length === 0) {
          return c.json({ 
            error: `No valid team members found in ${teamType}`, 
            details: "Team exists but members may have been removed" 
          }, 404);
        }// Get skills for all members
        let allSkills;
        try {
          allSkills = await databases.listDocuments(
            DATABASE_ID,
            SKILLS_ID,
            []
          );
        } catch (error) {
          console.error("Error fetching skills:", error);
          console.error("SKILLS_ID value:", SKILLS_ID);
          // Still continue even if we can't fetch skills
          allSkills = { documents: [] };
        }

        // Get all tasks to calculate workload and performance scores
        const allTasks = await databases.listDocuments(
          DATABASE_ID,
          TASKS_ID,
          []
        );

        // Prepare team members data with skills and workloads for AI
        const teamMembersData = await Promise.all(
          teamMembers.documents.map(async (member) => {
            // Get user details
            const userDetails = await users.get(member.userId);
            
            // Get member skills
            const memberSkills = allSkills.documents
              .filter(skill => skill.userId === member.$id)
              .map(skill => ({
                name: skill.skillname,
                level: skill.experienceLevel
              }));
            
            // Calculate workload
            const memberTasks = allTasks.documents.filter(t => t.assigneeId === member.$id);
            
            // Calculate total assigned hours
            const totalAssignedHours = memberTasks.reduce((total, t) => total + (t.estimatedHours || 0), 0);
            
            // Count tasks by status
            const todoTasks = memberTasks.filter(t => t.status === "TODO").length;
            const inProgressTasks = memberTasks.filter(t => t.status === "IN_PROGRESS").length;
            const completedTasks = memberTasks.filter(t => t.status === "DONE").length;
            
            // Simple performance score calculation
            const totalTasks = memberTasks.length;
            const performanceScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            return {
              id: member.$id,
              name: userDetails.name || userDetails.email.split('@')[0],
              email: userDetails.email,
              skills: memberSkills,
              workload: {
                totalAssignedHours,
                todoTasks,
                inProgressTasks,
                completedTasks
              },
              performanceScore
            };
          })
        );

        // Get task details
        const taskDetails = {
          id: task.$id,
          name: task.name,
          description: task.description || "",
          preferredRole: task.preferredRole,
          expertiseLevel: task.expertiseLevel || "BEGINNER",
          estimatedHours: task.estimatedHours || 0
        };

        // Call the Gemini API to select the best member
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) {
          return c.json({ error: "API key is missing" }, 500);
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });        // Create a structured prompt for Gemini
        const prompt = `
        You are an AI task assignment system for a project management tool. 
        Your job is to analyze team members' skills, workload, and past performance 
        to assign a task to the most suitable team member from a specific project team.

        Task details:
        ${JSON.stringify(taskDetails, null, 2)}

        Team type: ${teamType}
        
        Team members data (all from ${teamType}):
        ${JSON.stringify(teamMembersData, null, 2)}

        Based on the following criteria:
        1. Skills match: Does the member have skills relevant to the task's preferred role?
        2. Experience level: Does the member's skill level match the task's required expertise?
        3. Current workload: How many tasks and estimated hours does the member already have?
        4. Past performance: How well has the member completed tasks previously?

        Select the most suitable team member for this task and explain your reasoning.
        Include in your reasoning why this member from the ${teamType} is specifically qualified for this task.

        IMPORTANT: Return your response as a valid JSON object WITHOUT markdown formatting, code blocks, or backticks.
        Do not wrap the JSON in \`\`\` markers. Just return plain JSON as follows:
        
        {
          "selectedMemberId": "string",
          "reasoning": "string"
        }
        
        Your response must be parseable by JavaScript's JSON.parse() function.
        `;const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        console.log("Original AI response:", responseText);
        
        try {
          // Clean up the response text to handle markdown code blocks
          let cleanedResponse = responseText;
          
          // Remove markdown code fences if present
          if (responseText.includes('```')) {
            cleanedResponse = responseText.replace(/```json|```/g, '').trim();
          }
          
          // Further clean the response to ensure it's valid JSON
          // Sometimes the model might include explanatory text before or after the JSON
          const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            cleanedResponse = jsonMatch[0];
          }
          
          console.log("Cleaned AI response:", cleanedResponse);
          
          // Parse AI response
          const aiResponse = JSON.parse(cleanedResponse);
          
          // Validate required fields
          if (!aiResponse.selectedMemberId) {
            throw new Error("AI response is missing selectedMemberId");
          }
          
          const selectedMemberId = aiResponse.selectedMemberId;
          
          // Verify the selected member exists
          const selectedMember = teamMembersData.find(m => m.id === selectedMemberId);
          
          if (!selectedMember) {
            return c.json({ error: "AI selected an invalid team member" }, 400);
          }
          
          // Update the task with the selected assignee
          const updatedTask = await databases.updateDocument(
            DATABASE_ID,
            TASKS_ID,
            taskId,
            { assigneeId: selectedMemberId }
          );
            // Get workspace details for email
          const workspace = await databases.getDocument(
            DATABASE_ID,
            WORKSPACES_ID,
            task.workspaceId
          );
            // Get project details for email
          const project = await databases.getDocument(
            DATABASE_ID,
            PROJECTS_ID,
            task.projectId
          );
          
          // Send assignment email
          await sendAssignEmail(
            selectedMember.email,
            selectedMember.name,
            task.name,
            workspace.name,
            project.name,
            task.dueDate || "",
            task.workspaceId,
            task.$id
          );
          
          return c.json({ 
            data: {
              ...updatedTask,
              assignee: {
                $id: selectedMember.id,
                name: selectedMember.name,
                email: selectedMember.email
              },
              aiReasoning: aiResponse.reasoning
            }
          });
            } catch (error) {
          console.error("Error parsing AI response:", error);
          console.error("Original AI response:", responseText);
          
          // Try to extract just the JSON part using regex as a fallback
          try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const jsonString = jsonMatch[0];
              console.log("Attempting to parse extracted JSON:", jsonString);
              
              const aiResponse = JSON.parse(jsonString);
              const selectedMemberId = aiResponse.selectedMemberId;
              
              // Continue with the same logic as above
              const selectedMember = teamMembersData.find(m => m.id === selectedMemberId);
              
              if (!selectedMember) {
                return c.json({ error: "AI selected an invalid team member" }, 400);
              }
              
              // Update the task with the selected assignee
              const updatedTask = await databases.updateDocument(
                DATABASE_ID,
                TASKS_ID,
                taskId,
                { assigneeId: selectedMemberId }
              );
              
              // Get workspace details for email
              const workspace = await databases.getDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                task.workspaceId
              );
              
              // Get project details for email
              const project = await databases.getDocument(
                DATABASE_ID,
                PROJECTS_ID,
                task.projectId
              );
              
              // Send assignment email
              await sendAssignEmail(
                selectedMember.email,
                selectedMember.name,
                task.name,
                workspace.name,
                project.name,
                task.dueDate || "",
                task.workspaceId,
                task.$id
              );
              
              return c.json({ 
                data: {
                  ...updatedTask,
                  assignee: {
                    $id: selectedMember.id,
                    name: selectedMember.name,
                    email: selectedMember.email
                  },
                  aiReasoning: aiResponse.reasoning
                }
              });
            }
          } catch (secondError) {
            console.error("Second attempt to parse JSON failed:", secondError);
          }
          
          // If all parsing attempts fail, return error
          return c.json({ error: "Failed to parse AI response" }, 500);
        }
          } catch (error) {
        console.error("Auto-assign error:", error);
        // Provide more specific error message if available
        const errorMessage = error instanceof Error ? error.message : "Failed to auto-assign task";
        return c.json({ 
          error: errorMessage,
          details: error instanceof Error ? error.stack : undefined
        }, 500);
      }
    }
  );

export default app;
