import { Response, publicProcedure, router } from "@/api/core";
import {
  CreateFileSchema,
  FileSchema,
  JoinFileSchema,
  RenameFileSchema,
} from "@/schemas";
import { FileService } from "../services";

export const fileRouter = router({
  init: publicProcedure.mutation(async ({ ctx }) => {
    try {
      const fileService = ctx.ioc.get(FileService);
      return Response.ok(await fileService.init());
    } catch (err) {
      console.error(err);
      return Response.fail(JSON.stringify(err));
    }
  }),
  reload: publicProcedure.mutation(async ({ ctx }) => {
    try {
      const fileService = ctx.ioc.get(FileService);
      return Response.ok(await fileService.reload());
    } catch (err) {
      console.error(err);
      return Response.fail(JSON.stringify(err));
    }
  }),
  dirname: publicProcedure
    .input(FileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const fileService = ctx.ioc.get(FileService);
        return Response.ok(await fileService.dirname(input.path));
      } catch (err) {
        console.error(err);
        return Response.fail(JSON.stringify(err));
      }
    }),
  join: publicProcedure
    .input(JoinFileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const fileService = ctx.ioc.get(FileService);
        return Response.ok(await fileService.join(input.paths));
      } catch (err) {
        console.error(err);
        return Response.fail(JSON.stringify(err));
      }
    }),
  rename: publicProcedure
    .input(FileSchema.merge(RenameFileSchema))
    .mutation(async ({ ctx, input }) => {
      try {
        const fileService = ctx.ioc.get(FileService);
        return Response.ok(await fileService.rename(input.path, input.newPath));
      } catch (err) {
        console.error(err);
        return Response.fail(JSON.stringify(err));
      }
    }),
  create: publicProcedure
    .input(FileSchema.merge(CreateFileSchema))
    .mutation(async ({ ctx, input }) => {
      try {
        const fileService = ctx.ioc.get(FileService);
        return Response.ok(
          await fileService.create(input.path, input.isFolder),
        );
      } catch (err) {
        console.error(err);
        return Response.fail(JSON.stringify(err));
      }
    }),
  delete: publicProcedure.input(FileSchema).mutation(async ({ ctx, input }) => {
    try {
      const fileService = ctx.ioc.get(FileService);
      return Response.ok(await fileService.delete(input.path));
    } catch (err) {
      console.error(err);
      return Response.fail(JSON.stringify(err));
    }
  }),
});
