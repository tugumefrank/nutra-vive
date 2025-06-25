// app/admin/memberships/components/MembershipsStats.tsx
"use client";

import { motion } from "framer-motion";
import {
  Crown,
  Users,
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
  Star,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MembershipsStatsProps {
  stats: {
    totalMemberships: number;
    activeMemberships: number;
    totalSubscribers: number;
    totalRevenue: number;
    averageRevenue: number;
    membershipsByTier: Array<{
      tier: string;
      count: number;
      subscribers: number;
      revenue: number;
    }>;
    recentSubscriptions: any[];
    topMemberships: any[];
  };
}

export default function MembershipsStats({ stats }: MembershipsStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "basic":
        return "bg-blue-500";
      case "premium":
        return "bg-purple-500";
      case "vip":
        return "bg-yellow-500";
      case "elite":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "basic":
        return Package;
      case "premium":
        return Star;
      case "vip":
        return Crown;
      case "elite":
        return Activity;
      default:
        return Package;
    }
  };

  const statsCards = [
    {
      title: "Total Plans",
      value: stats.totalMemberships,
      subtitle: `${stats.activeMemberships} active`,
      icon: Crown,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: `${((stats.activeMemberships / stats.totalMemberships) * 100 || 0).toFixed(0)}% active`,
    },
    {
      title: "Active Subscribers",
      value: stats.totalSubscribers,
      subtitle: "Members subscribed",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "+12% this month",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      subtitle: "Lifetime earnings",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      trend: "+8% this month",
    },
    {
      title: "Average Revenue",
      value: formatCurrency(stats.averageRevenue),
      subtitle: "Per membership",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "Stable",
    },
  ];

  return (
    <div className="border-b bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="container mx-auto px-6 py-6">
        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {stat.subtitle}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {stat.trend}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tier Breakdown */}
        {stats.membershipsByTier.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Membership Tiers Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.membershipsByTier.map((tier, index) => {
                    const Icon = getTierIcon(tier.tier);
                    return (
                      <motion.div
                        key={tier.tier}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                        className="relative group"
                      >
                        <div className="p-4 rounded-lg border bg-gradient-to-br from-background to-background/50 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className={`p-2 rounded-lg ${getTierColor(tier.tier)} bg-opacity-10`}
                            >
                              <Icon
                                className={`h-4 w-4 text-white`}
                                style={{
                                  color: getTierColor(tier.tier).replace(
                                    "bg-",
                                    ""
                                  ),
                                }}
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold capitalize">
                                {tier.tier}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {tier.count} plans
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Subscribers
                              </span>
                              <span className="font-medium">
                                {tier.subscribers}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Revenue
                              </span>
                              <span className="font-medium">
                                {formatCurrency(tier.revenue)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
