import * as z from "zod";

export const CreateDatabaseSchema = z.object({
  name: z
    .string({ required_error: "Database Name is required" })
    .trim()
    .min(1, { message: "Database Name is required" }),
  encoding: z.string().optional(),
  collation: z.string().optional(),
});
