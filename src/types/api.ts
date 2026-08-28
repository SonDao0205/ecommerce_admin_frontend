export interface ApiResponse<T> {
  status: boolean;
  data: T;
  message: string;
  code: number;
}

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export type SortOrder = "ASC" | "DESC";

export type GetAllParams = QueryParams & {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  isActive?: boolean;
};

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  params?: QueryParams;
  body?: unknown;
  /** Next.js Data Cache options (only effective on the server). */
  next?: NextFetchRequestConfig;
  /** Skip Authorization for endpoints such as login and register. */
  skipAuth?: boolean;
}
