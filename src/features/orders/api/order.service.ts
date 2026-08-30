import { BaseApiService, httpClient } from "@/src/core/api";
import type { GetAllParams, PaginatedData } from "@/src/types/api";
import type { Order, OrderStatus, OrderSummary } from "../types/order";

export interface OrderListParams extends GetAllParams {
  status?: OrderStatus;
}

export class OrderService extends BaseApiService {
  constructor() {
    super(httpClient, "/orders/management");
  }

  getAll(query: OrderListParams = {}): Promise<PaginatedData<OrderSummary>> {
    return this.get<PaginatedData<OrderSummary>>("", {
      params: query,
      cache: "no-store",
    });
  }

  getById(id: string): Promise<Order> {
    return this.get<Order>(id, { cache: "no-store" });
  }

  updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return this.patch<Order>(`${id}/status`, { status });
  }

  reject(id: string, reason: string): Promise<Order> {
    return this.patch<Order>(`${id}/reject`, { reason });
  }

  reviewReturn(id: string, approved: boolean, reason: string): Promise<Order> {
    return this.patch<Order>(`${id}/return-review`, { approved, reason });
  }
}

export const orderService = new OrderService();
