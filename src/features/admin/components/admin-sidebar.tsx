"use client";

import {
  Boxes,
  LayoutDashboard,
  LogOut,
  Package,
  Warehouse,
  Settings,
  ShoppingCart,
  Tags,
  Users,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { authService } from "@/src/features/auth";
import { useState } from "react";
import { ConfirmDialog } from "@/src/components/common/confirm-dialog";

interface SidebarItem {
  label: string;
  icon: LucideIcon;
  href?: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const sections: SidebarSection[] = [
  {
    title: "Tổng quan",
    items: [{ label: "Dashboard", icon: LayoutDashboard, href: "/admin" }],
  },
  {
    title: "Quản lý cửa hàng",
    items: [
      { label: "Sản phẩm", icon: Package, href: "/admin/products" },
      { label: "Danh mục", icon: Tags, href: "/admin/categories" },
      { label: "Đơn hàng", icon: ShoppingCart, href: "/admin/orders" },
      { label: "Tồn kho", icon: Warehouse, href: "/admin/inventory" },
    ],
  },
  {
    title: "Hệ thống",
    items: [{ label: "Cài đặt", icon: Settings }],
  },
];

export function AdminSidebar({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [logoutOpen, setLogoutOpen] = useState(false);

  function handleLogout() {
    authService.logout();
    setLogoutOpen(false);
    router.replace("/login");
  }

  return <>
    <aside
      className={cn(
        "flex h-full w-[250px] flex-col bg-[#171717] text-white",
        !mobile && "fixed inset-y-0 left-0 z-40 hidden lg:flex",
      )}
    >
      <div className="flex h-[72px] items-center border-b border-[#303030] px-6">
        <div className="mr-3 flex size-[38px] items-center justify-center rounded-[9px] bg-[#ff5a1f]">
          <Boxes className="size-5" />
        </div>
        <div className="text-xl font-bold">
          Shop<span className="text-[#ff5a1f]">Now</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3.5 py-5">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 mt-4 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#777] first:mt-0">
              {section.title}
            </p>
            {section.items.map((item) => {
              const isActive = item.href
                ? pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href))
                : false;
              const className = cn(
                "mb-1 flex h-[46px] w-full items-center rounded-lg px-3.5 text-sm text-[#bbb] transition hover:bg-[#292929] hover:text-white",
                isActive && "bg-[#ff5a1f] text-white hover:bg-[#ff5a1f]",
              );
              const content = (
                <>
                  <item.icon className="mr-3 size-[18px]" />
                  {item.label}
                </>
              );

              return item.href ? (
                <Link key={item.label} href={item.href} className={className}>
                  {content}
                </Link>
              ) : (
                <button key={item.label} type="button" className={className}>
                  {content}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-[#303030] p-3.5">
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="flex h-[46px] w-full items-center rounded-lg px-3.5 text-sm text-[#bbb] transition hover:bg-[#292929] hover:text-white"
        >
          <LogOut className="mr-3 size-[18px]" />
          Đăng xuất
        </button>
      </div>
    </aside>
    <ConfirmDialog
      open={logoutOpen}
      onOpenChange={setLogoutOpen}
      title="Xác nhận đăng xuất"
      description="Bạn có chắc muốn đăng xuất khỏi trang quản trị?"
      confirmLabel="Đăng xuất"
      onConfirm={handleLogout}
    />
  </>;
}
