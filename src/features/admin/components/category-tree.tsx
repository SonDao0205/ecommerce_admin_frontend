"use client";

import {
  ChevronDown,
  ChevronRight,
  Edit3,
  Eye,
  EyeOff,
  Folder,
  FolderOpen,
  LoaderCircle,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCategoryChildren,
  type Category,
} from "@/src/features/categories";

interface CategoryNodeProps {
  category: Category;
  depth: number;
  onAddChild: (category: Category) => void;
  onEdit: (category: Category) => void;
  onToggleStatus: (category: Category) => void;
}

function CategoryNode({
  category,
  depth,
  onAddChild,
  onEdit,
  onToggleStatus,
}: CategoryNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = (category.childCount ?? 0) > 0;
  const childrenQuery = useCategoryChildren(
    category.id,
    expanded && hasChildren,
  );

  return (
    <div>
      <div
        className="group flex min-h-[62px] items-center border-b bg-white pr-3 transition hover:bg-[#fafafa]"
        style={{ paddingLeft: `${16 + depth * 28}px` }}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={!hasChildren}
          aria-label={expanded ? `Thu gọn ${category.name}` : `Mở ${category.name}`}
          aria-expanded={expanded}
          className="mr-1 disabled:cursor-default disabled:opacity-0"
          onClick={() => setExpanded((current) => !current)}
        >
          {childrenQuery.isFetching ? (
            <LoaderCircle className="animate-spin" />
          ) : expanded ? (
            <ChevronDown />
          ) : (
            <ChevronRight />
          )}
        </Button>

        <div className="mr-3 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#fff2ec] text-[#ff5a1f]">
          {expanded ? <FolderOpen className="size-[18px]" /> : <Folder className="size-[18px]" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <strong className="truncate text-[13px]">{category.name}</strong>
            {hasChildren && (
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600">
                {category.childCount} mục con
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-[11px] text-[#999]">/{category.slug}</p>
        </div>

        <Badge
          className={
            category.isActive
              ? "mr-3 hidden border-0 bg-green-100 text-green-700 sm:inline-flex"
              : "mr-3 hidden border-0 bg-zinc-100 text-zinc-600 sm:inline-flex"
          }
        >
          {category.isActive ? "Hiển thị" : "Đã ẩn"}
        </Badge>

        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={`Thêm danh mục con vào ${category.name}`}
            onClick={() => onAddChild(category)}
          >
            <Plus />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={`Sửa ${category.name}`}
            onClick={() => onEdit(category)}
          >
            <Edit3 />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={`${category.isActive ? "Ẩn" : "Hiện"} ${category.name}`}
            title={category.isActive ? "Ẩn danh mục" : "Hiện danh mục"}
            onClick={() => onToggleStatus(category)}
            className={category.isActive ? "hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700" : "hover:border-green-200 hover:bg-green-50 hover:text-green-700"}
          >
            {category.isActive ? <EyeOff /> : <Eye />}
          </Button>
        </div>
      </div>

      {expanded && childrenQuery.isError && (
        <Alert variant="destructive" className="my-2 ml-12 w-auto">
          <AlertDescription className="flex items-center justify-between gap-3">
            Không thể tải danh mục con.
            <Button size="sm" variant="outline" onClick={() => childrenQuery.refetch()}>
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {expanded &&
        childrenQuery.data?.items.map((child) => (
          <CategoryNode
            key={child.id}
            category={child}
            depth={depth + 1}
            onAddChild={onAddChild}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
          />
        ))}
    </div>
  );
}

export function CategoryTree({
  categories,
  onAddChild,
  onEdit,
  onToggleStatus,
}: {
  categories: Category[];
  onAddChild: (category: Category) => void;
  onEdit: (category: Category) => void;
  onToggleStatus: (category: Category) => void;
}) {
  if (categories.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-[#777]">
        Chưa có danh mục gốc.
      </div>
    );
  }

  return categories.map((category) => (
    <CategoryNode
      key={category.id}
      category={category}
      depth={0}
      onAddChild={onAddChild}
      onEdit={onEdit}
      onToggleStatus={onToggleStatus}
    />
  ));
}

export function CategoryTreeSkeleton() {
  return (
    <div className="space-y-px">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex h-[62px] items-center gap-3 border-b px-4">
          <Skeleton className="size-8" />
          <Skeleton className="size-9" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-2.5 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}
