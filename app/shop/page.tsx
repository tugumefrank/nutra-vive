import { Suspense } from "react";
import { Metadata } from "next";
import { LandingLayout } from "@/components/layout/MainLayout";

import {
  ProductsGridSkeleton,
  SearchAndFiltersSkeleton,
} from "@/components/shop/skeletons/Skeletons";

import { EnhancedProductsGrid } from "@/components/shop/ProductsGrid";
import { SearchAndFilters } from "@/components/shop/SearchAndFilters";
import { getCategories } from "@/lib/actions/productServerActions";

export const metadata: Metadata = {
  title: "Shop - Nutra-Vive Wellness Collection",
  description:
    "Discover our handcrafted selection of organic juices and herbal teas, designed to nourish your body and uplift your spirit.",
  keywords: ["organic juice", "herbal tea", "wellness", "health", "nutrition"],
  openGraph: {
    title: "Shop - Nutra-Vive Wellness Collection",
    description:
      "Discover our handcrafted selection of organic juices and herbal teas",
    images: ["/og-shop.jpg"],
  },
};

// Cache categories for 1 hour
async function getCategoriesWithCache() {
  try {
    const categories = await getCategories();
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await searchParams in Next.js 15+
  const resolvedSearchParams = await searchParams;

  // Parse search params for SSR
  const search =
    typeof resolvedSearchParams.search === "string"
      ? resolvedSearchParams.search
      : "";
  const category =
    typeof resolvedSearchParams.category === "string"
      ? resolvedSearchParams.category
      : "All";
  const sortBy =
    typeof resolvedSearchParams.sortBy === "string"
      ? resolvedSearchParams.sortBy
      : "name";
  const page =
    typeof resolvedSearchParams.page === "string"
      ? parseInt(resolvedSearchParams.page)
      : 1;

  return (
    <LandingLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
        {/* Page Header */}
        <div className="relative bg-gradient-to-br from-orange-50/90 via-amber-50/90 to-orange-100/90 backdrop-blur-md border-b border-orange-200/50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 py-16 mt-4">
            <div className="text-center">
              <h1 className="text-3xl md:text-6xl font-bold text-gray-800 mb-3 mt-8">
                Nutra-Vive Wellness
                <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Collection
                </span>
              </h1>
              <p className="text-md text-gray-600 max-w-2xl mx-auto">
                Discover our handcrafted selection of organic juices and herbal
                teas, designed to nourish your body and uplift your spirit.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Search and Filters with Suspense */}
          <Suspense fallback={<SearchAndFiltersSkeleton />}>
            <SearchAndFiltersServer
              initialSearch={search}
              initialCategory={category}
              initialSortBy={sortBy}
            />
          </Suspense>

          {/* Products Grid with Suspense */}
          <Suspense fallback={<ProductsGridSkeleton count={6} />}>
            <EnhancedProductsGrid
              search={search}
              category={category}
              sortBy={sortBy}
              page={page}
            />
          </Suspense>
        </div>
      </div>
    </LandingLayout>
  );
}

// Server component for search and filters
async function SearchAndFiltersServer({
  initialSearch,
  initialCategory,
  initialSortBy,
}: {
  initialSearch: string;
  initialCategory: string;
  initialSortBy: string;
}) {
  const categories = await getCategoriesWithCache();

  return (
    <SearchAndFilters
      categories={categories}
      initialSearch={initialSearch}
      initialCategory={initialCategory}
      initialSortBy={initialSortBy}
    />
  );
}
