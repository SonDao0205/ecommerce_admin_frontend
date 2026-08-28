import type { Metadata } from "next";
import { ProductDashboard } from "@/src/features/admin/components/product-dashboard";

export const metadata: Metadata = {
  title: "Quản lý sản phẩm | ShopNow Admin",
};

export default function ProductsPage() {
  return <ProductDashboard />;
}
