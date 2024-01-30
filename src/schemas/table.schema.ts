import * as z from "zod";

export const TableSchema = z.object({
  table: z
    .string({ required_error: "Table name is required" })
    .trim()
    .min(1, { message: "Table name is required" }),
});

export const QueryTableSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).default(1000),
});

export const CreateTableSchema = z.object({
  name: z
    .string({ required_error: "Table Name is required" })
    .trim()
    .min(1, { message: "Table Name is required" }),
  encoding: z.string().optional(),
  collation: z.string().optional(),
  engine: z.string().optional(),
});

export const RenameTableSchema = z.object({
  table: z
    .string({ required_error: "Table Name is required" })
    .trim()
    .min(1, { message: "Table Name is required" }),
  name: z
    .string({ required_error: "New Table Name is required" })
    .trim()
    .min(1, { message: "New Table Name is required" }),
});
