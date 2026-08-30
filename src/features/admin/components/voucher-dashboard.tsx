"use client";

import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Plus,
  RefreshCw,
  Search,
  TicketPercent,
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
import { ApiError } from "@/src/core/api";
import {
  useUpdateVoucherStatus,
  useVouchers,
  type Voucher,
  type VoucherStatus,
} from "@/src/features/vouchers";
import { VoucherFormModal } from "./voucher-form-modal";

const PAGE_SIZE = 10;
const statusLabels: Record<VoucherStatus, string> = {
  draft: "Bản nháp",
  active: "Hoạt động",
  expired: "Hết hạn",
  disabled: "Vô hiệu hóa",
};
const statusClasses: Record<VoucherStatus, string> = {
  draft: "bg-zinc-100 text-zinc-700",
  active: "bg-emerald-50 text-emerald-700",
  expired: "bg-amber-50 text-amber-700",
  disabled: "bg-red-50 text-red-700",
};
const money = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
const date = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

export function VoucherDashboard() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<VoucherStatus | "">("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [disabling, setDisabling] = useState<Voucher | null>(null);
  const updateStatus = useUpdateVoucherStatus();
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);
  const query = useVouchers({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: status || undefined,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });
  const data = query.data;
  const activeCount =
    data?.items.filter((item) => item.status === "active").length ?? 0;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(voucher: Voucher) {
    setEditing(voucher);
    setFormOpen(true);
  }
  async function disableVoucher() {
    if (!disabling) return;
    try {
      await updateStatus.mutateAsync({ id: disabling.id, status: "disabled" });
      toast.success("Đã vô hiệu hóa voucher");
      setDisabling(null);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Không thể vô hiệu hóa voucher.",
      );
    }
  }

  return (
    <div className="p-4 sm:p-7">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#222] sm:text-[25px]">
            Quản lý voucher
          </h1>
          <p className="mt-1.5 text-[13px] text-[#777]">
            Tạo chương trình sale và kiểm soát lượt sử dụng an toàn.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-[#ff5a1f] text-white hover:bg-[#e94b13]"
        >
          <Plus /> Thêm voucher
        </Button>
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Stat label="Tổng voucher" value={data?.meta.totalItems ?? 0} />
        <Stat label="Đang hoạt động trong trang" value={activeCount} />
        <Stat
          label="Lượt dùng trong trang"
          value={
            data?.items.reduce((sum, item) => sum + item.usedCount, 0) ?? 0
          }
        />
      </div>
      <Card className="overflow-hidden rounded-[10px] py-0 shadow-none">
        <div className="flex flex-col gap-3 border-b bg-[#fafafa] p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc mã voucher..."
              className="pl-9"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as VoucherStatus | "");
              setPage(1);
            }}
            className="h-9 rounded-md border bg-white px-3 text-sm"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => query.refetch()}
            aria-label="Tải lại"
          >
            <RefreshCw className={query.isFetching ? "animate-spin" : ""} />
          </Button>
        </div>
        {query.isPending && (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        )}
        {query.isError && (
          <Alert variant="destructive" className="m-4 w-auto">
            <AlertDescription>
              Không thể tải danh sách voucher.
            </AlertDescription>
          </Alert>
        )}
        {data && (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Voucher</TableHead>
                    <TableHead>Mức giảm</TableHead>
                    <TableHead>Hiệu lực</TableHead>
                    <TableHead>Lượt dùng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-32 text-center text-muted-foreground"
                      >
                        Chưa có voucher phù hợp.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.items.map((voucher) => (
                      <TableRow key={voucher.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-orange-50 text-[#ff5a1f]">
                              <TicketPercent className="size-4" />
                            </div>
                            <div>
                              <p className="font-semibold">{voucher.name}</p>
                              <code className="text-xs text-zinc-500">
                                {voucher.code}
                              </code>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">
                            {voucher.discountType === "percentage"
                              ? `${voucher.discountValue}%`
                              : money(voucher.discountValue)}
                          </p>
                          {voucher.maxDiscountAmount != null && (
                            <p className="text-xs text-zinc-500">
                              Tối đa {money(voucher.maxDiscountAmount)}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs">
                          <p>{date(voucher.startAt)}</p>
                          <p className="text-zinc-500">
                            đến {date(voucher.endAt)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">
                            {voucher.usedCount.toLocaleString("vi-VN")}
                          </p>
                          <p className="text-xs text-zinc-500">
                            /{" "}
                            {voucher.maxUsageCount ??
                              voucher.issuedQuantity ??
                              "∞"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusClasses[voucher.status]}>
                            {statusLabels[voucher.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(voucher)}
                              aria-label="Sửa voucher"
                            >
                              <Edit3 />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={voucher.status === "disabled"}
                              onClick={() => setDisabling(voucher)}
                              className="text-red-600 hover:text-red-700"
                              aria-label="Vô hiệu hóa voucher"
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-zinc-500">
              <span>
                Trang {data.meta.page} / {Math.max(data.meta.totalPages, 1)} ·{" "}
                {data.meta.totalItems} voucher
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={!data.meta.hasPreviousPage}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={!data.meta.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
      <VoucherFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        voucher={editing}
      />
      <ConfirmDialog
        open={Boolean(disabling)}
        onOpenChange={(open) => !open && setDisabling(null)}
        title="Vô hiệu hóa voucher?"
        description={`Voucher “${disabling?.name ?? ""}” sẽ không thể được áp dụng ở checkout. Lịch sử sử dụng vẫn được giữ nguyên.`}
        confirmLabel="Vô hiệu hóa"
        tone="danger"
        pending={updateStatus.isPending}
        onConfirm={disableVoucher}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="py-0 shadow-none">
      <CardContent className="p-4">
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="mt-1 text-2xl font-bold">
          {value.toLocaleString("vi-VN")}
        </p>
      </CardContent>
    </Card>
  );
}
