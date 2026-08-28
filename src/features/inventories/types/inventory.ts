export interface InventoryVariant {
  id: string;
  parentId: string | null;
  name: string;
  value: string;
  parentName: string | null;
  parentValue: string | null;
  sku: string | null;
  stock: number;
  isActive: boolean;
}

export interface InventoryProduct {
  id: string;
  name: string;
  sku: string | null;
  thumbnailUrl: string | null;
  categoryId: string;
  categoryName: string;
  stock: number;
  reservedStock: number;
  availableStock: number;
  hasVariants: boolean;
  variants: InventoryVariant[];
  updatedAt: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  variantId: string | null;
  variantName: string | null;
  variantValue: string | null;
  variantSku: string | null;
  type: "import" | "export" | "adjustment" | "order_reserve" | "order_restock";
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string | null;
  actorId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  createdAt: string;
}

export interface UpdateInventoryPayload {
  variantId?: string;
  stock: number;
  expectedStock: number;
  reason: string;
}
