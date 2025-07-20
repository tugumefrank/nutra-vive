"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

interface OrderStatsProps {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    refundedOrders: number;
    averageOrderValue: number;
    topProducts: Array<{
      productName: string;
      totalSold: number;
      revenue: number;
    }>;
    recentOrders: any[];
    monthlyRevenue: Array<{
      month: string;
      revenue: number;
      orders: number;
    }>;
  };
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = "emerald",
  delay = 0,
  children,
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "emerald" | "blue" | "purple" | "orange" | "red" | "teal";
  delay?: number;
  children?: React.ReactNode;
}) => {
  const colorClasses = {
    emerald: {
      bg: "from-emerald-500 to-green-500",
      icon: "text-emerald-600 dark:text-emerald-400",
      accent: "bg-emerald-50 dark:bg-emerald-950/20",
      border: "border-emerald-200 dark:border-emerald-800",
    },
    blue: {
      bg: "from-blue-500 to-cyan-500",
      icon: "text-blue-600 dark:text-blue-400",
      accent: "bg-blue-50 dark:bg-blue-950/20",
      border: "border-blue-200 dark:border-blue-800",
    },
    purple: {
      bg: "from-purple-500 to-violet-500",
      icon: "text-purple-600 dark:text-purple-400",
      accent: "bg-purple-50 dark:bg-purple-950/20",
      border: "border-purple-200 dark:border-purple-800",
    },
    orange: {
      bg: "from-orange-500 to-amber-500",
      icon: "text-orange-600 dark:text-orange-400",
      accent: "bg-orange-50 dark:bg-orange-950/20",
      border: "border-orange-200 dark:border-orange-800",
    },
    red: {
      bg: "from-red-500 to-rose-500",
      icon: "text-red-600 dark:text-red-400",
      accent: "bg-red-50 dark:bg-red-950/20",
      border: "border-red-200 dark:border-red-800",
    },
    teal: {
      bg: "from-teal-500 to-cyan-500",
      icon: "text-teal-600 dark:text-teal-400",
      accent: "bg-teal-50 dark:bg-teal-950/20",
      border: "border-teal-200 dark:border-teal-800",
    },
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-slate-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600 dark:text-green-400";
      case "down":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-slate-500 dark:text-slate-400";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: delay * 0.1,
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      whileHover={{
        y: -4,
        transition: { type: "spring", stiffness: 400, damping: 30 },
      }}
      className="group"
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        {/* Gradient Background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color].bg} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
        />

        {/* Animated Accent Border */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses[color].bg} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}
        />

        <CardContent className="p-3 sm:p-4 lg:p-6 relative">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div
                  className={`p-1.5 sm:p-2.5 rounded-xl ${colorClasses[color].accent} group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon
                    className={`h-4 w-4 sm:h-6 sm:w-6 ${colorClasses[color].icon} group-hover:rotate-12 transition-transform duration-300`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide truncate">
                    {title}
                  </p>
                  {trend && trendValue && (
                    <div className="flex items-center gap-1 mt-1">
                      {getTrendIcon()}
                      <span
                        className={`text-xs font-medium ${getTrendColor()}`}
                      >
                        {trendValue}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {value}
                </p>
                {children}
              </div>
            </div>
          </div>
        </CardContent>

        {/* Subtle Glow Effect */}
        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-br ${colorClasses[color].bg} rounded-lg blur-xl transition-opacity duration-500 -z-10`}
        />
      </Card>
    </motion.div>
  );
};

