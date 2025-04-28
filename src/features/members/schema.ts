import {z} from "zod";
import { MemberRole } from "./types";

export const UpdateMemberSchema = z.object({
  name: z.string().trim().min(1,"Minimum 1 character required"),
  role: z.nativeEnum(MemberRole).optional(),
  image: z.union([
        z.instanceof(File),
        z.string().transform((value) => value === "" ? undefined : value),
    ]).optional(),
  gitHubToken: z.string().optional(),
});