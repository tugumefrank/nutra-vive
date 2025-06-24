// components/shop/ProductsGrid.tsx
import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { getProducts } from "@/lib/actions/productServerActions";
import { ProductCard } from "./ProductCard";

import { LoadMoreButton } from "./LoadMoreButton";

// Cache the product fetching function
const getCachedProducts = cache(async (filters: any) => {
  try {
    const result = await getProducts({
      category: filters.category !== "All" ? filters.category : undefined,
      search: filters.search || undefined,
      isActive: true,
      sortBy: filters.sortBy as "name" | "price" | "createdAt" | "updatedAt",
      sortOrder:
        filters.sortBy === "price" ? "asc" : ("desc" as "asc" | "desc"),
      page: filters.page || 1,
      limit: 12,
    });

    return {
      products: result.products.map((p: any) => ({
        _id: p._id,
        name: p.name,
        slug: p.slug,
        price: typeof p.price === "number" ? p.price : parseFloat(p.price),
        compareAtPrice: p.compareAtPrice
          ? typeof p.compareAtPrice === "number"
            ? p.compareAtPrice
            : parseFloat(p.compareAtPrice)
          : undefined,
        category:
          p.category && typeof p.category === "object"
            ? { _id: p.category._id, name: p.category.name }
            : p.category
              ? { _id: p.category, name: "" }
              : null,
        images: p.images || [],
        description: p.description,
        shortDescription: p.shortDescription,
        averageRating: p.averageRating ?? 0,
        reviewCount: p.reviewCount ?? 0,
        features: p.features || [],
        isActive: p.isActive ?? true,
        isFeatured: p.isFeatured ?? false,
      })),
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      total: result.total,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to load products");
  }
});

interface ProductsGridProps {
  search: string;
  category: string;
  sortBy: string;
  page: number;
}

export async function ProductsGrid({
  search,
  category,
  sortBy,
  page,
}: ProductsGridProps) {
  // For dynamic content that changes frequently, use noStore
  // Remove this if you want to cache products
  noStore();

  const { products, totalPages, currentPage, total } = await getCachedProducts({
    search,
    category,
    sortBy,
    page,
  });

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          No products found
        </h3>
        <p className="text-gray-600">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            showCategory={true}
            showFeatures={true}
            maxFeatures={2}
          />
        ))}
      </div>

      {/* Load More Button */}
      {currentPage < totalPages && (
        <LoadMoreButton
          currentPage={currentPage}
          totalPages={totalPages}
          search={search}
          category={category}
          sortBy={sortBy}
        />
      )}

      {/* Results Info */}
      <div className="mt-8 text-center text-gray-600">
        <p>
          Showing {products.length} of {total} products
          {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
        </p>
      </div>
    </>
  );
}
