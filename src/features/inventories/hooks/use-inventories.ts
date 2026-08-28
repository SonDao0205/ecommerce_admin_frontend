"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryKeys } from "../api/inventory.keys";
import {
  inventoryService,
  type InventoryListQuery,
} from "../api/inventory.service";
import type { UpdateInventoryPayload } from "../types/inventory";

export function useInventories(query: InventoryListQuery, enabled: boolean) {
  return useQuery({
    queryKey: [...inventoryKeys.lists(), query],
    queryFn: () => inventoryService.getAll(query),
    enabled,
  });
}

export function useInventoryLogs(productId?: string, variantId?: string) {
  return useQuery({
    queryKey: inventoryKeys.logs(productId ?? "", variantId),
    queryFn: () => inventoryService.getLogs(productId!, variantId),
    enabled: Boolean(productId),
  });
}

export function useUpdateInventoryStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: UpdateInventoryPayload }) =>
      inventoryService.updateStock(productId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
  });
}
