import * as z from "zod";

export const ConnectionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["mysql"], {
    required_error: "Database Type is required",
  }),
  alias: z
    .string({ required_error: "Connection Alias is required" })
    .trim()
    .min(1, { message: "Connection Alias is required" }),
  host: z
    .string({ required_error: "Host is required" })
    .trim()
    .min(1, { message: "Host is required" }),
  port: z
    .string({ required_error: "Port is required" })
    .trim()
    .min(1, { message: "Port is required" }),
  user: z
    .string({ required_error: "User is required" })
    .trim()
    .min(1, { message: "User is required" }),
  password: z
    .string({ required_error: "Password is required" })
    .trim()
    .min(1, { message: "Password is required" }),
  database: z.string().optional(),
});

export const RawSchema = z.object({
  sql: z
    .string({ required_error: "SQL is required" })
    .trim()
    .min(1, { message: "SQL is required" }),
});

export const VariableSchema = z.object({
  variable: z
    .string({ required_error: "Variable is required" })
    .trim()
    .min(1, { message: "Variable is required" }),
});

export const GetCollationSchema = z.object({
  characterSet: z
    .string({ required_error: "CharacterSet is required" })
    .trim()
    .min(1, { message: "CharacterSet is required" }),
});
