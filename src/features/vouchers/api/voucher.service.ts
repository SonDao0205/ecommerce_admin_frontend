import { BaseApiService, httpClient } from "@/src/core/api";
import type { PaginatedData, QueryParams } from "@/src/types/api";
import type {
  Voucher,
  VoucherCustomerOption,
  VoucherMemberGroupOption,
  VoucherPayload,
  VoucherQuery,
  VoucherStatus,
} from "../types/voucher";

export class VoucherService extends BaseApiService {
  constructor() {
    super(httpClient, "/vouchers");
  }
  getAll(query: VoucherQuery): Promise<PaginatedData<Voucher>> {
    return this.get("", { params: query as QueryParams, cache: "no-store" });
  }
  getById(id: string): Promise<Voucher> {
    return this.get(id, { cache: "no-store" });
  }
  getCustomerOptions(): Promise<VoucherCustomerOption[]> {
    return this.get("options/customers", { cache: "no-store" });
  }
  getMemberGroupOptions(): Promise<VoucherMemberGroupOption[]> {
    return this.get("options/member-groups", { cache: "no-store" });
  }
  create(payload: VoucherPayload): Promise<Voucher> {
    return this.post("", payload);
  }
  update(id: string, payload: VoucherPayload): Promise<Voucher> {
    return this.put(id, payload);
  }
  updateStatus(id: string, status: VoucherStatus): Promise<Voucher> {
    return this.patch(`${id}/status`, { status });
  }
}
export const voucherService = new VoucherService();
