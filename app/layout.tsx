import type { Metadata } from "next";
import { AppProvider } from "@/src/providers/app-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShopNow | Mua sắm trực tuyến",
  description: "Sản phẩm chính hãng, giao hàng nhanh tại ShopNow.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
