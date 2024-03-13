import { extractAuth } from "~server/auth/authed-procedure";
import { publicProcedure, router } from "../trpc";

export const appRouter = router({
  queryMe: publicProcedure.use(extractAuth).query(async ({ ctx }) => {
    return ctx.user;
  }),
});

export type AppRouter = typeof appRouter;
