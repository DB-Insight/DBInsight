import { AnyRouter, initTRPC } from "@trpc/server";
import { HTTPRequest, resolveHTTPResponse } from "@trpc/server/http";
import SuperJSON from "superjson";
import Container from "typedi";

export async function createContextInner() {
  return {
    ioc: Container,
  };
}

export type Context = Awaited<ReturnType<typeof createContextInner>>;

const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
});

export const publicProcedure = t.procedure;
export const router = t.router;

export async function ipcRequestHandler<TRouter extends AnyRouter>(opts: {
  req: IpcRequest;
  router: TRouter;
  batching?: { enabled: boolean };
  onError?: (o: { error: Error; req: IpcRequest }) => void;
  endpoint: string;
}): Promise<IpcResponse> {
  const createContext = async () => {
    const contextInner = await createContextInner();
    return {
      ...contextInner,
      req: opts.req,
    };
  };

  // adding a fake "https://electron" to the URL so it can be parsed
  const url = new URL("https://electron" + opts.req.url);
  const path = url.pathname.slice(opts.endpoint.length + 1);
  const req: HTTPRequest = {
    query: url.searchParams,
    method: opts.req.method,
    headers: opts.req.headers,
    body: opts.req.body,
  };

  const result = await resolveHTTPResponse({
    req,
    createContext,
    path,
    router: opts.router,
    batching: opts.batching,
    onError(o) {
      opts?.onError?.({ ...o, req: opts.req });
    },
  });

  return {
    body: result.body,
    headers: result.headers,
    status: result.status,
  };
}
