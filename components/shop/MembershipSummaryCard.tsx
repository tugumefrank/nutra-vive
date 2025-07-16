"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Info, 
  Crown, 
  Sparkles, 
  TrendingUp, 
  Star, 
  Gift,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MembershipSummaryCardProps {
  membershipSummary: {
    tier: string;
    totalAllocations: Array<{
      categoryId: string;
      categoryName: string;
      totalAllocation: number;
      usedAllocation: number;
      remainingAllocation: number;
    }>;
    totalMonthlySavings: number;
  };
  eligibleProducts: any[];
  totalPotentialSavings: number;
}

export function MembershipSummaryCard({
  membershipSummary,
  eligibleProducts,
  totalPotentialSavings,
}: MembershipSummaryCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-lg">
      {/* Close Button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-10"
        aria-label="Close membership summary"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-amber-800 capitalize">
              {membershipSummary.tier} Member Benefits
            </h3>
            <p className="text-amber-600 text-sm md:text-base">
              Unlock exclusive savings on our wellness collection
            </p>
          </div>
        </div>
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
            {membershipSummary.totalAllocations.length}
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
          {membershipSummary.totalAllocations.map((allocation) => (
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
                {allocation.usedAllocation} of {allocation.totalAllocation} used
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
            <span className="font-semibold">Pro Tip:</span> Look for the golden{" "}
            <Crown className="w-4 h-4 inline mx-1" />
            FREE badges on products to maximize your membership benefits!
          </div>
        </div>
      </div>
    </div>
  );
}