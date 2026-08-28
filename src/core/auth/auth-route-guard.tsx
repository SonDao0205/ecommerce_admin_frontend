"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { useAdminSession, useHydrated } from "./use-auth-session";

interface AuthRouteGuardProps extends PropsWithChildren {
  mode: "admin" | "guest";
}

export function AuthRouteGuard({ mode, children }: AuthRouteGuardProps) {
  const router = useRouter();
  const hydrated = useHydrated();
  const isAdmin = useAdminSession();
  const allowed = mode === "admin" ? isAdmin : !isAdmin;

  useEffect(() => {
    if (!hydrated || allowed) return;
    router.replace(mode === "admin" ? "/login" : "/admin");
  }, [allowed, hydrated, mode, router]);

  if (!hydrated || !allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f6f8]">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin text-[#ff5a1f]" />
          Đang kiểm tra phiên đăng nhập...
        </div>
      </main>
    );
  }

  return children;
}
