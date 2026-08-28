export const inventoryKeys = {
  all: ["inventories"] as const,
  lists: () => [...inventoryKeys.all, "list"] as const,
  logs: (productId: string, variantId?: string) =>
    [...inventoryKeys.all, "logs", productId, variantId ?? "all"] as const,
};
