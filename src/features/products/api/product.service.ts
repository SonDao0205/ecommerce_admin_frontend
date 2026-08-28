import { ApiError, BaseApiService, httpClient } from "@/src/core/api";
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

  async create(payload: ProductMultipartPayload): Promise<Product> {
    const prepared = await this.prepareMedia(payload);
    try {
      return await this.post<Product>("", this.toJson(prepared.payload));
    } catch (error) {
      await this.cleanup(prepared.uploaded);
      throw error;
    }
  }

  async update(id: string, payload: ProductMultipartPayload): Promise<Product> {
    const prepared = await this.prepareMedia(payload);
    try {
      return await this.put<Product>(id, this.toJson(prepared.payload, true));
    } catch (error) {
      await this.cleanup(prepared.uploaded);
      throw error;
    }
  }

  updateStatus(id: string, isActive: boolean): Promise<Product> {
    return this.patch<Product>(`${id}/status`, { isActive });
  }

  private toJson(
    payload: ProductMultipartPayload,
    omitStock = false,
  ): Record<string, unknown> {
    const body: Record<string, unknown> = {};
    Object.entries(payload.product).forEach(([key, value]) => {
      if (value !== undefined && !(omitStock && key === "stock")) {
        body[key] = key === "variants" ? JSON.stringify(value) : value;
      }
    });
    body.imageManifest = JSON.stringify(payload.imageManifest);
    if (payload.thumbnailIndex !== undefined) {
      body.thumbnailIndex = payload.thumbnailIndex;
    }
    return body;
  }

  private async prepareMedia(payload: ProductMultipartPayload): Promise<{
    payload: ProductMultipartPayload;
    uploaded: CloudinaryAsset[];
  }> {
    if (payload.files.length === 0) return { payload, uploaded: [] };
    if (payload.imageManifest.length > 6 || payload.files.length > 6) {
      throw new ApiError("Mỗi sản phẩm chỉ được có tối đa 6 media", 400);
    }

    payload.files.forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const limit = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
      if ((!isImage && !isVideo) || file.size > limit) {
        throw new ApiError(
          `${file.name}: ảnh tối đa 5 MB, video tối đa 50 MB`,
          400,
        );
      }
    });

    const signature = await httpClient.post<CloudinarySignature>(
      "/cloudinary/upload-signature",
    );
    const uploaded: Array<CloudinaryAsset | undefined> = new Array(
      payload.files.length,
    );
    const failedIndexes: number[] = [];
    let cursor = 0;
    const workers = Array.from(
      { length: Math.min(3, payload.files.length) },
      async () => {
        while (cursor < payload.files.length) {
          const index = cursor++;
          try {
            uploaded[index] = await this.uploadToCloudinary(
              payload.files[index],
              signature,
            );
          } catch {
            failedIndexes.push(index);
          }
        }
      },
    );
    await Promise.all(workers);

    const successful = uploaded.filter(
      (asset): asset is CloudinaryAsset => asset !== undefined,
    );
    if (failedIndexes.length > 0) {
      await this.cleanup(successful);
      throw new ApiError("Một hoặc nhiều media tải lên thất bại", 502, {
        failedIndexes: failedIndexes.sort((a, b) => a - b),
      });
    }

    const manifest = payload.imageManifest.map((item) => {
      if (item.kind === "existing") return item;
      const asset = uploaded[item.fileIndex];
      if (!asset) {
        throw new ApiError("Thứ tự media không khớp với tệp đã chọn", 400, {
          failedIndexes: [item.fileIndex],
        });
      }
      return { kind: "existing" as const, url: asset.url };
    });
    return {
      payload: { ...payload, files: [], imageManifest: manifest },
      uploaded: successful,
    };
  }

  private async uploadToCloudinary(
    file: File,
    signature: CloudinarySignature,
  ): Promise<CloudinaryAsset> {
    const body = new FormData();
    body.append("file", file);
    body.append("api_key", signature.apiKey);
    body.append("timestamp", String(signature.timestamp));
    body.append("signature", signature.signature);
    body.append("folder", signature.folder);
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/auto/upload`,
      { method: "POST", body },
    );
    if (!response.ok) throw new Error("Cloudinary upload failed");
    const result = (await response.json()) as {
      secure_url: string;
      public_id: string;
      resource_type: string;
    };
    return {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type === "video" ? "video" : "image",
    };
  }

  private async cleanup(assets: CloudinaryAsset[]): Promise<void> {
    if (assets.length === 0) return;
    try {
      await httpClient.post<null>("/cloudinary/cleanup", {
        assets: assets.map(({ publicId, resourceType }) => ({
          publicId,
          resourceType,
        })),
      });
    } catch {
      // Cleanup is best effort; the original product/upload error is preserved.
    }
  }
}

interface CloudinarySignature {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

interface CloudinaryAsset {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
}

export const productService = new ProductService();
