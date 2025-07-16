import { getCachedProducts } from "@/lib/actions/cachedProductActions";
import { EnhancedProductCard } from "./ProductCard";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import type { IProduct } from "@/types/product";

interface ServerProductsGridProps {
  search?: string;
  category?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export async function ServerProductsGrid({
  search = "",
  category = "All",
  sortBy = "name",
  page = 1,
  limit = 12,
}: ServerProductsGridProps) {
  const { products, total, totalPages, currentPage } = await getCachedProducts({
    search: search || undefined,
    category: category !== "All" ? category : undefined,
    sortBy,
    page,
    limit,
  });

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <Info className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600 mb-6">
            {search || category !== "All"
              ? "Try adjusting your search terms or filters"
              : "No products are currently available"}
          </p>
          {(search || category !== "All") && (
            <a
              href="/shop"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Clear Filters
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {total} product{total !== 1 ? "s" : ""}
          </Badge>
          {search && (
            <Badge variant="secondary">
              Search: "{search}"
            </Badge>
          )}
          {category && category !== "All" && (
            <Badge variant="secondary">
              Category: {category}
            </Badge>
          )}
        </div>
        
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          // Convert IProduct to ProductWithMembership for the component
          const productWithMembership = product as any;
          return (
            <EnhancedProductCard
              key={product._id}
              product={productWithMembership}
              showMembershipBenefits={false}
              variant="default"
            />
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            search={search}
            category={category}
            sortBy={sortBy}
          />
        </div>
      )}
    </div>
  );
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  search?: string;
  category?: string;
  sortBy?: string;
}

function PaginationControls({
  currentPage,
  totalPages,
  search,
  category,
  sortBy,
}: PaginationControlsProps) {
  const generatePageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category && category !== "All") params.set("category", category);
    if (sortBy) params.set("sortBy", sortBy);
    if (page > 1) params.set("page", page.toString());
    
    const queryString = params.toString();
    return queryString ? `/shop?${queryString}` : "/shop";
  };

  const renderPageButton = (page: number, isActive: boolean = false) => (
    <a
      key={page}
      href={generatePageUrl(page)}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-green-600 text-white"
          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
      }`}
    >
      {page}
    </a>
  );

  const pages = [];
  const showEllipsis = totalPages > 7;

  if (showEllipsis) {
    // Show first page
    pages.push(renderPageButton(1, currentPage === 1));

    // Show ellipsis if current page is far from start
    if (currentPage > 4) {
      pages.push(<span key="ellipsis1" className="px-2 text-gray-500">...</span>);
    }

    // Show pages around current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(renderPageButton(i, currentPage === i));
    }

    // Show ellipsis if current page is far from end
    if (currentPage < totalPages - 3) {
      pages.push(<span key="ellipsis2" className="px-2 text-gray-500">...</span>);
    }

    // Show last page
    if (totalPages > 1) {
      pages.push(renderPageButton(totalPages, currentPage === totalPages));
    }
  } else {
    // Show all pages if not too many
    for (let i = 1; i <= totalPages; i++) {
      pages.push(renderPageButton(i, currentPage === i));
    }
  }

  return (
    <div className="flex items-center gap-1">
      {/* Previous button */}
      {currentPage > 1 && (
        <a
          href={generatePageUrl(currentPage - 1)}
          className="px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
        >
          Previous
        </a>
      )}

      {pages}

      {/* Next button */}
      {currentPage < totalPages && (
        <a
          href={generatePageUrl(currentPage + 1)}
          className="px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
        >
          Next
        </a>
      )}
    </div>
  );
}