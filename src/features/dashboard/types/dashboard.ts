export type DashboardRange = "today" | "7d" | "30d" | "month" | "custom";

export interface DashboardMetric {
  value: number;
  previousValue: number;
  changePercent: number;
}

export interface DashboardSeriesPoint {
  date: string;
  revenue: number;
  orders: number;
  soldProducts: number;
}

export interface DashboardData {
  period: {
    range: DashboardRange;
    start: string;
    end: string;
    previousStart: string;
    previousEnd: string;
    bucket: "hour" | "day" | "week";
  };
  metrics: {
    revenue: DashboardMetric;
    completedOrders: DashboardMetric;
    soldProducts: DashboardMetric;
    newCustomers: DashboardMetric;
    averageOrderValue: DashboardMetric;
    cancellationRate: DashboardMetric;
  };
  series: DashboardSeriesPoint[];
  orderStatuses: {
    pending: number;
    confirmed: number;
    processing: number;
    shipping: number;
    completed: number;
    cancelled: number;
    returned: number;
  };
  topProducts: Array<{
    productId: string | null;
    name: string;
    sold: number;
    revenue: number;
  }>;
  lowStock: Array<{
    productId: string;
    productName: string;
    variantId: string | null;
    variantName: string | null;
    sku: string | null;
    stock: number;
    totalCount: number;
  }>;
  customers: {
    segments: { newCustomers: number; returningCustomers: number };
    top: Array<{
      userId: string;
      name: string;
      email: string | null;
      orderCount: number;
      totalSpent: number;
    }>;
  };
  actions: {
    pendingOrders: number;
    pendingRefunds: number;
    lowStockItems: number;
    unansweredReviews: number;
  };
}

export interface DashboardQuery {
  range: DashboardRange;
  from?: string;
  to?: string;
}
