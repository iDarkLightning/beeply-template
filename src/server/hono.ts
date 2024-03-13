import { Hono } from "hono";
import { appRouter } from "./routes/__root";
import { authRouter } from "./auth/auth-routes";
import { createTRPCContext } from "./trpc";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

export const hono = new Hono().basePath("/api");

hono.get("/healthcheck", (ctx) => ctx.json({ ok: true }));

hono.route("/auth", authRouter);

hono.use("/trpc/*", (ctx) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext: () => createTRPCContext(ctx),
    req: ctx.req.raw,
  })
);
