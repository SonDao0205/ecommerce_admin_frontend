import { tokenStorage } from "@/src/core/auth/token-storage";
import type {
  ApiRequestOptions,
  ApiResponse,
  QueryParams,
} from "@/src/types/api";
import { ApiError } from "./api-error";

type ApiEnvelope<T> = Partial<ApiResponse<T>> & { data?: T };

export class HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly getToken: () => string | null = () =>
      tokenStorage.getAccessToken(),
  ) {}

  get<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  put<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  patch<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  delete<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }

  private async request<T>(
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    const { params, body, skipAuth, headers, ...requestInit } = options;
    const token = skipAuth ? null : this.getToken();
    const url = this.createUrl(path, params);
    const isFormData = body instanceof FormData;

    const response = await fetch(url, {
      ...requestInit,
      headers: {
        Accept: "application/json",
        ...(body !== undefined && !isFormData && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
    });

    const payload = await this.parseResponse<T>(response);

    if (!response.ok) {
      if (response.status === 401 && !skipAuth) {
        tokenStorage.clear();
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.replace("/login");
        }
      }
      const errorPayload = payload as ApiEnvelope<unknown> | undefined;
      throw new ApiError(
        errorPayload?.message ?? `Request failed with status ${response.status}`,
        response.status,
        payload,
      );
    }

    if (this.isEnvelope<T>(payload)) {
      return payload.data as T;
    }

    return payload as T;
  }

  private createUrl(path: string, params?: QueryParams): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${this.baseUrl.replace(/\/$/, "")}${normalizedPath}`);

    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });

    return url.toString();
  }

  private async parseResponse<T>(response: Response): Promise<T | undefined> {
    if (response.status === 204) return undefined;

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return (await response.json()) as T;
    }

    const text = await response.text();
    return (text || undefined) as T | undefined;
  }

  private isEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
    return (
      typeof value === "object" &&
      value !== null &&
      ("status" in value || "code" in value) &&
      "data" in value
    );
  }
}
