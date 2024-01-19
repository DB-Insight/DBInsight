import { createTRPCProxyClient, httpLink } from "@trpc/client";
import SuperJSON from "superjson";
import { AppRouter } from "./routes";

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: "/trpc",
      fetch: async (input, init) => {
        const req = {
          url:
            input instanceof URL
              ? input.toString()
              : typeof input === "string"
                ? input
                : input.url,
          method: input instanceof Request ? input.method : init?.method!,
          headers: input instanceof Request ? input.headers : init?.headers!,
          body: input instanceof Request ? input.body : init?.body!,
        };

        const resp = await window.API.trpc(req);

        return new Response(resp.body, {
          status: resp.status,
          headers: resp.headers,
        });
      },
    }),
  ],
  transformer: SuperJSON,
});
