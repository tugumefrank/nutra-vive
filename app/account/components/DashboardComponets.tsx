"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  Package,
  CheckCircle,
  Heart,
  Calendar,
  Star,
  Gift,
  ShoppingCart,
  MessageCircle,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Icon mapping for string to component conversion
const iconMap = {
  Package,
  CheckCircle,
  TrendingUp,
  Heart,
  Calendar,
  Star,
  Clock,
  Gift,
  ArrowRight,
  ShoppingCart,
  MessageCircle,
  Stethoscope,
  TrendingDown,
} as const;

type IconName = keyof typeof iconMap;

// StatCard Component - Updated to accept icon names as strings
interface StatCardProps {
  title: string;
  value: string | number;
  icon: IconName; // ✅ Now accepts string instead of component
  change?: string;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({ title, value, icon, change, trend }: StatCardProps) {
  // Get the icon component from the map
  const IconComponent = iconMap[icon];

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {value}
              </p>
              {change && (
                <div
                  className={`flex items-center space-x-1 text-xs ${
                    trend === "up"
                      ? "text-green-600"
                      : trend === "down"
                        ? "text-red-600"
                        : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {trend === "up" && <TrendingUp className="w-3 h-3" />}
                  {trend === "down" && <TrendingDown className="w-3 h-3" />}
                  <span>{change}</span>
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// RecentOrdersCard Component
interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
  }>;
}

interface RecentOrdersCardProps {
  orders: Order[];
}

export function RecentOrdersCard({ orders }: RecentOrdersCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "pending":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Orders</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link
            href="/account/orders"
            className="text-green-600 hover:text-green-700"
          >
            View All <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              📦
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No orders yet
            </p>
            <Button asChild size="sm">
              <Link href="/shop">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-white/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">#{order.orderNumber}</h4>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {order.items.length} item{order.items.length > 1 ? "s" : ""} •
                  ${order.totalAmount.toFixed(2)}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/account/orders/${order._id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// RecentConsultationsCard Component
interface Consultation {
  _id: string;
  consultationNumber: string;
  status: string;
  personalInfo: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  scheduledAt?: string;
}

interface RecentConsultationsCardProps {
  consultations: Consultation[];
}

export function RecentConsultationsCard({
  consultations,
}: RecentConsultationsCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Consultations</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link
            href="/account/consultations"
            className="text-green-600 hover:text-green-700"
          >
            View All <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {consultations.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              🩺
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No consultations yet
            </p>
            <Button asChild size="sm">
              <Link href="/consultation">Book Consultation</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {consultations.map((consultation, index) => (
              <motion.div
                key={consultation._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-white/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">
                    #{consultation.consultationNumber}
                  </h4>
                  <Badge className={getStatusColor(consultation.status)}>
                    {consultation.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {consultation.scheduledAt && (
                    <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>
                        Scheduled:{" "}
                        {new Date(
                          consultation.scheduledAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Created:{" "}
                      {new Date(consultation.createdAt).toLocaleDateString()}
                    </span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/account/consultations/${consultation._id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// QuickActions Component
export function QuickActions() {
  const actions = [
    {
      label: "Book Consultation",
      href: "/consultation",
      icon: "🩺",
      description: "Get personalized wellness advice",
      gradient: "from-blue-500 to-purple-500",
    },
    {
      label: "Shop Products",
      href: "/shop",
      icon: "🛒",
      description: "Browse our organic selection",
      gradient: "from-green-500 to-teal-500",
    },
    {
      label: "Track Order",
      href: "/account/tracking",
      icon: "📦",
      description: "Monitor your deliveries",
      gradient: "from-orange-500 to-red-500",
    },
    {
      label: "View Promotions",
      href: "/account/promotions",
      icon: "🎁",
      description: "Check available discounts",
      gradient: "from-pink-500 to-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href={action.href}>
            <Card className="h-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-4 text-center">
                <div
                  className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center text-2xl`}
                >
                  {action.icon}
                </div>
                <h3 className="font-medium text-sm mb-1">{action.label}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
