"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Star,
  Eye,
  Trash2,
  Plus,
  Minus,
  TrendingUp,
  Package,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// FavoriteCard Component
interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  averageRating: number;
  reviewCount: number;
  category?: {
    name: string;
    slug: string;
  };
  isActive: boolean;
}

interface FavoriteCardProps {
  product: Product;
}

export function FavoriteCard({ product }: FavoriteCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleRemoveFromFavorites = async () => {
    setIsRemoving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Remove from favorites logic would go here
      console.log("Removed from favorites:", product._id);
    } catch (error) {
      console.error("Failed to remove from favorites");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      // Add to cart logic would go here
      console.log("Added to cart:", product._id, "quantity:", quantity);
    } catch (error) {
      console.error("Failed to add to cart");
    }
  };

  const discountPercentage = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) *
          100
      )
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 1, scale: 1 }}
      animate={{
        opacity: isRemoving ? 0 : 1,
        scale: isRemoving ? 0.9 : 1,
      }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="relative">
          {/* Product Image */}
          <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
            )}

            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-500">
                -{discountPercentage}%
              </Badge>
            )}

            {/* Favorite Button */}
            <Button
              onClick={handleRemoveFromFavorites}
              disabled={isRemoving}
              size="sm"
              className="absolute top-2 right-2 w-8 h-8 p-0 bg-white/90 hover:bg-white text-red-500 hover:text-red-600 shadow-lg"
            >
              <Heart
                className={`w-4 h-4 ${isRemoving ? "animate-pulse" : "fill-current"}`}
              />
            </Button>

            {/* Quick View */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Button asChild size="sm" variant="secondary">
                <Link href={`/shop/products/${product.slug}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  Quick View
                </Link>
              </Button>
            </div>
          </div>

          <CardContent className="p-4">
            {/* Category */}
            {product.category && (
              <Badge variant="outline" className="text-xs mb-2">
                {product.category.name}
              </Badge>
            )}

            {/* Product Name */}
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
              <Link
                href={`/shop/products/${product.slug}`}
                className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                {product.name}
              </Link>
            </h3>

            {/* Rating */}
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex items-center space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {product.averageRating.toFixed(1)} ({product.reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Add to Cart */}
            <div className="space-y-3">
              {/* Quantity Selector */}
              <div className="flex items-center justify-center space-x-3">
                <Button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  size="sm"
                  variant="outline"
                  className="w-8 h-8 p-0"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="font-medium text-sm w-8 text-center">
                  {quantity}
                </span>
                <Button
                  onClick={() => setQuantity(quantity + 1)}
                  size="sm"
                  variant="outline"
                  className="w-8 h-8 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}

// FavoriteStats Component
interface FavoriteStatsData {
  total: number;
  byCategory: Record<string, number>;
  recent: number;
}

interface FavoriteStatsProps {
  stats: FavoriteStatsData;
}

export function FavoriteStats({ stats }: FavoriteStatsProps) {
  const topCategories = Object.entries(stats.byCategory || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const statCards = [
    {
      title: "Total Favorites",
      value: stats.total,
      icon: Heart,
      color: "from-red-500 to-pink-500",
      change: `${stats.total} saved items`,
    },
    {
      title: "Recent Additions",
      value: stats.recent,
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
      change: "This week",
    },
    {
      title: "Top Category",
      value: topCategories[0]?.[1] || 0,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      change: topCategories[0]?.[0] || "None",
    },
    {
      title: "Categories",
      value: Object.keys(stats.byCategory || {}).length,
      icon: Package,
      color: "from-purple-500 to-violet-500",
      change: "Different types",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -2 }}
        >
          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {stat.title}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stat.change}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// Category Breakdown Component
export function CategoryBreakdown({ stats }: FavoriteStatsProps) {
  if (!stats.byCategory || Object.keys(stats.byCategory).length === 0) {
    return null;
  }

  const categories = Object.entries(stats.byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const total = Object.values(stats.byCategory).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
      <CardContent className="p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Favorites by Category
        </h3>

        <div className="space-y-3">
          {categories.map(([category, count]) => {
            const percentage = Math.round((count / total) * 100);

            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {category}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {count} items ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
