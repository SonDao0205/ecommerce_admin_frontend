"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, ImagePlus, RefreshCw, Star, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ProductImageManifestItem } from "@/src/features/products";

export interface ProductImagesValue {
  files: File[];
  manifest: ProductImageManifestItem[];
  thumbnailIndex?: number;
}

interface ImageItem {
  id: string;
  src: string;
  file?: File;
  existingUrl?: string;
  mediaType: "image" | "video";
}

function mediaTypeFromUrl(url: string): "image" | "video" {
  return /\/video\/upload\/|\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)
    ? "video"
    : "image";
}

interface ProductImageManagerProps {
  initialImages?: string[];
  initialThumbnail?: string;
  disabled?: boolean;
  onChange: (value: ProductImagesValue) => void;
}

export function ProductImageManager({
  initialImages = [],
  initialThumbnail,
  disabled,
  onChange,
}: ProductImageManagerProps) {
  const initialUrls = Array.from(
    new Set([...(initialThumbnail ? [initialThumbnail] : []), ...initialImages]),
  );
  const [items, setItems] = useState<ImageItem[]>(() =>
    initialUrls.map((url) => ({
      id: `existing-${url}`,
      src: url,
      existingUrl: url,
      mediaType: mediaTypeFromUrl(url),
    })),
  );
  const [thumbnailId, setThumbnailId] = useState<string | undefined>(() =>
    initialThumbnail ? `existing-${initialThumbnail}` : undefined,
  );
  const objectUrls = useRef<string[]>([]);

  useEffect(
    () => () => objectUrls.current.forEach((url) => URL.revokeObjectURL(url)),
    [],
  );

  function emit(nextItems: ImageItem[], nextThumbnailId?: string) {
    const files = nextItems.filter((item) => item.file).map((item) => item.file as File);
    const manifest: ProductImageManifestItem[] = nextItems.map((item) =>
      item.existingUrl
        ? { kind: "existing", url: item.existingUrl }
        : { kind: "new", fileIndex: files.indexOf(item.file as File) },
    );
    const thumbnailIndex = nextThumbnailId
      ? nextItems.findIndex((item) => item.id === nextThumbnailId)
      : undefined;
    onChange({
      files,
      manifest,
      thumbnailIndex:
        thumbnailIndex !== undefined && thumbnailIndex >= 0 ? thumbnailIndex : undefined,
    });
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    const accepted = Array.from(files).filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) {
        toast.error(`${file.name} không phải ảnh hoặc video.`);
        return false;
      }
      const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`${file.name} vượt quá giới hạn ${isVideo ? 50 : 5} MB.`);
        return false;
      }
      return true;
    });
    const availableSlots = Math.max(0, 6 - items.length);
    if (accepted.length > availableSlots) {
      toast.error("Mỗi sản phẩm được tải tối đa 6 ảnh hoặc video.");
    }
    const added = accepted.slice(0, availableSlots).map((file) => {
      const src = URL.createObjectURL(file);
      objectUrls.current.push(src);
      return {
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        src,
        file,
        mediaType: file.type.startsWith("video/") ? "video" as const : "image" as const,
      };
    });
    const nextItems = [...items, ...added];
    const nextThumbnailId =
      thumbnailId ?? nextItems.find((item) => item.mediaType === "image")?.id;
    setItems(nextItems);
    setThumbnailId(nextThumbnailId);
    emit(nextItems, nextThumbnailId);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const nextItems = [...items];
    [nextItems[index], nextItems[target]] = [nextItems[target], nextItems[index]];
    setItems(nextItems);
    emit(nextItems, thumbnailId);
  }

  function pin(id: string) {
    setThumbnailId(id);
    emit(items, id);
  }

  function remove(id: string) {
    const removed = items.find((item) => item.id === id);
    if (removed?.file) URL.revokeObjectURL(removed.src);
    const nextItems = items.filter((item) => item.id !== id);
    const nextThumbnailId =
      thumbnailId === id
        ? nextItems.find((item) => item.mediaType === "image")?.id
        : thumbnailId;
    setItems(nextItems);
    setThumbnailId(nextThumbnailId);
    emit(nextItems, nextThumbnailId);
  }

  function replace(id: string, file?: File) {
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if ((!isImage && !isVideo) || file.size > maxSize) {
      toast.error("File thay thế không đúng định dạng hoặc vượt quá dung lượng.");
      return;
    }
    const src = URL.createObjectURL(file);
    objectUrls.current.push(src);
    const nextItems: ImageItem[] = items.map((item) =>
      item.id === id
        ? {
            id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
            src,
            file,
            mediaType: isVideo ? "video" : "image",
          }
        : item,
    );
    const replacement = nextItems.find((_, index) => items[index]?.id === id);
    const nextThumbnailId =
      thumbnailId === id
        ? replacement?.mediaType === "image"
          ? replacement.id
          : nextItems.find((item) => item.mediaType === "image")?.id
        : thumbnailId;
    setItems(nextItems);
    setThumbnailId(nextThumbnailId);
    emit(nextItems, nextThumbnailId);
  }

  return (
    <div className="space-y-3">
      <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 px-4 text-center hover:border-[#ff5a1f] hover:bg-orange-50/50">
        <ImagePlus className="mb-2 size-6 text-[#ff5a1f]" />
        <span className="text-sm font-medium">Chọn ảnh hoặc video sản phẩm</span>
        <span className="mt-1 text-xs text-muted-foreground">Tối đa 6 media — ảnh 5 MB, video 50 MB</span>
        <Input
          type="file"
          accept="image/*,video/*"
          multiple
          disabled={disabled}
          className="sr-only"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </label>

      {items.length > 0 && (
        <div
          className="flex gap-3 overflow-x-auto overscroll-x-contain pb-3"
          onWheel={(event) => {
            if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
              event.preventDefault();
              event.currentTarget.scrollLeft += event.deltaY;
            }
          }}
        >
          {items.map((item, index) => {
            const pinned = item.id === thumbnailId;
            return (
              <article
                key={item.id}
                className={cn(
                  "w-40 shrink-0 overflow-hidden rounded-xl border bg-background",
                  pinned && "border-amber-400 ring-2 ring-amber-200",
                )}
              >
                <div className="relative h-28 bg-muted">
                  {item.mediaType === "video" ? (
                    <video src={item.src} controls preload="metadata" className="h-full w-full object-cover" />
                  ) : (
                    <Image src={item.src} alt={`Ảnh sản phẩm ${index + 1}`} fill unoptimized className="object-cover" />
                  )}
                  <span className="absolute top-2 left-2 rounded bg-black/65 px-1.5 py-0.5 text-[10px] text-white">
                    #{index + 1}
                  </span>
                  {pinned && (
                    <span className="absolute right-2 bottom-2 rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-semibold text-amber-950">
                      Ảnh đại diện
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-center gap-1 p-2">
                  <Button type="button" size="icon-sm" variant={pinned ? "default" : "outline"} title={item.mediaType === "video" ? "Video không thể làm ảnh bìa" : "Ghim làm ảnh đại diện"} disabled={disabled || item.mediaType === "video"} onClick={() => pin(item.id)} className={pinned ? "bg-amber-400 text-amber-950 hover:bg-amber-500" : ""}>
                    <Star className={cn("size-4", pinned && "fill-current")} />
                  </Button>
                  <Button type="button" size="icon-sm" variant="outline" title="Đưa ảnh lên trước" disabled={disabled || index === 0} onClick={() => move(index, -1)}>
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button type="button" size="icon-sm" variant="outline" title="Đưa ảnh xuống sau" disabled={disabled || index === items.length - 1} onClick={() => move(index, 1)}>
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button type="button" size="icon-sm" variant="outline" title="Xóa ảnh" disabled={disabled} onClick={() => remove(item.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="size-4" />
                  </Button>
                  <label className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md border hover:bg-accent" title="Thay thế ảnh">
                    <RefreshCw className="size-4" />
                    <input
                      type="file"
                      accept="image/*,video/*"
                      disabled={disabled}
                      className="sr-only"
                      onChange={(event) => {
                        replace(item.id, event.target.files?.[0]);
                        event.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
