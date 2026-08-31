import type { GetAllParams } from "@/src/types/api";
export interface ReviewMedia {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
}
export interface ProductReview {
  id: string;
  productSlug: string;
  productName: string;
  variantName: string | null;
  variantValue: string | null;
  variantSku: string | null;
  userName: string;
  rating: number;
  content: string;
  media: ReviewMedia[];
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
}
export type ReviewQuery = GetAllParams & { replied?: boolean };
