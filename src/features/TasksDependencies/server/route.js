import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
      const { tasks } = c.req.valid("json");      if (!tasks) {
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
    }
  );

export default app;