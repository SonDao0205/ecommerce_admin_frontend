"use client";

import { useQuery } from "@tanstack/react-query";
import { categoryKeys } from "../api/category.keys";
import { categoryService } from "../api/category.service";

const permanentTreeCache = {
  staleTime: Infinity,
  gcTime: Infinity,
  // Query còn fresh vẫn dùng cache; query đã bị mutation invalidate sẽ tự tải
  // lại khi người dùng quay về trang có sử dụng cây danh mục.
  refetchOnMount: true,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
} as const;

export function useRootCategories() {
  return useQuery({
    queryKey: categoryKeys.roots(),
    queryFn: () => categoryService.getRoots(),
    ...permanentTreeCache,
  });
}

export function useCategoryChildren(parentId: string, enabled: boolean) {
  return useQuery({
    queryKey: categoryKeys.children(parentId),
    queryFn: () => categoryService.getChildren(parentId),
    enabled,
    ...permanentTreeCache,
  });
}

export function useActiveRootCategories() {
  return useQuery({
    queryKey: categoryKeys.activeRoots(),
    queryFn: () => categoryService.getActiveRoots(),
    ...permanentTreeCache,
  });
}
