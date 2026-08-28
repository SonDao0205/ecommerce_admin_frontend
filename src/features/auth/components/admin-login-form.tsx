"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/src/core/api";
import { authService } from "@/src/features/auth";

const loginSchema = z.object({
  email: z.email("Email không đúng định dạng."),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
  remember: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function AdminLoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  async function onSubmit(values: LoginFormValues) {
    setApiError(null);

    try {
      const session = await authService.login({
        email: values.email,
        password: values.password,
      });

      if (!session.user.roles.includes("admin")) {
        authService.logout();
        setApiError("Tài khoản này không có quyền truy cập trang quản trị.");
        return;
      }

      toast.success("Đăng nhập thành công", {
        description: `Xin chào ${session.user.fullName ?? session.user.email}.`,
      });
      router.replace("/admin");
    } catch (error) {
      setApiError(
        error instanceof ApiError
          ? error.message
          : "Không thể kết nối máy chủ. Vui lòng thử lại.",
      );
    }
  }

  return (
    <Card className="w-full max-w-[420px] rounded-[14px] border-[#e5e7eb] py-0 shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
      <CardContent className="p-7 sm:p-[38px]">
        <div className="mb-7 flex items-center justify-center gap-2.5">
          <div className="flex size-[42px] items-center justify-center rounded-[9px] bg-[#ff5a1f] text-white">
            <ShoppingCart className="size-5" aria-hidden="true" />
          </div>
          <div className="text-[21px] font-bold tracking-tight">
            Shop<span className="text-[#ff5a1f]">Now</span>
          </div>
          <span className="rounded bg-[#222] px-2 py-1 text-[9px] font-semibold tracking-[0.14em] text-white">
            ADMIN
          </span>
        </div>

        <div className="mb-7 text-center">
          <h1 className="text-[25px] font-bold tracking-tight text-[#222]">
            Đăng nhập quản trị
          </h1>
          <p className="mt-2 text-[13px] leading-6 text-[#777]">
            Đăng nhập để truy cập hệ thống quản trị ShopNow.
          </p>
        </div>

        <form className="space-y-[17px]" onSubmit={handleSubmit(onSubmit)}>
          {apiError && (
            <Alert variant="destructive" className="py-3">
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#999]" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@shopnow.vn"
                aria-invalid={Boolean(errors.email)}
                className="h-[46px] rounded-lg border-[#e5e7eb] pl-10 text-[13px] focus-visible:border-[#ff5a1f] focus-visible:ring-[#ff5a1f]/10"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-semibold">
              Mật khẩu
            </Label>
            <div className="relative">
              <LockKeyhole className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#999]" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Nhập mật khẩu"
                aria-invalid={Boolean(errors.password)}
                className="h-[46px] rounded-lg border-[#e5e7eb] px-10 text-[13px] focus-visible:border-[#ff5a1f] focus-visible:ring-[#ff5a1f]/10"
                {...register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                className="absolute right-1 top-1/2 size-9 -translate-y-1/2 text-[#777] hover:bg-transparent"
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pb-1 text-xs">
            <div className="flex items-center gap-2 text-[#666]">
              <Checkbox
                id="remember"
                defaultChecked
                className="data-[checked]:border-[#ff5a1f] data-[checked]:bg-[#ff5a1f]"
                onCheckedChange={(checked) =>
                  setValue("remember", checked === true)
                }
              />
              <Label htmlFor="remember" className="font-normal">
                Ghi nhớ đăng nhập
              </Label>
            </div>
            <button
              type="button"
              className="font-semibold text-[#ff5a1f] hover:underline"
            >
              Quên mật khẩu?
            </button>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-[47px] w-full rounded-lg bg-[#ff5a1f] text-[13px] font-bold text-white hover:bg-[#e94b13]"
          >
            {isSubmitting && <LoaderCircle className="animate-spin" />}
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1.5 border-t border-[#e5e7eb] pt-[18px] text-[11px] text-[#999]">
          <ShieldCheck className="size-3.5" />
          ShopNow Administration System
        </div>
      </CardContent>
    </Card>
  );
}
