import * as z from "zod";

export const FileSchema = z.object({
  path: z
    .string({ required_error: "Path is required" })
    .trim()
    .min(1, { message: "Path is required" }),
});

export const CreateFileSchema = z.object({
  isFolder: z.boolean().default(false),
});

export const RenameFileSchema = z.object({
  newPath: z
    .string({ required_error: "New Path is required" })
    .trim()
    .min(1, { message: "New Path is required" }),
});

export const JoinFileSchema = z.object({
  paths: z
    .string({ required_error: "Paths is required" })
    .array()
    .min(1, { message: "Paths is required" }),
});
