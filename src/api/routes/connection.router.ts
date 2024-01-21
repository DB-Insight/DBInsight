import { Response } from "@/api/core";
import { publicProcedure, router } from "@/api/core/server";
import { ConnectionSchema } from "@/schemas";
import { CacheService } from "../services";

export const connectionRouter = router({
  test: publicProcedure
    .input(ConnectionSchema)
    .query(async ({ ctx, input }) => {
      const cache = ctx.ioc.get(CacheService);
      try {
        const db = await ctx.getConnection(input, false);
        await db.destroy();
        cache.set(input.id!, null);
        return Response.ok();
      } catch (err) {
        return Response.fail(JSON.stringify(err));
      }
    }),
  connect: publicProcedure
    .input(ConnectionSchema)
    .query(async ({ ctx, input }) => {
      try {
        const db = await ctx.getConnection(input);
        return Response.ok(await db.getVersion());
      } catch (err) {
        return Response.fail(JSON.stringify(err));
      }
    }),
  databases: publicProcedure
    .input(ConnectionSchema)
    .query(async ({ ctx, input }) => {
      try {
        const db = await ctx.getConnection(input);
        return Response.ok(await db.showDatabases());
      } catch (err) {
        return Response.fail(JSON.stringify(err));
      }
    }),
  tables: publicProcedure
    .input(ConnectionSchema)
    .query(async ({ ctx, input }) => {
      if (!input.database) {
        return Response.fail("Database is required");
      }
      try {
        const db = await ctx.getConnection(input, false);
        return Response.ok(await db.showTables());
      } catch (err) {
        return Response.fail(JSON.stringify(err));
      }
    }),
});
