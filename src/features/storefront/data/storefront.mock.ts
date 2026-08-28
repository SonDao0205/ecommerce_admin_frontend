import type { Product } from "@/src/features/products";

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  isActive: boolean;
}

export interface StorefrontProduct extends Product {
  brand: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  inventory: {
    stock: number;
    reservedStock: number;
    lowStockThreshold: number;
  };
}

export const mockCategories: StoreCategory[] = [
  { id: "cat-tech", name: "Công nghệ", slug: "cong-nghe", isActive: true },
  { id: "cat-phone", name: "Điện thoại", slug: "dien-thoai", parentId: "cat-tech", isActive: true },
  { id: "cat-laptop", name: "Laptop", slug: "laptop", parentId: "cat-tech", isActive: true },
  { id: "cat-fashion", name: "Thời trang", slug: "thoi-trang", isActive: true },
  { id: "cat-shoes", name: "Giày", slug: "giay", parentId: "cat-fashion", isActive: true },
  { id: "cat-watch", name: "Đồng hồ", slug: "dong-ho", isActive: true },
  { id: "cat-audio", name: "Âm thanh", slug: "am-thanh", parentId: "cat-tech", isActive: true },
];

const category = (id: string) => mockCategories.find((item) => item.id === id)!;

export const mockProducts: StorefrontProduct[] = [
  {
    id: "prod-iphone-15",
    name: "iPhone 15 Pro Max",
    slug: "iphone-15-pro-max",
    description: "<h2>Đẳng cấp từ Titan</h2><p>iPhone 15 Pro Max sở hữu thiết kế Titan cấp hàng không vũ trụ, chip A17 Pro và camera Telephoto 5x.</p><ul><li>Màn hình Super Retina XDR 6.7 inch.</li><li>Camera chính 48MP.</li><li>USB-C và thời lượng pin cả ngày.</li></ul>",
    sku: "IP15PM-BASE",
    unitPrice: 29990000,
    originalPrice: 32990000,
    thumbnailUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=85",
      "https://res.cloudinary.com/demo/video/upload/elephants.mp4",
    ],
    categoryId: "cat-phone",
    category: category("cat-phone"),
    isActive: true,
    brand: "Apple",
    rating: 4.9,
    reviewCount: 128,
    soldCount: 1240,
    inventory: { stock: 25, reservedStock: 3, lowStockThreshold: 5 },
    variants: [
      {
        id: "var-black",
        name: "Màu sắc",
        value: "Titan Đen",
        stock: 0,
        children: [
          { id: "var-black-256", name: "Dung lượng", value: "256GB", sku: "IP15PM-BLK-256", unitPrice: 29990000, stock: 12 },
          { id: "var-black-512", name: "Dung lượng", value: "512GB", sku: "IP15PM-BLK-512", unitPrice: 34990000, stock: 5 },
        ],
      },
      {
        id: "var-white",
        name: "Màu sắc",
        value: "Titan Trắng",
        stock: 0,
        children: [
          { id: "var-white-512", name: "Dung lượng", value: "512GB", sku: "IP15PM-WHT-512", unitPrice: 35490000, stock: 8 },
        ],
      },
      {
        id: "var-blue",
        name: "Màu sắc",
        value: "Titan Xanh",
        stock: 0,
        children: [
          { id: "var-blue-256", name: "Dung lượng", value: "256GB", sku: "IP15PM-BLU-256", unitPrice: 30490000, stock: 0 },
        ],
      },
    ],
  },
  {
    id: "prod-macbook-air",
    name: "MacBook Air M3 13 inch",
    slug: "macbook-air-m3-13-inch",
    description: "<h2>Siêu mỏng. Siêu mạnh.</h2><p>MacBook Air M3 mang đến hiệu năng mạnh mẽ trong thiết kế mỏng nhẹ, pin lên đến 18 giờ.</p>",
    sku: "MBA-M3-BASE",
    unitPrice: 26990000,
    originalPrice: 28990000,
    thumbnailUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=85"],
    categoryId: "cat-laptop",
    category: category("cat-laptop"),
    isActive: true,
    brand: "Apple",
    rating: 4.8,
    reviewCount: 86,
    soldCount: 620,
    inventory: { stock: 18, reservedStock: 2, lowStockThreshold: 4 },
    variants: [
      { id: "mba-midnight", name: "Màu sắc", value: "Midnight", stock: 0, children: [
        { id: "mba-midnight-256", name: "Bộ nhớ", value: "256GB", sku: "MBA-M3-MID-256", unitPrice: 26990000, stock: 10 },
        { id: "mba-midnight-512", name: "Bộ nhớ", value: "512GB", sku: "MBA-M3-MID-512", unitPrice: 31990000, stock: 4 },
      ] },
    ],
  },
  {
    id: "prod-airpods-pro",
    name: "AirPods Pro thế hệ 2 USB-C",
    slug: "airpods-pro-2-usb-c",
    description: "<p>Chống ồn chủ động thông minh, âm thanh thích ứng và hộp sạc USB-C tiện lợi.</p>",
    sku: "APP2-USBC",
    unitPrice: 5990000,
    originalPrice: 6490000,
    thumbnailUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=900&q=85",
    images: ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=1200&q=85"],
    categoryId: "cat-audio",
    category: category("cat-audio"),
    isActive: true,
    brand: "Apple",
    rating: 4.7,
    reviewCount: 240,
    soldCount: 2300,
    inventory: { stock: 42, reservedStock: 6, lowStockThreshold: 10 },
    variants: [],
  },
  {
    id: "prod-nike-air",
    name: "Nike Air Max Pulse",
    slug: "nike-air-max-pulse",
    description: "<p>Đệm Air thế hệ mới cùng thiết kế đường phố hiện đại, phù hợp cho mọi hoạt động hàng ngày.</p>",
    sku: "NIKE-AMP-BASE",
    unitPrice: 3890000,
    originalPrice: 4290000,
    thumbnailUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85"],
    categoryId: "cat-shoes",
    category: category("cat-shoes"),
    isActive: true,
    brand: "Nike",
    rating: 4.6,
    reviewCount: 51,
    soldCount: 410,
    inventory: { stock: 30, reservedStock: 2, lowStockThreshold: 5 },
    variants: [],
  },
  {
    id: "prod-watch",
    name: "Đồng hồ Minimal Silver",
    slug: "dong-ho-minimal-silver",
    description: "<p>Thiết kế tối giản với mặt kính khoáng và dây thép không gỉ thanh lịch.</p>",
    sku: "WATCH-MIN-SLV",
    unitPrice: 2490000,
    originalPrice: 2990000,
    thumbnailUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85"],
    categoryId: "cat-watch",
    category: category("cat-watch"),
    isActive: true,
    brand: "Nord",
    rating: 4.5,
    reviewCount: 34,
    soldCount: 185,
    inventory: { stock: 14, reservedStock: 1, lowStockThreshold: 3 },
    variants: [],
  },
];

export function getProductBySlug(slug: string) {
  return mockProducts.find((product) => product.slug === slug && product.isActive);
}
