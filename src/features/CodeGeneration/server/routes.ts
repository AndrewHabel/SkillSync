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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });        // Create a structured prompt with the user input and specific instructions
        const prompt = `
Task Description:
${userInput}

You are an expert software engineer. Based on the task description above, generate a detailed implementation plan specifically tailored to the technology stack mentioned.

Requirements:
1. Return your response as a valid JSON object with the following structure:
{
  "taskName": "string",
  "techStack": "string",
  "steps": [
    {
      "stepNumber": number,
      "stepTitle": "string",
      "description": "string",
      "code": "string"
    }
  ]
}

2. Guidelines:
- PRIORITIZE PROVIDING CODE in every step possible. Users strongly prefer code implementations over explanations.
- Provide clear, numbered steps in chronological order
- Each step should have a descriptive title and detailed explanation
- For all tasks (even if they seem like planning or research tasks):
  - Provide practical, executable code that follows the specific tech stack's best practices
  - Include all necessary imports and dependencies
  - The code should be placed inside the "code" field as a plain string (no markdown formatting)
  - Ensure code is complete, runnable, and follows real-world implementation patterns
- Only if the step absolutely cannot be addressed with code:
  - Still try to provide code templates, examples, or boilerplate that would be useful
  - Use the "code" field for executable examples where possible, not just comments
  - When code absolutely isn't applicable, include detailed implementation guidance
- Analyze if the specified tech stack is appropriate for the task
- Do not include any additional commentary or markdown outside the JSON structure
- Follow best practices for the specified technology stack
- Use modern patterns and approaches compatible with the tech stack
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return c.json({ data: { response: responseText } });
      } catch (error) {
        console.error("Gemini API Error:", error);
        return c.json({ error: "Internal Server Error" }, 500);
      }
    }
  )

  export default app;