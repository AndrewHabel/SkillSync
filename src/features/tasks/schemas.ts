import { z } from "zod";
import { TaskStatus, PreferredRole, ExpertiseLevel } from "./types";

export const createTaskSchema = z.object({
  name: z.string().min(1,"Required"),
  status: z.nativeEnum(TaskStatus, {required_error: "Required"}),
  workspaceId: z.string().trim().min(1, "Required"),
  projectId: z.string().trim().min(1, "Required"),
  dueDate: z.coerce.date().optional(),
  assigneeId: z.string().trim().optional(),
  description: z.string().optional(),
  estimatedHours: z.number().positive().optional(),
  preferredRole: z.nativeEnum(PreferredRole).optional(),
  expertiseLevel: z.nativeEnum(ExpertiseLevel).optional(),
})