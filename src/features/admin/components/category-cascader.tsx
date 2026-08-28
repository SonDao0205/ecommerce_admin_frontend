"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Folder,
  LoaderCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  categoryService,
  useActiveRootCategories,
  type Category,
} from "@/src/features/categories";
import { categoryKeys } from "@/src/features/categories/api/category.keys";

interface CategoryCascaderProps {
  value?: string;
  initialLabel?: string;
  disabled?: boolean;
  onChange: (categoryId: string) => void;
  allowParentSelection?: boolean;
}

export function CategoryCascader({
  value,
  initialLabel,
  disabled,
  onChange,
  allowParentSelection = false,
}: CategoryCascaderProps) {
  const queryClient = useQueryClient();
  const rootQuery = useActiveRootCategories();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [columns, setColumns] = useState<Category[][]>([]);
  const [path, setPath] = useState<Category[]>([]);
  const [selectedLabel, setSelectedLabel] = useState(initialLabel ?? "");
  const [loadingId, setLoadingId] = useState<string>();
  const visibleColumns = columns.length
    ? columns
    : [rootQuery.data?.items ?? []];

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  function toggle() {
    if (disabled) return;
    setOpen((current) => !current);
  }

  async function choose(category: Category, level: number) {
    const nextPath = [...path.slice(0, level), category];
    setPath(nextPath);

    if ((category.childCount ?? 0) > 0) {
      if (allowParentSelection) {
        onChange(category.id);
        setSelectedLabel(nextPath.map((item) => item.name).join(" / "));
      } else {
        onChange("");
        setSelectedLabel("");
      }
      setLoadingId(category.id);
      try {
        const result = await queryClient.fetchQuery({
          queryKey: categoryKeys.activeChildren(category.id),
          queryFn: () => categoryService.getActiveChildren(category.id),
          staleTime: Infinity,
          gcTime: Infinity,
        });
        setColumns((current) => [...current.slice(0, level + 1), result.items]);
      } catch {
        toast.error("Không thể tải danh mục con. Vui lòng thử lại.");
      } finally {
        setLoadingId(undefined);
      }
      return;
    }

    setColumns((current) => current.slice(0, level + 1));
    setSelectedLabel(nextPath.map((item) => item.name).join(" / "));
    onChange(category.id);
    setOpen(false);
  }

  function clearSelection() {
    onChange("");
    setSelectedLabel("");
    setPath([]);
    setColumns([rootQuery.data?.items ?? []]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={toggle}
        className="flex h-8 w-full items-center justify-between rounded-lg border bg-transparent px-2.5 text-left text-sm outline-none focus:border-[#ff5a1f] focus:ring-3 focus:ring-[#ff5a1f]/10 disabled:opacity-50"
      >
        <span className={cn("truncate", !value && "text-muted-foreground")}>
          {value
            ? selectedLabel || initialLabel || "Danh mục đã chọn"
            : "Chọn danh mục"}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-999 mt-2 w-[min(720px,calc(100vw-4rem))] overflow-x-auto rounded-xl border bg-popover p-2 shadow-xl">
          <div className="mb-2 flex items-center justify-between border-b px-2 pb-2">
            <p className="text-xs font-medium text-muted-foreground">
              {allowParentSelection
                ? "Có thể chọn danh mục cha hoặc danh mục con"
                : "Chỉ có thể chọn danh mục không còn danh mục con"}
            </p>
            {value && (
              <button
                type="button"
                onClick={clearSelection}
                className="text-xs text-destructive hover:underline"
              >
                Bỏ chọn
              </button>
            )}
          </div>

          {rootQuery.isLoading ? (
            <div className="flex h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" /> Đang tải danh
              mục...
            </div>
          ) : rootQuery.isError ? (
            <p className="p-4 text-sm text-destructive">
              Không thể tải danh mục.
            </p>
          ) : (
            <div className="flex min-h-44 divide-x">
              {visibleColumns.map((items, level) => (
                <div
                  key={level}
                  role="listbox"
                  className="w-52 shrink-0 space-y-1 px-1"
                >
                  {items.length === 0 && (
                    <p className="px-2 py-3 text-xs text-muted-foreground">
                      Không có danh mục con
                    </p>
                  )}
                  {items.map((category) => {
                    const hasChildren = (category.childCount ?? 0) > 0;
                    const active = path[level]?.id === category.id;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        role="option"
                        aria-selected={value === category.id}
                        onClick={() => choose(category, level)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent",
                          active && "bg-orange-50 text-[#e94b13]",
                        )}
                      >
                        <Folder className="size-4 shrink-0" />
                        <span className="flex-1 truncate">{category.name}</span>
                        {loadingId === category.id ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : hasChildren ? (
                          <ChevronRight className="size-4" />
                        ) : value === category.id ? (
                          <Check className="size-4" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
