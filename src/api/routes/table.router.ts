import { Response } from "@/api/core";
import { publicProcedure, router } from "@/api/core/server";
import { ConnectionSchema, ListTableSchema, TableSchema } from "@/schemas";
import { DBFactory } from "../services";

export const tableRouter = router({
  showTableStatus: publicProcedure
    .input(ConnectionSchema.merge(TableSchema))
    .query(async ({ ctx, input }) => {
      try {
        const { table, type, ...connection } = input;
        const factory = ctx.ioc.get(DBFactory);
        const db = await factory.create(type, connection);
        const res = await db.showTableStatus(table);
        return Response.ok(res);
      } catch (err) {
        console.error(err);
        return Response.fail(JSON.stringify(err));
      }
    }),
  showCreateTable: publicProcedure
    .input(ConnectionSchema.merge(TableSchema))
    .query(async ({ ctx, input }) => {
      try {
        const { table, type, ...connection } = input;
        const factory = ctx.ioc.get(DBFactory);
        const db = await factory.create(type, connection);
        const res = await db.showCreateTable(table);
        return Response.ok(res);
      } catch (err) {
        return Response.fail(JSON.stringify(err));
      }
    }),
  showColumns: publicProcedure
    .input(ConnectionSchema.merge(TableSchema))
    .query(async ({ ctx, input }) => {
      try {
        const { table, type, ...connection } = input;
        const factory = ctx.ioc.get(DBFactory);
        const db = await factory.create(type, connection);
        const res = await db.showColumns(table);
        return Response.ok(res);
      } catch (err) {
        console.error(err);
        return Response.fail(JSON.stringify(err));
      }
    }),
  list: publicProcedure
    .input(ConnectionSchema.merge(TableSchema.merge(ListTableSchema)))
    .query(async ({ ctx, input }) => {
      try {
        const { table, page, pageSize, type, ...connection } = input;
        const factory = ctx.ioc.get(DBFactory);
        const db = await factory.create(type, connection);
        const res = await db.queryTable(table, page, pageSize);
        return Response.ok(res);
      } catch (err) {
        console.error(err);
        return Response.fail(JSON.stringify(err));
      }
    }),
});
