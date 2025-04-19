import { Models } from "node-appwrite";
import { z } from "zod";
import { createTeamSchema } from "./schemas";

// Extract the valid team type values from the schema
type TeamType = z.infer<typeof createTeamSchema>["teamtype"];

export type Team = Models.Document & {
  workspaceId: string;
  projectId: string;
  teamtype: TeamType;
  membersId?: string[]; // Array of member IDs
};