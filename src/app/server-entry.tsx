import { createMemoryHistory } from "@tanstack/react-router";
import { RouterManagedTag } from "@tanstack/react-router-server/client";
import {
  StartServer,
  transformStreamWithRouter,
} from "@tanstack/react-router-server/server";
import { PipeableStream, renderToPipeableStream } from "react-dom/server";
import {
  eventHandler,
  getCookie,
  sendRedirect,
  setHeader,
  setHeaders,
  setResponseStatus,
  toWebRequest,
} from "vinxi/http";
import { getManifest } from "vinxi/manifest";
import { AUTH_COOKIE_NAME } from "~constants";
import { createRouter } from "./lib/router";
import { createLinks } from "./lib/trpc";

const getAssets = async (manifest: ReturnType<typeof getManifest>) => {
  const assets = (await manifest.inputs[
    manifest.handler
  ].assets()) as unknown as RouterManagedTag[];

  if (import.meta.env.DEV) {
    const index = assets.findIndex(
      (asset) => asset.attrs?.["key"] === "plugin-1"
    );
    const refreshScript = assets[index];

    assets[index] = {
      ...refreshScript,
      attrs: { ...refreshScript.attrs, type: "module", async: true },
    };
  }

  return assets;
};

const handler = eventHandler(async (event) => {
  const req = toWebRequest(event);

  if (!req) throw new Error("Building request failed");

  const url = new URL(req.url);
  const href = url.href.replace(url.origin, "");

  const clientManifest = getManifest("client");
  const assets = await getAssets(clientManifest);

  const router = createRouter({
    trpcLinks: createLinks(() => {
      const authCookie = getCookie(event, AUTH_COOKIE_NAME);

      return {
        cookie: `${AUTH_COOKIE_NAME}=${authCookie ?? ""}`,
      };
    }),
  });
  const history = createMemoryHistory({ initialEntries: [href] });

  router.update({
    history,
    context: {
      assets,
      queryUtils: router.options.context.queryUtils,
    },
  });

  await router.load();

  if (router.state.redirect) {
    return sendRedirect(
      event,
      router.state.redirect.href,
      router.state.redirect.code
    );
  }

  const manifestJson = await clientManifest.json();

  const stream = await new Promise<PipeableStream>((resolve) => {
    const stream = renderToPipeableStream(<StartServer router={router} />, {
      onShellReady: () => resolve(stream),
      bootstrapModules: [
        clientManifest.inputs[clientManifest.handler].output.path,
      ],
      bootstrapScriptContent: `window.manifest = ${JSON.stringify(
        manifestJson
      )}`,
    });
  });

  setResponseStatus(event, router.state.statusCode);

  setHeader(event, "Content-Type", "text/html");
  setHeader(event, "Transfer-Encoding", "chunked");
  setHeaders(
    event,
    router.state.matches.reduce((acc, match) => {
      if (match.headers) {
        Object.assign(acc, match.headers);
      }
      return acc;
    }, {} as Record<string, string>)
  );

  const transforms = [transformStreamWithRouter(router)];

  return transforms.reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (stream, transform) => stream.pipe(transform as any),
    stream
  );
});

export default handler;
