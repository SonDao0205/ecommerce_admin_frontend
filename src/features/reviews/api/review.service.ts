import { BaseApiService, httpClient } from "@/src/core/api";
import type { PaginatedData, QueryParams } from "@/src/types/api";
import type { ProductReview, ReviewQuery } from "../types/review";
class ReviewService extends BaseApiService {
  constructor() {
    super(httpClient, "/reviews");
  }
  getManagement(query: ReviewQuery): Promise<PaginatedData<ProductReview>> {
    return this.get("management", {
      params: query as QueryParams,
      cache: "no-store",
    });
  }
  reply(id: string, reply: string): Promise<ProductReview> {
    return this.patch(`management/${id}/reply`, { reply });
  }
}
export const reviewService = new ReviewService();
