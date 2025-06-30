// app/(account)/account/memberships/components/ProductAllocations.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Package,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

interface ProductAllocationsProps {
  productUsage: Array<{
    categoryId: string;
    categoryName: string;
    allocatedQuantity: number;
    usedQuantity: number;
    availableQuantity: number;
  }>;
  membership: {
    name: string;
    tier: string;
    deliveryFrequency: string;
  };
}

export function ProductAllocations({
  productUsage,
  membership,
}: ProductAllocationsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const totalAllocated = productUsage.reduce(
    (sum, usage) => sum + usage.allocatedQuantity,
    0
  );
  const totalUsed = productUsage.reduce(
    (sum, usage) => sum + usage.usedQuantity,
    0
  );
  const totalAvailable = productUsage.reduce(
    (sum, usage) => sum + usage.availableQuantity,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Your Product Allocations
          </h2>
          <p className="text-muted-foreground">
            Free products included with your {membership.name} membership
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Badge variant="outline" className="gap-2 py-2">
            <Clock className="w-4 h-4" />
            {membership.deliveryFrequency} delivery
          </Badge>
          <Badge className="gap-2 py-2 bg-emerald-500 hover:bg-emerald-600">
            <Package className="w-4 h-4" />
            {totalAvailable} available
          </Badge>
        </div>
      </div>

      {/* Overall Progress */}
      <Card className="glass-card border-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 text-white rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">This Period's Usage</h3>
                <p className="text-sm text-muted-foreground">
                  {totalUsed} of {totalAllocated} products used
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600">
                {Math.round((totalUsed / totalAllocated) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">utilized</div>
            </div>
          </div>

          <Progress
            value={(totalUsed / totalAllocated) * 100}
            className="h-3 mb-2"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{totalAvailable} products remaining</span>
            <span>Resets {membership.deliveryFrequency}</span>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productUsage.map((usage) => {
          const usagePercentage =
            usage.allocatedQuantity > 0
              ? (usage.usedQuantity / usage.allocatedQuantity) * 100
              : 0;

          const isFullyUsed = usage.availableQuantity === 0;
          const hasProducts = usage.availableQuantity > 0;

          return (
            <Card
              key={usage.categoryId}
              className={`glass-card border-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                selectedCategory === usage.categoryId
                  ? "ring-2 ring-emerald-500"
                  : ""
              }`}
              onClick={() => setSelectedCategory(usage.categoryId)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {usage.categoryName}
                  </CardTitle>
                  {isFullyUsed ? (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Used
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600">
                      {usage.availableQuantity} left
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Usage Stats */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Used</span>
                  <span className="font-medium">
                    {usage.usedQuantity} / {usage.allocatedQuantity}
                  </span>
                </div>

                <Progress
                  value={usagePercentage}
                  className={`h-2 ${isFullyUsed ? "opacity-50" : ""}`}
                />

                {/* Action Button */}
                <div className="pt-2">
                  {hasProducts ? (
                    <Link
                      href={`/shop?category=${usage.categoryId}&membership=true`}
                    >
                      <Button
                        className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
                        size="sm"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Shop Free Products
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      disabled
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Allocation Used
                    </Button>
                  )}
                </div>

                {/* Additional Info */}
                <div className="text-xs text-muted-foreground">
                  {hasProducts
                    ? `${usage.availableQuantity} free product${usage.availableQuantity !== 1 ? "s" : ""} available`
                    : "All products claimed this period"}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="glass-card border-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 text-white rounded-lg">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Browse All Free Products</h3>
                <p className="text-sm text-muted-foreground">
                  Explore your complete selection of membership benefits
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Link href="/shop?membership=true">
                <Button className="gap-2">
                  <Package className="w-4 h-4" />
                  View All Categories
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
