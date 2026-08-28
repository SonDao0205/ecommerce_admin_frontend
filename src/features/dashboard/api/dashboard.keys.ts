import type { DashboardQuery } from "../types/dashboard";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  overview: (query: DashboardQuery) => [...dashboardKeys.all, query] as const,
};
