"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { voucherKeys } from "../api/voucher.keys";
import { voucherService } from "../api/voucher.service";
import type {
  VoucherPayload,
  VoucherQuery,
  VoucherStatus,
} from "../types/voucher";

export function useVouchers(query: VoucherQuery) {
  return useQuery({
    queryKey: [...voucherKeys.lists(), query],
    queryFn: () => voucherService.getAll(query),
  });
}
function useInvalidateVouchers() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: voucherKeys.all });
}
export function useCreateVoucher() {
  const invalidate = useInvalidateVouchers();
  return useMutation({
    mutationFn: (payload: VoucherPayload) => voucherService.create(payload),
    onSuccess: invalidate,
  });
}
export function useUpdateVoucher() {
  const invalidate = useInvalidateVouchers();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: VoucherPayload }) =>
      voucherService.update(id, payload),
    onSuccess: invalidate,
  });
}
export function useUpdateVoucherStatus() {
  const invalidate = useInvalidateVouchers();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: VoucherStatus }) =>
      voucherService.updateStatus(id, status),
    onSuccess: invalidate,
  });
}
