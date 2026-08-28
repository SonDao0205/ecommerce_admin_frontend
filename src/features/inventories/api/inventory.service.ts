import { BaseApiService, httpClient } from "@/src/core/api";
import type { PaginatedData, QueryParams } from "@/src/types/api";
import type {
  InventoryLog,
  InventoryProduct,
  UpdateInventoryPayload,
} from "../types/inventory";

export interface InventoryListQuery {
  categoryId: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export class InventoryService extends BaseApiService {
  constructor() {
    super(httpClient, "/inventories");
  }

  getAll(query: InventoryListQuery): Promise<PaginatedData<InventoryProduct>> {
    return this.get<PaginatedData<InventoryProduct>>("", {
      params: query as unknown as QueryParams,
      cache: "no-store",
    });
  }

  updateStock(productId: string, payload: UpdateInventoryPayload): Promise<InventoryProduct> {
    return this.patch<InventoryProduct>(`${productId}/stock`, payload);
  }

  getLogs(productId: string, variantId?: string): Promise<InventoryLog[]> {
    return this.get<InventoryLog[]>(`${productId}/logs`, {
      params: { limit: 50, variantId },
      cache: "no-store",
    });
  }
}

export const inventoryService = new InventoryService();
