import {z} from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  image: z.union([
    z.instanceof(File),
    z.string().transform((value) => (value === "" ? undefined : value)),
  ]).optional(),
  workspaceId: z.string(),
  description: z.string().trim().optional(),
  ProjectTechStack: z.union([
    z.string().transform((value) => 
      value ? value.split(',').map(tech => tech.trim()) : []
    ),
    z.array(z.string())
  ]),
});

export const UpdateProjectSchema = z.object({
  name: z.string().trim().min(1,"Minimum 1 character required").optional(),
  image: z.union([
      z.instanceof(File),
      z.string().transform((value) => value === "" ? undefined : value),
  ])
  .optional(),
  description: z.string().trim().optional(),
  ProjectTechStack: z.union([
    z.string().transform((value) => 
      value ? value.split(',').map(tech => tech.trim()) : []
    ),
    z.array(z.string())
  ]).optional(),
});