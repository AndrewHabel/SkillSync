import {z} from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  image: z.union([
    z.instanceof(File),
    z.string().transform((value) => (value === "" ? undefined : value)),
  ]).optional(),
  workspaceId: z.string(),
  ProjectTechStack: z.string().transform((value) => 
    value.split(',').map(tech => tech.trim()) // Split by comma and trim whitespace
  ),
});

export const UpdateProjectSchema = z.object({
  name: z.string().trim().min(1,"Minimum 1 character required").optional(),
  image: z.union([
      z.instanceof(File),
      z.string().transform((value) => value === "" ? undefined : value),
  ])
  .optional()
});