// components/cart/MembershipCartSummary.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Crown, Gift, Sparkles, TrendingDown, ShoppingBag } from "lucide-react";
import { getMembershipCartSummary } from "@/lib/actions/membershipCartServerActions";

interface CartSummary {
  regularTotal: number;
  membershipTotal: number;
  totalSavings: number;
  freeItems: number;
  paidItems: number;
  membershipTier?: string;
}

export function MembershipCartSummary() {
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const result = await getMembershipCartSummary();
        if (result.success && result.summary) {
          setSummary(result.summary);
        }
      } catch (error) {
        console.error("Error fetching cart summary:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  if (loading || !summary || !summary.membershipTier) {
    return null;
  }

  const hasMembershipBenefits =
    summary.freeItems > 0 || summary.totalSavings > 0;

  if (!hasMembershipBenefits) {
    return null;
  }

  return (
    <Card className="glass-card border-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Crown className="w-5 h-5 text-emerald-600" />
            Membership Benefits
          </CardTitle>
          <Badge className="capitalize bg-emerald-500 hover:bg-emerald-600">
            {summary.membershipTier}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Free Items */}
        {summary.freeItems > 0 && (
          <div className="flex items-center justify-between p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium">Free Items</span>
            </div>
            <Badge className="bg-emerald-500 hover:bg-emerald-600">
              {summary.freeItems} item{summary.freeItems !== 1 ? "s" : ""}
            </Badge>
          </div>
        )}

        {/* Pricing Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Regular Price</span>
            <span className="line-through text-muted-foreground">
              ${summary.regularTotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-sm font-medium">
            <span>Membership Price</span>
            <span>${summary.membershipTotal.toFixed(2)}</span>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-emerald-600">
                Total Savings
              </span>
            </div>
            <span className="text-lg font-bold text-emerald-600">
              ${summary.totalSavings.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Benefits Summary */}
        <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                Membership Benefits Applied
              </div>
              <div className="text-blue-600/80 dark:text-blue-400/80 text-xs">
                {summary.freeItems > 0 &&
                  `${summary.freeItems} free product${summary.freeItems !== 1 ? "s" : ""}`}
                {summary.freeItems > 0 &&
                  summary.totalSavings >
                    summary.regularTotal - summary.membershipTotal &&
                  " • "}
                {summary.totalSavings > 0 &&
                  `$${summary.totalSavings.toFixed(2)} saved`}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
