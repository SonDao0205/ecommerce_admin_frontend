"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormModal } from "@/src/components/common/form-modal";
import { ApiError } from "@/src/core/api";
import {
  useCreateCategory,
  useRootCategories,
  useUpdateCategory,
  type Category,
  type CategoryPayload,
} from "@/src/features/categories";

const categorySchema = z.object({
  name: z.string().trim().min(2, "Tên danh mục phải có ít nhất 2 ký tự."),
  slug: z.string().trim().min(2, "Slug không được để trống."),
  description: z.string().trim().optional(),
  parentId: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  defaultParent?: Category | null;
}

export function CategoryFormModal({
  open,
  onOpenChange,
  category,
  defaultParent,
}: CategoryFormModalProps) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const rootsQuery = useRootCategories();
  const pending = createCategory.isPending || updateCategory.isPending;
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  });

  useEffect(() => {
    if (!open) return;
    reset({
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      parentId: category?.parentId ?? defaultParent?.id ?? "",
    });
  }, [category, defaultParent, open, reset]);

  async function onSubmit(values: CategoryFormValues) {
    const payload: CategoryPayload = {
      ...values,
      description: values.description || undefined,
      parentId: values.parentId || undefined,
    };

    try {
      if (category) {
        await updateCategory.mutateAsync({ id: category.id, payload });
        toast.success("Cập nhật danh mục thành công");
      } else {
        await createCategory.mutateAsync(payload);
        toast.success("Thêm danh mục thành công");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Có lỗi xảy ra. Vui lòng thử lại.",
      );
    }
  }

  return (
    <FormModal
      open={open}
      onOpenChange={(nextOpen) => !pending && onOpenChange(nextOpen)}
      title={category ? "Sửa danh mục" : "Thêm danh mục"}
      description={
        defaultParent
          ? `Danh mục mới sẽ nằm trong “${defaultParent.name}”.`
          : "Tạo danh mục gốc hoặc chọn một danh mục cha."
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Tên danh mục</Label>
            <Input {...register("name")} placeholder="Điện thoại" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input {...register("slug")} placeholder="dien-thoai" />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Danh mục cha</Label>
          <select
            {...register("parentId")}
            disabled={Boolean(defaultParent)}
            className="h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus:border-[#ff5a1f] focus:ring-3 focus:ring-[#ff5a1f]/10 disabled:bg-zinc-100"
          >
            <option value="">Không có — danh mục gốc</option>
            {defaultParent && (
              <option value={defaultParent.id}>{defaultParent.name}</option>
            )}
            {rootsQuery.data?.items
              .filter((root) => root.id !== category?.id && root.id !== defaultParent?.id)
              .map((root) => (
                <option key={root.id} value={root.id}>
                  {root.name}
                </option>
              ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label>Mô tả</Label>
          <Textarea {...register("description")} rows={4} placeholder="Mô tả ngắn về danh mục..." />
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button type="submit" disabled={pending} className="bg-[#ff5a1f] text-white hover:bg-[#e94b13]">
            {pending && <LoaderCircle className="animate-spin" />}
            {pending ? "Đang lưu..." : "Lưu danh mục"}
          </Button>
        </DialogFooter>
      </form>
    </FormModal>
  );
}
