import { router } from "@/api/core/server";
import { connectionRouter } from "./connection.router";

export const appRouter = router({
  connection: connectionRouter,
});

export type AppRouter = typeof appRouter;
