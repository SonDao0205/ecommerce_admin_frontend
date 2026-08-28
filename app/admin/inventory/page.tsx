import type { Metadata } from "next";
import { InventoryDashboard } from "@/src/features/admin/components/inventory-dashboard";

export const metadata: Metadata = {
  title: "Quản lý tồn kho | ShopNow Admin",
};

export default function InventoryPage() {
  return <InventoryDashboard />;
}
