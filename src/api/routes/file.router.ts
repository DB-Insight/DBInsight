import { Response, publicProcedure, router } from "@/api/core";
import { FileService } from "../services";

export const fileRouter = router({
  init: publicProcedure.mutation(async ({ ctx, input }) => {
    try {
      const fileService = ctx.ioc.get(FileService);
      return Response.ok(await fileService.init());
    } catch (err) {
      console.error(err);
      return Response.fail(JSON.stringify(err));
    }
  }),
});
