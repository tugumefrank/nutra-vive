"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Heart,
  Search,
  Grid3X3,
  List,
  Trash2,
  ShoppingCart,
  SortAsc,
  SortDesc,
  X,
  Sparkles,
  Package,
  ArrowLeft,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  getUserFavorites,
  clearAllFavorites,
  getFavoriteStats,
} from "@/lib/actions/favouriteServerActions";
import { Product, ProductCard } from "../shop/ProductCard";
import { useStandaloneFavorites } from "@/hooks/useFavourite";

interface FavoriteStats {
  total: number;
  byCategory: Record<string, number>;
  recent: number;
}

export default function FavoritesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { favoriteIds } = useStandaloneFavorites();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<FavoriteStats>({
    total: 0,
    byCategory: {},
    recent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "recent">("recent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearingFavorites, setClearingFavorites] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      toast.info("Please sign in to view your favorites");
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  // Load favorites
  const loadFavorites = async () => {
    try {
      setLoading(true);
      const [favoritesResult, statsResult] = await Promise.all([
        getUserFavorites(),
        getFavoriteStats(),
      ]);

      setProducts(
        favoritesResult.products.map((p: any) => ({
          ...p,
          category:
            typeof p.category === "string"
              ? { _id: "", name: p.category }
              : p.category
                ? p.category
                : null,
        }))
      );
      setStats(statsResult);
    } catch (error) {
      console.error("Error loading favorites:", error);
      toast.error("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [favoriteIds]);
  // Get unique categories
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    products.forEach((product) => {
      if (product.category?.name) {
        categorySet.add(product.category.name);
      }
    });
    return Array.from(categorySet).sort();
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          product.features.some((feature) =>
            feature.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category?.name === selectedCategory
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "recent":
        default:
          // Since we don't have favorite date in product, we'll sort by product creation
          comparison =
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy, sortOrder]);

  // Handle clear all favorites
  const handleClearAllFavorites = async () => {
    try {
      setClearingFavorites(true);
      const result = await clearAllFavorites();

      if (result.success) {
        setProducts([]);
        setStats({ total: 0, byCategory: {}, recent: 0 });
        toast.success(`Cleared ${result.cleared} favorites`);
      } else {
        toast.error(result.error || "Failed to clear favorites");
      }
    } catch (error) {
      toast.error("Failed to clear favorites");
    } finally {
      setClearingFavorites(false);
      setShowClearDialog(false);
    }
  };

  // Loading state
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 shadow-lg">
                  <div className="h-48 bg-gray-200 rounded-2xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-green-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                My Favorites
              </h1>
              <p className="text-gray-600 mt-1">
                {stats.total} product{stats.total !== 1 ? "s" : ""} you love
              </p>
            </div>
          </div>

          {/* Stats */}
          {stats.total > 0 && (
            <div className="flex flex-wrap gap-4 mb-6">
              <Badge
                variant="secondary"
                className="flex items-center gap-2 px-4 py-2"
              >
                <Sparkles className="w-4 h-4" />
                {stats.recent} added this week
              </Badge>
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <Badge key={category} variant="outline" className="px-3 py-1">
                  {category}: {count}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Empty State */}
        {products.length === 0 && !loading ? (
          <div className="text-center py-16">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <Heart className="w-16 h-16 text-gray-400" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No favorites yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start exploring our products and add them to your favorites by
              clicking the heart icon.
            </p>
            <Button
              onClick={() => router.push("/shop")}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Shop Now
            </Button>
          </div>
        ) : (
          <>
            {/* Filters and Controls */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-orange-200 mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search favorites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-xl"
                  />
                </div>

                {/* Category Filter */}
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="rounded-xl border-gray-300">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort */}
                <div className="flex gap-2">
                  <Select
                    value={sortBy}
                    onValueChange={(value: any) => setSortBy(value)}
                  >
                    <SelectTrigger className="rounded-xl border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Recently Added</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    className="rounded-xl border-gray-300"
                  >
                    {sortOrder === "asc" ? (
                      <SortAsc className="w-4 h-4" />
                    ) : (
                      <SortDesc className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* View Mode and Clear */}
                <div className="flex gap-2 justify-end">
                  <div className="flex bg-gray-100 rounded-xl p-1">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-lg"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-lg"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>

                  {products.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setShowClearDialog(true)}
                      className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>
              </div>

              {/* Active Filters */}
              {(searchQuery || selectedCategory !== "all") && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {searchQuery && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      Search: "{searchQuery}"
                      <button
                        onClick={() => setSearchQuery("")}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedCategory !== "all" && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      Category: {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory("all")}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Results */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredAndSortedProducts.length} of {products.length}{" "}
                favorites
              </p>
            </div>

            {/* Products Grid */}
            {filteredAndSortedProducts.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }
              >
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    variant={viewMode === "grid" ? "default" : "list"}
                    showCategory={true}
                    showFeatures={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No favorites found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filters
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="rounded-xl"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}

        {/* Clear All Dialog */}
        <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                Clear All Favorites
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to remove all {products.length} products
                from your favorites? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowClearDialog(false)}
                disabled={clearingFavorites}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearAllFavorites}
                disabled={clearingFavorites}
                className="rounded-xl"
              >
                {clearingFavorites ? "Clearing..." : "Clear All"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
