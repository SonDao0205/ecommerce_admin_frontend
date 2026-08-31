import type { Metadata } from "next";
import { ReviewDashboard } from "@/src/features/admin/components/review-dashboard";
export const metadata: Metadata = { title: "Quản lý đánh giá | ShopNow Admin" };
export default function ReviewsPage() {
  return <ReviewDashboard />;
}
