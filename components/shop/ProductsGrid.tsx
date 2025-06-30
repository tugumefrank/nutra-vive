"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Sparkles,
  TrendingUp,
  Info,
  Loader2,
  Star,
  Gift,
  Zap,
  Award,
} from "lucide-react";
import { EnhancedProductCard } from "./ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getProductsWithMembership,
  ProductWithMembership,
  ProductListResponse,
} from "@/lib/actions/membershipProductServerActions";
import { cn } from "@/lib/utils";

interface EnhancedProductsGridProps {
  search?: string;
  category?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
  className?: string;
}

export function EnhancedProductsGrid({
  search = "",
  category = "All",
  sortBy = "name",
  page = 1,
  limit = 12,
  className = "",
}: EnhancedProductsGridProps) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductWithMembership[]>([]);
  const [productResponse, setProductResponse] =
    useState<ProductListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMembershipSummary, setShowMembershipSummary] = useState(true);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Loading products with membership context...");

      const params: {
        search?: string;
        category?: string;
        sortBy?: string;
        page?: number;
        limit?: number;
        isActive?: boolean;
      } = {
        sortBy,
        page,
        limit,
        isActive: true,
      };

      if (search) {
        params.search = search;
      }

      if (category && category !== "All") {
        params.category = category;
      }

      const response = await getProductsWithMembership(params);

      setProductResponse(response);
      setProducts(response.products);

      console.log("Products loaded:", response.products.length);
      console.log("Membership summary:", response.membershipSummary);
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, category, sortBy, page, limit]);

  // Load products with membership context
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Calculate membership stats
  const membershipStats = productResponse?.membershipSummary;
  const eligibleProducts = products.filter(
    (p) => p.membershipInfo?.isEligibleForFree
  );
  const totalPotentialSavings = eligibleProducts.reduce(
    (sum, product) => sum + (product.membershipInfo?.savings || 0),
    0
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Skeleton */}
        <div className="animate-pulse space-y-4">
          {/* Membership Summary Skeleton */}
          <div className="bg-white/60 rounded-2xl p-6 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/60 rounded-3xl overflow-hidden animate-pulse"
              >
                <div className="h-60 bg-gray-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loading Message */}
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600 mb-4" />
          <p className="text-gray-600 font-medium">
            Loading your personalized products...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-red-700">
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={loadProducts}
            className="ml-4"
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Membership Summary Card */}
      {membershipStats && showMembershipSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-amber-800 capitalize">
                  {membershipStats.tier} Member Benefits
                </h3>
                <p className="text-amber-600 text-sm md:text-base">
                  Unlock exclusive savings on our wellness collection
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMembershipSummary(false)}
              className="text-amber-700 hover:bg-amber-100"
            >
              ×
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white/80 rounded-xl p-4 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-amber-800">
                  Available Now
                </span>
              </div>
              <div className="text-2xl font-bold text-amber-900">
                {eligibleProducts.length}
              </div>
              <div className="text-sm text-amber-600">
                FREE products you can claim
              </div>
            </div>

            <div className="bg-white/80 rounded-xl p-4 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-amber-800">
                  Potential Savings
                </span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                ${totalPotentialSavings.toFixed(2)}
              </div>
              <div className="text-sm text-amber-600">
                On items in this view
              </div>
            </div>

            <div className="bg-white/80 rounded-xl p-4 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-amber-800">
                  Total Categories
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {membershipStats.totalAllocations.length}
              </div>
              <div className="text-sm text-amber-600">
                With active allocations
              </div>
            </div>
          </div>

          {/* Allocation Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="font-semibold text-amber-800 text-sm md:text-base">
                Your Monthly Allocations
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {membershipStats.totalAllocations.map((allocation) => (
                <div
                  key={allocation.categoryId}
                  className="bg-white/60 rounded-xl p-3 border border-amber-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800 text-sm">
                      {allocation.categoryName}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        allocation.remainingAllocation > 0
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-50 text-gray-500 border-gray-200"
                      )}
                    >
                      {allocation.remainingAllocation} left
                    </Badge>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        allocation.remainingAllocation > 0
                          ? "bg-gradient-to-r from-amber-400 to-orange-400"
                          : "bg-gray-400"
                      )}
                      style={{
                        width: `${Math.min(100, (allocation.usedAllocation / allocation.totalAllocation) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="text-xs text-gray-600">
                    {allocation.usedAllocation} of {allocation.totalAllocation}{" "}
                    used
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Helpful Tips */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <span className="font-semibold">Pro Tip:</span> Look for the
                golden
                <Crown className="w-4 h-4 inline mx-1" />
                FREE badges on products to maximize your membership benefits!
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No products found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search or filter criteria
          </p>
          {membershipStats && (
            <p className="text-amber-600 text-sm">
              Don&apos;t worry - your {membershipStats.tier} membership benefits are
              still waiting for you!
            </p>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <EnhancedProductCard
                  product={product}
                  showMembershipBenefits={true}
                  className="h-full"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Pagination Info */}
      {productResponse && productResponse.total > 0 && (
        <div className="text-center text-sm text-gray-600 pt-4">
          Showing {products.length} of {productResponse.total} products
          {membershipStats && eligibleProducts.length > 0 && (
            <span className="text-amber-600 font-medium ml-2">
              • {eligibleProducts.length} FREE with membership
            </span>
          )}
        </div>
      )}

      {/* Membership Upsell for Non-Members */}
      {!membershipStats && products.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-blue-800 mb-2">
            Unlock Member-Only Benefits
          </h3>
          <p className="text-blue-600 mb-4 max-w-md mx-auto">
            Join our membership program and get FREE products every month, plus
            exclusive discounts on your favorite wellness items.
          </p>
          <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
            <Crown className="w-4 h-4 mr-2" />
            Explore Memberships
          </Button>
        </motion.div>
      )}
    </div>
  );
}
