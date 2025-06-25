// app/(account)/account/memberships/components/CurrentMembershipCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Crown,
  Calendar,
  CreditCard,
  Settings,
  Zap,
  Gift,
  Star,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface CurrentMembershipCardProps {
  membership: {
    _id: string;
    membership: {
      _id: string;
      name: string;
      tier: string;
      price: number;
      billingFrequency: string;
      features: string[];
      customBenefits: Array<{
        title: string;
        description: string;
        type: string;
      }>;
    };
    status: string;
    startDate: string;
    nextBillingDate?: string;
    currentPeriodEnd: string;
    productUsage: Array<{
      categoryId: string;
      categoryName: string;
      allocatedQuantity: number;
      usedQuantity: number;
      availableQuantity: number;
    }>;
    autoRenewal: boolean;
  };
  onRefresh: () => void;
}

const tierConfig = {
  basic: {
    icon: Gift,
    color: "bg-emerald-500",
    gradient: "from-emerald-500 to-emerald-600",
    badgeVariant: "default" as const,
  },
  premium: {
    icon: Star,
    color: "bg-blue-500",
    gradient: "from-blue-500 to-blue-600",
    badgeVariant: "default" as const,
  },
  vip: {
    icon: Crown,
    color: "bg-purple-500",
    gradient: "from-purple-500 to-purple-600",
    badgeVariant: "secondary" as const,
  },
  elite: {
    icon: Zap,
    color: "bg-amber-500",
    gradient: "from-amber-500 to-amber-600",
    badgeVariant: "destructive" as const,
  },
};

export function CurrentMembershipCard({
  membership,
  onRefresh,
}: CurrentMembershipCardProps) {
  const config =
    tierConfig[membership.membership.tier as keyof typeof tierConfig];
  const IconComponent = config.icon;

  // Calculate period progress
  const startDate = new Date(membership.startDate);
  const endDate = new Date(membership.currentPeriodEnd);
  const now = new Date();
  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysUsed = Math.ceil(
    (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const progressPercentage = Math.min((daysUsed / totalDays) * 100, 100);

  // Calculate total product usage
  const totalAllocated = membership.productUsage.reduce(
    (sum, usage) => sum + usage.allocatedQuantity,
    0
  );
  const totalUsed = membership.productUsage.reduce(
    (sum, usage) => sum + usage.usedQuantity,
    0
  );
  const usagePercentage =
    totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0;

  return (
    <Card className="glass-card border-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl overflow-hidden">
      <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl ${config.color} text-white shadow-lg`}
            >
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold capitalize">
                {membership.membership.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={config.badgeVariant} className="capitalize">
                  {membership.membership.tier}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {membership.status}
                </Badge>
              </div>
            </div>
          </div>

          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="w-4 h-4" />
            Manage
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Billing Information */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
              <CreditCard className="w-4 h-4" />
              <span className="text-sm font-medium">Monthly Cost</span>
            </div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              ${membership.membership.price}
            </div>
            <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
              Per {membership.membership.billingFrequency.replace("ly", "")}
            </div>
          </div>

          <div className="glass-card p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Next Billing</span>
            </div>
            <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              {membership.nextBillingDate
                ? format(new Date(membership.nextBillingDate), "MMM dd, yyyy")
                : "N/A"}
            </div>
            <div className="text-xs text-blue-600/70 dark:text-blue-400/70">
              {membership.nextBillingDate
                ? formatDistanceToNow(new Date(membership.nextBillingDate), {
                    addSuffix: true,
                  })
                : "No upcoming billing"}
            </div>
          </div>

          <div className="glass-card p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/50 rounded-xl">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
              <Gift className="w-4 h-4" />
              <span className="text-sm font-medium">Products Used</span>
            </div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {totalUsed}/{totalAllocated}
            </div>
            <div className="text-xs text-purple-600/70 dark:text-purple-400/70">
              This period
            </div>
          </div>
        </div>

        {/* Period Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Billing Period Progress</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Started {format(startDate, "MMM dd")}</span>
            <span>Ends {format(endDate, "MMM dd")}</span>
          </div>
        </div>

        {/* Product Usage Overview */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              Product Allocation Usage
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(usagePercentage)}% used
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <div className="text-xs text-muted-foreground">
            You have {totalAllocated - totalUsed} products remaining this period
          </div>
        </div>

        {/* Key Benefits */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Your Benefits</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {membership.membership.features
              .slice(0, 4)
              .map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
