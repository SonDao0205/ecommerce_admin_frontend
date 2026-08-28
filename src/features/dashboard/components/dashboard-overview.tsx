"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  ChartNoAxesCombined,
  CheckCircle2,
  CircleDollarSign,
  ClipboardClock,
  PackageCheck,
  PackageOpen,
  RefreshCw,
  RotateCcw,
  ShoppingCart,
  Star,
  Truck,
  UserPlus,
  UsersRound,
  WalletCards,
  Warehouse,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import { ApiError } from "@/src/core/api";
import { useDashboard } from "../hooks/use-dashboard";
import type {
  DashboardData,
  DashboardMetric,
  DashboardQuery,
  DashboardRange,
} from "../types/dashboard";

const rangeOptions: Array<{ value: DashboardRange; label: string }> = [
  { value: "today", label: "Hôm nay" },
  { value: "7d", label: "7 ngày" },
  { value: "30d", label: "30 ngày" },
  { value: "month", label: "Tháng này" },
  { value: "custom", label: "Tùy chỉnh" },
];

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
const number = (value: number) => new Intl.NumberFormat("vi-VN").format(value);

export function DashboardOverview() {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const [range, setRange] = useState<DashboardRange>("7d");
  const [customFrom, setCustomFrom] = useState(today);
  const [customTo, setCustomTo] = useState(today);
  const [query, setQuery] = useState<DashboardQuery>({ range: "7d" });
  const { data, isLoading, isFetching, error, refetch } = useDashboard(query);

  function chooseRange(value: DashboardRange) {
    setRange(value);
    if (value !== "custom") setQuery({ range: value });
  }

  function applyCustomRange() {
    if (!customFrom || !customTo || customFrom > customTo) {
      toast.error("Khoảng ngày không hợp lệ", { description: "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu." });
      return;
    }
    setQuery({ range: "custom", from: customFrom, to: customTo });
  }

  return (
    <div className="space-y-6 p-4 sm:p-7">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#ff5a1f]">Tổng quan vận hành</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Dashboard kinh doanh</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Theo dõi hiệu quả và những việc cửa hàng cần xử lý ngay.</p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-white p-2 shadow-sm">
            {rangeOptions.map((option) => (
              <button key={option.value} type="button" onClick={() => chooseRange(option.value)} className={cn("rounded-lg px-3 py-2 text-xs font-semibold transition", range === option.value ? "bg-[#171717] text-white" : "text-muted-foreground hover:bg-zinc-100 hover:text-foreground")}>{option.label}</button>
            ))}
            <Button variant="ghost" size="icon-sm" disabled={isFetching} aria-label="Làm mới" onClick={() => void refetch()}><RefreshCw className={cn(isFetching && "animate-spin")} /></Button>
          </div>
          {range === "custom" && <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-white p-3 shadow-sm"><CalendarDays className="size-4 text-[#ff5a1f]" /><Input type="date" value={customFrom} max={customTo} onChange={(event) => setCustomFrom(event.target.value)} className="w-38" /><span className="text-xs text-muted-foreground">đến</span><Input type="date" value={customTo} min={customFrom} onChange={(event) => setCustomTo(event.target.value)} className="w-38" /><Button size="sm" onClick={applyCustomRange} className="bg-[#ff5a1f] text-white hover:bg-[#e94b13]">Áp dụng</Button></div>}
        </div>
      </section>

      {error && <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><span><strong>Không thể tải dashboard.</strong> {error instanceof ApiError ? error.message : "Vui lòng thử lại."}</span><Button variant="outline" size="sm" onClick={() => void refetch()}>Thử lại</Button></div>}

      {isLoading || !data ? <DashboardSkeleton /> : <DashboardContent data={data} />}
    </div>
  );
}

function DashboardContent({ data }: { data: DashboardData }) {
  const kpis = [
    { label: "Doanh thu", metric: data.metrics.revenue, icon: CircleDollarSign, format: money },
    { label: "Đơn hoàn thành", metric: data.metrics.completedOrders, icon: CheckCircle2, format: number },
    { label: "Sản phẩm đã bán", metric: data.metrics.soldProducts, icon: PackageCheck, format: number },
    { label: "Khách hàng mới", metric: data.metrics.newCustomers, icon: UserPlus, format: number },
    { label: "Giá trị đơn trung bình", metric: data.metrics.averageOrderValue, icon: WalletCards, format: money },
    { label: "Tỷ lệ hủy đơn", metric: data.metrics.cancellationRate, icon: RotateCcw, format: (value: number) => `${value.toFixed(1)}%`, inverse: true },
  ];

  return <>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {kpis.map((item) => <MetricCard key={item.label} {...item} />)}
    </section>

    <ActionCenter actions={data.actions} />

    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
      <PerformanceChart data={data} />
      <OrderStatusCard statuses={data.orderStatuses} />
    </section>

    <section className="grid gap-5 xl:grid-cols-2">
      <TopProducts products={data.topProducts} />
      <LowStock items={data.lowStock} />
    </section>

    <CustomerCard data={data.customers} />
  </>;
}

function MetricCard({ label, metric, icon: Icon, format, inverse = false }: { label: string; metric: DashboardMetric; icon: typeof Banknote; format: (value: number) => string; inverse?: boolean }) {
  const positive = inverse ? metric.changePercent <= 0 : metric.changePercent >= 0;
  const TrendIcon = metric.changePercent >= 0 ? ArrowUpRight : ArrowDownRight;
  return <Card className="gap-3 border-0 py-4 shadow-sm ring-1 ring-zinc-200">
    <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-xs font-semibold text-muted-foreground">{label}</CardTitle><span className="grid size-9 place-items-center rounded-xl bg-orange-50 text-[#ff5a1f]"><Icon className="size-4.5" /></span></CardHeader>
    <CardContent><strong className="block truncate text-xl font-bold">{format(metric.value)}</strong><div className="mt-2 flex items-center gap-1 text-[11px]"><span className={cn("flex items-center font-bold", positive ? "text-emerald-600" : "text-red-600")}><TrendIcon className="size-3.5" />{metric.changePercent > 0 ? "+" : ""}{metric.changePercent.toFixed(1)}%</span><span className="text-muted-foreground">so với kỳ trước</span></div></CardContent>
  </Card>;
}

function ActionCenter({ actions }: { actions: DashboardData["actions"] }) {
  const items = [
    { label: "đơn hàng đang chờ xác nhận", value: actions.pendingOrders, icon: ClipboardClock, color: "red", href: "/admin/orders" },
    { label: "yêu cầu hoàn tiền", value: actions.pendingRefunds, icon: RotateCcw, color: "orange" },
    { label: "SKU/sản phẩm sắp hết hàng", value: actions.lowStockItems, icon: Warehouse, color: "orange", href: "/admin/inventory" },
    { label: "đánh giá chưa phản hồi", value: actions.unansweredReviews, icon: Star, color: "amber" },
  ];
  return <section className="overflow-hidden rounded-2xl border bg-[#171717] text-white shadow-sm">
    <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center"><div className="lg:w-48"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#ff7b49]"><AlertCircle className="size-4" /> Cần xử lý</p><p className="mt-1 text-xs text-zinc-400">Ưu tiên công việc hôm nay</p></div><div className="grid flex-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">{items.map((item) => {
      const content = <><span className={cn("grid size-9 place-items-center rounded-lg", item.color === "red" ? "bg-red-500/15 text-red-400" : item.color === "orange" ? "bg-orange-500/15 text-orange-400" : "bg-amber-500/15 text-amber-400")}><item.icon className="size-4" /></span><span><strong className="block text-lg leading-none">{item.value}</strong><span className="mt-1 block text-[11px] text-zinc-400">{item.label}</span></span></>;
      return item.href ? <Link key={item.label} href={item.href} className="flex items-center gap-3 rounded-xl bg-white/5 p-3 transition hover:bg-white/10">{content}</Link> : <div key={item.label} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">{content}</div>;
    })}</div></div>
  </section>;
}

type ChartMetric = "revenue" | "orders" | "soldProducts";
function PerformanceChart({ data }: { data: DashboardData }) {
  const [metric, setMetric] = useState<ChartMetric>("revenue");
  const config = { revenue: { label: "Doanh thu", format: money }, orders: { label: "Số đơn hàng", format: number }, soldProducts: { label: "Sản phẩm bán ra", format: number } }[metric];
  return <Card className="border-0 shadow-sm ring-1 ring-zinc-200"><CardHeader className="gap-4 border-b sm:flex sm:flex-row sm:items-center sm:justify-between"><div><CardTitle>Doanh thu & đơn hàng</CardTitle><p className="mt-1 text-xs text-muted-foreground">Dữ liệu trong khoảng thời gian đã chọn</p></div><div className="flex w-fit rounded-lg bg-zinc-100 p-1">{(["revenue", "orders", "soldProducts"] as ChartMetric[]).map((key) => <button key={key} type="button" onClick={() => setMetric(key)} className={cn("rounded-md px-3 py-1.5 text-xs font-semibold transition", metric === key ? "bg-white text-[#ff5a1f] shadow-sm" : "text-muted-foreground")}>{key === "revenue" ? "Doanh thu" : key === "orders" ? "Số đơn" : "Đã bán"}</button>)}</div></CardHeader><CardContent className="pt-5"><MiniAreaChart points={data.series.map((point) => ({ date: point.date, value: point[metric] }))} format={config.format} bucket={data.period.bucket} /></CardContent></Card>;
}

function MiniAreaChart({ points, format, bucket }: { points: Array<{ date: string; value: number }>; format: (value: number) => string; bucket: DashboardData["period"]["bucket"] }) {
  const width = 900, height = 260, paddingX = 24, paddingY = 24;
  const max = Math.max(...points.map((point) => point.value), 1);
  const coordinates = points.map((point, index) => ({ x: paddingX + (index / Math.max(points.length - 1, 1)) * (width - paddingX * 2), y: height - paddingY - (point.value / max) * (height - paddingY * 2), ...point }));
  const line = coordinates.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");
  const area = coordinates.length ? `${line} L ${coordinates.at(-1)?.x} ${height - paddingY} L ${coordinates[0].x} ${height - paddingY} Z` : "";
  const labelIndexes = Array.from(new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])).filter((value) => value >= 0);
  const label = (value: string) => new Intl.DateTimeFormat("vi-VN", bucket === "hour" ? { hour: "2-digit", minute: "2-digit" } : { day: "2-digit", month: "2-digit" }).format(new Date(value));
  return <div><div className="mb-2 flex items-end justify-between"><div><span className="text-xs text-muted-foreground">Cao nhất</span><strong className="ml-2 text-lg">{format(max === 1 && points.every((item) => item.value === 0) ? 0 : max)}</strong></div></div><div className="relative overflow-hidden"><svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full" role="img" aria-label="Biểu đồ hiệu suất"><defs><linearGradient id="dashboard-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff5a1f" stopOpacity="0.3" /><stop offset="100%" stopColor="#ff5a1f" stopOpacity="0.02" /></linearGradient></defs>{[0.25, 0.5, 0.75, 1].map((ratio) => <line key={ratio} x1={paddingX} x2={width - paddingX} y1={paddingY + (height - paddingY * 2) * ratio} y2={paddingY + (height - paddingY * 2) * ratio} stroke="#e4e4e7" strokeDasharray="5 6" />)}{area && <path d={area} fill="url(#dashboard-area)" />}{line && <path d={line} fill="none" stroke="#ff5a1f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}{coordinates.map((point) => <circle key={point.date} cx={point.x} cy={point.y} r="3.5" fill="white" stroke="#ff5a1f"><title>{label(point.date)}: {format(point.value)}</title></circle>)}</svg>{points.length === 0 && <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Chưa có dữ liệu</div>}</div><div className="flex justify-between px-2 text-[11px] text-muted-foreground">{labelIndexes.map((index) => <span key={index}>{points[index] ? label(points[index].date) : ""}</span>)}</div></div>;
}

function OrderStatusCard({ statuses }: { statuses: DashboardData["orderStatuses"] }) {
  const items = [
    ["pending", "Chờ xác nhận", ClipboardClock, "bg-red-500"], ["confirmed", "Đã xác nhận", CheckCircle2, "bg-blue-500"], ["processing", "Đang đóng gói", PackageOpen, "bg-violet-500"], ["shipping", "Đang giao", Truck, "bg-cyan-500"], ["completed", "Hoàn thành", PackageCheck, "bg-emerald-500"], ["cancelled", "Đã hủy", RotateCcw, "bg-zinc-500"], ["returned", "Hoàn trả", RotateCcw, "bg-amber-500"],
  ] as const;
  const total = Math.max(Object.values(statuses).reduce((sum, value) => sum + value, 0), 1);
  return <Card className="border-0 shadow-sm ring-1 ring-zinc-200"><CardHeader className="border-b"><CardTitle>Trạng thái đơn hàng</CardTitle><p className="text-xs text-muted-foreground">Đơn hàng trong kỳ đã chọn</p></CardHeader><CardContent className="space-y-2 pt-4">{items.map(([key, label, Icon, color]) => {
    const value = statuses[key];
    return <div key={key} className={cn("rounded-xl p-3", key === "pending" && value > 0 ? "border border-red-200 bg-red-50" : "bg-zinc-50")}><div className="flex items-center gap-2"><Icon className={cn("size-4", key === "pending" && value > 0 ? "text-red-600" : "text-zinc-500")} /><span className="flex-1 text-xs font-medium">{label}</span><strong className={cn("text-sm", key === "pending" && value > 0 && "text-red-600")}>{value}</strong></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-200"><div className={cn("h-full rounded-full", color)} style={{ width: `${Math.max(value ? 3 : 0, (value / total) * 100)}%` }} /></div>{key === "pending" && value > 0 && <Link href="/admin/orders" className="mt-2 block text-[11px] font-semibold text-red-600 hover:underline">{value} đơn cần xác nhận ngay →</Link>}</div>;
  })}</CardContent></Card>;
}

function TopProducts({ products }: { products: DashboardData["topProducts"] }) {
  return <DataCard title="Top sản phẩm bán chạy" subtitle="Tính trên đơn đã hoàn thành" icon={ChartNoAxesCombined}><Table><TableHeader><TableRow><TableHead>Sản phẩm</TableHead><TableHead className="text-right">Đã bán</TableHead><TableHead className="text-right">Doanh thu</TableHead></TableRow></TableHeader><TableBody>{products.length ? products.map((product, index) => <TableRow key={`${product.productId}-${product.name}`}><TableCell><span className="mr-2 inline-grid size-6 place-items-center rounded-full bg-orange-50 text-[10px] font-bold text-[#ff5a1f]">{index + 1}</span><span className="font-medium">{product.name}</span></TableCell><TableCell className="text-right font-semibold">{number(product.sold)}</TableCell><TableCell className="text-right font-semibold">{money(product.revenue)}</TableCell></TableRow>) : <EmptyRow colSpan={3} text="Chưa có sản phẩm đã bán trong kỳ" />}</TableBody></Table></DataCard>;
}

function LowStock({ items }: { items: DashboardData["lowStock"] }) {
  return <DataCard title="Sản phẩm tồn kho thấp" subtitle="Cảnh báo khi tồn kho dưới 5" icon={Warehouse} action={<Link href="/admin/inventory" className="text-xs font-semibold text-[#ff5a1f]">Quản lý kho →</Link>}><Table><TableHeader><TableRow><TableHead>Sản phẩm / biến thể</TableHead><TableHead>SKU</TableHead><TableHead className="text-right">Tồn kho</TableHead></TableRow></TableHeader><TableBody>{items.length ? items.map((item) => <TableRow key={item.variantId ?? item.productId} className="bg-red-50/50 hover:bg-red-50"><TableCell><strong className="block text-xs">{item.productName}</strong>{item.variantName && <span className="mt-0.5 block text-[11px] text-muted-foreground">{item.variantName}</span>}</TableCell><TableCell className="font-mono text-xs">{item.sku ?? "—"}</TableCell><TableCell className="text-right"><span className="inline-flex min-w-8 justify-center rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">{item.stock}</span></TableCell></TableRow>) : <EmptyRow colSpan={3} text="Không có sản phẩm sắp hết hàng" />}</TableBody></Table></DataCard>;
}

function CustomerCard({ data }: { data: DashboardData["customers"] }) {
  const total = data.segments.newCustomers + data.segments.returningCustomers;
  const newPercent = total ? Math.round((data.segments.newCustomers / total) * 100) : 0;
  return <Card className="border-0 shadow-sm ring-1 ring-zinc-200"><CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><UsersRound className="size-5 text-[#ff5a1f]" /> Khách hàng</CardTitle><p className="text-xs text-muted-foreground">Khách mua mới, quay lại và khách chi tiêu cao nhất trong kỳ</p></CardHeader><CardContent className="grid gap-8 pt-6 lg:grid-cols-[300px_1fr]"><div className="flex items-center gap-6 lg:border-r"><div className="grid size-32 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#ff5a1f 0 ${newPercent}%, #27272a ${newPercent}% 100%)` }}><div className="grid size-22 place-items-center rounded-full bg-white text-center"><span><strong className="block text-xl">{total}</strong><small className="text-[10px] text-muted-foreground">khách mua</small></span></div></div><div className="space-y-4 text-xs"><Legend color="bg-[#ff5a1f]" label="Khách mới" value={data.segments.newCustomers} /><Legend color="bg-zinc-800" label="Khách quay lại" value={data.segments.returningCustomers} /></div></div><div><h3 className="mb-3 text-sm font-semibold">Top khách hàng theo tổng chi tiêu</h3><Table><TableHeader><TableRow><TableHead>Khách hàng</TableHead><TableHead className="text-right">Số đơn</TableHead><TableHead className="text-right">Tổng chi tiêu</TableHead></TableRow></TableHeader><TableBody>{data.top.length ? data.top.map((customer) => <TableRow key={customer.userId}><TableCell><strong className="block text-xs">{customer.name}</strong><span className="text-[11px] text-muted-foreground">{customer.email ?? "Không có email"}</span></TableCell><TableCell className="text-right">{customer.orderCount}</TableCell><TableCell className="text-right font-semibold">{money(customer.totalSpent)}</TableCell></TableRow>) : <EmptyRow colSpan={3} text="Chưa có khách hàng phát sinh mua hàng" />}</TableBody></Table></div></CardContent></Card>;
}

function DataCard({ title, subtitle, icon: Icon, action, children }: { title: string; subtitle: string; icon: typeof ShoppingCart; action?: React.ReactNode; children: React.ReactNode }) { return <Card className="border-0 shadow-sm ring-1 ring-zinc-200"><CardHeader className="flex-row items-center border-b"><span className="grid size-9 place-items-center rounded-xl bg-orange-50 text-[#ff5a1f]"><Icon className="size-4.5" /></span><div className="flex-1"><CardTitle>{title}</CardTitle><p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p></div>{action}</CardHeader><CardContent>{children}</CardContent></Card>; }
function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) { return <TableRow><TableCell colSpan={colSpan} className="h-32 text-center text-muted-foreground">{text}</TableCell></TableRow>; }
function Legend({ color, label, value }: { color: string; label: string; value: number }) { return <div><div className="flex items-center gap-2 text-muted-foreground"><span className={cn("size-2.5 rounded-full", color)} />{label}</div><strong className="mt-1 block pl-4 text-lg text-foreground">{value}</strong></div>; }
function DashboardSkeleton() { return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-32 rounded-xl" />)}</div><Skeleton className="h-28 rounded-2xl" /><div className="grid gap-5 xl:grid-cols-[1.7fr_0.8fr]"><Skeleton className="h-96 rounded-xl" /><Skeleton className="h-96 rounded-xl" /></div></div>; }
