import type { PropsWithChildren } from "react";
import { AdminHeader } from "@/src/features/admin/components/admin-header";
import { AdminSidebar } from "@/src/features/admin/components/admin-sidebar";
import { AuthRouteGuard } from "@/src/core/auth/auth-route-guard";

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <AuthRouteGuard mode="admin">
      <div className="min-h-screen bg-[#f5f6f8] text-[#222]">
        <AdminSidebar />
        <main className="lg:ml-[250px]">
          <AdminHeader />
          {children}
        </main>
      </div>
    </AuthRouteGuard>
  );
}
