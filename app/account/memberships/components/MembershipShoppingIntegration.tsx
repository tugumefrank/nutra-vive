// app/(account)/account/memberships/components/MembershipShoppingIntegration.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Gift, ShoppingCart, Sparkles, Check, Info } from "lucide-react";
import { useMembership } from "../hooks/useMembership";
import { toast } from "sonner";

interface MembershipShoppingIntegrationProps {
  productId: string;
  categoryId: string;
  regularPrice: number;
  onMembershipPriceChange?: (price: number, isFree: boolean) => void;
}

export function MembershipShoppingIntegration({
  productId,
  categoryId,
  regularPrice,
  onMembershipPriceChange,
}: MembershipShoppingIntegrationProps) {
  const { membership, benefits, checkFreeProductEligibility } = useMembership();
  const [quantity, setQuantity] = useState(1);

  const canGetFree = membership
    ? checkFreeProductEligibility(categoryId, quantity)
    : false;
  const membershipPrice = canGetFree ? 0 : regularPrice;
  const savings = regularPrice - membershipPrice;

  useEffect(() => {
    if (onMembershipPriceChange) {
      onMembershipPriceChange(membershipPrice, canGetFree);
    }
  }, [membershipPrice, canGetFree, onMembershipPriceChange]);

  if (!membership || !benefits) {
    return null;
  }

  const categoryUsage = membership.productUsage.find(
    (usage) => usage.categoryId === categoryId
  );

  return (
    <div className="space-y-4">
      {/* Membership Status Card */}
      <Card className="glass-card border-0 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 text-white rounded-lg">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold capitalize">
                    {membership.membership.name}
                  </span>
                  <Badge className="capitalize bg-emerald-500 hover:bg-emerald-600">
                    {membership.membership.tier}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {benefits.availableProducts} free products remaining
                </p>
              </div>
            </div>

            {canGetFree && (
              <Badge className="gap-1 bg-emerald-500 hover:bg-emerald-600">
                <Gift className="w-3 h-3" />
                FREE
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Allocation Status */}
      {categoryUsage && (
        <Card className="glass-card border-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {categoryUsage.categoryName} Allocation
              </span>
              <span className="text-sm text-muted-foreground">
                {categoryUsage.usedQuantity} / {categoryUsage.allocatedQuantity}{" "}
                used
              </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((categoryUsage.usedQuantity / categoryUsage.allocatedQuantity) * 100, 100)}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{categoryUsage.availableQuantity} remaining</span>
              <span>Resets {membership.membership.deliveryFrequency}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Information */}
      <Card className="glass-card border-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Regular Price</span>
              <span
                className={`text-sm ${canGetFree ? "line-through text-muted-foreground" : "font-semibold"}`}
              >
                ${regularPrice.toFixed(2)}
              </span>
            </div>

            {canGetFree && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-600">
                    Membership Price
                  </span>
                  <span className="text-lg font-bold text-emerald-600">
                    FREE
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-600">
                    Your Savings
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    ${savings.toFixed(2)}
                  </span>
                </div>
              </>
            )}

            {!canGetFree &&
              categoryUsage &&
              categoryUsage.availableQuantity === 0 && (
                <div className="flex items-center gap-2 p-2 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg">
                  <Info className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-amber-700 dark:text-amber-300">
                    You've used all free products for this category this period
                  </span>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Membership Benefits Reminder */}
      {canGetFree && (
        <Card className="glass-card border-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500 text-white rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold mb-1">
                  Membership Benefit
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  This product is included in your {membership.membership.name}{" "}
                  membership benefits.
                </p>
                <div className="flex flex-wrap gap-1">
                  {membership.membership.freeDelivery && (
                    <Badge variant="outline" className="text-xs">
                      Free Delivery
                    </Badge>
                  )}
                  {membership.membership.prioritySupport && (
                    <Badge variant="outline" className="text-xs">
                      Priority Support
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
