import { BaseApiService, httpClient } from "@/src/core/api";
import type { DashboardData, DashboardQuery } from "../types/dashboard";

export class DashboardService extends BaseApiService {
  constructor() {
    super(httpClient, "/dashboard");
  }

  getOverview(query: DashboardQuery): Promise<DashboardData> {
    return this.get<DashboardData>("", {
      params: {
        range: query.range,
        ...(query.from && { from: query.from }),
        ...(query.to && { to: query.to }),
      },
      cache: "no-store",
    });
  }
}

export const dashboardService = new DashboardService();
