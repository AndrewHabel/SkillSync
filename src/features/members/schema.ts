import {z} from "zod";
import { MemberRole } from "./types";

export const UpdateMemberSchema = z.object({
  name: z.string().trim().min(1,"Minimum 1 character required"),
  skills: z.string().transform((value) => 
    value.split(',').map(tech => tech.trim())
  ),
  role: z.nativeEnum(MemberRole).optional(),
  image: z.union([
        z.instanceof(File),
        z.string().transform((value) => value === "" ? undefined : value),
    ]).optional(),
});