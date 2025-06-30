"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  Package,
  ArrowRight,
  ExternalLink,
  Calendar,
  Copy,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// TrackingForm Component
export function TrackingForm() {
  const [trackingInfo, setTrackingInfo] = useState({
    orderNumber: "",
    trackingNumber: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!trackingInfo.orderNumber && !trackingInfo.trackingNumber) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to tracking page with the info
      const searchParams = new URLSearchParams();
      if (trackingInfo.orderNumber)
        searchParams.set("order", trackingInfo.orderNumber);
      if (trackingInfo.trackingNumber)
        searchParams.set("tracking", trackingInfo.trackingNumber);
      if (trackingInfo.email) searchParams.set("email", trackingInfo.email);

      window.open(`/track?${searchParams.toString()}`, "_blank");
    } catch (error) {
      console.error("Failed to track order");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Enter your order number or tracking number to get real-time updates on
        your shipment.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="orderNumber">Order Number</Label>
          <Input
            id="orderNumber"
            placeholder="NV-000123"
            value={trackingInfo.orderNumber}
            onChange={(e) =>
              setTrackingInfo((prev) => ({
                ...prev,
                orderNumber: e.target.value,
              }))
            }
            className="bg-white/50 dark:bg-gray-700/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="trackingNumber">Tracking Number</Label>
          <Input
            id="trackingNumber"
            placeholder="1Z999AA1234567890"
            value={trackingInfo.trackingNumber}
            onChange={(e) =>
              setTrackingInfo((prev) => ({
                ...prev,
                trackingNumber: e.target.value,
              }))
            }
            className="bg-white/50 dark:bg-gray-700/50"
          />
        </div>
      </div>

      {/* <div className="space-y-2">
        <Label htmlFor="email">Email Address (Optional)</Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          value={trackingInfo.email}
          onChange={(e) =>
            setTrackingInfo((prev) => ({ ...prev, email: e.target.value }))
          }
          className="bg-white/50 dark:bg-gray-700/50"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          For additional verification and order details
        </p>
      </div> */}

      <Button
        onClick={handleSubmit}
        disabled={
          isLoading ||
          (!trackingInfo.orderNumber && !trackingInfo.trackingNumber)
        }
        className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Tracking...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <span>Track Package</span>
          </div>
        )}
      </Button>
    </div>
  );
}

// TrackingWidget Component
interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  trackingNumber?: string;
  shippedAt?: string;
  items: Array<{
    productName: string;
    quantity: number;
  }>;
}

interface TrackingWidgetProps {
  order: Order;
}

export function TrackingWidget({ order }: TrackingWidgetProps) {
  const [copied, setCopied] = useState(false);

  const copyTrackingNumber = async () => {
    if (order.trackingNumber) {
      await navigator.clipboard.writeText(order.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getEstimatedDelivery = () => {
    if (order.shippedAt) {
      const shipDate = new Date(order.shippedAt);
      const estimatedDate = new Date(shipDate);
      estimatedDate.setDate(shipDate.getDate() + 3); // Add 3 days
      return estimatedDate.toLocaleDateString();
    }
    return "Calculating...";
  };

  return (
    <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Order #{order.orderNumber}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {order.items.length} item{order.items.length > 1 ? "s" : ""} • $
              {order.totalAmount.toFixed(2)}
            </p>
          </div>

          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            In Transit
          </Badge>
        </div>

        {/* Tracking Number */}
        {order.trackingNumber && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Tracking Number
                </p>
                <p className="font-mono text-sm text-gray-900 dark:text-white">
                  {order.trackingNumber}
                </p>
              </div>
              <Button
                onClick={copyTrackingNumber}
                size="sm"
                variant="ghost"
                className="text-xs"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Shipped
              </span>
            </div>

            <div className="flex-1 h-0.5 bg-blue-500"></div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                In Transit
              </span>
            </div>

            <div className="flex-1 h-0.5 bg-gray-300 dark:bg-gray-600"></div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-gray-500" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Delivered
              </span>
            </div>
          </div>
        </div>

        {/* Estimated Delivery */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Estimated Delivery
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {getEstimatedDelivery()}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/track?order=${order.orderNumber}`} target="_blank">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Link>
          </Button>

          <Button asChild size="sm" variant="outline">
            <Link href={`/account/orders/${order.orderNumber}`}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Order Info
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// RecentShipments Component
interface RecentShipmentsProps {
  orders: Order[];
}

export function RecentShipments({ orders }: RecentShipmentsProps) {
  if (orders.length === 0) {
    return (
      <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            📦
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            No Recent Shipments
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Your recent orders will appear here once they're shipped.
          </p>
          <Button asChild size="sm">
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-green-600" />
            <span>Recent Shipments</span>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link
              href="/account/orders"
              className="text-green-600 hover:text-green-700"
            >
              View All <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    order.status === "delivered"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-blue-100 dark:bg-blue-900/30"
                  }`}
                >
                  {order.status === "delivered" ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Truck className="w-5 h-5 text-blue-600" />
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                    Order #{order.orderNumber}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {order.items.length} item{order.items.length > 1 ? "s" : ""}{" "}
                    •
                    {order.shippedAt &&
                      ` Shipped ${new Date(order.shippedAt).toLocaleDateString()}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {order.status === "delivered" ? "Delivered" : "In Transit"}
                </Badge>

                <Button asChild size="sm" variant="ghost">
                  <Link href={`/track?order=${order.orderNumber}`}>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
