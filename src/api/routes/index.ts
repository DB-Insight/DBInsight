import { router } from "@/api/core/server";
import { connectionRouter } from "./connection.router";
import { tableRouter } from "./table.router";

export const appRouter = router({
  connection: connectionRouter,
  table: tableRouter,
});

export type AppRouter = typeof appRouter;
