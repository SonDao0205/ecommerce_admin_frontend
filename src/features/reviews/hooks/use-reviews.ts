"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "../api/review.service";
import type { ReviewQuery } from "../types/review";
const keys = {
  all: ["reviews"] as const,
  lists: () => ["reviews", "list"] as const,
};
export function useReviews(query: ReviewQuery) {
  return useQuery({
    queryKey: [...keys.lists(), query],
    queryFn: () => reviewService.getManagement(query),
  });
}
export function useReplyReview() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) =>
      reviewService.reply(id, reply),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.all }),
  });
}
