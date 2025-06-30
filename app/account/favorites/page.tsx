import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import {
  Heart,
  Filter,
  Search,
  Trash2,
  ShoppingCart,
  Share2,
  Grid3X3,
  List,
  Star,
  ArrowRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

// Import server actions
import {
  getUserFavorites,
  getFavoriteStats,
} from "@/lib/actions/favouriteServerActions";
import { FavoriteCard, FavoriteStats } from "./components/FavoritesComponents";
import { EmptyState } from "../components/Consultationscomponents";

// Component imports

async function FavoritesData() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [favoritesResult, favoriteStats] = await Promise.all([
    getUserFavorites(),
    getFavoriteStats(),
  ]);

  const products = favoritesResult?.products || [];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Favorites
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {products.length} saved item{products.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share List
          </Button>

          {products.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}

          <Button
            asChild
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            <Link href="/shop">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <FavoriteStats stats={favoriteStats} />

      {/* Filters & Search */}
      <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search your favorites..."
                  className="pl-10 bg-white/50 dark:bg-gray-700/50"
                />
              </div>
            </div>

            <Select>
              <SelectTrigger className="w-full md:w-40 bg-white/50 dark:bg-gray-700/50">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="juices">Juices</SelectItem>
                <SelectItem value="teas">Teas</SelectItem>
                <SelectItem value="smoothies">Smoothies</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-full md:w-40 bg-white/50 dark:bg-gray-700/50">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Recently Added</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Grid View
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <List className="w-4 h-4 mr-2" />
                  List View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Favorites Grid */}
      {products.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          description="Start adding products to your favorites to see them here. Browse our collection and click the heart icon on products you love."
          actionLabel="Browse Products"
          actionHref="/shop"
          icon="❤️"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => {
              // Transform category to expected shape if needed
              const mappedProduct = {
                ...product,
                category:
                  typeof product.category === "string"
                    ? {
                        name: product.category,
                        slug: product.category
                          .toLowerCase()
                          .replace(/\s+/g, "-"),
                      }
                    : product.category,
              };
              return (
                <div key={product._id}>
                  <FavoriteCard product={mappedProduct} />
                </div>
              );
            })}
          </div>

          {/* Load More */}
          {products.length >= 12 && (
            <div className="flex justify-center pt-6">
              <Button variant="outline">Load More Favorites</Button>
            </div>
          )}
        </>
      )}

      {/* Recommendations */}
      {products.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/50 dark:border-purple-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  You Might Also Like
                </h3>
                <p className="text-purple-700 dark:text-purple-300 text-sm">
                  Based on your favorites, here are some similar products
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                <Link href="/shop?recommended=true">
                  View All
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Placeholder recommendation cards */}
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3"
                >
                  <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-md mb-2"></div>
                  <h4 className="font-medium text-xs mb-1">
                    Green Detox Juice
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">$8.99</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">4.5</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-blue-200/50 dark:border-blue-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                💡 Tips for Your Favorites
              </h3>
              <div className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                <p>
                  • Add products to favorites while browsing to save them for
                  later
                </p>
                <p>• Create custom collections by organizing your favorites</p>
                <p>• Share your favorite lists with friends and family</p>
                <p>• Get notified when your favorite items go on sale</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FavoritesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      {/* Filters Skeleton */}
      <Skeleton className="h-16 rounded-lg" />

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <Suspense fallback={<FavoritesSkeleton />}>
      <FavoritesData />
    </Suspense>
  );
}
