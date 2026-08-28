"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryKeys } from "../api/category.keys";
import { categoryService } from "../api/category.service";
import type { CategoryPayload } from "../types/category";

function useInvalidateCategoryTree() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: categoryKeys.all });
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategoryTree();
  return useMutation({
    mutationFn: (payload: CategoryPayload) => categoryService.create(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategoryTree();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CategoryPayload }) =>
      categoryService.update(id, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateCategoryStatus() {
  const invalidate = useInvalidateCategoryTree();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      categoryService.updateStatus(id, isActive),
    onSuccess: invalidate,
  });
}
