"use client";

import { FolderTree, Plus, Server, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/src/components/common/confirm-dialog";
import { ApiError } from "@/src/core/api";
import {
  useUpdateCategoryStatus,
  useRootCategories,
  type Category,
} from "@/src/features/categories";
import { CategoryTree, CategoryTreeSkeleton } from "./category-tree";
import { CategoryFormModal } from "./category-form-modal";

export function CategoryDashboard() {
  const rootsQuery = useRootCategories();
  const updateCategoryStatus = useUpdateCategoryStatus();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [defaultParent, setDefaultParent] = useState<Category | null>(null);
  const [statusCategory, setStatusCategory] = useState<Category | null>(null);

  function openCreate(parent: Category | null = null) {
    setEditingCategory(null);
    setDefaultParent(parent);
    setFormOpen(true);
  }

  function openEdit(category: Category) {
    setEditingCategory(category);
    setDefaultParent(null);
    setFormOpen(true);
  }

  async function handleStatusChange() {
    if (!statusCategory) return;
    const nextActive = !statusCategory.isActive;
    try {
      await updateCategoryStatus.mutateAsync({
        id: statusCategory.id,
        isActive: nextActive,
      });
      toast.success(`${nextActive ? "Hiện" : "Ẩn"} danh mục thành công`);
      setStatusCategory(null);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : `Không thể ${nextActive ? "hiện" : "ẩn"} danh mục.`,
      );
    }
  }

  return (
    <div className="p-4 sm:p-7">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#222] sm:text-[25px]">
            Quản lý danh mục
          </h1>
          <p className="mt-1.5 text-[13px] text-[#777]">
            Mở từng danh mục để tải các tầng con theo nhu cầu.
          </p>
        </div>
        <Button onClick={() => openCreate()} className="bg-[#ff5a1f] text-white hover:bg-[#e94b13]">
          <Plus /> Thêm danh mục
        </Button>
      </div>

      <div className="mb-6 grid gap-[18px] sm:grid-cols-3">
        <Card className="rounded-[10px] py-0 shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-lg bg-[#fff2ec] text-[#ff5a1f]">
              <FolderTree />
            </div>
            <div>
              <p className="text-xs text-[#888]">Danh mục gốc</p>
              <strong className="mt-1 block text-xl">
                {rootsQuery.data?.meta.totalItems ?? "—"}
              </strong>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[10px] py-0 shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Zap />
            </div>
            <div>
              <p className="text-xs text-[#888]">Cách tải dữ liệu</p>
              <strong className="mt-1 block text-sm">Lazy loading</strong>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[10px] py-0 shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <Server />
            </div>
            <div>
              <p className="text-xs text-[#888]">Cache nhánh đã tải</p>
              <strong className="mt-1 block text-sm">Trong toàn phiên</strong>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-[10px] py-0 shadow-none">
        <div className="border-b bg-[#fafafa] px-4 py-3">
          <p className="text-xs font-semibold text-[#777]">
            Cấu trúc danh mục · Bấm mũi tên để mở từng tầng
          </p>
        </div>

        {rootsQuery.isPending && <CategoryTreeSkeleton />}

        {rootsQuery.isError && (
          <Alert variant="destructive" className="m-4 w-auto">
            <AlertDescription className="flex items-center justify-between gap-3">
              Không thể tải danh mục gốc.
              <Button size="sm" variant="outline" onClick={() => rootsQuery.refetch()}>
                Thử lại
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {rootsQuery.data && (
          <CategoryTree
            categories={rootsQuery.data.items}
            onAddChild={openCreate}
            onEdit={openEdit}
            onToggleStatus={setStatusCategory}
          />
        )}
      </Card>

      <CategoryFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editingCategory}
        defaultParent={defaultParent}
      />
      <ConfirmDialog
        open={Boolean(statusCategory)}
        onOpenChange={(open) => !open && setStatusCategory(null)}
        title={`${statusCategory?.isActive ? "Ẩn" : "Hiện"} danh mục?`}
        description={`Bạn có chắc muốn ${statusCategory?.isActive ? "ẩn" : "hiện"} “${statusCategory?.name ?? ""}”?`}
        confirmLabel={statusCategory?.isActive ? "Ẩn danh mục" : "Hiện danh mục"}
        tone={statusCategory?.isActive ? "danger" : "success"}
        pending={updateCategoryStatus.isPending}
        onConfirm={handleStatusChange}
      />
    </div>
  );
}
