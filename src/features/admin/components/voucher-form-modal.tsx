"use client";

import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormModal } from "@/src/components/common/form-modal";
import { ApiError } from "@/src/core/api";
import { categoryService } from "@/src/features/categories";
import { useProducts } from "@/src/features/products";
import {
  useCreateVoucher,
  useUpdateVoucher,
  voucherService,
  type Voucher,
  type VoucherPayload,
} from "@/src/features/vouchers";

interface VoucherFormValues {
  name: string;
  code: string;
  description: string;
  status: Voucher["status"];
  discountType: Voucher["discountType"];
  discountValue: string;
  maxDiscountAmount: string;
  minimumOrderAmount: string;
  scope: Voucher["scope"];
  audience: Voucher["audience"];
  startAt: string;
  endAt: string;
  issuedQuantity: string;
  maxUsageCount: string;
  usageLimitPerUser: string;
  productIds: string[];
  categoryIds: string[];
  customerIds: string[];
  memberGroupIds: string[];
  combinableWithVouchers: boolean;
  combinableWithFlashSale: boolean;
  combinableWithPromotions: boolean;
}

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus:border-[#ff5a1f] focus:ring-2 focus:ring-[#ff5a1f]/10";
const toLocalDateTime = (value?: string) =>
  value ? new Date(value).toISOString().slice(0, 16) : "";
const splitIds = (value: string | string[]) =>
  (Array.isArray(value) ? value : value.split(/[\s,]+/))
    .map((id) => id.trim())
    .filter(Boolean);

export function VoucherFormModal({
  open,
  onOpenChange,
  voucher,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: Voucher | null;
}) {
  const createVoucher = useCreateVoucher();
  const updateVoucher = useUpdateVoucher();
  const pending = createVoucher.isPending || updateVoucher.isPending;
  const products = useProducts({
    page: 1,
    limit: 100,
    sortBy: "name",
    sortOrder: "ASC",
  });
  const categories = useQuery({
    queryKey: ["categories", "voucher-options"],
    queryFn: () =>
      categoryService.getAll({
        page: 1,
        limit: 100,
        sortBy: "name",
        sortOrder: "ASC",
      }),
  });
  const {
    register,
    reset,
    handleSubmit,
    getValues,
    control,
    formState: { errors },
  } = useForm<VoucherFormValues>();
  const discountType = useWatch({ control, name: "discountType" });
  const scope = useWatch({ control, name: "scope" });
  const audience = useWatch({ control, name: "audience" });
  const customers = useQuery({
    queryKey: ["vouchers", "customer-options"],
    queryFn: () => voucherService.getCustomerOptions(),
    enabled: open && audience === "specific_customers",
  });
  const memberGroups = useQuery({
    queryKey: ["vouchers", "member-group-options"],
    queryFn: () => voucherService.getMemberGroupOptions(),
    enabled: open && audience === "member_groups",
  });

  useEffect(() => {
    if (!open) return;
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    reset({
      name: voucher?.name ?? "",
      code: voucher?.code ?? "",
      description: voucher?.description ?? "",
      status: voucher?.status ?? "draft",
      discountType: voucher?.discountType ?? "percentage",
      discountValue: String(voucher?.discountValue ?? ""),
      maxDiscountAmount:
        voucher?.maxDiscountAmount == null
          ? ""
          : String(voucher.maxDiscountAmount),
      minimumOrderAmount: String(voucher?.minimumOrderAmount ?? 0),
      scope: voucher?.scope ?? "shop",
      audience: voucher?.audience ?? "all",
      startAt:
        toLocalDateTime(voucher?.startAt) || toLocalDateTime(now.toISOString()),
      endAt:
        toLocalDateTime(voucher?.endAt) ||
        toLocalDateTime(tomorrow.toISOString()),
      issuedQuantity:
        voucher?.issuedQuantity == null ? "" : String(voucher.issuedQuantity),
      maxUsageCount:
        voucher?.maxUsageCount == null ? "" : String(voucher.maxUsageCount),
      usageLimitPerUser: String(voucher?.usageLimitPerUser ?? 1),
      productIds: voucher?.productIds ?? [],
      categoryIds: voucher?.categoryIds ?? [],
      customerIds: voucher?.customerIds ?? [],
      memberGroupIds: voucher?.memberGroupIds ?? [],
      combinableWithVouchers: voucher?.combinableWithVouchers ?? false,
      combinableWithFlashSale: voucher?.combinableWithFlashSale ?? false,
      combinableWithPromotions: voucher?.combinableWithPromotions ?? false,
    });
  }, [open, reset, voucher]);

  async function onSubmit(values: VoucherFormValues) {
    const nullableNumber = (value: string) =>
      value === "" ? undefined : Number(value);
    const payload: VoucherPayload = {
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      description: values.description.trim() || undefined,
      status: values.status,
      voucherType: "order_discount",
      discountType: values.discountType,
      discountValue: Number(values.discountValue),
      maxDiscountAmount:
        values.discountType === "percentage"
          ? nullableNumber(values.maxDiscountAmount)
          : undefined,
      minimumOrderAmount: Number(values.minimumOrderAmount),
      scope: values.scope,
      audience: values.audience,
      startAt: new Date(values.startAt).toISOString(),
      endAt: new Date(values.endAt).toISOString(),
      issuedQuantity: nullableNumber(values.issuedQuantity),
      maxUsageCount: nullableNumber(values.maxUsageCount),
      usageLimitPerUser: Number(values.usageLimitPerUser),
      combinableWithVouchers: values.combinableWithVouchers,
      combinableWithFlashSale: values.combinableWithFlashSale,
      combinableWithPromotions: values.combinableWithPromotions,
      ...(values.scope === "products" ? { productIds: values.productIds } : {}),
      ...(values.scope === "categories"
        ? { categoryIds: values.categoryIds }
        : {}),
      ...(values.audience === "specific_customers"
        ? { customerIds: splitIds(values.customerIds) }
        : {}),
      ...(values.audience === "member_groups"
        ? { memberGroupIds: splitIds(values.memberGroupIds) }
        : {}),
    };
    try {
      if (voucher) await updateVoucher.mutateAsync({ id: voucher.id, payload });
      else await createVoucher.mutateAsync(payload);
      toast.success(
        voucher ? "Cập nhật voucher thành công" : "Thêm voucher thành công",
      );
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Không thể lưu voucher.",
      );
    }
  }

  return (
    <FormModal
      open={open}
      onOpenChange={(next) => !pending && onOpenChange(next)}
      title={voucher ? "Sửa voucher" : "Thêm voucher"}
      description="Thiết lập điều kiện, phạm vi và giới hạn sử dụng."
      className="sm:max-w-[820px]"
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <section className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên voucher" error={errors.name?.message}>
            <Input
              {...register("name", {
                required: "Tên voucher không được để trống.",
              })}
              placeholder="Khuyến mãi đầu tháng"
            />
          </Field>
          <Field label="Mã voucher" error={errors.code?.message}>
            <Input
              {...register("code", {
                required: "Mã voucher không được để trống.",
                pattern: {
                  value: /^[A-Za-z0-9_-]+$/,
                  message: "Chỉ dùng chữ, số, _ hoặc -.",
                },
              })}
              className="uppercase"
              placeholder="SALE20"
            />
          </Field>
          <Field label="Trạng thái">
            <select {...register("status")} className={selectClass}>
              <option value="draft">Bản nháp</option>
              <option value="active">Đang hoạt động</option>
              <option value="expired">Hết hạn</option>
              <option value="disabled">Vô hiệu hóa</option>
            </select>
          </Field>
          <Field label="Loại giảm">
            <select {...register("discountType")} className={selectClass}>
              <option value="percentage">Theo phần trăm</option>
              <option value="fixed_amount">Số tiền cố định</option>
            </select>
          </Field>
        </section>
        <Field label="Mô tả">
          <Textarea
            {...register("description")}
            rows={3}
            placeholder="Mô tả chương trình..."
          />
        </Field>

        <section className="grid gap-4 rounded-lg border p-4 sm:grid-cols-3">
          <Field
            label={
              discountType === "percentage" ? "Mức giảm (%)" : "Số tiền giảm"
            }
            error={errors.discountValue?.message}
          >
            <Input
              type="number"
              step="0.01"
              {...register("discountValue", {
                required: "Bắt buộc",
                min: { value: 0.01, message: "Phải lớn hơn 0" },
                max:
                  discountType === "percentage"
                    ? { value: 100, message: "Tối đa 100%" }
                    : undefined,
              })}
            />
          </Field>
          {discountType === "percentage" && (
            <Field
              label="Giảm tối đa"
              error={errors.maxDiscountAmount?.message}
            >
              <Input
                type="number"
                {...register("maxDiscountAmount", {
                  required: "Bắt buộc với giảm phần trăm",
                  min: { value: 1, message: "Phải lớn hơn 0" },
                })}
              />
            </Field>
          )}
          <Field label="Đơn hàng tối thiểu">
            <Input
              type="number"
              min="0"
              {...register("minimumOrderAmount", { required: true })}
            />
          </Field>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <Field label="Phạm vi áp dụng">
            <select {...register("scope")} className={selectClass}>
              <option value="shop">Toàn shop</option>
              <option value="products">Theo sản phẩm</option>
              <option value="categories">Theo danh mục</option>
            </select>
          </Field>
          {scope === "products" && (
            <Field
              label="Sản phẩm (giữ Ctrl/Cmd để chọn nhiều)"
              error={errors.productIds?.message as string}
            >
              <select
                multiple
                {...register("productIds", {
                  validate: (v) => v.length > 0 || "Chọn ít nhất một sản phẩm",
                })}
                className={`${selectClass} h-28`}
              >
                {products.data?.items.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {scope === "categories" && (
            <Field
              label="Danh mục (giữ Ctrl/Cmd để chọn nhiều)"
              error={errors.categoryIds?.message as string}
            >
              <select
                multiple
                {...register("categoryIds", {
                  validate: (v) => v.length > 0 || "Chọn ít nhất một danh mục",
                })}
                className={`${selectClass} h-28`}
              >
                {categories.data?.items.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Đối tượng sử dụng">
            <select {...register("audience")} className={selectClass}>
              <option value="all">Tất cả khách hàng</option>
              <option value="new_customers">Khách hàng mới</option>
              <option value="existing_customers">Khách hàng cũ</option>
              <option value="member_groups">Nhóm thành viên</option>
              <option value="specific_customers">Khách hàng cụ thể</option>
            </select>
          </Field>
          {audience === "specific_customers" && (
            <Field
              label="Khách hàng (giữ Ctrl/Cmd để chọn nhiều)"
              error={errors.customerIds?.message}
            >
              <select
                multiple
                {...register("customerIds", {
                  validate: (value) =>
                    value.length > 0 || "Chọn ít nhất một khách hàng",
                })}
                className={`${selectClass} h-28`}
              >
                {customers.data?.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name ||
                      customer.email ||
                      customer.phone ||
                      customer.id}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {audience === "member_groups" && (
            <Field
              label="Nhóm thành viên (giữ Ctrl/Cmd để chọn nhiều)"
              error={errors.memberGroupIds?.message}
            >
              <select
                multiple
                {...register("memberGroupIds", {
                  validate: (value) =>
                    value.length > 0 || "Chọn ít nhất một nhóm",
                })}
                className={`${selectClass} h-28`}
              >
                {memberGroups.data?.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </section>

        <section className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Bắt đầu">
            <Input
              type="datetime-local"
              {...register("startAt", { required: true })}
            />
          </Field>
          <Field label="Kết thúc">
            <Input
              type="datetime-local"
              {...register("endAt", {
                required: true,
                validate: (v) =>
                  new Date(v) > new Date(getValues("startAt")) ||
                  "Phải sau thời gian bắt đầu",
              })}
            />
          </Field>
          <Field label="Số voucher phát hành">
            <Input
              type="number"
              min="1"
              placeholder="Không giới hạn"
              {...register("issuedQuantity")}
            />
          </Field>
          <Field label="Tổng lượt sử dụng tối đa">
            <Input
              type="number"
              min={Math.max(1, voucher?.usedCount ?? 1)}
              placeholder="Không giới hạn"
              {...register("maxUsageCount")}
            />
          </Field>
          <Field label="Giới hạn mỗi khách">
            <Input
              type="number"
              min="1"
              {...register("usageLimitPerUser", { required: true })}
            />
          </Field>
        </section>

        <section className="space-y-3 rounded-lg border p-4">
          <p className="text-sm font-semibold">Quy tắc kết hợp</p>
          <Check
            label="Dùng chung với voucher khác"
            registration={register("combinableWithVouchers")}
          />
          <Check
            label="Dùng chung với flash sale"
            registration={register("combinableWithFlashSale")}
          />
          <Check
            label="Dùng chung với chương trình giảm giá khác"
            registration={register("combinableWithPromotions")}
          />
        </section>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={pending}
            className="bg-[#ff5a1f] text-white hover:bg-[#e94b13]"
          >
            {pending && <LoaderCircle className="animate-spin" />}
            {pending ? "Đang lưu..." : "Lưu voucher"}
          </Button>
        </DialogFooter>
      </form>
    </FormModal>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
function Check({
  label,
  registration,
}: {
  label: string;
  registration: ReturnType<
    ReturnType<typeof useForm<VoucherFormValues>>["register"]
  >;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        {...registration}
        className="size-4 accent-[#ff5a1f]"
      />
      {label}
    </label>
  );
}
