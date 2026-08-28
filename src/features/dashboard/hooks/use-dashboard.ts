"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardKeys } from "../api/dashboard.keys";
import { dashboardService } from "../api/dashboard.service";
import type { DashboardQuery } from "../types/dashboard";

export function useDashboard(query: DashboardQuery) {
  return useQuery({
    queryKey: dashboardKeys.overview(query),
    queryFn: () => dashboardService.getOverview(query),
    staleTime: 60_000,
  });
}
