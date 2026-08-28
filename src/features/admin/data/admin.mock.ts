export const productStats = [
  { label: "Tổng sản phẩm", value: "1,284", tone: "orange" },
  { label: "Đang bán", value: "1,102", tone: "green" },
  { label: "Sắp hết hàng", value: "36", tone: "amber" },
  { label: "Hết hàng", value: "18", tone: "red" },
] as const;

export const products = [
  {
    name: "Smartphone Pro Max 256GB",
    sku: "IP15PM-256",
    category: "iPhone",
    price: "29.990.000₫",
    stock: 126,
    status: "Đang bán",
  },
  {
    name: "Laptop Ultra M3",
    sku: "LAP-M3-512",
    category: "MacBook",
    price: "26.490.000₫",
    stock: 52,
    status: "Đang bán",
  },
  {
    name: "Tai nghe không dây Pro",
    sku: "AIR-PRO-02",
    category: "Phụ kiện",
    price: "5.490.000₫",
    stock: 9,
    status: "Sắp hết",
  },
  {
    name: "Đồng hồ thông minh S9",
    sku: "WATCH-S9",
    category: "Wearable",
    price: "10.990.000₫",
    stock: 0,
    status: "Hết hàng",
  },
] as const;
