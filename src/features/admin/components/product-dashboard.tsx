"use client";

import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  EyeOff,
  LoaderCircle,
  Package,
  PackageCheck,
  PackageX,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/src/components/common/confirm-dialog";
import { FormModal } from "@/src/components/common/form-modal";
import { ApiError } from "@/src/core/api";
import {
  useCreateProduct,
  useProducts,
  useUpdateProductStatus,
  type Product,
  type ProductImageManifestItem,
  type ProductMultipartPayload,
} from "@/src/features/products";
import { ProductFormModal } from "./product-form-modal";

const PAGE_SIZE = 10;

interface ProductUploadTask {
  id: string;
  payload: ProductMultipartPayload;
  previewUrls: string[];
  status: "uploading" | "error";
  error?: string;
  failedIndexes: number[];
}

function UploadMediaPreview({
  url,
  file,
  alt,
}: {
  url: string;
  file?: File;
  alt: string;
}) {
  if (file?.type.startsWith("video/")) {
    return <video src={url} muted preload="metadata" className="h-full w-full object-cover" />;
  }
  return <Image src={url} alt={alt} fill unoptimized className="object-cover" />;
}

function formatPrice(value: number | string) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value));
}

function getProductStock(product: Product): number {
  if (typeof product.availableStock === "number") return product.availableStock;
  return (product.variants ?? []).reduce(
    (total, parent) =>
      total +
      (parent.children ?? []).reduce(
        (groupTotal, variant) => groupTotal + variant.stock,
        0,
      ),
    0,
  );
}

function getPendingProductStock(payload: ProductMultipartPayload): number {
  const variants = payload.product.variants ?? [];
  if (variants.length === 0) return payload.product.stock ?? 0;
  return variants.reduce(
    (total, parent) =>
      total +
      parent.children.reduce(
        (groupTotal, variant) => groupTotal + variant.stock,
        0,
      ),
    0,
  );
}

