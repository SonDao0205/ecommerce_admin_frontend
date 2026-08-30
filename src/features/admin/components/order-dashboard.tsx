"use client";

import {
  Ban,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Eye,
  LoaderCircle,
  PackageCheck,
  RefreshCw,
  RotateCcw,
  Search,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import { ConfirmDialog } from "@/src/components/common/confirm-dialog";
import { FormModal } from "@/src/components/common/form-modal";
import { ApiError } from "@/src/core/api";
import { useAuditLogStream } from "@/src/features/audit-logs";
import {
  type Order,
  type OrderStatus,
  type OrderSummary,
  useOrder,
  useOrders,
  useRejectOrder,
  useReviewOrderReturn,
  useUpdateOrderStatus,
} from "@/src/features/orders";

const PAGE_SIZE = 10;

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Chờ xác nhận", className: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { label: "Đã xác nhận", className: "bg-blue-50 text-blue-700 border-blue-200" },
  processing: { label: "Đang xử lý", className: "bg-violet-50 text-violet-700 border-violet-200" },
  shipping: { label: "Đang giao", className: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  completed: { label: "Hoàn thành", className: "bg-green-50 text-green-700 border-green-200" },
  cancelled: { label: "Đã hủy", className: "bg-zinc-100 text-zinc-700 border-zinc-200" },
  rejected: { label: "Đã từ chối", className: "bg-red-50 text-red-700 border-red-200" },
  return_requested: { label: "Chờ duyệt hoàn trả", className: "bg-orange-50 text-orange-700 border-orange-200" },
  returned: { label: "Đã hoàn trả", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  return_rejected: { label: "Từ chối hoàn trả", className: "bg-red-50 text-red-700 border-red-200" },
};

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "confirmed",
  confirmed: "processing",
  processing: "shipping",
  shipping: "completed",
};

const money = (value: number) => new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
}).format(value);

const dateTime = (value: string) => new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
}).format(new Date(value));

