import type { Metadata } from "next";
import { AdminLoginForm } from "@/src/features/auth/components/admin-login-form";
import { AuthRouteGuard } from "@/src/core/auth/auth-route-guard";

export const metadata: Metadata = {
  title: "Đăng nhập quản trị | ShopNow",
  description: "Đăng nhập vào hệ thống quản trị ShopNow.",
};

export default function LoginPage() {
  return (
    <AuthRouteGuard mode="guest">
      <main className="flex min-h-screen items-center justify-center bg-[#f5f6f8] p-5">
        <AdminLoginForm />
      </main>
    </AuthRouteGuard>
  );
}
