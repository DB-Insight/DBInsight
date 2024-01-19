import { publicProcedure, router } from "./server";

export const appRouter = router({
  hello: publicProcedure.query(() => `Hello!`),
});

export type AppRouter = typeof appRouter;
