// components/shop/LoadMoreButton.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

interface LoadMoreButtonProps {
  currentPage: number;
  totalPages: number;
  search: string;
  category: string;
  sortBy: string;
}

export function LoadMoreButton({
  currentPage,
  totalPages,
  search,
  category,
  sortBy,
}: LoadMoreButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleLoadMore = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", (currentPage + 1).toString());

    if (search && search !== "All") params.set("search", search);
    if (category && category !== "All") params.set("category", category);
    if (sortBy) params.set("sortBy", sortBy);

    startTransition(() => {
      router.push(`/shop?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="text-center mt-12">
      <button
        onClick={handleLoadMore}
        disabled={isPending}
        className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading...
          </>
        ) : (
          `Load More Products (${totalPages - currentPage} pages remaining)`
        )}
      </button>
    </div>
  );
}
