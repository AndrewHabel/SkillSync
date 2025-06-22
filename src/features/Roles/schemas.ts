import { z } from "zod";

export const createRoleSchema = z.object({
  workspaceId: z.string().trim().min(1, "Required"),
  roleName: z.string().trim().min(1, "Required"),
  manageProjects: z.boolean().optional(),
  manageTeams: z.boolean().optional(),
  manageUserStories: z.boolean().optional(),
  manageTasks: z.boolean().optional(),
  manageAnalytics: z.boolean().optional(),
});