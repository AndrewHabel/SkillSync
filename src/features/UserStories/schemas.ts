import { z } from "zod";
import { TaskStatus } from "../tasks/types";

export const createUserStorySchema = z.object({
  workspaceId: z.string().trim().min(1, "Required"),
  projectId: z.string().trim().min(1, "Required"),
  description: z.string().min(1,"Required"),
  AcceptanceCriteria: z.string().min(1,"Optional"),
})

export const bulkCreateTasksSchema = z.object({
  tasks: z.array(z.object({
    name: z.string().min(1,"Required"),
    description: z.string().optional(),
    status: z.nativeEnum(TaskStatus).optional().nullable(),
    workspaceId: z.string().trim().min(1, "Required"),
    projectId: z.string().trim().min(1, "Required"),
    assigneeId: z.string().trim().optional().nullable(),
    dueDate: z.coerce.date().optional().nullable(),
    position: z.number().optional().default(1000)
  }))
})