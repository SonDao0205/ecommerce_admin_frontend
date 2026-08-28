"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormModal } from "@/src/components/common/form-modal";
import { ApiError } from "@/src/core/api";
import {
  useCreateProduct,
  useUpdateProduct,
  productService,
  type Product,
  type ProductMultipartPayload,
  type ProductVariantGroupInput,
} from "@/src/features/products";
import { CategoryCascader } from "./category-cascader";
import {
  ProductImageManager,
  type ProductImagesValue,
} from "./product-image-manager";
import { RichTextEditor } from "./rich-text-editor";
import { ProductVariantEditor } from "./product-variant-editor";

const productSchema = z.object({
  name: z.string().trim().min(2, "Tên sản phẩm phải có ít nhất 2 ký tự."),
  slug: z.string().trim().min(2, "Slug không được để trống."),
  description: z.string().refine(
    (html) => html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length > 0,
    "Mô tả không được để trống.",
  ),
  sku: z.string().trim().min(1, "SKU không được để trống."),
  unitPrice: z.number().min(0, "Giá không thể nhỏ hơn 0."),
  stock: z
    .number()
    .int("Tồn kho phải là số nguyên.")
    .min(0, "Tồn kho không thể nhỏ hơn 0."),
  categoryId: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onBackgroundCreate?: (payload: ProductMultipartPayload) => void;
}

function errorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Có lỗi xảy ra. Vui lòng thử lại.";
}

