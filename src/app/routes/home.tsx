import { createRoute, defer, lazyRouteComponent } from "@tanstack/react-router";
import { rootRoute } from "./__root";

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  meta: () => [{ title: "Home" }],
  loader: async ({ context }) => {
    await context.queryUtils.queryMe.ensureData();

    return {
      slow: defer(
        new Promise<string>((resolve) =>
          setTimeout(() => resolve("data"), 1000)
        )
      ),
    };
  },
  component: lazyRouteComponent(
    () => import("src/app/features/home-view"),
    "HomeView"
  ),
});
