// app/admin/memberships/components/MembershipsPagination.tsx
"use client";

import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MembershipsPaginationProps {
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  searchParams: Record<string, string | undefined>;
}

export default function MembershipsPagination({
  pagination,
  searchParams,
}: MembershipsPaginationProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();

  const updatePage = (page: number) => {
    const params = new URLSearchParams(urlSearchParams);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const updateLimit = (limit: string) => {
    const params = new URLSearchParams(urlSearchParams);
    params.set("limit", limit);
    params.delete("page"); // Reset to first page when changing limit
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const { currentPage, totalPages } = pagination;
    const delta = 2; // Number of pages to show on each side of current page
    const pages: (number | string)[] = [];

    // Always show first page
    if (totalPages > 0) {
      pages.push(1);
    }

    // Calculate start and end of middle section
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    // Add ellipsis if there's a gap after first page
    if (start > 2) {
      pages.push("...");
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }

    // Add ellipsis if there's a gap before last page
    if (end < totalPages - 1) {
      pages.push("...");
    }

    // Always show last page (if different from first)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-6 bg-background/50 backdrop-blur-sm rounded-lg border"
    >
      {/* Results info */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          Showing{" "}
          {Math.min((pagination.currentPage - 1) * 12 + 1, pagination.total)} -{" "}
          {Math.min(pagination.currentPage * 12, pagination.total)} of{" "}
          {pagination.total} results
        </span>

        {/* Items per page selector */}
        <div className="flex items-center gap-2">
          <span>Show:</span>
          <Select
            value={searchParams.limit || "12"}
            onValueChange={updateLimit}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="48">48</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => updatePage(1)}
          disabled={!pagination.hasPrevPage}
          className="h-8 w-8 p-0"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => updatePage(pagination.currentPage - 1)}
          disabled={!pagination.hasPrevPage}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-2">
          {pageNumbers.map((page, index) => (
            <motion.div
              key={`${page}-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              {page === "..." ? (
                <div className="flex items-center justify-center h-8 w-8">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
              ) : (
                <Button
                  variant={
                    page === pagination.currentPage ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => updatePage(page as number)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Next page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => updatePage(pagination.currentPage + 1)}
          disabled={!pagination.hasNextPage}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => updatePage(pagination.totalPages)}
          disabled={!pagination.hasNextPage}
          className="h-8 w-8 p-0"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
