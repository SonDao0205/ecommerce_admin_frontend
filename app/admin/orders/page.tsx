import type { Metadata } from "next";
import { OrderDashboard } from "@/src/features/admin/components/order-dashboard";

export const metadata: Metadata = {
  title: "Quản lý đơn hàng | ShopNow Admin",
};

export default function OrdersPage() {
  return <OrderDashboard />;
}
