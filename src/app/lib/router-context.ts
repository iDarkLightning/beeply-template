import { RouterManagedTag } from "@tanstack/react-router-server/client";
import { CreateQueryUtils } from "@trpc/react-query/shared";
import { AppRouter } from "~server/routes/__root";

export type RouterContext = {
  queryUtils: CreateQueryUtils<AppRouter>;
  assets: RouterManagedTag[];
};
