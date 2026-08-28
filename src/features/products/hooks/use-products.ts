"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productKeys } from "../api/product.keys";
import { productService } from "../api/product.service";
import type { GetAllParams } from "@/src/types/api";
import type { ProductMultipartPayload } from "../types/product";

export function useProducts(query: GetAllParams = {}) {
  return useQuery({
    queryKey: [...productKeys.lists(), query],
    queryFn: () => productService.getAll(query),
  });
}

export function useUpdateProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      productService.updateStatus(id, isActive),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductMultipartPayload) => productService.create(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductMultipartPayload }) =>
      productService.update(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}
