"use client";

import { motion } from "framer-motion";
import {
  Package,
  MapPin,
  User,
  Calendar,
  CreditCard,
  Truck,
  Copy,
  ExternalLink,
  Phone,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

interface OrderItem {
  _id: string;
  productName: string;
  productSlug: string;
  productImage: string;
  quantity: number;
  price: number;
  totalPrice: number;
  product?: {
    _id: string;
    name: string;
    slug: string;
    images: string[];
    price: number;
  };
}

interface Order {
  _id: string;
  orderNumber: string;
  email: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
  };
  items: OrderItem[];
  notes?: string;
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

interface TrackingInfo {
  orderNumber: string;
  trackingNumber?: string;
  status: string;
  estimatedDelivery?: string;
  shippingCarrier?: string;
  currentLocation?: string;
  canTrack: boolean;
  isDelivered: boolean;
  daysInTransit?: number;
}

interface OrderDetailsCardProps {
  order: Order;
  trackingInfo: TrackingInfo;
  className?: string;
}

const statusColors = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
  processing:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
  shipped:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
  delivered:
    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
  refunded: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
};

const paymentStatusColors = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
  refunded: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
  partially_refunded:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
};

export default function OrderDetailsCard({
  order,
  trackingInfo,
  className = "",
}: OrderDetailsCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error("Failed to copy. Please try again.");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: order.currency || "USD",
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={className}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Summary */}
        <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-green-600" />
              <span>Order Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Order Number
                </span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-medium">
                    {order.orderNumber}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(order.orderNumber, "Order Number")
                    }
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {trackingInfo.trackingNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Tracking Number
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-medium">
                      {trackingInfo.trackingNumber}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          trackingInfo.trackingNumber!,
                          "Tracking Number"
                        )
                      }
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Order Date
                </span>
                <span className="text-sm font-medium">
                  {format(new Date(order.createdAt), "MMM dd, yyyy")}
                </span>
              </div>

              {trackingInfo.shippingCarrier && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Carrier
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-white/50 dark:bg-gray-800/50"
                  >
                    <Truck className="w-3 h-3 mr-1" />
                    {trackingInfo.shippingCarrier}
                  </Badge>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Status
                </span>
                <Badge
                  className={
                    statusColors[order.status as keyof typeof statusColors] ||
                    statusColors.pending
                  }
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Payment
                </span>
                <Badge
                  className={
                    paymentStatusColors[
                      order.paymentStatus as keyof typeof paymentStatusColors
                    ] || paymentStatusColors.pending
                  }
                >
                  {order.paymentStatus.charAt(0).toUpperCase() +
                    order.paymentStatus.slice(1).replace("_", " ")}
                </Badge>
              </div>

              {trackingInfo.estimatedDelivery && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Est. Delivery
                  </span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {format(
                      new Date(trackingInfo.estimatedDelivery),
                      "MMM dd, yyyy"
                    )}
                  </span>
                </div>
              )}

              {trackingInfo.daysInTransit && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Days in Transit
                  </span>
                  <span className="text-sm font-medium">
                    {trackingInfo.daysInTransit} days
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Order Items */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Items ({order.items.length})
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {order.items.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatPrice(item.totalPrice)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Order Total */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal
                </span>
                <span className="font-medium">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Discount
                  </span>
                  <span className="font-medium text-green-600">
                    -{formatPrice(order.discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Shipping
                </span>
                <span className="font-medium">
                  {order.shippingAmount === 0
                    ? "Free"
                    : formatPrice(order.shippingAmount)}
                </span>
              </div>
              {order.taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="font-medium">
                    {formatPrice(order.taxAmount)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Information */}
        <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <span>Shipping Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Shipping Address */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Delivery Address</span>
              </h4>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.shippingAddress.firstName}{" "}
                  {order.shippingAddress.lastName}
                </p>
                {order.shippingAddress.company && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.shippingAddress.company}
                  </p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {order.shippingAddress.address1}
                </p>
                {order.shippingAddress.address2 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.shippingAddress.address2}
                  </p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
                  {order.shippingAddress.zip}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {order.shippingAddress.country}
                </p>
                {order.shippingAddress.phone && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                    <Phone className="w-3 h-3" />
                    <span>{order.shippingAddress.phone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Contact Information</span>
              </h4>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                  <Mail className="w-3 h-3" />
                  <span>{order.email}</span>
                </p>
              </div>
            </div>

            {/* Current Location */}
            {trackingInfo.currentLocation && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Current Location</span>
                </h4>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    {trackingInfo.currentLocation}
                  </p>
                </div>
              </div>
            )}

            {/* Order Notes */}
            {order.notes && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Order Notes
                </h4>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {order.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Need Help?
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="outline" size="sm" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Return Policy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
