import React from "react";

// components/shop/skeletons/SearchAndFiltersSkeleton.tsx
export function SearchAndFiltersSkeleton() {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 mb-8 border border-orange-200/50">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Skeleton */}
        <div className="relative flex-1">
          <div className="w-full h-12 bg-gray-200 rounded-2xl animate-pulse" />
        </div>

        {/* Category Filter Skeleton */}
        <div className="w-full lg:w-48">
          <div className="h-12 bg-gray-200 rounded-2xl animate-pulse" />
        </div>

        {/* Sort Skeleton */}
        <div className="w-full lg:w-48">
          <div className="h-12 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// components/shop/skeletons/ProductsGridSkeleton.tsx
interface ProductsGridSkeletonProps {
  count?: number;
}

export function ProductsGridSkeleton({ count = 6 }: ProductsGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

// components/shop/skeletons/ProductCardSkeleton.tsx
export function ProductCardSkeleton() {
  return (
    <div className="group bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border border-orange-200/50 shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
      {/* Image Skeleton */}
      <div className="relative aspect-square overflow-hidden bg-gray-200 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />

        {/* Badge Skeleton */}
        <div className="absolute top-4 left-4 w-16 h-6 bg-gray-300 rounded-full animate-pulse" />

        {/* Heart Icon Skeleton */}
        <div className="absolute top-4 right-4 w-10 h-10 bg-gray-300 rounded-full animate-pulse" />
      </div>

      {/* Content Skeleton */}
      <div className="p-6 space-y-3">
        {/* Category Skeleton */}
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />

        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="w-3/4 h-5 bg-gray-200 rounded animate-pulse" />
          <div className="w-1/2 h-5 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Description Skeleton */}
        <div className="space-y-2">
          <div className="w-full h-3 bg-gray-200 rounded animate-pulse" />
          <div className="w-5/6 h-3 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Features Skeleton */}
        <div className="flex flex-wrap gap-2 mt-3">
          <div className="w-16 h-5 bg-gray-200 rounded-full animate-pulse" />
          <div className="w-20 h-5 bg-gray-200 rounded-full animate-pulse" />
        </div>

        {/* Rating Skeleton */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 bg-gray-200 rounded animate-pulse"
              />
            ))}
          </div>
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Price Skeleton */}
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-1">
            <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
            <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Button Skeleton */}
        <div className="w-full h-11 bg-gray-200 rounded-xl animate-pulse mt-4" />
      </div>
    </div>
  );
}

// components/shop/skeletons/SkeletonUtils.tsx
/**
 * Utility function to generate skeleton components with matching dimensions
 */
export function generateSkeleton({
  width,
  height,
  className = "",
  rounded = "rounded",
  animated = true,
}: {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: string;
  animated?: boolean;
}) {
  const baseClasses = "bg-gray-200";
  const animationClass = animated ? "animate-pulse" : "";
  const widthClass =
    typeof width === "string" ? width : width ? `w-[${width}px]` : "";
  const heightClass =
    typeof height === "string" ? height : height ? `h-[${height}px]` : "";

  return (
    <div
      className={`${baseClasses} ${animationClass} ${rounded} ${widthClass} ${heightClass} ${className}`}
    />
  );
}

/**
 * Create skeleton grids with specified dimensions
 */
export function createSkeletonGrid({
  count,
  columns = {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 3,
  },
  gap = "gap-8",
  children,
}: {
  count: number;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
  children: (index: number) => React.ReactNode;
}) {
  const gridCols = `grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg} xl:grid-cols-${columns.xl}`;

  return (
    <div className={`grid ${gridCols} ${gap}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{children(index)}</div>
      ))}
    </div>
  );
}

/**
 * Text skeleton with realistic lengths
 */
export function TextSkeleton({
  lines = 1,
  lengths = ["w-full"],
  className = "",
}: {
  lines?: number;
  lengths?: string[];
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => {
        const length = lengths[index % lengths.length];
        return (
          <div
            key={index}
            className={`h-4 bg-gray-200 rounded animate-pulse ${length}`}
          />
        );
      })}
    </div>
  );
}

/**
 * Simulate loading states with realistic timing
 */
export function useSkeletonTimer(minLoadTime = 800, maxLoadTime = 2000) {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(
      () => {
        setIsLoading(false);
      },
      Math.random() * (maxLoadTime - minLoadTime) + minLoadTime
    );

    return () => clearTimeout(timer);
  }, [minLoadTime, maxLoadTime]);

  return isLoading;
}
