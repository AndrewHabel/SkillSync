import {z} from 'zod';
import { ExpertiseLevel } from './types';

export const createSkillSchema = z.object({
    userId: z.string().min(1, "Required"),
    skillName: z.string().trim().min(1, "Required"),
    experienceLevel: z.nativeEnum(ExpertiseLevel),
});

export const bulkCreateSkillSchema = z.object({
  workspaceId: z.string().trim().min(1, "Required"),
  skills: z.array(z.object({
    userId: z.string().min(1, "Required"),
    skillName: z.string().trim().min(1, "Required"),
    experienceLevel: z.nativeEnum(ExpertiseLevel),
  }))
})
