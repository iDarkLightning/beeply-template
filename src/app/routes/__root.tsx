import { createRootRouteWithContext } from "@tanstack/react-router";
import { RouterContext } from "src/app/lib/router-context";
import { RootRoute } from "~app/features/root-route";
import { devStyleInject } from "~app/lib/dev-style-inject";

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  links: devStyleInject,
  component: RootRoute,
});
