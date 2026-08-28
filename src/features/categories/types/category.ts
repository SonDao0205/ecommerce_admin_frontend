export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  parentId?: string | null;
  childCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  isActive?: boolean;
  parentId?: string;
  rootOnly?: boolean;
}

export interface CategoryPayload {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}
