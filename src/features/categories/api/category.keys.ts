export const categoryKeys = {
  all: ["categories"] as const,
  roots: () => [...categoryKeys.all, "roots"] as const,
  children: (parentId: string) =>
    [...categoryKeys.all, "children", parentId] as const,
  activeRoots: () => [...categoryKeys.all, "product-picker", "roots"] as const,
  activeChildren: (parentId: string) =>
    [...categoryKeys.all, "product-picker", "children", parentId] as const,
};
