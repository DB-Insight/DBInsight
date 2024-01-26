import { Response } from "@/api/core";
import { publicProcedure, router } from "@/api/core/server";
import { ConnectionSchema, RawSchema } from "@/schemas";
import { DBFactory } from "../services";

export const connectionRouter = router({
  ping: publicProcedure
    .input(ConnectionSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { type, ...connection } = input;
        const factory = ctx.ioc.get(DBFactory);
        const db = await factory.create(type, connection);
        await db.ping();
        return Response.ok();
      } catch (err) {
        console.error(err);
        return Response.fail(JSON.stringify(err));
      }
    }),
  connect: publicProcedure
    .input(ConnectionSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { type, ...connection } = input;
        const factory = ctx.ioc.get(DBFactory);
        const db = await factory.create(type, connection);
        return Response.ok(await db.getVersion());
      } catch (err) {
        console.error(err);
        return Response.fail(JSON.stringify(err));
      }
    }),
  showDatabases: publicProcedure
    .input(ConnectionSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { type, ...connection } = input;
        const factory = ctx.ioc.get(DBFactory);
        const db = await factory.create(type, connection);
        return Response.ok(await db.showDatabases());
      } catch (err) {
        console.error(err);
        return Response.fail(JSON.stringify(err));
      }
    }),
  showTables: publicProcedure
    .input(ConnectionSchema)
    .query(async ({ ctx, input }) => {
      if (!input.database) {
        return Response.fail("Database is required");
      }
      try {
        const { type, ...connection } = input;
        const factory = ctx.ioc.get(DBFactory);
        const db = await factory.create(type, connection);
        return Response.ok(await db.showTables());
      } catch (err) {
        console.error(err);
        return Response.fail(JSON.stringify(err));
      }
    }),
  raw: publicProcedure
    .input(ConnectionSchema.merge(RawSchema))
    .query(async ({ ctx, input }) => {
      try {
        const { type, sql, ...connection } = input;
        const factory = ctx.ioc.get(DBFactory);
        const db = await factory.create(type, connection);
        return Response.ok(await db.raw(sql));
      } catch (err) {
        console.error(err);
        return Response.fail(JSON.stringify(err));
      }
    }),
});
