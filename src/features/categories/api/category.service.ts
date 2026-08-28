import { BaseApiService, httpClient } from "@/src/core/api";
import type { PaginatedData, QueryParams } from "@/src/types/api";
import type {
  Category,
  CategoryPayload,
  CategoryQuery,
} from "../types/category";

export class CategoryService extends BaseApiService {
  constructor() {
    super(httpClient, "/categories");
  }

  getAll(query: CategoryQuery): Promise<PaginatedData<Category>> {
    return this.get<PaginatedData<Category>>("", {
      params: query as QueryParams,
      cache: "no-store",
    });
  }

  getRoots(): Promise<PaginatedData<Category>> {
    return this.getAll({
      page: 1,
      limit: 100,
      rootOnly: true,
      sortBy: "name",
      sortOrder: "ASC",
    });
  }

  getChildren(parentId: string): Promise<PaginatedData<Category>> {
    return this.getAll({
      page: 1,
      limit: 100,
      parentId,
      sortBy: "name",
      sortOrder: "ASC",
    });
  }

  getActiveRoots(): Promise<PaginatedData<Category>> {
    return this.getAll({
      page: 1,
      limit: 100,
      rootOnly: true,
      isActive: true,
      sortBy: "name",
      sortOrder: "ASC",
    });
  }

  getActiveChildren(parentId: string): Promise<PaginatedData<Category>> {
    return this.getAll({
      page: 1,
      limit: 100,
      parentId,
      isActive: true,
      sortBy: "name",
      sortOrder: "ASC",
    });
  }

  create(payload: CategoryPayload): Promise<Category> {
    return this.post<Category>("", payload);
  }

  update(id: string, payload: CategoryPayload): Promise<Category> {
    return this.put<Category>(id, payload);
  }

  updateStatus(id: string, isActive: boolean): Promise<Category> {
    return this.patch<Category>(`${id}/status`, { isActive });
  }
}

export const categoryService = new CategoryService();