export function OrderStats({ stats }: OrderStatsProps) {
  // Calculate trends (mock data for demo - in real app, compare with previous period)
  const orderGrowth = "+12.5%";
  const revenueGrowth = "+8.2%";
  const processingChange = "+5.1%";
  const deliveryRate = "94.2%";

  // Calculate completion rate
  const totalOrdersExcludingCancelled =
    stats.totalOrders - stats.cancelledOrders;
  const completionRate =
    totalOrdersExcludingCancelled > 0
      ? (stats.deliveredOrders / totalOrdersExcludingCancelled) * 100
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-6">
        {/* Total Orders */}
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          icon={Package}
          trend="up"
          trendValue={orderGrowth}
          color="emerald"
          delay={0}
        >
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              This month
            </span>
            <Badge
              variant="secondary"
              className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 text-xs"
            >
              Active
            </Badge>
          </div>
        </StatCard>

        {/* Total Revenue */}
        <StatCard
          title="Total Revenue"
          value={`${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend="up"
          trendValue={revenueGrowth}
          color="blue"
          delay={1}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                Avg. Order
              </span>
              <span className="font-medium">
                ${stats.averageOrderValue.toFixed(2)}
              </span>
            </div>
          </div>
        </StatCard>

        {/* Pending Orders */}
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
          trend="up"
          trendValue={processingChange}
          color="orange"
          delay={2}
        >
          <div className="space-y-2">
            <Progress
              value={
                (stats.pendingOrders / Math.max(stats.totalOrders, 1)) * 100
              }
              className="h-2"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Needs processing
            </p>
          </div>
        </StatCard>

        {/* Completion Rate */}
        <StatCard
          title="Completion Rate"
          value={`${completionRate.toFixed(1)}%`}
          icon={CheckCircle}
          trend="up"
          trendValue={deliveryRate}
          color="teal"
          delay={3}
        >
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1 text-xs">
              <div className="text-center">
                <div className="font-medium text-purple-600 dark:text-purple-400">
                  {stats.processingOrders}
                </div>
                <div className="text-slate-500 dark:text-slate-400 truncate">
                  Processing
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600 dark:text-blue-400">
                  {stats.shippedOrders}
                </div>
                <div className="text-slate-500 dark:text-slate-400 truncate">
                  Shipped
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-600 dark:text-green-400">
                  {stats.deliveredOrders}
                </div>
                <div className="text-slate-500 dark:text-slate-400 truncate">
                  Delivered
                </div>
              </div>
            </div>
          </div>
        </StatCard>
      </div>

      {/* Additional Stats Row - Full Width Cards for larger screens */}
      <div className="hidden xl:block mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Orders by Status */}
          <StatCard
            title="Order Status Distribution"
            value={`${stats.processingOrders + stats.shippedOrders} Active`}
            icon={RefreshCw}
            color="purple"
            delay={4}
          >
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Processing
                  </span>
                  <span className="font-medium">{stats.processingOrders}</span>
                </div>
                <Progress
                  value={
                    (stats.processingOrders / Math.max(stats.totalOrders, 1)) *
                    100
                  }
                  className="h-1.5"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Shipped
                  </span>
                  <span className="font-medium">{stats.shippedOrders}</span>
                </div>
                <Progress
                  value={
                    (stats.shippedOrders / Math.max(stats.totalOrders, 1)) * 100
                  }
                  className="h-1.5"
                />
              </div>
            </div>
          </StatCard>

          {/* Failed Orders */}
          <StatCard
            title="Issues & Returns"
            value={stats.cancelledOrders + stats.refundedOrders}
            icon={XCircle}
            trend="down"
            trendValue="-2.1%"
            color="red"
            delay={5}
          >
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Cancelled
                </span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {stats.cancelledOrders}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Refunded
                </span>
                <span className="font-medium text-orange-600 dark:text-orange-400">
                  {stats.refundedOrders}
                </span>
              </div>
            </div>
          </StatCard>

          {/* Top Product */}
          <StatCard
            title="Top Performing Product"
            value={stats.topProducts[0]?.productName || "No data"}
            icon={TrendingUp}
            trend="up"
            trendValue="Best seller"
            color="emerald"
            delay={6}
          >
            {stats.topProducts[0] && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Units sold
                  </span>
                  <span className="font-medium">
                    {stats.topProducts[0].totalSold}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Revenue
                  </span>
                  <span className="font-medium">
                    ${stats.topProducts[0].revenue.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </StatCard>
        </div>
      </div>
    </motion.div>
  );
}
