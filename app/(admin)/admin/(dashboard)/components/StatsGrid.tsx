"use client";

import { motion } from "framer-motion";
import StatCard from "@/components/ui/stat-card";
import { DashboardData } from "@/lib/dashboard-cache";
import {
  ShoppingBag,
  DollarSign,
  Users,
  Package,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface StatsGridProps {
  data: DashboardData;
}

export default function StatsGrid({ data }: StatsGridProps) {
  const stats = [
    {
      title: "Total Revenue",
      value: data.orderStats.totalRevenue,
      format: "currency" as const,
      icon: DollarSign,
      trend: { value: 12.5, isPositive: true },
      className: "bg-gradient-to-br from-green-500 to-emerald-600",
    },
    {
      title: "Total Orders",
      value: data.orderStats.totalOrders,
      format: "number" as const,
      icon: ShoppingBag,
      trend: { value: 8.2, isPositive: true },
      className: "bg-gradient-to-br from-blue-500 to-cyan-600",
    },
    {
      title: "Active Products",
      value: data.productStats.active,
      format: "number" as const,
      icon: Package,
      trend: { value: 2.1, isPositive: true },
      className: "bg-gradient-to-br from-purple-500 to-violet-600",
    },
    {
      title: "Total Users",
      value: data.userStats.totalUsers,
      format: "number" as const,
      icon: Users,
      trend: { value: 15.3, isPositive: true },
      className: "bg-gradient-to-br from-orange-500 to-red-600",
    },
    {
      title: "Consultations",
      value: data.consultationStats.total,
      format: "number" as const,
      icon: Calendar,
      trend: { value: 5.7, isPositive: true },
      className: "bg-gradient-to-br from-teal-500 to-green-600",
    },
    {
      title: "Avg Order Value",
      value: data.orderStats.averageOrderValue,
      format: "currency" as const,
      icon: TrendingUp,
      trend: { value: 3.2, isPositive: true },
      className: "bg-gradient-to-br from-indigo-500 to-blue-600",
    },
    {
      title: "Low Stock Items",
      value: data.productStats.lowStock,
      format: "number" as const,
      icon: AlertCircle,
      trend: { value: 2, isPositive: false },
      className: "bg-gradient-to-br from-yellow-500 to-orange-600",
    },
    {
      title: "Completed Orders",
      value: data.orderStats.deliveredOrders,
      format: "number" as const,
      icon: CheckCircle,
      trend: { value: 9.1, isPositive: true },
      className: "bg-gradient-to-br from-emerald-500 to-teal-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.6 }}
        >
          <StatCard {...stat} />
        </motion.div>
      ))}
    </div>
  );
}
