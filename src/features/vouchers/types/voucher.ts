import type { GetAllParams } from "@/src/types/api";

export type VoucherStatus = "draft" | "active" | "expired" | "disabled";
export type VoucherDiscountType = "percentage" | "fixed_amount";
export type VoucherScope = "shop" | "products" | "categories";
export type VoucherAudience =
  | "all"
  | "new_customers"
  | "existing_customers"
  | "member_groups"
  | "specific_customers";

export interface Voucher {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  status: VoucherStatus;
  voucherType: "order_discount";
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minimumOrderAmount: number;
  scope: VoucherScope;
  audience: VoucherAudience;
  startAt: string;
  endAt: string;
  issuedQuantity?: number | null;
  maxUsageCount?: number | null;
  usageLimitPerUser: number;
  usedCount: number;
  combinableWithVouchers: boolean;
  combinableWithFlashSale: boolean;
  combinableWithPromotions: boolean;
  productIds: string[];
  categoryIds: string[];
  customerIds: string[];
  memberGroupIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type VoucherPayload = Omit<
  Voucher,
  | "id"
  | "usedCount"
  | "createdAt"
  | "updatedAt"
  | "productIds"
  | "categoryIds"
  | "customerIds"
  | "memberGroupIds"
> & {
  productIds?: string[];
  categoryIds?: string[];
  customerIds?: string[];
  memberGroupIds?: string[];
};
export type VoucherQuery = GetAllParams & {
  status?: VoucherStatus;
  discountType?: VoucherDiscountType;
};
export interface VoucherCustomerOption {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}
export interface VoucherMemberGroupOption {
  id: string;
  name: string;
}
