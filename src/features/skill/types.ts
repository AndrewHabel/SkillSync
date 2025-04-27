import { z } from "zod";

export enum ExpertiseLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
  EXPERT = "EXPERT"
}

// Helper function to get display names for Expertise Level values
export const getExpertiseLevelDisplay = (level: ExpertiseLevel): string => {
  switch (level) {
    case ExpertiseLevel.BEGINNER: return "Beginner";
    case ExpertiseLevel.INTERMEDIATE: return "Intermediate";
    case ExpertiseLevel.ADVANCED: return "Advanced";
    case ExpertiseLevel.EXPERT: return "Expert";
    default: return String(level);
  }
}

export type Skill = {
  $id?: string,
  name: string,
  level: ExpertiseLevel,
  userId: string,
  workspaceId: string,
  createdAt?: string,
};