export function OrderDashboard() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [detailId, setDetailId] = useState<string>();
  const [transitionOrder, setTransitionOrder] = useState<OrderSummary>();
  const [rejectOrder, setRejectOrder] = useState<OrderSummary>();
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState<string>();
  const [returnOrder, setReturnOrder] = useState<OrderSummary>();
  const [returnApproved, setReturnApproved] = useState(true);
  const [returnReviewReason, setReturnReviewReason] = useState("");
  const [returnReviewError, setReturnReviewError] = useState<string>();
  const ordersQuery = useOrders({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: status || undefined,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });
  const detailQuery = useOrder(detailId);
  const updateStatus = useUpdateOrderStatus();
  const rejectMutation = useRejectOrder();
  const returnMutation = useReviewOrderReturn();
  const data = ordersQuery.data;

  useAuditLogStream((event) => {
    if (event.entityName !== "orders") return;
    toast.info("Đơn hàng có cập nhật mới", {
      id: "orders-updated-reminder",
      description: "Hãy làm mới lại trang để cập nhật đơn hàng.",
      duration: 10_000,
      action: {
        label: "Làm mới ngay",
        onClick: () => void ordersQuery.refetch(),
      },
    });
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const pageOrders = data?.items ?? [];
  const stats = [
    { label: "Tổng đơn hàng", value: data?.meta.totalItems ?? 0, icon: ShoppingCart },
    { label: "Chờ xác nhận", value: pageOrders.filter((item) => item.status === "pending").length, icon: Clock3 },
    { label: "Đang vận chuyển", value: pageOrders.filter((item) => item.status === "shipping").length, icon: Truck },
    { label: "Doanh thu trang", value: money(pageOrders.filter((item) => item.status !== "rejected").reduce((sum, item) => sum + item.totalAmount, 0)), icon: CircleDollarSign },
  ];

  async function confirmTransition() {
    if (!transitionOrder) return;
    const target = nextStatus[transitionOrder.status];
    if (!target) return;
    try {
      await updateStatus.mutateAsync({ id: transitionOrder.id, status: target });
      toast.success("Cập nhật trạng thái đơn hàng thành công");
      setTransitionOrder(undefined);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Không thể cập nhật đơn hàng.");
    }
  }

  async function confirmReject() {
    if (!rejectOrder) return;
    const reason = rejectionReason.trim();
    if (reason.length < 5) {
      setRejectionError("Lý do từ chối phải có ít nhất 5 ký tự.");
      return;
    }
    try {
      await rejectMutation.mutateAsync({ id: rejectOrder.id, reason });
      toast.success("Đã từ chối đơn hàng và hoàn lại tồn kho");
      setRejectOrder(undefined);
      setRejectionReason("");
      setRejectionError(undefined);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Không thể từ chối đơn hàng.");
    }
  }

  async function confirmReturnReview() {
    if (!returnOrder) return;
    const reason = returnReviewReason.trim();
    if (reason.length < 5) {
      setReturnReviewError("Lý do xử lý phải có ít nhất 5 ký tự.");
      return;
    }
    try {
      await returnMutation.mutateAsync({ id: returnOrder.id, approved: returnApproved, reason });
      toast.success(returnApproved ? "Đã xác nhận hoàn trả và cộng lại tồn kho" : "Đã từ chối yêu cầu hoàn trả");
      setReturnOrder(undefined);
      setReturnReviewReason("");
      setReturnReviewError(undefined);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Không thể xử lý yêu cầu hoàn trả.");
    }
  }

  return (
    <div className="p-4 sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[25px]">Quản lý đơn hàng</h1>
          <p className="mt-1.5 text-[13px] text-[#777]">Theo dõi, xác nhận và xử lý đơn hàng của khách hàng.</p>
        </div>
        <Button variant="outline" onClick={() => void ordersQuery.refetch()} disabled={ordersQuery.isFetching}>
          <RefreshCw className={ordersQuery.isFetching ? "animate-spin" : ""} /> Làm mới
        </Button>
      </div>

      <div className="mb-6 grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-[10px] py-0 shadow-none">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-12 items-center justify-center rounded-[10px] bg-[#fff2ec] text-[#ff5a1f]"><stat.icon className="size-5" /></div>
              <div><p className="text-xs text-[#888]">{stat.label}</p><p className="mt-1 text-xl font-bold">{ordersQuery.isPending ? "—" : stat.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden rounded-[10px] py-0 shadow-none">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row">
          <div className="relative flex-1 sm:max-w-[380px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Mã đơn, khách hàng, số điện thoại..." className="h-10 pl-9" />
          </div>
          <select value={status} onChange={(event) => { setStatus(event.target.value as OrderStatus | ""); setPage(1); }} className="h-10 rounded-lg border bg-white px-3 text-sm outline-none focus:border-[#ff5a1f]">
            <option value="">Tất cả trạng thái</option>
            {Object.entries(statusConfig).map(([value, config]) => <option key={value} value={value}>{config.label}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Mã đơn</TableHead><TableHead>Khách hàng</TableHead><TableHead>Sản phẩm</TableHead><TableHead>Tổng tiền</TableHead><TableHead>Trạng thái</TableHead><TableHead>Ngày đặt</TableHead><TableHead className="text-right">Thao tác</TableHead></TableRow></TableHeader>
            <TableBody>
              {ordersQuery.isPending && Array.from({ length: 6 }).map((_, index) => <TableRow key={index}>{Array.from({ length: 7 }).map((__, cell) => <TableCell key={cell}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>)}
              {!ordersQuery.isPending && pageOrders.map((order) => {
                const target = nextStatus[order.status];
                return <TableRow key={order.id}>
                  <TableCell className="font-semibold">{order.orderCode}</TableCell>
                  <TableCell><p className="font-medium">{order.customerName ?? order.recipientName}</p><p className="text-xs text-muted-foreground">{order.customerEmail ?? order.customerPhone ?? order.recipientPhone}</p></TableCell>
                  <TableCell>{order.itemCount} sản phẩm</TableCell>
                  <TableCell className="font-semibold text-[#ff5a1f]">{money(order.totalAmount)}</TableCell>
                  <TableCell><OrderStatusBadge status={order.status} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{dateTime(order.createdAt)}</TableCell>
                  <TableCell><div className="flex justify-end gap-1">
                    <Button size="icon-sm" variant="ghost" title="Xem chi tiết" onClick={() => setDetailId(order.id)}><Eye /></Button>
                    {target && <Button size="sm" variant="outline" onClick={() => setTransitionOrder(order)}><PackageCheck /> {statusConfig[target].label}</Button>}
                    {order.status === "pending" && <Button size="icon-sm" variant="ghost" title="Từ chối" className="text-red-600" onClick={() => { setRejectOrder(order); setRejectionReason(""); setRejectionError(undefined); }}><Ban /></Button>}
                    {order.status === "return_requested" && <Button size="sm" className="bg-orange-600 text-white hover:bg-orange-700" onClick={() => { setReturnOrder(order); setReturnApproved(true); setReturnReviewReason(""); setReturnReviewError(undefined); }}><RotateCcw /> Xử lý hoàn trả</Button>}
                  </div></TableCell>
                </TableRow>;
              })}
              {!ordersQuery.isPending && pageOrders.length === 0 && <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">Không tìm thấy đơn hàng.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>

        {data && data.meta.totalPages > 1 && <div className="flex items-center justify-between border-t p-4 text-sm"><span className="text-muted-foreground">Trang {data.meta.page}/{data.meta.totalPages} · {data.meta.totalItems} đơn hàng</span><div className="flex gap-2"><Button size="icon-sm" variant="outline" disabled={!data.meta.hasPreviousPage} onClick={() => setPage((value) => value - 1)}><ChevronLeft /></Button><Button size="icon-sm" variant="outline" disabled={!data.meta.hasNextPage} onClick={() => setPage((value) => value + 1)}><ChevronRight /></Button></div></div>}
      </Card>

      <OrderDetailModal order={detailQuery.data} loading={detailQuery.isPending && Boolean(detailId)} open={Boolean(detailId)} onOpenChange={(open) => { if (!open) setDetailId(undefined); }} />

      <ConfirmDialog open={Boolean(transitionOrder)} onOpenChange={(open) => { if (!open) setTransitionOrder(undefined); }} title="Cập nhật trạng thái đơn hàng" description={transitionOrder && nextStatus[transitionOrder.status] ? `Chuyển đơn ${transitionOrder.orderCode} sang “${statusConfig[nextStatus[transitionOrder.status]!].label}”?` : ""} confirmLabel="Xác nhận" tone="success" pending={updateStatus.isPending} onConfirm={confirmTransition} />

      <FormModal open={Boolean(rejectOrder)} onOpenChange={(open) => { if (!open && !rejectMutation.isPending) setRejectOrder(undefined); }} title="Từ chối đơn hàng" description={`Nhập lý do từ chối ${rejectOrder?.orderCode ?? "đơn hàng"}. Tồn kho sẽ được hoàn lại.`}>
        <div className="space-y-4">
          <label className="block space-y-2 text-sm font-medium">Lý do từ chối<Textarea value={rejectionReason} onChange={(event) => { setRejectionReason(event.target.value); setRejectionError(undefined); }} disabled={rejectMutation.isPending} maxLength={1000} aria-invalid={Boolean(rejectionError)} placeholder="Ví dụ: Không thể xác minh thông tin người nhận..." className="min-h-28" />{rejectionError && <span className="text-xs text-red-600">{rejectionError}</span>}</label>
          <div className="flex justify-end gap-2"><Button variant="outline" disabled={rejectMutation.isPending} onClick={() => setRejectOrder(undefined)}>Hủy</Button><Button className="bg-red-600 text-white hover:bg-red-700" disabled={rejectMutation.isPending} onClick={() => void confirmReject()}>{rejectMutation.isPending && <LoaderCircle className="animate-spin" />}Từ chối đơn hàng</Button></div>
        </div>
      </FormModal>

      <FormModal open={Boolean(returnOrder)} onOpenChange={(open) => { if (!open && !returnMutation.isPending) setReturnOrder(undefined); }} title="Xử lý yêu cầu hoàn trả" description={`Xem lý do, minh chứng và đưa ra quyết định cho ${returnOrder?.orderCode ?? "đơn hàng"}.`} className="sm:max-w-[760px]">
        {returnOrder && <div className="space-y-5"><div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900"><strong className="block">Lý do khách hàng</strong><p className="mt-1 whitespace-pre-wrap">{returnOrder.returnReason}</p></div><ReturnEvidenceGallery evidence={returnOrder.returnEvidence} /><div className="grid grid-cols-2 gap-3"><button type="button" disabled={returnMutation.isPending} onClick={() => setReturnApproved(true)} className={`cursor-pointer rounded-xl border p-3 text-sm font-semibold ${returnApproved ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "hover:bg-zinc-50"}`}>Xác nhận hoàn trả</button><button type="button" disabled={returnMutation.isPending} onClick={() => setReturnApproved(false)} className={`cursor-pointer rounded-xl border p-3 text-sm font-semibold ${!returnApproved ? "border-red-500 bg-red-50 text-red-700" : "hover:bg-zinc-50"}`}>Từ chối hoàn trả</button></div><label className="block space-y-2 text-sm font-medium">Lý do quyết định<Textarea value={returnReviewReason} onChange={(event) => { setReturnReviewReason(event.target.value); setReturnReviewError(undefined); }} disabled={returnMutation.isPending} maxLength={1000} aria-invalid={Boolean(returnReviewError)} placeholder={returnApproved ? "Ví dụ: Đã kiểm tra minh chứng và chấp nhận hoàn trả..." : "Ví dụ: Sản phẩm không đáp ứng điều kiện hoàn trả..."} className="min-h-28" />{returnReviewError && <span className="text-xs text-red-600">{returnReviewError}</span>}</label><div className="flex justify-end gap-2"><Button variant="outline" disabled={returnMutation.isPending} onClick={() => setReturnOrder(undefined)}>Đóng</Button><Button className={returnApproved ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-red-600 text-white hover:bg-red-700"} disabled={returnMutation.isPending} onClick={() => void confirmReturnReview()}>{returnMutation.isPending && <LoaderCircle className="animate-spin" />}{returnApproved ? "Xác nhận và hoàn kho" : "Từ chối yêu cầu"}</Button></div></div>}
      </FormModal>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
}

function OrderDetailModal({ order, loading, open, onOpenChange }: { order?: Order; loading: boolean; open: boolean; onOpenChange: (open: boolean) => void }) {
  return <FormModal open={open} onOpenChange={onOpenChange} title={order ? `Đơn hàng ${order.orderCode}` : "Chi tiết đơn hàng"} description="Thông tin khách hàng, giao nhận và sản phẩm trong đơn." className="sm:max-w-[760px]">
    {loading || !order ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}</div> : <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/40 p-4"><div><p className="text-xs text-muted-foreground">Trạng thái</p><div className="mt-1"><OrderStatusBadge status={order.status} /></div></div><div className="text-right"><p className="text-xs text-muted-foreground">Tổng thanh toán</p><strong className="text-xl text-[#ff5a1f]">{money(order.totalAmount)}</strong></div></div>
      <div className="grid gap-3 text-sm sm:grid-cols-2"><Info label="Khách hàng" value={order.customerName ?? order.recipientName} /><Info label="Liên hệ tài khoản" value={order.customerEmail ?? order.customerPhone ?? "—"} /><Info label="Người nhận" value={`${order.recipientName} · ${order.recipientPhone}`} /><Info label="Ngày đặt" value={dateTime(order.createdAt)} /><div className="sm:col-span-2"><Info label="Địa chỉ giao hàng" value={order.shippingAddress} /></div>{order.note && <div className="sm:col-span-2"><Info label="Ghi chú" value={order.note} /></div>}{order.rejectionReason && <div className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700"><strong>Lý do từ chối:</strong> {order.rejectionReason}</div>}</div>
      {order.cancellationReason && <div className="rounded-lg border bg-zinc-50 p-3 text-sm"><strong>Lý do khách hủy:</strong> {order.cancellationReason}</div>}
      {order.returnReason && <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900"><strong>Lý do yêu cầu hoàn trả:</strong> {order.returnReason}</div>}
      {order.returnEvidence.length > 0 && <ReturnEvidenceGallery evidence={order.returnEvidence} />}
      {order.returnReviewReason && <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800"><strong>Lý do xử lý của admin:</strong> {order.returnReviewReason}</div>}
      <div className="overflow-hidden rounded-xl border"><Table><TableHeader><TableRow><TableHead>Sản phẩm</TableHead><TableHead>Biến thể</TableHead><TableHead className="text-center">SL</TableHead><TableHead className="text-right">Đơn giá</TableHead><TableHead className="text-right">Thành tiền</TableHead></TableRow></TableHeader><TableBody>{order.items.map((item) => <TableRow key={item.id}><TableCell className="font-medium">{item.productName}</TableCell><TableCell className="text-muted-foreground">{item.variantValue ? `${item.variantName}: ${item.variantValue}` : "—"}{item.variantSku && <small className="block">SKU: {item.variantSku}</small>}</TableCell><TableCell className="text-center">{item.quantity}</TableCell><TableCell className="text-right">{money(item.unitPrice)}</TableCell><TableCell className="text-right font-semibold">{money(item.subtotal)}</TableCell></TableRow>)}</TableBody></Table></div>
    </div>}
  </FormModal>;
}

function ReturnEvidenceGallery({ evidence }: { evidence: Order["returnEvidence"] }) {
  if (!evidence.length) return <p className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">Khách hàng không gửi media minh chứng.</p>;
  return <div><p className="mb-2 text-sm font-semibold">Media minh chứng</p><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{evidence.map((asset) => <a key={asset.publicId} href={asset.url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border bg-zinc-50">{asset.resourceType === "video" ? <video src={asset.url} controls className="h-36 w-full object-cover" /> : <img src={asset.url} alt="Minh chứng sản phẩm lỗi" className="h-36 w-full object-cover" />}</a>)}</div></div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-medium">{value}</p></div>;
}
