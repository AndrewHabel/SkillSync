import { z } from "zod";

export const createUserStorySchema = z.object({
  workspaceId: z.string().trim().min(1, "Required"),
  projectId: z.string().trim().min(1, "Required"),
  description: z.string().min(1,"Required"),
  AcceptanceCriteria: z.string().min(1,"Optional"),
})