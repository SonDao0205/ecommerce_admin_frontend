"use client";

import { ChevronDown, Menu, Search, UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AdminSidebar } from "./admin-sidebar";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { authService } from "@/src/features/auth";
import { AuditLogBell } from "@/src/features/audit-logs";

export function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const title = pathname.startsWith("/admin/categories")
    ? "Quản lý danh mục"
    : pathname.startsWith("/admin/products")
      ? "Quản lý sản phẩm"
      : pathname.startsWith("/admin/orders")
        ? "Quản lý đơn hàng"
        : pathname.startsWith("/admin/inventory")
          ? "Quản lý tồn kho"
          : "Tổng quan kinh doanh";

  function handleLogout() {
    authService.logout();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b bg-white px-4 sm:px-7">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" className="lg:hidden" />
            }
          >
            <Menu />
          </SheetTrigger>
          <SheetContent side="left" className="w-[250px] border-0 p-0">
            <SheetTitle className="sr-only">Menu quản trị</SheetTitle>
            <AdminSidebar mobile />
          </SheetContent>
        </Sheet>
        <div>
          <h2 className="text-base font-bold sm:text-lg">{title}</h2>
          <p className="mt-0.5 hidden text-xs text-[#888] sm:block">
            ShopNow Admin Dashboard
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <AuditLogBell />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg outline-none">
            <Avatar className="size-[38px] bg-[#fff2ec]">
              <AvatarFallback className="bg-[#fff2ec] text-[#ff5a1f]">
                <UserRound className="size-5" />
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-left sm:block">
              <strong className="block text-[13px]">Admin</strong>
              <span className="block text-[11px] text-[#999]">
                Administrator
              </span>
            </span>
            <ChevronDown className="hidden size-4 text-[#777] sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Tài khoản</DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
