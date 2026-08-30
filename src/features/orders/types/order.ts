export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipping"
  | "completed"
  | "cancelled"
  | "rejected"
  | "return_requested"
  | "returned"
  | "return_rejected";

export interface OrderReturnEvidence {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
}

export interface OrderItem {
  id: string;
  productId: string | null;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  variantValue: string | null;
  variantSku: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderSummary {
  id: string;
  orderCode: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
  note: string | null;
  rejectionReason: string | null;
  rejectedAt: string | null;
  confirmedAt: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  returnReason: string | null;
  returnEvidence: OrderReturnEvidence[];
  returnRequestedAt: string | null;
  returnReviewReason: string | null;
  returnReviewedAt: string | null;
  returnReviewedBy: string | null;
  stockRestoredAt: string | null;
  createdAt: string;
  updatedAt: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  itemCount: number;
}

export interface Order extends Omit<OrderSummary, "itemCount"> {
  items: OrderItem[];
}
