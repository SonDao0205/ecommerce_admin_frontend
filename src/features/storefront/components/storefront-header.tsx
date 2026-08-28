import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function StorefrontHeader({ query = "" }: { query?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-3 px-4 lg:px-6">
        <Link href="/" className="shrink-0 text-2xl font-black tracking-tight text-[#ff5a1f]">ShopNow</Link>
        <Button variant="outline" className="hidden md:inline-flex"><Menu /> Danh mục</Button>
        <form action="/" className="flex flex-1 overflow-hidden rounded-xl border-2 border-[#ff5a1f] bg-white">
          <Input name="q" defaultValue={query} placeholder="Tìm kiếm sản phẩm..." className="h-10 flex-1 rounded-none border-0 shadow-none focus-visible:ring-0" />
          <Button type="submit" className="h-10 rounded-none bg-[#ff5a1f] px-5 text-white hover:bg-[#e94b13]"><Search /> <span className="hidden sm:inline">Tìm</span></Button>
        </form>
        <nav className="hidden items-center gap-1 lg:flex">
          <Button variant="ghost" size="sm"><Heart /> Yêu thích</Button>
          <Button variant="ghost" size="sm"><ShoppingBag /> Giỏ hàng</Button>
          <Button nativeButton={false} variant="ghost" size="sm" render={<Link href="/login" />}><UserRound /> Tài khoản</Button>
        </nav>
      </div>
      <div className="border-t">
        <nav className="mx-auto flex max-w-7xl gap-7 overflow-x-auto px-4 py-3 text-sm whitespace-nowrap lg:px-6">
          <Link href="/" className="font-semibold text-[#ff5a1f]">Trang chủ</Link>
          <Link href="/#products">Sản phẩm</Link>
          <Link href="/#products">Flash Sale</Link>
          <Link href="/#products">Sản phẩm mới</Link>
          <Link href="/#products">Bán chạy</Link>
          <Link href="/login">Quản trị</Link>
        </nav>
      </div>
    </header>
  );
}
