"use client";

import { CircleCheck, LoaderCircle, TriangleAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void | Promise<void>;
  tone?: "danger" | "success";
}

/** Confirm nguy hiểm chuẩn dùng chung cho mọi management page. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Xác nhận thao tác",
  description,
  confirmLabel = "Xóa",
  pending = false,
  onConfirm,
  tone = "danger",
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className={tone === "danger" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}>
            {tone === "danger" ? <TriangleAlert /> : <CircleCheck />}
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Từ chối</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={onConfirm}
            className={tone === "danger" ? "bg-red-600 text-white hover:bg-red-700" : "bg-green-600 text-white hover:bg-green-700"}
          >
            {pending && <LoaderCircle className="animate-spin" />}
            {pending ? "Đang xử lý..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
