"use client";

import { useMemo, useRef, useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { vi } from "date-fns/locale";
import { Bell, CircleAlert, FilePlus2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuditLogs, useAuditLogStream } from "../hooks/use-audit-logs";
import type { AuditLog } from "../types/audit-log";

const actionStyle = {
  INSERT: { icon: FilePlus2, className: "bg-emerald-50 text-emerald-600" },
  UPDATE: { icon: Pencil, className: "bg-amber-50 text-amber-600" },
  DELETE: { icon: Trash2, className: "bg-red-50 text-red-600" },
};

function dayLabel(value: string) {
  const date = new Date(value);
  if (isToday(date)) return "Hôm nay";
  if (isYesterday(date)) return "Hôm qua";
  return format(date, "EEEE, dd/MM/yyyy", { locale: vi });
}

export function AuditLogBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const openRef = useRef(open);
  const { data = [], isLoading, isError, refetch } = useAuditLogs(50, open);
  const connected = useAuditLogStream(() => {
    if (!openRef.current) setUnread((count) => Math.min(count + 1, 99));
  });
  const handleOpenChange = (nextOpen: boolean) => {
    openRef.current = nextOpen;
    setOpen(nextOpen);
    if (nextOpen) setUnread(0);
  };
  const groupedLogs = useMemo(() => {
    return data.reduce<Record<string, AuditLog[]>>((groups, log) => {
      const key = format(new Date(log.createdAt), "yyyy-MM-dd");
      (groups[key] ??= []).push(log);
      return groups;
    }, {});
  }, [data]);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="relative cursor-pointer"
            aria-label="Mở nhật ký hệ thống"
          />
        }
      >
        <Bell />
        {unread > 0 && (
          <span className="absolute -right-2 -top-2 flex min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-[10px] font-bold leading-4 text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </SheetTrigger>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="text-lg font-bold">Nhật ký hệ thống</SheetTitle>
          <SheetDescription>
            <span className="inline-flex items-center gap-2">
              <span className={`size-2 rounded-full ${connected ? "bg-emerald-500" : "bg-amber-500"}`} />
              {connected ? "Đang cập nhật trực tiếp" : "Đang kết nối lại"} · 50 thao tác gần nhất
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
          {isLoading && (
            <div className="space-y-3 pt-5">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-20 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          )}
          {isError && (
            <div className="mt-8 flex flex-col items-center rounded-xl border border-red-100 bg-red-50 p-5 text-center">
              <CircleAlert className="mb-2 text-red-500" />
              <p className="text-sm text-red-700">Không thể tải nhật ký hệ thống.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 cursor-pointer"
                onClick={() => void refetch()}
              >
                Thử lại
              </Button>
            </div>
          )}
          {!isLoading && !isError && data.length === 0 && (
            <p className="py-12 text-center text-sm text-slate-500">
              Chưa có thao tác nào được ghi nhận.
            </p>
          )}

          {Object.entries(groupedLogs).map(([date, logs]) => (
            <section key={date} className="pt-5">
              <h3 className="sticky top-0 z-10 bg-white/95 py-2 text-xs font-bold uppercase tracking-wide text-slate-500 backdrop-blur">
                {dayLabel(logs[0].createdAt)}
              </h3>
              <div className="relative ml-4 border-l border-slate-200 pl-5">
                {logs.map((log) => {
                  const style = actionStyle[log.action];
                  const Icon = style.icon;
                  return (
                    <article key={log.id} className="relative pb-5">
                      <span
                        className={`absolute -left-[37px] top-0 flex size-8 items-center justify-center rounded-full ring-4 ring-white ${style.className}`}
                      >
                        <Icon className="size-4" />
                      </span>
                      <div className="rounded-xl border bg-white p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold leading-5 text-slate-800">
                            {log.description}
                          </p>
                          <time className="shrink-0 text-xs font-medium text-slate-500">
                            {format(new Date(log.createdAt), "HH:mm:ss")}
                          </time>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Bởi <span className="font-semibold text-slate-700">{log.actorName}</span>
                          {log.actorEmail ? ` · ${log.actorEmail}` : ""}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
