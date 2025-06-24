// app/shop/loading.tsx
import { LandingLayout } from "@/components/layout/MainLayout";
import {
  ProductsGridSkeleton,
  SearchAndFiltersSkeleton,
} from "@/components/shop/skeletons/Skeletons";

export default function ShopLoading() {
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

        {/* Main Content - Loading State */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Search and Filters Skeleton */}
          <SearchAndFiltersSkeleton />

          {/* Products Grid Skeleton */}
          <ProductsGridSkeleton count={6} />
        </div>
      </div>
    </LandingLayout>
  );
}
