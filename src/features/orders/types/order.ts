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

export type PaymentStatus =
  | "pending"
  | "success"
  | "failed"
  | "cancelled"
  | "expired"
  | "review_required"
  | "refunded";

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  provider: "cod" | "sepay" | "mock" | "stripe" | "vnpay";
  method: "cod" | "sepay_bank_transfer" | "sepay_card" | "sepay_napas";
  invoiceNumber: string;
  providerOrderId: string | null;
  transactionId: string | null;
  currency: string;
  attemptNumber: number;
  expiresAt: string | null;
  paidAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
  lastVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

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
  payment: Payment | null;
}

export interface Order extends Omit<OrderSummary, "itemCount"> {
  items: OrderItem[];
}
