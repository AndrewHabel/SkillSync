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
${userInput}

You are given a User Story and its associated Acceptance Criteria. Based on this information, generate a list of specific and actionable tasks required to fulfill the requirements.
Your output must follow this exact JSON format:

{
  "Task Titles": [
    "Task Title 1",
    "Task Title 2",
    ...
  ],
  "Task description": [
    "1. Detailed description of Task Title 1.",
    "2. Detailed description of Task Title 2.",
    ...
  ]
}

Guidelines:
1)Each task must be:

 Clear–Easy to understand.

 Actionable–Describes a specific piece of work that can be independently executed.

 Aligned–Directly supports the given User Story and its Acceptance Criteria.

2)Each task must be specific to one role only.
 If a task might apply to more than one role, split it into separate, role-specific tasks.

3)Only include tasks for the following roles if and only if they are explicitly required by the Acceptance Criteria:

Data Analyst

Frontend Developer

Security Specialist

UI Designer

Performance Engineer

Tester

Backend Developer

Database Administrator

DevOps Engineer

AI Specialist

Mobile Developer

UX Designer

Data Scientist

Business Analyst

4)Do not include tasks for any role not mentioned or implied in the Acceptance Criteria.

5)It is allowed for multiple tasks to be assigned to the same role — this is encouraged when appropriate.

6)All tasks must be uniformly formatted across both the "Task Titles" and "Task description" lists.
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