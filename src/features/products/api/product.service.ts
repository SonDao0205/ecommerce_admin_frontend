import {
  BaseApiService,
  httpClient,
} from "@/src/core/api";
import type { Product, ProductMultipartPayload } from "../types/product";
import type { GetAllParams, PaginatedData } from "@/src/types/api";

export class ProductService extends BaseApiService {
  constructor() {
    super(httpClient, "/products");
  }

  getAll(query: GetAllParams = {}): Promise<PaginatedData<Product>> {
    return this.get<PaginatedData<Product>>("", {
      params: query,
      cache: "no-store",
    });
  }

  getById(id: string): Promise<Product> {
    return this.get<Product>(id);
  }

  validateSkus(payload: {
    sku: string;
    variantSkus: string[];
    productId?: string;
  }): Promise<null> {
    return this.post<null>("validate-skus", payload);
  }

  create(payload: ProductMultipartPayload): Promise<Product> {
    return this.post<Product>("", this.toFormData(payload));
  }

  update(id: string, payload: ProductMultipartPayload): Promise<Product> {
    return this.put<Product>(id, this.toFormData(payload));
  }

  updateStatus(id: string, isActive: boolean): Promise<Product> {
    return this.patch<Product>(`${id}/status`, { isActive });
  }

  private toFormData(payload: ProductMultipartPayload): FormData {
    const formData = new FormData();
    Object.entries(payload.product).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, key === "variants" ? JSON.stringify(value) : String(value));
      }
    });
    formData.append("imageManifest", JSON.stringify(payload.imageManifest));
    if (payload.thumbnailIndex !== undefined) {
      formData.append("thumbnailIndex", String(payload.thumbnailIndex));
    }
    payload.files.forEach((file) => formData.append("images", file));
    return formData;
  }
}

export const productService = new ProductService();
