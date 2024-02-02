import { Response } from "@/api/core";
import { publicProcedure, router } from "@/api/core/server";
import {
  ConnectionSchema,
  CreateDatabaseSchema,
  CreateTableSchema,
  GetCollationSchema,
  QueryTableSchema,
  RawSchema,
  RenameTableSchema,
  TableSchema,
  VariableSchema,
} from "@/schemas";
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
  getCharacterSets: publicProcedure
    .input(ConnectionSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { type, ...connection } = input;
        const factory = ctx.ioc.get(DBFactory);
        const db = await factory.create(type, connection);
        return Response.ok(await db.getCharacterSets());
      } catch (err) {
        console.error(err);
        return Response.fail(JSON.stringify(err));
      }
    }),
  getCollations: publicProcedure
    .input(ConnectionSchema.merge(GetCollationSchema))
    .query(async ({ ctx, input }) => {
      try {
        const { type, characterSet, ...connection } = input;
        const factory = ctx.ioc.get(DBFactory);
        const db = await factory.create(type, connection);
        return Response.ok(await db.getCollations(characterSet));
      } catch (err) {
        console.error(err);
        return Response.fail(JSON.stringify(err));
      }
    }),
  getEngines: publicProcedure
    .input(ConnectionSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { type, ...connection } = input;
        const factory = ctx.ioc.get(DBFactory);
        const db = await factory.create(type, connection);
        return Response.ok(await db.getEngines());
      } catch (err) {
        console.error(err);
        return Response.fail(JSON.stringify(err));
      }
    }),
  showVariables: publicProcedure
    .input(ConnectionSchema.merge(VariableSchema))
    .query(async ({ ctx, input }) => {
      try {
        const { type, variable, ...connection } = input;
        const factory = ctx.ioc.get(DBFactory);
        const db = await factory.create(type, connection);
        return Response.ok(await db.showVariables(variable));
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
  showIndex: publicProcedure
    .input(ConnectionSchema.merge(TableSchema))
    .query(async ({ ctx, input }) => {
      try {
        const { table, type, ...connection } = input;
        const factory = ctx.ioc.get(DBFactory);
        const db = await factory.create(type, connection);
        const res = await db.showIndex(table);
        return Response.ok(res);
      } catch (err) {
        console.error(err);
        return Response.fail(JSON.stringify(err));
      }
    }),
  createDatabase: publicProcedure
    .input(ConnectionSchema.merge(CreateDatabaseSchema))
    .mutation(async ({ ctx, input }) => {
      try {
        const { type, name, encoding, collation, ...connection } = input;
        const factory = ctx.ioc.get(DBFactory);
        const db = await factory.create(type, connection);
        return Response.ok(await db.createDatabase(name, encoding, collation));
      } catch (err) {
        console.error(err);
        return Response.fail(JSON.stringify(err));
      }
    }),
  createTable: publicProcedure
    .input(ConnectionSchema.merge(CreateTableSchema))
    .mutation(async ({ ctx, input }) => {
      try {
        const { type, name, encoding, collation, engine, ...connection } =
          input;
        const factory = ctx.ioc.get(DBFactory);
        const db = await factory.create(type, connection);
        return Response.ok(
          await db.createTable(name, encoding, collation, engine),
        );
      } catch (err) {
        console.error(err);
        return Response.fail(JSON.stringify(err));
      }
    }),
  renameTable: publicProcedure
    .input(ConnectionSchema.merge(RenameTableSchema))
    .mutation(async ({ ctx, input }) => {
      try {
        const { type, table, name, ...connection } = input;
        const factory = ctx.ioc.get(DBFactory);
        const db = await factory.create(type, connection);
        return Response.ok(await db.renameTable(table, name));
      } catch (err) {
        console.error(err);
        return Response.fail(JSON.stringify(err));
      }
    }),
  truncateTable: publicProcedure
    .input(ConnectionSchema.merge(TableSchema))
    .mutation(async ({ ctx, input }) => {
      try {
        const { type, table, ...connection } = input;
        const factory = ctx.ioc.get(DBFactory);
        const db = await factory.create(type, connection);
        return Response.ok(await db.truncateTable(table));
      } catch (err) {
        console.error(err);
        return Response.fail(JSON.stringify(err));
      }
    }),
  dropTable: publicProcedure
    .input(ConnectionSchema.merge(TableSchema))
    .mutation(async ({ ctx, input }) => {
      try {
        const { type, table, ...connection } = input;
        const factory = ctx.ioc.get(DBFactory);
        const db = await factory.create(type, connection);
        return Response.ok(await db.dropTable(table));
      } catch (err) {
        console.error(err);
        return Response.fail(JSON.stringify(err));
      }
    }),
  queryTable: publicProcedure
    .input(ConnectionSchema.merge(TableSchema.merge(QueryTableSchema)))
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
  getColumns: publicProcedure
    .input(ConnectionSchema.merge(TableSchema))
    .query(async ({ ctx, input }) => {
      try {
        const { table, type, ...connection } = input;
        const factory = ctx.ioc.get(DBFactory);
        const db = await factory.create(type, connection);
        const res = await db.getColumns(table);
        return Response.ok(res);
      } catch (err) {
        console.error(err);
        return Response.fail(JSON.stringify(err));
      }
    }),
});
