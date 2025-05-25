import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = new Hono()
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", z.object({ userInput: z.string() })),
    async (c) => {
      const { userInput } = c.req.valid("json");

      if (!userInput) {
        return c.json({ error: "User input is required" }, 400);
      }

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        return c.json({ error: "API key is missing" }, 500);
      }

      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        // Create a structured prompt with the user input and specific instructions
        const prompt = `
Task Name: ${userInput.split('\n')[0]}
Task Description: ${userInput.split('\n').slice(1).join('\n')}

Based on the task name and description above, provide the following information:
- The most appropriate preferred role for this task
- The expertise level required for this task (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
- Estimated hours to complete the task (a reasonable number between 1 and 40 hours)

Format your response as a valid JSON object with the following structure:
{
  "preferredRole": "string",
  "expertiseLevel": "string",
  "estimatedHours": number
}

Guidelines:
- Determine the most appropriate role from: Frontend Developer, Backend Developer, UI Designer, Database Administrator, DevOps Engineer, Tester, Security Specialist, AI Specialist, Data Scientist, Performance Engineer, Data Analyst
- Select an expertise level based on the complexity of the task (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
- Provide a realistic estimate of how many hours it would take someone with the specified expertise level to complete this task

Return only the JSON object with no additional text or explanation.
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return c.json({ data: { response: responseText } });
      } catch (error) {
        console.error("Gemini API Error:", error);
        return c.json({ error: "Internal Server Error" }, 500);
      }
    }
  );

export default app;