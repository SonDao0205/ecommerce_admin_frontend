# Kiến trúc frontend và quy ước gọi API

```text
app/                         # Route, layout, loading, error của Next.js
src/
├── components/              # UI dùng chung (Button, Modal...)
├── core/
│   ├── api/                 # HttpClient + BaseApiService duy nhất
│   └── auth/                # Lưu/đọc token, có thể thay adapter
├── features/                # Chia theo nghiệp vụ
│   └── products/
│       ├── api/             # ProductService, query keys
│       ├── components/      # UI riêng của product
│       ├── hooks/           # React Query hooks
│       ├── schemas/         # Zod schema (khi cần)
│       └── types/           # Type riêng của product
├── providers/               # Provider toàn ứng dụng
├── stores/                  # Zustand stores toàn cục (khi cần)
├── types/                   # Type dùng chung
└── utils/                   # Hàm thuần dùng chung
```

## Quy tắc bắt buộc

1. Page/component không gọi `fetch` hoặc Axios trực tiếp.
2. Mỗi nghiệp vụ có một class kế thừa `BaseApiService`.
3. Chỉ `src/core/api/http-client.ts` xử lý URL, header, token, JSON và lỗi.
4. Server Component gọi service; Client Component gọi hook của feature.
5. Export API công khai của feature qua file `index.ts`.

## Cách gọi thống nhất

Server Component:

```tsx
import { productService } from "@/src/features/products";

export default async function ProductsPage() {
  const products = await productService.getAll();
  return <pre>{JSON.stringify(products, null, 2)}</pre>;
}
```

Client Component:

```tsx
"use client";

import { useProducts } from "@/src/features/products";

export function ProductList() {
  const { data = [], isPending, error } = useProducts();
  // render UI...
}
```

Thêm feature mới: sao chép cách tổ chức của `products`, tạo class service và
singleton. Không tạo thêm HTTP client và không xử lý token trong component.

## Biến môi trường

Sao chép `.env.example` thành `.env.local`. URL mặc định khi không cấu hình là
`http://localhost:8080/api/v1`.

> `TokenStorage` hiện dùng localStorage để tương thích API Bearer token hiện tại.
> Với production, nên chuyển sang BFF + cookie `httpOnly`; chỉ cần thay adapter,
> các service và page không phải đổi.