export function ProductDashboard() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [statusProduct, setStatusProduct] = useState<Product | null>(null);
  const [uploadTasks, setUploadTasks] = useState<ProductUploadTask[]>([]);
  const [errorTaskId, setErrorTaskId] = useState<string>();
  const createProduct = useCreateProduct();
  const updateProductStatus = useUpdateProductStatus();
  const errorTask = uploadTasks.find((task) => task.id === errorTaskId);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const productsQuery = useProducts({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });
  const data = productsQuery.data;
  const activeOnPage = data?.items.filter((item) => item.isActive).length ?? 0;
  const inactiveOnPage = (data?.items.length ?? 0) - activeOnPage;

  const stats = [
    { label: "Tổng sản phẩm", value: data?.meta.totalItems ?? 0, icon: Package },
    {
      label: "Trong trang này",
      value: data?.items.length ?? 0,
      icon: PackageCheck,
    },
    { label: "Đang bán", value: activeOnPage, icon: PackageCheck },
    { label: "Đã ẩn", value: inactiveOnPage, icon: PackageX },
  ];

  function openCreateForm() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  async function handleStatusChange() {
    if (!statusProduct) return;
    const nextActive = !statusProduct.isActive;
    try {
      await updateProductStatus.mutateAsync({
        id: statusProduct.id,
        isActive: nextActive,
      });
      toast.success(`${nextActive ? "Hiện" : "Ẩn"} sản phẩm thành công`);
      setStatusProduct(null);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : `Không thể ${nextActive ? "hiện" : "ẩn"} sản phẩm.`,
      );
    }
  }

  function startBackgroundCreate(payload: ProductMultipartPayload) {
    const task: ProductUploadTask = {
      id: crypto.randomUUID(),
      payload,
      previewUrls: payload.files.map((file) => URL.createObjectURL(file)),
      status: "uploading",
      failedIndexes: [],
    };
    setUploadTasks((current) => [task, ...current]);
    void runUploadTask(task);
  }

  async function runUploadTask(task: ProductUploadTask) {
    setUploadTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? { ...item, status: "uploading", error: undefined, failedIndexes: [] }
          : item,
      ),
    );
    try {
      await createProduct.mutateAsync(task.payload);
      task.previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setUploadTasks((current) => current.filter((item) => item.id !== task.id));
      setErrorTaskId((current) => (current === task.id ? undefined : current));
      toast.success(`Sản phẩm “${task.payload.product.name}” đã sẵn sàng`);
    } catch (error) {
      const details = error instanceof ApiError && typeof error.details === "object"
        ? (error.details as { failedIndexes?: unknown })
        : undefined;
      const serverIndexes = Array.isArray(details?.failedIndexes)
        ? details.failedIndexes.filter((index): index is number => Number.isInteger(index))
        : [];
      const failedIndexes = serverIndexes.length
        ? serverIndexes
        : task.payload.files.map((_, index) => index);
      setUploadTasks((current) =>
        current.map((item) =>
          item.id === task.id
            ? {
                ...item,
                status: "error",
                error: error instanceof ApiError ? error.message : "Không thể tải ảnh lên.",
                failedIndexes,
              }
            : item,
        ),
      );
      toast.error(
        error instanceof ApiError
          ? error.message
          : `Không thể thêm sản phẩm “${task.payload.product.name}” vào database.`,
      );
    }
  }

  function removeFailedImages(task: ProductUploadTask, indexes: number[]) {
    const removed = new Set(indexes);
    const indexMap = new Map<number, number>();
    const nextFiles = task.payload.files.filter((_, index) => {
      if (removed.has(index)) {
        URL.revokeObjectURL(task.previewUrls[index]);
        return false;
      }
      indexMap.set(index, indexMap.size);
      return true;
    });
    const oldThumbnailItem = task.payload.imageManifest[task.payload.thumbnailIndex ?? -1];
    const nextManifest = task.payload.imageManifest.flatMap<ProductImageManifestItem>((item) => {
      if (item.kind === "existing") return [item];
      const nextIndex = indexMap.get(item.fileIndex);
      return nextIndex === undefined ? [] : [{ kind: "new", fileIndex: nextIndex }];
    });
    const nextThumbnailIndex = oldThumbnailItem
      ? nextManifest.findIndex((item) =>
          oldThumbnailItem.kind === "existing" && item.kind === "existing"
            ? item.url === oldThumbnailItem.url
            : oldThumbnailItem.kind === "new" && item.kind === "new"
              ? item.fileIndex === indexMap.get(oldThumbnailItem.fileIndex)
              : false,
        )
      : -1;
    const nextTask: ProductUploadTask = {
      ...task,
      payload: {
        ...task.payload,
        files: nextFiles,
        imageManifest: nextManifest,
        thumbnailIndex: nextManifest.length
          ? Math.max(0, nextThumbnailIndex)
          : undefined,
      },
      previewUrls: task.previewUrls.filter((_, index) => !removed.has(index)),
      status: "uploading",
      error: undefined,
      failedIndexes: [],
    };
    setErrorTaskId(undefined);
    setUploadTasks((current) =>
      current.map((item) => (item.id === task.id ? nextTask : item)),
    );
    void runUploadTask(nextTask);
  }

  return (
    <div className="p-4 sm:p-7">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#222] sm:text-[25px]">
            Quản lý sản phẩm
          </h1>
          <p className="mt-1.5 text-[13px] text-[#777]">
            Dữ liệu được tải trực tiếp từ hệ thống ShopNow.
          </p>
        </div>
        <Button onClick={openCreateForm} className="bg-[#ff5a1f] text-white hover:bg-[#e94b13]">
          <Plus /> Thêm sản phẩm
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-[10px] py-0 shadow-none">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-12 items-center justify-center rounded-[10px] bg-[#fff2ec] text-[#ff5a1f]">
                <stat.icon className="size-[21px]" />
              </div>
              <div>
                <p className="text-xs text-[#888]">{stat.label}</p>
                <p className="mt-1 text-[23px] font-bold text-[#222]">
                  {productsQuery.isPending ? "—" : stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden rounded-[10px] py-0 shadow-none">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-[360px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#999]" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm tên hoặc SKU..."
              className="h-10 bg-[#fafafa] pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => productsQuery.refetch()}
            disabled={productsQuery.isFetching}
          >
            <RefreshCw
              className={productsQuery.isFetching ? "animate-spin" : ""}
            />
            Làm mới
          </Button>
        </div>

        {productsQuery.isError && (
          <Alert variant="destructive" className="m-4 w-auto">
            <AlertDescription className="flex items-center justify-between gap-3">
              Không thể tải danh sách sản phẩm.
              <Button size="sm" variant="outline" onClick={() => productsQuery.refetch()}>
                Thử lại
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#fafafa] hover:bg-[#fafafa]">
                <TableHead>Sản phẩm</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Tồn kho còn lại</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsQuery.isPending &&
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {uploadTasks.map((task) => (
                <TableRow key={task.id} className="bg-orange-50/40">
                  <TableCell>
                    <div className="flex min-w-[230px] items-center gap-3">
                      <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                        {task.previewUrls[0] ? (
                          <UploadMediaPreview
                            url={task.previewUrls[0]}
                            file={task.payload.files[0]}
                            alt={task.payload.product.name}
                          />
                        ) : (
                          <Package className="size-5" />
                        )}
                      </div>
                      <div>
                        <strong className="block text-[13px]">{task.payload.product.name}</strong>
                        <span className="text-[11px] text-muted-foreground">{task.payload.product.slug}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{task.payload.product.sku ?? "—"}</TableCell>
                  <TableCell>Đang xử lý</TableCell>
                  <TableCell className="font-semibold">{formatPrice(task.payload.product.unitPrice)}</TableCell>
                  <TableCell className="font-semibold tabular-nums">
                    {getPendingProductStock(task.payload).toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    {task.status === "uploading" ? (
                      <Badge className="border-0 bg-orange-100 text-orange-700">
                        <LoaderCircle className="animate-spin" /> Đang tải ảnh
                      </Badge>
                    ) : (
                      <Badge className="border-0 bg-red-100 text-red-700">Upload lỗi</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {task.status === "error" && (
                      <Button variant="outline" size="sm" onClick={() => setErrorTaskId(task.id)}>
                        <Eye /> Xem lỗi
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {data?.items.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex min-w-[230px] items-center gap-3">
                      <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f4f4f4] text-[#777]">
                        {product.thumbnailUrl ? (
                          <Image
                            src={product.thumbnailUrl}
                            alt={product.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <Package className="size-5" />
                        )}
                      </div>
                      <div>
                        <strong className="block text-[13px]">{product.name}</strong>
                        <span className="text-[11px] text-[#999]">{product.slug}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.sku ?? "—"}</TableCell>
                  <TableCell>{product.category?.name ?? "Chưa phân loại"}</TableCell>
                  <TableCell className="font-semibold">
                    {formatPrice(product.unitPrice)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        getProductStock(product) > 0
                          ? "font-semibold tabular-nums text-slate-700"
                          : "font-semibold text-red-600"
                      }
                    >
                      {getProductStock(product).toLocaleString("vi-VN")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        product.isActive
                          ? "border-0 bg-green-100 text-green-700"
                          : "border-0 bg-zinc-100 text-zinc-600"
                      }
                    >
                      {product.isActive ? "Đang bán" : "Đã ẩn"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Sửa"
                        onClick={() => openEditForm(product)}
                      >
                        <Edit3 />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={product.isActive ? "Ẩn sản phẩm" : "Hiện sản phẩm"}
                        title={product.isActive ? "Ẩn sản phẩm" : "Hiện sản phẩm"}
                        onClick={() => setStatusProduct(product)}
                        className={product.isActive ? "hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700" : "hover:border-green-200 hover:bg-green-50 hover:text-green-700"}
                      >
                        {product.isActive ? <EyeOff /> : <Eye />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {!productsQuery.isPending && data?.items.length === 0 && uploadTasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-[#777]">
                    Không tìm thấy sản phẩm phù hợp.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {data && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-[#777]">
            <span>
              Trang {data.meta.page}/{Math.max(data.meta.totalPages, 1)} · {data.meta.totalItems} sản phẩm
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Trang trước"
                disabled={!data.meta.hasPreviousPage}
                onClick={() => setPage((current) => current - 1)}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Trang sau"
                disabled={!data.meta.hasNextPage}
                onClick={() => setPage((current) => current + 1)}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ProductFormModal
        key={`${editingProduct?.id ?? "new"}-${formOpen}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
        onBackgroundCreate={startBackgroundCreate}
      />
      <FormModal
        open={Boolean(errorTask)}
        onOpenChange={(open) => !open && setErrorTaskId(undefined)}
        title="Lỗi tải ảnh sản phẩm"
        description={errorTask?.error ?? "Một số ảnh không thể tải lên."}
        className="sm:max-w-[680px]"
      >
        {errorTask && (
          <div className="space-y-4">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {errorTask.previewUrls.map((url, index) => {
                const failed = errorTask.failedIndexes.includes(index);
                return (
                  <div key={url} className={`w-36 shrink-0 rounded-lg border p-2 ${failed ? "border-red-400 bg-red-50" : ""}`}>
                    <div className="relative h-24 overflow-hidden rounded-md">
                      <UploadMediaPreview
                        url={url}
                        file={errorTask.payload.files[index]}
                        alt={`Media ${index + 1}`}
                      />
                    </div>
                    <p className="mt-2 text-xs">Ảnh #{index + 1} {failed ? "— bị lỗi" : ""}</p>
                    {failed && (
                      <Button className="mt-2 w-full" size="sm" variant="destructive" onClick={() => removeFailedImages(errorTask, [index])}>
                        <Trash2 /> Xóa ảnh lỗi
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setErrorTaskId(undefined)}>Đóng</Button>
              <Button variant="destructive" onClick={() => removeFailedImages(errorTask, errorTask.payload.files.map((_, index) => index))}>
                <Trash2 /> Xóa tất cả ảnh
              </Button>
            </div>
          </div>
        )}
      </FormModal>
      <ConfirmDialog
        open={Boolean(statusProduct)}
        onOpenChange={(open) => !open && setStatusProduct(null)}
        title={`${statusProduct?.isActive ? "Ẩn" : "Hiện"} sản phẩm?`}
        description={`Bạn có chắc muốn ${statusProduct?.isActive ? "ẩn" : "hiện"} “${statusProduct?.name ?? ""}”?`}
        confirmLabel={statusProduct?.isActive ? "Ẩn sản phẩm" : "Hiện sản phẩm"}
        tone={statusProduct?.isActive ? "danger" : "success"}
        pending={updateProductStatus.isPending}
        onConfirm={handleStatusChange}
      />
    </div>
  );
}
