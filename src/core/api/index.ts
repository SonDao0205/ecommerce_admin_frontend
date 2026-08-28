import { HttpClient } from "./http-client";

export { ApiError } from "./api-error";
export { BaseApiService } from "./base-api.service";
export { HttpClient } from "./http-client";

export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

/** The only shared HTTP client instance used by all domain services. */
export const httpClient = new HttpClient(apiBaseUrl);
