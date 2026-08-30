import type { Metadata } from "next";
import { VoucherDashboard } from "@/src/features/admin/components/voucher-dashboard";
export const metadata: Metadata = { title: "Quản lý voucher | ShopNow Admin" };
export default function VouchersPage() {
  return <VoucherDashboard />;
}
