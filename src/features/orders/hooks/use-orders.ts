"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderKeys } from "../api/order.keys";
import { orderService, type OrderListParams } from "../api/order.service";
import type { OrderStatus } from "../types/order";

export function useOrders(query: OrderListParams = {}) {
  return useQuery({
    queryKey: [...orderKeys.lists(), query],
    queryFn: () => orderService.getAll(query),
  });
}

export function useOrder(id?: string) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ""),
    queryFn: () => orderService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      orderService.updateStatus(id, status),
    onSuccess: (order) => {
      queryClient.setQueryData(orderKeys.detail(order.id), order);
      return queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

export function useRejectOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      orderService.reject(id, reason),
    onSuccess: (order) => {
      queryClient.setQueryData(orderKeys.detail(order.id), order);
      return queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}
