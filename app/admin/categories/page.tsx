import type { Metadata } from "next";
import { CategoryDashboard } from "@/src/features/admin/components/category-dashboard";

export const metadata: Metadata = {
  title: "Quản lý danh mục | ShopNow Admin",
};

export default function CategoriesPage() {
  return <CategoryDashboard />;
}
