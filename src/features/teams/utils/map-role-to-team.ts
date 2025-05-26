import { PreferredRole } from "@/features/tasks/types";

/**
 * Maps a PreferredRole enum value to the corresponding team type string
 * @param role The PreferredRole enum value
 * @returns The corresponding team type string used in team schemas
 */
export const mapRoleToTeamType = (role?: PreferredRole): string | undefined => {
  if (!role) return undefined;

  const roleToTeamMap: Record<PreferredRole, string> = {
    [PreferredRole.DATA_ANALYST]: "Data Analytics Team",
    [PreferredRole.FRONTEND_DEVELOPER]: "Frontend Team", 
    [PreferredRole.SECURITY_SPECIALIST]: "Security Specialist Team",
    [PreferredRole.UI_DESIGNER]: "User interface Team",
    [PreferredRole.PERFORMANCE_ENGINEER]: "Performance Engineering Team",
    [PreferredRole.TESTER]: "Testing Team",
    [PreferredRole.BACKEND_DEVELOPER]: "Backend Team",
    [PreferredRole.DATABASE_ADMINISTRATOR]: "Database Administration Team",
    [PreferredRole.DEVOPS_ENGINEER]: "DevOps Team",
    [PreferredRole.AI_SPECIALIST]: "AI Specialist Team",
    [PreferredRole.DATA_SCIENTIST]: "Data Scientist Team"
  };

  return roleToTeamMap[role];
};
