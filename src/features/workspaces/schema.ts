import {z} from "zod";

export const createworkspaceSchema = z.object({
    name: z.string().trim().min(1,"Required"),
    image: z.union([
        z.instanceof(File),
        z.string().transform((value) => value === "" ? undefined : value),
    ])
    .optional(),
});



export const updateworkspaceSchema = z.object({
    name: z.string().trim().min(1,"Must be 1 or more characters").optional(),
    image: z.union([
        z.instanceof(File),
        z.string().transform((value) => value === "" ? undefined : value),
    ])
    .optional(),
});