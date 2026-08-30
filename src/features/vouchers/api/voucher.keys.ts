export const voucherKeys = {
  all: ["vouchers"] as const,
  lists: () => [...voucherKeys.all, "list"] as const,
  detail: (id: string) => [...voucherKeys.all, "detail", id] as const,
};