export function ProductFormModal({
  open,
  onOpenChange,
  product,
  onBackgroundCreate,
}: ProductFormModalProps) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [validatingSkus, setValidatingSkus] = useState(false);
  const pending =
    validatingSkus || createProduct.isPending || updateProduct.isPending;
  const initialUrls = Array.from(
    new Set([
      ...(product?.thumbnailUrl ? [product.thumbnailUrl] : []),
      ...(product?.images ?? []),
    ]),
  );
  const [imagesValue, setImagesValue] = useState<ProductImagesValue>({
    files: [],
    manifest: initialUrls.map((url) => ({ kind: "existing", url })),
    thumbnailIndex: product?.thumbnailUrl
      ? initialUrls.indexOf(product.thumbnailUrl)
      : undefined,
  });
  const [variantsValue, setVariantsValue] = useState<ProductVariantGroupInput[]>(
    () =>
      (product?.variants ?? []).map((group) => ({
        id: group.id,
        name: group.name,
        value: group.value,
        children: (group.children ?? []).map((child) => ({
          id: child.id,
          name: child.name,
          value: child.value,
          sku: child.sku ?? "",
          unitPrice: Number(child.unitPrice ?? 0),
          stock: child.stock ?? 0,
        })),
      })),
  );
  const [variantSkuErrors, setVariantSkuErrors] = useState<Record<string, string>>({});
  const {
    register,
    reset,
    setValue,
    setError,
    clearErrors,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      sku: "",
      unitPrice: 0,
      stock: 0,
      categoryId: "",
    },
  });
  const categoryId = useWatch({ control, name: "categoryId" });
  const description = useWatch({ control, name: "description" });

  useEffect(() => {
    if (!open) return;
    reset({
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      sku: product?.sku ?? "",
      unitPrice: product?.unitPrice ?? 0,
      stock: product?.stock ?? product?.availableStock ?? 0,
      categoryId: product?.categoryId ?? "",
    });
  }, [open, product, reset]);

  async function onSubmit(values: ProductFormValues) {
    const payload: ProductMultipartPayload = {
      product: {
        ...values,
        stock: variantsValue.length === 0 ? values.stock : undefined,
        categoryId: values.categoryId || undefined,
        variants: variantsValue,
      },
      files: imagesValue.files,
      imageManifest: imagesValue.manifest,
      thumbnailIndex: imagesValue.thumbnailIndex,
    };

    setValidatingSkus(true);
    try {
      clearErrors("sku");
      setVariantSkuErrors({});
      await productService.validateSkus({
        sku: values.sku,
        variantSkus: variantsValue.flatMap((group) =>
          group.children.map((child) => child.sku),
        ),
        productId: product?.id,
      });
      if (product) {
        await updateProduct.mutateAsync({ id: product.id, payload });
        toast.success("Cập nhật sản phẩm thành công");
      } else if (payload.files.length > 0 && onBackgroundCreate) {
        onBackgroundCreate(payload);
        toast.success("Đã bắt đầu tải ảnh trong nền");
        onOpenChange(false);
        return;
      } else {
        await createProduct.mutateAsync(payload);
        toast.success("Thêm sản phẩm thành công");
      }
      onOpenChange(false);
    } catch (error) {
      if (applySkuErrors(error)) return;
      toast.error(errorMessage(error));
    } finally {
      setValidatingSkus(false);
    }
  }

  function applySkuErrors(error: unknown): boolean {
    if (!(error instanceof ApiError) || typeof error.details !== "object" || !error.details) {
      return false;
    }
    const details = error.details as {
      fieldErrors?: {
        sku?: string;
        variantSkus?: Record<string, string>;
      };
    };
    if (!details.fieldErrors) return false;
    if (details.fieldErrors.sku) {
      setError("sku", { type: "server", message: details.fieldErrors.sku });
    }
    setVariantSkuErrors(details.fieldErrors.variantSkus ?? {});
    return Boolean(details.fieldErrors.sku || details.fieldErrors.variantSkus);
  }

  return (
    <FormModal
      open={open}
      onOpenChange={(nextOpen) => !pending && onOpenChange(nextOpen)}
      title={product ? "Sửa sản phẩm" : "Thêm sản phẩm"}
      description="Nhập đầy đủ thông tin sản phẩm trước khi lưu."
      className="sm:max-w-[1100px]"
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên sản phẩm" error={errors.name?.message}>
            <Input {...register("name")} placeholder="iPhone 15 Pro Max" />
          </Field>
          <Field label="Slug" error={errors.slug?.message}>
            <Input {...register("slug")} placeholder="iphone-15-pro-max" />
          </Field>
          <Field label="SKU" error={errors.sku?.message}>
            <Input
              {...register("sku", {
                onChange: () => clearErrors("sku"),
              })}
              aria-invalid={Boolean(errors.sku)}
              placeholder="IP15PM-256"
            />
          </Field>
          <Field label="Giá bán" error={errors.unitPrice?.message}>
            <Input
              {...register("unitPrice", { valueAsNumber: true })}
              type="number"
              min="0"
            />
          </Field>
          {variantsValue.length === 0 && (
            <Field label="Tồn kho sản phẩm" error={errors.stock?.message}>
              <Input
                {...register("stock", { valueAsNumber: true })}
                type="number"
                min="0"
                step="1"
                required
                placeholder="Nhập số lượng tồn kho"
              />
            </Field>
          )}
          <div className="sm:col-span-2">
            <Field label="Danh mục" error={errors.categoryId?.message}>
              <CategoryCascader
                key={`${product?.id ?? "new"}-${open}`}
                value={categoryId}
                initialLabel={product?.category?.name}
                disabled={pending}
                onChange={(id) =>
                  setValue("categoryId", id, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
            </Field>
          </div>
        </div>
        <ProductVariantEditor
          key={`variants-${product?.id ?? "new"}-${open}`}
          initialVariants={product?.variants}
          disabled={pending}
          skuErrors={variantSkuErrors}
          onChange={(variants) => {
            setVariantsValue(variants);
            setVariantSkuErrors({});
          }}
        />
        <Field label="Hình ảnh sản phẩm">
          <ProductImageManager
            key={`images-${product?.id ?? "new"}-${open}`}
            initialImages={product?.images}
            initialThumbnail={product?.thumbnailUrl}
            disabled={pending}
            onChange={setImagesValue}
          />
        </Field>
        <Field label="Mô tả" error={errors.description?.message}>
          <RichTextEditor
            value={description}
            disabled={pending}
            onChange={(html) =>
              setValue("description", html, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
        </Field>

        <DialogFooter className="mt-6">
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
            {validatingSkus
              ? "Đang kiểm tra SKU..."
              : pending
                ? "Đang lưu..."
                : "Lưu sản phẩm"}
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
