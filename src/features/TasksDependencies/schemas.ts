import { z } from "zod";

const singleDependencySchema = z.object({
  taskId: z.string().trim().min(1, "Required"),
  dependOnTaskId: z.string().trim().min(1, "Required"),
  dependReason: z.string().optional(),
});

export const bulkCreateTDependencySchema= z.object({
  tasksDependencies: z.array(z.object({
    taskId: z.string().trim().min(1, "Required"),
    dependOnTaskId: z.string().trim().min(1, "Required"),
    dependOnTaskName: z.string().trim().min(1, "Required"),
    dependReason: z.string().optional(),
  }))
})
