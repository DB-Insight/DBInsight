import { router } from "@/api/core/server";
import { connectionRouter } from "./connection.router";
import { fileRouter } from "./file.router";

export const appRouter = router({
  file: fileRouter,
  connection: connectionRouter,
});

export type AppRouter = typeof appRouter;
