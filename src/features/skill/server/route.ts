import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { DATABASE_ID, MEMBERS_ID, SKILLS_ID } from "@/config";
import { ID, Query } from "node-appwrite";

import { ExpertiseLevel, Skill } from "../types";
import { bulkCreateSkillSchema } from "../schema";
import { getMember } from "@/features/members/utils";

const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        zValidator("query", z.object({
            workspaceId: z.string(),
            userId: z.string().optional()
        })),
        async (c) => {
            const {users} = await createAdminClient();
            const databases = c.get("databases");
            const user = c.get("user");
            const { workspaceId, userId } = c.req.valid("query");

            const member = await getMember({
                databases,
                workspaceId: workspaceId,
                userId: user.$id,
            })

            if (!member) {
                return c.json({ error: "Member not found" }, 404);
            }

            let filters: any[] = [];
                
            if (userId) {
                console.log("Filtering skills for specific user:", userId);
                filters.push(Query.equal("userId", userId));
            } else {
                try {
                    const workspaceMembers = await databases.listDocuments(
                        DATABASE_ID,
                        MEMBERS_ID,
                        [Query.equal("workspaceId", workspaceId)]
                    );
                    
                    console.log("Workspace members:", workspaceMembers.documents);

                    if (workspaceMembers.documents.length > 0) {
                        // Extract all userIds from the workspace members
                        const memberUserIds = workspaceMembers.documents.map(member => member.$id);
                        
                        console.log("Member userIds:", memberUserIds);

                        if (memberUserIds.length === 1) {
                            filters.push(Query.equal("userId", memberUserIds[0]));
                        } else if (memberUserIds.length > 1) {
                            
                            try {
                                
                                filters = [Query.equal("userId", memberUserIds)];
                            } catch (error) {
                                console.error("Error creating multi-value filter, falling back to multiple filters:", error);
                                
                                const userIdFilters = memberUserIds.map(userId => 
                                    Query.equal("userId", userId)
                                );
                                
                                if (userIdFilters.length > 0) {
                                    filters.push(...userIdFilters);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error fetching workspace members:", error);
                    return c.json({ error: "Failed to fetch workspace members" }, 500);
                }
            }

            console.log("Final filters:", filters);

            if (filters.length === 0) {
                console.log("No filters specified, returning empty results");
                return c.json({ data: { documents: [], total: 0 } });            }              // Use client-side pagination to get all skills
            // Start with a large limit to minimize the number of requests
            filters.push(Query.limit(1000)); // Maximum limit per request
            
            // First request to get initial set of skills and total count
            const initialResults = await databases.listDocuments(
                DATABASE_ID,
                SKILLS_ID,
                filters
            );

            let skills = initialResults;
            const totalSkills = initialResults.total;
            
            // If we have more skills than our limit can fetch in one go, fetch the rest
            if (totalSkills > 1000) {
                console.log(`Found ${totalSkills} skills, need to fetch remaining ${totalSkills - 1000} skills with pagination`);
                
                // Create an array to hold all documents
                const allSkillDocuments = [...initialResults.documents];
                
                // Fetch remaining pages
                for (let offset = 1000; offset < totalSkills; offset += 1000) {
                    // Clone the filters array and add offset
                    const pageFilters = [...filters.filter(f => !f.toString().includes('limit'))];
                    pageFilters.push(Query.limit(1000));
                    pageFilters.push(Query.offset(offset));
                    
                    const nextPage = await databases.listDocuments(
                        DATABASE_ID,
                        SKILLS_ID,
                        pageFilters
                    );
                    
                    // Add documents to our collection
                    allSkillDocuments.push(...nextPage.documents);
                }
                
                // Replace the documents in our skills object with the complete set
                skills = {
                    ...initialResults,
                    documents: allSkillDocuments
                };
                
                console.log(`Successfully fetched all ${allSkillDocuments.length} skills`);
            }            console.log(`Skills result: Total ${skills.total}, Fetched ${skills.documents.length} documents`);
            
            return c.json({ data: skills });
        }
    )        
   .post(
        "/bulk-create",
        sessionMiddleware,
        zValidator("json", bulkCreateSkillSchema),
        async (c) => {
            const databases = c.get("databases");
            const { skills , workspaceId} = c.req.valid("json");
            
            console.log(skills);

            // Process each skill
            const createdSkills = await Promise.all(
                skills.map(async (skill) => {
                    // Check if a skill with the same name already exists for this user
                    const existingSkills = await databases.listDocuments(
                        DATABASE_ID,
                        SKILLS_ID,
                        [
                            Query.equal("skillname", skill.skillName),
                            Query.equal("userId", skill.userId),
                        ]
                    );

                    if (existingSkills.documents.length > 0) {
                        // Update the existing skill
                        return await databases.updateDocument(
                            DATABASE_ID,
                            SKILLS_ID,
                            existingSkills.documents[0].$id,
                            {
                                experienceLevel: skill.experienceLevel
                            }
                        );
                    } else {
                        // Create a new skill document
                        return await databases.createDocument(
                            DATABASE_ID,
                            SKILLS_ID,
                            ID.unique(),
                            {
                                skillname: skill.skillName,
                                userId: skill.userId,
                                experienceLevel: skill.experienceLevel,
                            }
                        );
                    }
                })
            );

            return c.json({ data: { success: true, count: createdSkills.length } });
        }
    )
    .delete(
        "/:skillId",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases");
            const { skillId } = c.req.param();
            const user = c.get("user");  

            const members = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [Query.equal("userId", user.$id)]
            );
            
            const member = members.documents[0];

            const skill = await databases.getDocument(
                DATABASE_ID,
                SKILLS_ID,
                skillId
            );

            console.log(skill.userId) 
            console.log(user.$id)
            // Verify the user owns the skill
            if (skill.userId !== member.$id) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            // Delete the skill
            await databases.deleteDocument(
                DATABASE_ID,
                SKILLS_ID,
                skillId
            );

            return c.json({ data: { success: true } });
        }
    );

export default app;