import * as z from "zod";

export const TableSchema = z.object({
  table: z
    .string({ required_error: "Table name is required" })
    .trim()
    .min(1, { message: "Table name is required" }),
});

export const ListTableSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).default(1000),
});
