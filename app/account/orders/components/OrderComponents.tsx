"use client";

import { motion } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
  RefreshCw,
  Eye,
  Download,
  AlertCircle,
  XCircle,
  DollarSign,
  Calendar,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// OrderCard Component
interface OrderItem {
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  items: OrderItem[];
  trackingNumber?: string;
}

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "delivered":
        return {
          color:
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          icon: CheckCircle,
          iconColor: "text-green-600",
          label: "Delivered",
        };
      case "shipped":
        return {
          color:
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          icon: Truck,
          iconColor: "text-blue-600",
          label: "Shipped",
        };
      case "processing":
        return {
          color:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          icon: Package,
          iconColor: "text-yellow-600",
          label: "Processing",
        };
      case "pending":
        return {
          color:
            "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
          icon: Clock,
          iconColor: "text-gray-600",
          label: "Pending",
        };
      case "cancelled":
        return {
          color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          icon: XCircle,
          iconColor: "text-red-600",
          label: "Cancelled",
        };
      default:
        return {
          color:
            "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
          icon: Clock,
          iconColor: "text-gray-600",
          label: status,
        };
    }
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${statusConfig.color.replace("text-", "bg-").split(" ")[0]}/20`}
              >
                <StatusIcon className={`w-5 h-5 ${statusConfig.iconColor}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Order #{order.orderNumber}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {order.items.length} item{order.items.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
              <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                {order.paymentStatus}
              </Badge>
            </div>
          </div>

          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>
                Ordered: {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>

            {order.shippedAt && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Truck className="w-4 h-4" />
                <span>
                  Shipped: {new Date(order.shippedAt).toLocaleDateString()}
                </span>
              </div>
            )}

            {order.deliveredAt && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4" />
                <span>
                  Delivered: {new Date(order.deliveredAt).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <DollarSign className="w-4 h-4" />
              <span className="font-medium">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Products */}
          <div className="mb-4">
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {order.items.slice(0, 4).map((item, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 flex items-center space-x-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2"
                >
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center overflow-hidden">
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-32">
                      {item.productName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
              {order.items.length > 4 && (
                <div className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  +{order.items.length - 4} more
                </div>
              )}
            </div>
          </div>

          {/* Tracking */}
          {order.trackingNumber && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Tracking Available
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Tracking #: {order.trackingNumber}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Link href={`/track?order=${order.orderNumber}`}>
                    Track Package
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              ID: {order._id.slice(-8)}
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/account/orders/${order.orderNumber}`}>
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Link>
              </Button>

              {order.status === "delivered" && (
                <Button variant="ghost" size="sm">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Reorder
                </Button>
              )}

              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Invoice
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// OrderStats Component
interface OrderStatsProps {
  total: number;
  delivered: number;
  pending: number;
  shipped: number;
  totalSpent: number;
}

export function OrderStats({
  total,
  delivered,
  pending,
  shipped,
  totalSpent,
}: OrderStatsProps) {
  const stats = [
    {
      title: "Total Orders",
      value: total,
      icon: ShoppingCart,
      color: "from-blue-500 to-blue-600",
      change: `All time`,
    },
    {
      title: "Delivered",
      value: delivered,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      change: `${Math.round((delivered / Math.max(total, 1)) * 100)}% success rate`,
    },
    {
      title: "In Transit",
      value: shipped,
      icon: Truck,
      color: "from-blue-500 to-cyan-500",
      change: shipped > 0 ? "On the way" : "None shipping",
    },
    {
      title: "Processing",
      value: pending,
      icon: Package,
      color: "from-yellow-500 to-orange-500",
      change: pending > 0 ? "Being prepared" : "All processed",
    },
    {
      title: "Total Spent",
      value: `$${totalSpent.toFixed(2)}`,
      icon: DollarSign,
      color: "from-purple-500 to-pink-500",
      change: "Lifetime value",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -2 }}
        >
          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {stat.title}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stat.change}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
