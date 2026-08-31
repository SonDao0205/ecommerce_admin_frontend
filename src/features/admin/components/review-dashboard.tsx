"use client";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  MessageSquareReply,
  RefreshCw,
  Search,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormModal } from "@/src/components/common/form-modal";
import { ApiError } from "@/src/core/api";
import {
  useReplyReview,
  useReviews,
  type ProductReview,
} from "@/src/features/reviews";

const date = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
export function ReviewDashboard() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "new" | "replied">("all");
  const [replying, setReplying] = useState<ProductReview | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      setTerm(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);
  const query = useReviews({
    page,
    limit: 10,
    search: term || undefined,
    replied: filter === "all" ? undefined : filter === "replied",
    sortBy: "createdAt",
    sortOrder: "DESC",
  });
  return (
    <div className="p-4 sm:p-7">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý đánh giá</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Theo dõi đánh giá mới và phản hồi khách hàng.
        </p>
      </div>
      <Card className="overflow-hidden py-0 shadow-none">
        <div className="flex flex-col gap-3 border-b bg-zinc-50 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm sản phẩm, khách hàng, nội dung..."
              className="pl-9"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as typeof filter);
              setPage(1);
            }}
            className="h-9 rounded-md border bg-white px-3 text-sm"
          >
            <option value="all">Tất cả</option>
            <option value="new">Chưa phản hồi</option>
            <option value="replied">Đã phản hồi</option>
          </select>
          <Button size="icon" variant="outline" onClick={() => query.refetch()}>
            <RefreshCw className={query.isFetching ? "animate-spin" : ""} />
          </Button>
        </div>
        {query.isPending ? (
          <div className="grid min-h-64 place-items-center">
            <LoaderCircle className="animate-spin" />
          </div>
        ) : (
          <div className="divide-y">
            {query.data?.items.length ? (
              query.data.items.map((review) => (
                <article key={review.id} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <strong>{review.productName}</strong>
                        {review.variantValue && (
                          <span className="rounded bg-zinc-100 px-2 py-1 text-xs">
                            {review.variantName}: {review.variantValue}
                            {review.variantSku ? ` · ${review.variantSku}` : ""}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {review.userName} · {date(review.createdAt)}
                      </p>
                      <div className="mt-2 flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`size-4 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-300"}`}
                          />
                        ))}
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                        {review.content}
                      </p>
                      {review.media.length > 0 && (
                        <div className="mt-3 flex gap-2">
                          {review.media.map((asset) => (
                            <a
                              key={asset.publicId}
                              href={asset.url}
                              target="_blank"
                              rel="noreferrer"
                              className="relative size-16 overflow-hidden rounded-lg border"
                            >
                              {asset.resourceType === "video" ? (
                                <video
                                  src={asset.url}
                                  muted
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Image
                                  src={asset.url}
                                  alt="Media đánh giá"
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              )}
                            </a>
                          ))}
                        </div>
                      )}
                      {review.adminReply && (
                        <div className="mt-3 rounded-lg bg-orange-50 p-3 text-sm">
                          <strong>Phản hồi cửa hàng:</strong>
                          <p className="mt-1 whitespace-pre-wrap">
                            {review.adminReply}
                          </p>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setReplying(review)}
                    >
                      <MessageSquareReply />
                      {review.adminReply ? "Sửa phản hồi" : "Phản hồi"}
                    </Button>
                  </div>
                </article>
              ))
            ) : (
              <div className="p-16 text-center text-muted-foreground">
                Chưa có đánh giá phù hợp.
              </div>
            )}
          </div>
        )}
        {query.data && (
          <div className="flex items-center justify-between border-t p-4 text-sm">
            <span>{query.data.meta.totalItems} đánh giá</span>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="outline"
                disabled={!query.data.meta.hasPreviousPage}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft />
              </Button>
              <Button
                size="icon"
                variant="outline"
                disabled={!query.data.meta.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        )}
      </Card>
      {replying && (
        <ReplyModal
          key={replying.id}
          review={replying}
          onClose={() => setReplying(null)}
        />
      )}
    </div>
  );
}
function ReplyModal({
  review,
  onClose,
}: {
  review: ProductReview;
  onClose: () => void;
}) {
  const [reply, setReply] = useState(review.adminReply ?? "");
  const mutation = useReplyReview();
  async function submit() {
    if (reply.trim().length < 2) return;
    try {
      await mutation.mutateAsync({ id: review.id, reply: reply.trim() });
      toast.success("Phản hồi đánh giá thành công");
      onClose();
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Không thể phản hồi đánh giá.",
      );
    }
  }
  return (
    <FormModal
      open
      onOpenChange={(open) => !open && !mutation.isPending && onClose()}
      title="Phản hồi đánh giá"
      description={`${review.productName} · ${review.userName}`}
    >
      <Textarea
        rows={6}
        value={reply}
        maxLength={2000}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Nhập phản hồi của cửa hàng..."
      />
      <DialogFooter>
        <Button
          variant="outline"
          disabled={mutation.isPending}
          onClick={onClose}
        >
          Hủy
        </Button>
        <Button
          disabled={mutation.isPending || reply.trim().length < 2}
          onClick={() => void submit()}
          className="bg-[#ff5a1f] text-white"
        >
          {mutation.isPending && <LoaderCircle className="animate-spin" />}Lưu
          phản hồi
        </Button>
      </DialogFooter>
    </FormModal>
  );
}
