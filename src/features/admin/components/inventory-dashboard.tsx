"use client";

import Image from "next/image";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  History,
  LoaderCircle,
  Package,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Warehouse,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { FormModal } from "@/src/components/common/form-modal";
import { ApiError } from "@/src/core/api";
import {
  type InventoryProduct,
  type InventoryLog,
  type InventoryVariant,
  useInventories,
  useInventoryLogs,
  useUpdateInventoryStock,
} from "@/src/features/inventories";
import { cn } from "@/lib/utils";
import { CategoryCascader } from "./category-cascader";

const PAGE_SIZE = 10;

interface StockTarget {
  product: InventoryProduct;
  variant?: InventoryVariant;
  stock: number;
}

interface LogTarget {
  product: InventoryProduct;
  variant?: InventoryVariant;
}

export function InventoryDashboard() {
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [stockTarget, setStockTarget] = useState<StockTarget>();
  const [logTarget, setLogTarget] = useState<LogTarget>();
  const [stockValue, setStockValue] = useState("");
  const [reason, setReason] = useState("");
  const [formErrors, setFormErrors] = useState<{
    stock?: string;
    reason?: string;
    api?: string;
  }>({});

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const inventoriesQuery = useInventories(
    {
      categoryId,
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      sortBy: "name",
      sortOrder: "ASC",
    },
    Boolean(categoryId),
  );
  const updateStock = useUpdateInventoryStock();
  const logsQuery = useInventoryLogs(
    logTarget?.product.id,
    logTarget?.variant?.id,
  );
  const data = inventoriesQuery.data;
  const rows = useMemo(
    () =>
      (data?.items ?? []).flatMap<StockTarget>((product) =>
        product.hasVariants
          ? product.variants.map((variant) => ({
              product,
              variant,
              stock: variant.stock,
            }))
          : [{ product, stock: product.stock }],
      ),
    [data],
  );
  const lowStockCount = rows.filter((row) => row.stock < 5).length;

  function openStockForm(target: StockTarget) {
    setStockTarget(target);
    setStockValue(String(target.stock));
    setReason("");
    setFormErrors({});
  }

  async function submitStockUpdate() {
    if (!stockTarget) return;
    const parsedStock = Number(stockValue);
    const errors: typeof formErrors = {};
    if (!stockValue.trim() || !Number.isInteger(parsedStock))
      errors.stock = "Số lượng phải là số nguyên.";
    else if (parsedStock < 0)
      errors.stock = "Số lượng sản phẩm không được nhỏ hơn 0.";
    const trimmedReason = reason.trim();
    if (trimmedReason.length < 5)
      errors.reason = "Lý do cập nhật phải có ít nhất 5 ký tự.";
    setFormErrors(errors);
    if (Object.keys(errors).length) return;
    try {
      await updateStock.mutateAsync({
        productId: stockTarget.product.id,
        payload: {
          variantId: stockTarget.variant?.id,
          stock: parsedStock,
          expectedStock: stockTarget.stock,
          reason: trimmedReason,
        },
      });
      toast.success("Cập nhật tồn kho thành công", {
        description: `${stockTarget.product.name}: ${stockTarget.stock} → ${parsedStock}`,
      });
      setStockTarget(undefined);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Không thể cập nhật tồn kho.";
      setFormErrors((current) => ({ ...current, api: message }));
      toast.error(message);
      if (error instanceof ApiError && error.statusCode === 409)
        void inventoriesQuery.refetch();
    }
  }

  return (
    <div className="p-4 sm:p-7">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[25px]">
            Quản lý tồn kho
          </h1>
          <p className="mt-1.5 text-[13px] text-[#777]">
            Cập nhật tồn theo sản phẩm hoặc từng biến thể và lưu lịch sử người
            thao tác.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={!categoryId || inventoriesQuery.isFetching}
          onClick={() => void inventoriesQuery.refetch()}
        >
          <RefreshCw
            className={inventoriesQuery.isFetching ? "animate-spin" : ""}
          />{" "}
          Làm mới
        </Button>
      </div>

      <Card className="mb-6 overflow-visible relative z-20 rounded-[10px] py-0 shadow-none">
        <CardContent className="grid gap-4 p-5 md:grid-cols-[minmax(260px,420px)_1fr] md:items-end">
          <label className="space-y-2 text-sm font-medium">
            <span>Danh mục sản phẩm</span>
            <CategoryCascader
              value={categoryId}
              allowParentSelection
              onChange={(value) => {
                setCategoryId(value);
                setPage(1);
                setSearch("");
              }}
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>Tìm kiếm sản phẩm</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                disabled={!categoryId}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  categoryId
                    ? "Tên hoặc SKU sản phẩm..."
                    : "Chọn danh mục trước khi tìm kiếm"
                }
                className="h-10 pl-9"
              />
            </div>
          </label>
        </CardContent>
      </Card>

      {!categoryId ? (
        <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed bg-white p-8 text-center">
          <div>
            <Warehouse className="mx-auto size-14 text-zinc-300" />
            <h2 className="mt-4 text-xl font-bold">
              Chọn danh mục để xem tồn kho
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Danh sách sản phẩm chỉ được tải sau khi bạn chọn một danh mục.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-[18px] sm:grid-cols-3">
            <Stat
              label="Sản phẩm trong danh mục"
              value={data?.meta.totalItems ?? 0}
              icon={Package}
              loading={inventoriesQuery.isPending}
            />
            <Stat
              label="Dòng tồn kho trên trang"
              value={rows.length}
              icon={SlidersHorizontal}
              loading={inventoriesQuery.isPending}
            />
            <Stat
              label="Cảnh báo dưới 5"
              value={lowStockCount}
              icon={AlertTriangle}
              loading={inventoriesQuery.isPending}
              danger={lowStockCount > 0}
            />
          </div>
          <Card className="overflow-hidden rounded-[10px] py-0 shadow-none">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Biến thể</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead className="text-center">Tồn kho</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoriesQuery.isPending &&
                    Array.from({ length: 7 }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 7 }).map((__, cell) => (
                          <TableCell key={cell}>
                            <Skeleton className="h-8 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  {!inventoriesQuery.isPending &&
                    rows.map((row) => {
                      const low = row.stock < 5;
                      return (
                        <TableRow
                          key={`${row.product.id}-${row.variant?.id ?? "product"}`}
                          className={cn(
                            low &&
                              "relative bg-red-50/70 shadow-[inset_0_0_18px_rgba(239,68,68,0.22)] ring-1 ring-inset ring-red-300 hover:bg-red-50",
                          )}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {row.product.thumbnailUrl ? (
                                <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                                  <Image
                                    src={row.product.thumbnailUrl}
                                    alt={row.product.name}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="grid size-10 place-items-center rounded-lg bg-zinc-100">
                                  <Package className="size-4 text-zinc-400" />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold">
                                  {row.product.name}
                                </p>
                                {row.product.hasVariants && (
                                  <small className="text-muted-foreground">
                                    Tổng: {row.product.stock}
                                  </small>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {row.variant ? (
                              <div>
                                <p className="font-medium">
                                  {row.variant.parentValue
                                    ? `${row.variant.parentName}: ${row.variant.parentValue}`
                                    : row.variant.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {row.variant.name}: {row.variant.value}
                                </p>
                                {!row.variant.isActive && (
                                  <Badge variant="outline" className="mt-1">
                                    Đã ẩn
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                Không có biến thể
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {row.variant?.sku ?? row.product.sku ?? "—"}
                          </TableCell>
                          <TableCell>{row.product.categoryName}</TableCell>
                          <TableCell
                            className={cn(
                              "text-center text-lg font-bold",
                              low ? "text-red-600" : "text-green-700",
                            )}
                          >
                            {row.stock}
                          </TableCell>
                          <TableCell className="text-center">
                            {low ? (
                              <Badge className="bg-red-100 text-red-700">
                                <AlertTriangle /> Sắp hết
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-700">
                                Ổn định
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openStockForm(row)}
                              >
                                <SlidersHorizontal /> Cập nhật
                              </Button>
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                title="Lịch sử cập nhật"
                                onClick={() =>
                                  setLogTarget({
                                    product: row.product,
                                    variant: row.variant,
                                  })
                                }
                              >
                                <History />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  {!inventoriesQuery.isPending && rows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-36 text-center text-muted-foreground"
                      >
                        Không có sản phẩm trong danh mục này.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {data && data.meta.totalPages > 1 && (
              <div className="flex items-center justify-between border-t p-4 text-sm">
                <span className="text-muted-foreground">
                  Trang {data.meta.page}/{data.meta.totalPages} ·{" "}
                  {data.meta.totalItems} sản phẩm
                </span>
                <div className="flex gap-2">
                  <Button
                    size="icon-sm"
                    variant="outline"
                    disabled={!data.meta.hasPreviousPage}
                    onClick={() => setPage((value) => value - 1)}
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    disabled={!data.meta.hasNextPage}
                    onClick={() => setPage((value) => value + 1)}
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}

      <FormModal
        open={Boolean(stockTarget)}
        onOpenChange={(open) => {
          if (!open && !updateStock.isPending) setStockTarget(undefined);
        }}
        title="Cập nhật số lượng tồn kho"
        description={
          stockTarget
            ? `${stockTarget.product.name}${stockTarget.variant ? ` · ${stockTarget.variant.parentValue ?? ""} ${stockTarget.variant.value}` : ""}`
            : ""
        }
      >
        <div className="space-y-4">
          {formErrors.api && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {formErrors.api}
            </div>
          )}
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            Số lượng hiện tại: <strong>{stockTarget?.stock ?? 0}</strong>
          </div>
          <label className="block space-y-2 text-sm font-medium">
            Số lượng mới
            <Input
              type="text"
              inputMode="numeric"
              value={stockValue}
              disabled={updateStock.isPending}
              aria-invalid={Boolean(formErrors.stock)}
              onChange={(event) => {
                setStockValue(event.target.value);
                setFormErrors((current) => ({
                  ...current,
                  stock: undefined,
                  api: undefined,
                }));
              }}
              placeholder="Nhập số lượng từ 0 trở lên"
            />
            {formErrors.stock && (
              <span className="text-xs text-red-600">{formErrors.stock}</span>
            )}
          </label>
          <label className="block space-y-2 text-sm font-medium">
            Lý do cập nhật
            <Textarea
              value={reason}
              disabled={updateStock.isPending}
              aria-invalid={Boolean(formErrors.reason)}
              onChange={(event) => {
                setReason(event.target.value);
                setFormErrors((current) => ({
                  ...current,
                  reason: undefined,
                  api: undefined,
                }));
              }}
              placeholder="Ví dụ: Nhập thêm hàng từ nhà cung cấp..."
              className="min-h-28"
            />
            {formErrors.reason && (
              <span className="text-xs text-red-600">{formErrors.reason}</span>
            )}
          </label>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={updateStock.isPending}
              onClick={() => setStockTarget(undefined)}
            >
              Hủy
            </Button>
            <Button
              disabled={updateStock.isPending}
              onClick={() => void submitStockUpdate()}
              className="bg-[#ff5a1f] text-white hover:bg-[#e94b13]"
            >
              {updateStock.isPending && (
                <LoaderCircle className="animate-spin" />
              )}
              Lưu tồn kho
            </Button>
          </div>
        </div>
      </FormModal>

      <InventoryLogsModal
        target={logTarget}
        open={Boolean(logTarget)}
        loading={logsQuery.isPending}
        logs={logsQuery.data ?? []}
        onOpenChange={(open) => {
          if (!open) setLogTarget(undefined);
        }}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  loading,
  danger,
}: {
  label: string;
  value: number;
  icon: typeof Package;
  loading: boolean;
  danger?: boolean;
}) {
  return (
    <Card
      className={cn(
        "rounded-[10px] py-0 shadow-none",
        danger && "border-red-200",
      )}
    >
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            "grid size-11 place-items-center rounded-lg bg-orange-50 text-[#ff5a1f]",
            danger && "bg-red-50 text-red-600",
          )}
        >
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-bold">{loading ? "—" : value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InventoryLogsModal({
  target,
  open,
  loading,
  logs,
  onOpenChange,
}: {
  target?: LogTarget;
  open: boolean;
  loading: boolean;
  logs: InventoryLog[];
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Lịch sử cập nhật tồn kho"
      description={
        target
          ? `${target.product.name}${target.variant ? ` · ${target.variant.value}` : ""}`
          : ""
      }
      className="sm:max-w-[760px]"
    >
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Chưa có lịch sử cập nhật.
        </p>
      ) : (
        <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
          {logs.map((log) => (
            <div
              key={log.id}
              className="grid gap-2 rounded-xl border p-4 sm:grid-cols-[1fr_auto]"
            >
              <div>
                <p className="font-medium">{log.reason ?? "Không có lý do"}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {log.actorName ?? log.actorEmail ?? "Hệ thống"} ·{" "}
                  {new Intl.DateTimeFormat("vi-VN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(log.createdAt))}
                </p>
                {log.variantValue && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {log.variantName}: {log.variantValue}
                    {log.variantSku ? ` · ${log.variantSku}` : ""}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "font-bold",
                    log.quantity > 0 ? "text-green-600" : "text-red-600",
                  )}
                >
                  {log.quantity > 0 ? "+" : ""}
                  {log.quantity}
                </p>
                <p className="text-xs text-muted-foreground">
                  {log.previousStock} → {log.newStock}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </FormModal>
  );
}
