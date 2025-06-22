import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createSessionClient } from "@/lib/appwrite";
import { ID, Query } from "node-appwrite";
import { bulkCreateTDependencySchema } from "../schemas";
import { DATABASE_ID, TASKS_DEPENDENCIES_ID } from "@/config";

const app = new Hono()
  .post(
    "/",
    sessionMiddleware,    zValidator("json", z.object({ 
      tasks: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        workspaceId: z.string(),
        projectId: z.string().optional()
      }))
    })),
    async (c) => {
      const { tasks } = c.req.valid("json");      
      if (!tasks) {
        return c.json({ error: "Tasks data is required" }, 400);
      }

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        return c.json({ error: "API key is missing" }, 500);
      }

      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });        

        const prompt = `
Analyze the following tasks and identify dependencies between them.
For each task, determine which other tasks it depends on (prerequisite tasks that must be completed before this task can start).
Include a reason for each dependency relationship to explain why the task depends on another task.

Return the results as a JSON array with the following format:
[
  {
    "taskId": "task1-id",
    "dependencies": [
      {
        "dependsOnTaskId": "dependent-task-id-1",
        "reason": "Clear explanation of why this dependency exists"
      },
      {
        "dependsOnTaskId": "dependent-task-id-2", 
        "reason": "Clear explanation of why this dependency exists"
      }
    ]
  }
]

Tasks:
${JSON.stringify(tasks, null, 2)}
`;        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Parse the response from text to JSON object
        try {
          // Look for a JSON array in the response
          const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
          
          if (jsonMatch) {
            // Parse the JSON string into an actual JavaScript object
            const parsedData = JSON.parse(jsonMatch[0]);
            // Return the parsed data object
            return c.json({ data: parsedData });
          } else {
            console.error("Could not find valid JSON array in response");
            return c.json({ error: "Failed to parse dependencies" }, 500);
          }
        } catch (error) {
          console.error("Error parsing JSON from AI response:", error);
          // If parsing fails, return the raw text for debugging
          return c.json({ error: "Failed to parse JSON", rawResponse: responseText }, 500);
        }
      } catch (error) {
        console.error("Gemini API Error:", error);
        return c.json({ error: "Internal Server Error" }, 500);
      }
    })
  .post(
    "/save-dependencies",
    sessionMiddleware,
    zValidator("json", bulkCreateTDependencySchema),
    async (c) => {
      const { tasksDependencies } = c.req.valid("json");
    
      try {
        const { user } = c.get("user");

        const databases = c.get("databases");
        
        // Create array to track successful and failed operations
        const results = {
          success: [],
          failed: []
        };
        
        console.log("Saving task dependencies:", tasksDependencies);

        // Process each dependency in the array
        for (const dependency of tasksDependencies) {
          try {
            // Create the dependency record in the database
            const createdDependency = await databases.createDocument(
              DATABASE_ID,
              TASKS_DEPENDENCIES_ID,
              ID.unique(),
              {
                taskId: dependency.taskId,
                dependOnTaskId: dependency.dependOnTaskId,
                dependReason: dependency.dependReason || "",
                dependOnTaskName: dependency.dependOnTaskName || "",
              }
            );
            
            results.success.push({
              id: createdDependency.$id,
              taskId: dependency.taskId,
              dependOnTaskId: dependency.dependOnTaskId
            });
          } catch (error) {
            console.error("Error creating dependency:", error);
            results.failed.push({
              taskId: dependency.taskId,
              dependOnTaskId: dependency.dependOnTaskId,
              error: error.message
            });
          }
        }
        
        return c.json({
          message: "Task dependencies processed",
          results
        }, results.failed.length > 0 ? 207 : 201);
      } catch (error) {
        console.error("Error saving dependencies:", error);
        return c.json({ error: "Failed to save task dependencies" }, 500);
      }
    }
  )
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({
      taskId: z.string().optional(),
      workspaceId: z.string().optional(),
      projectId: z.string().optional()
    })),
    async (c) => {
      try {
        const { taskId, workspaceId, projectId } = c.req.valid("query");
        const databases = c.get("databases");
        
        console.log("Fetching task dependencies with parameters:", { taskId, workspaceId, projectId });

        let queries = [];
        
        if (taskId) {
           queries.push(Query.equal('taskId', taskId));
        }

        if (workspaceId || projectId) {
          console.log(`Filtering by workspace: ${workspaceId}, project: ${projectId}`);
        }

        console.log("Queries to be executed:", queries);
        
        const dependencies = await databases.listDocuments(
          DATABASE_ID,
          TASKS_DEPENDENCIES_ID,
          queries
        );
        
        return c.json({ 
          data: dependencies.documents,
          total: dependencies.total
        });
      } catch (error) {
        console.error("Error fetching dependencies:", error);
        return c.json({ error: "Failed to retrieve task dependencies" }, 500);
      }
    }
  )
  .post(
    "/bulk-get",
    sessionMiddleware,
    zValidator("json", z.object({
      taskIds: z.array(z.string())
    })),
    async (c) => {
      try {
        const { taskIds } = c.req.valid("json");
        
        if (!taskIds || taskIds.length === 0) {
          return c.json({ error: "At least one task ID is required" }, 400);
        }
        
        const databases = c.get("databases");
        
        const dependenciesMap = {};

        taskIds.forEach(taskId => {
          dependenciesMap[taskId] = {
            dependsOn: [],
            dependedOnBy: []
          };
        });
        
        const dependsOnQueries = taskIds.map(taskId => ({
          field: "taskId",
          operator: "equal",
          value: taskId
        }));
        
        // Query for dependencies where other tasks depend on any of these tasks
        const dependedOnByQueries = taskIds.map(taskId => ({
          field: "dependOnTaskId",
          operator: "equal",
          value: taskId
        }));

        const [dependsOnResults, dependedOnByResults] = await Promise.all([
          databases.listDocuments(DATABASE_ID, TASKS_DEPENDENCIES_ID, { 
            queries: dependsOnQueries.length > 1 ? [{ 
              operator: "or", 
              queries: dependsOnQueries 
            }] : dependsOnQueries 
          }),
          databases.listDocuments(DATABASE_ID, TASKS_DEPENDENCIES_ID, { 
            queries: dependedOnByQueries.length > 1 ? [{ 
              operator: "or", 
              queries: dependedOnByQueries 
            }] : dependedOnByQueries
          })
        ]);
        
        // Organize the results into the map
        dependsOnResults.documents.forEach(dep => {
          if (dependenciesMap[dep.taskId]) {
            dependenciesMap[dep.taskId].dependsOn.push(dep);
          }
        });
        
        dependedOnByResults.documents.forEach(dep => {
          if (dependenciesMap[dep.dependOnTaskId]) {
            dependenciesMap[dep.dependOnTaskId].dependedOnBy.push(dep);
          }
        });
        
        return c.json({
          data: dependenciesMap,
          counts: {
            dependsOn: dependsOnResults.total,
            dependedOnBy: dependedOnByResults.total
          }
        });
      } catch (error) {
        console.error("Error fetching bulk dependencies:", error);
        return c.json({ error: "Failed to retrieve bulk task dependencies" }, 500);
      }
    }
  )
  .delete(
    "/:dependencyId",
    sessionMiddleware,
    async (c) => {
      try {
        const dependencyId = c.req.param("dependencyId");
        
        if (!dependencyId) {
          return c.json({ error: "Dependency ID is required" }, 400);
        }
        
        const databases = c.get("databases");
        
        // Delete the specified dependency
        await databases.deleteDocument(
          DATABASE_ID,
          TASKS_DEPENDENCIES_ID,
          dependencyId
        );
        
        return c.json({
          message: "Task dependency successfully deleted",
          deletedId: dependencyId
        }, 200);
      } catch (error) {
        console.error(`Error deleting dependency ${c.req.param("dependencyId")}:`, error);
        return c.json({ error: "Failed to delete task dependency" }, 500);
      }
    }
  )

export default app;