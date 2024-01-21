import { publicProcedure, router } from "@/api/core/server";
import { DBFactory } from "@/api/services/db.factory";
import { connectionRouter } from "./connection.router";

export const appRouter = router({
  connection: connectionRouter,
  hello: publicProcedure.query(async ({ ctx }) => {
    const factory = ctx.ioc.get(DBFactory);
    const mysql = await factory.create("mysql", {
      host: process.env.VITE_MYSQL_HOST,
      user: process.env.VITE_MYSQL_USER,
      password: process.env.VITE_MYSQL_PASSWORD,
      database: process.env.VITE_MYSQL_DATABASE,
    });
    const result = await mysql.raw("SELECT * FROM user");
    console.log(result);
    return result;
  }),
});

export type AppRouter = typeof appRouter;
