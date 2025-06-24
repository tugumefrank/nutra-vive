import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Tag,
  Percent,
  Calendar,
  Clock,
  Gift,
  TrendingUp,
  Plus,
  Search,
  Filter,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

// Import server actions
import { getAvailablePromotions } from "@/lib/actions/promotionValidationServerAction";
import { getUserFavorites } from "@/lib/actions/favouriteServerActions";
import {
  PromotionCard,
  PromotionStats,
  EmptyState,
  PromotionCodeInput,
  ActivePromotions,
} from "./components/PromotionsComponents";

// ✅ SERIALIZATION HELPER FUNCTION
function serializePromotions(promotions: any[]) {
  return promotions.map((promotion) => ({
    _id: promotion._id?.toString() || promotion._id,
    name: promotion.name || "",
    description: promotion.description || "",
    type: promotion.type || "custom",
    discountType: promotion.discountType || "percentage",
    discountValue: promotion.discountValue || 0,

    // Serialize codes
    codes:
      promotion.codes?.map((code: any) => ({
        code: code.code || "",
        isPublic: code.isPublic || false,
        usageLimit: code.usageLimit || null,
        usedCount: code.usedCount || 0,
        isActive: code.isActive || false,
        createdAt: code.createdAt?.toString() || "",
      })) || [],

    // Applicability scope
    applicabilityScope: promotion.applicabilityScope || "entire_store",

    // Usage limits
    usageLimit: promotion.usageLimit || null,
    usageLimitPerCustomer: promotion.usageLimitPerCustomer || null,
    usedCount: promotion.usedCount || 0,

    // Requirements
    minimumPurchaseAmount: promotion.minimumPurchaseAmount || null,
    minimumQuantity: promotion.minimumQuantity || null,

    // Timing
    startsAt: promotion.startsAt?.toString() || null,
    endsAt: promotion.endsAt?.toString() || null,
    isActive: promotion.isActive || false,
    isScheduled: promotion.isScheduled || false,

    // Analytics
    totalRedemptions: promotion.totalRedemptions || 0,
    totalRevenue: promotion.totalRevenue || 0,
    averageOrderValue: promotion.averageOrderValue || 0,

    // Metadata
    tags: promotion.tags || [],

    // Serialize dates as strings
    createdAt: promotion.createdAt?.toString() || "",
    updatedAt: promotion.updatedAt?.toString() || "",
  }));
}

async function PromotionsData() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [promotionsResult] = await Promise.all([getAvailablePromotions()]);

  // ✅ SERIALIZE DATA BEFORE PASSING TO CLIENT COMPONENTS
  const promotions = serializePromotions(promotionsResult.promotions || []);

  // Calculate stats using serialized data
  const totalPromotions = promotions.length;
  const activePromotions = promotions.filter((p) => p.isActive).length;
  const expiringSoon = promotions.filter((p) => {
    if (!p.endsAt) return false;
    const endDate = new Date(p.endsAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Promotions & Offers
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover exclusive deals and manage your promotional codes
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            asChild
            variant="outline"
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
          >
            <Link href="/shop">
              <Gift className="w-4 h-4 mr-2" />
              Shop Now
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <PromotionStats
        total={totalPromotions}
        active={activePromotions}
        expiringSoon={expiringSoon}
      />

      {/* Promotion Code Input */}
      <PromotionCodeInput />

      {/* Active Promotions in Cart */}
      <ActivePromotions />

      {/* Filters */}
      <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search promotions..."
                  className="pl-10 bg-white/50 dark:bg-gray-700/50"
                />
              </div>
            </div>

            <Select>
              <SelectTrigger className="w-full md:w-40 bg-white/50 dark:bg-gray-700/50">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="flash_sale">Flash Sale</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-full md:w-40 bg-white/50 dark:bg-gray-700/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Promotions List */}
      {promotions.length === 0 ? (
        <EmptyState
          title="No promotions available"
          description="Check back soon for exclusive deals and promotional offers"
          actionLabel="Browse Products"
          actionHref="/shop"
          icon="🎁"
        />
      ) : (
        <div className="space-y-4">
          {promotions.map((promotion, index) => (
            <div key={promotion._id}>
              <PromotionCard promotion={promotion} />
            </div>
          ))}
        </div>
      )}

      {/* Savings Tip */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/50 dark:border-purple-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                💡 Pro Tip: Maximize Your Savings
              </h3>
              <p className="text-purple-700 dark:text-purple-300 text-sm">
                Stack promotions with bulk orders and seasonal sales for maximum
                discounts. Follow us on social media for exclusive flash deals!
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="border-purple-300 text-purple-700 hover:bg-purple-100"
                asChild
              >
                <Link href="/favorites">
                  <Tag className="w-4 h-4 mr-2" />
                  View Wishlist
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PromotionsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      {/* Code Input Skeleton */}
      <Skeleton className="h-16 rounded-lg" />

      {/* Active Promotions Skeleton */}
      <Skeleton className="h-20 rounded-lg" />

      {/* Filters Skeleton */}
      <Skeleton className="h-16 rounded-lg" />

      {/* List Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function PromotionsPage() {
  return (
    <Suspense fallback={<PromotionsSkeleton />}>
      <PromotionsData />
    </Suspense>
  );
}
