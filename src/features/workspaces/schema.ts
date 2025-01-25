import {z} from "zod";

export const createworkspaceSchema = z.object({
    name: z.string().trim().min(1,"Required"),
});