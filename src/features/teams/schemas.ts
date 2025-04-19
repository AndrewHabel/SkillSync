import { z } from "zod";

export const createTeamSchema = z.object({
  workspaceId: z.string().trim().min(1, "Required"),
  projectId: z.string().trim().min(1, "Required"),
  teamtype: z.enum([
    "Data Analytics Team",
    "Frontend Team",
    "Security Specialist Team",
    "User interface Team",
    "Performance Engineering Team",
    "Testing Team",
    "Backend Team",
    "Database Administration Team",
    "DevOps Team",
    "AI Specialist Team",
    "Data Scientist Team",
  ], {
    required_error: "Team type is required",
  }),
  membersId: z.array(z.string()).optional()
});

export const updateTeamSchema = createTeamSchema.partial();