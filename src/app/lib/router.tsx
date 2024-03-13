import { createRouter as _createRouter } from "@tanstack/react-router";
import { routeTree } from "~app/routes/route-tree";
import {
  createLinks,
  createQueryClient,
  createTRPCClient,
  createTRPCQueryUtils,
  trpc,
} from "./trpc";
import SuperJSON from "superjson";
import { QueryClientProvider, dehydrate, hydrate } from "@tanstack/react-query";

export const createRouter = (opts: {
  trpcLinks?: ReturnType<typeof createLinks>;
}) => {
  const queryClient = createQueryClient();
  const trpcClient = createTRPCClient(opts.trpcLinks);

  const reactClient = trpc.createClient({
    links: opts.trpcLinks ? opts.trpcLinks() : createLinks()(),
  });

  return _createRouter({
    routeTree,
    context: {
      queryUtils: createTRPCQueryUtils({
        queryClient,
        client: trpcClient,
      }),
      assets: [],
    },
    transformer: SuperJSON,
    Wrap: (props) => (
      <trpc.Provider queryClient={queryClient} client={reactClient}>
        <QueryClientProvider client={queryClient}>
          {props.children}
        </QueryClientProvider>
      </trpc.Provider>
    ),
    dehydrate: () => {
      return {
        queryClientState: dehydrate(queryClient),
      };
    },
    hydrate: (dehydratedState) => {
      hydrate(queryClient, dehydratedState.queryClientState);
    },
    defaultNotFoundComponent: () => <div>That page was not found!</div>,
    defaultPreloadStaleTime: 0,
  });
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
