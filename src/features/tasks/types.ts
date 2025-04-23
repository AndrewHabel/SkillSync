import { Models } from "node-appwrite";

export enum TaskStatus {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE"
};

export enum PreferredRole {
  DATA_ANALYST = "DATA_ANALYST",
  FRONTEND_DEVELOPER = "FRONTEND_DEVELOPER", 
  SECURITY_SPECIALIST = "SECURITY_SPECIALIST",
  UI_DESIGNER = "UI_DESIGNER",
  PERFORMANCE_ENGINEER = "PERFORMANCE_ENGINEER",
  TESTER = "TESTER",
  BACKEND_DEVELOPER = "BACKEND_DEVELOPER",
  DATABASE_ADMINISTRATOR = "DATABASE_ADMINISTRATOR",
  DEVOPS_ENGINEER = "DEVOPS_ENGINEER",
  AI_SPECIALIST = "AI_SPECIALIST",
  DATA_SCIENTIST = "DATA_SCIENTIST"
}

// Helper function to get display names for PreferredRole values
export const getPreferredRoleDisplay = (role: PreferredRole): string => {
  switch (role) {
    case PreferredRole.DATA_ANALYST: return "Data Analyst";
    case PreferredRole.FRONTEND_DEVELOPER: return "Frontend Developer";
    case PreferredRole.SECURITY_SPECIALIST: return "Security Specialist";
    case PreferredRole.UI_DESIGNER: return "UI Designer";
    case PreferredRole.PERFORMANCE_ENGINEER: return "Performance Engineer";
    case PreferredRole.TESTER: return "Tester";
    case PreferredRole.BACKEND_DEVELOPER: return "Backend Developer";
    case PreferredRole.DATABASE_ADMINISTRATOR: return "Database Administrator";
    case PreferredRole.DEVOPS_ENGINEER: return "DevOps Engineer";
    case PreferredRole.AI_SPECIALIST: return "AI Specialist";
    case PreferredRole.DATA_SCIENTIST: return "Data Scientist";
    default: return String(role);
  }
}

export type Task = Models.Document & {
  name: string,
  status: TaskStatus,
  workspaceId: string,
  assigneeId: string,
  position: string,
  dueDate: string,
  description?: string,
  projectId?: string,
  projectName?: string,
  assigneeName?: string,
  preferredRole?: PreferredRole
}