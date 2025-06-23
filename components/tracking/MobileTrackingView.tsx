"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  MapPin,
  Truck,
  ChevronDown,
  ChevronUp,
  Share2,
  Copy,
  ExternalLink,
  Phone,
  MessageCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import Image from "next/image";
import OrderStatusIndicator from "@/components/tracking/OrderStatusIndicator";

interface MobileTrackingViewProps {
  order: any;
  trackingInfo: any;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function MobileTrackingView({
  order,
  trackingInfo,
  onRefresh,
  isLoading,
}: MobileTrackingViewProps) {
  const [expandedSections, setExpandedSections] = useState({
    timeline: true,
    items: false,
    address: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const shareTracking = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Order ${trackingInfo.orderNumber} Tracking`,
          text: `Track my Nutra-Vive order: ${trackingInfo.orderNumber}`,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copy
        copyTrackingLink();
      }
    } else {
      copyTrackingLink();
    }
  };

  const copyTrackingLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast("Tracking link copied to clipboard!");
    } catch (err) {
      toast("Failed to copy link");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: order.currency || "USD",
    }).format(price);
  };

  const currentEvent = trackingInfo.events?.[trackingInfo.events.length - 1];
  const progressPercentage = getProgressPercentage(trackingInfo.status);

  return (
    <div className="space-y-4 pb-20">
      {" "}
      {/* Bottom padding for mobile nav */}
      {/* Header Card */}
      <Card className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Order {trackingInfo.orderNumber}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {format(new Date(order.createdAt), "MMM dd, yyyy")}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={shareTracking}
              className="h-8 w-8 p-0"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Status Indicator */}
          <div className="mb-4">
            <OrderStatusIndicator
              status={trackingInfo.status}
              size="lg"
              animated={true}
            />
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>Order Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full relative"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute right-0 top-0 w-2 h-2 bg-white rounded-full shadow-sm"
                />
              </motion.div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4 text-center">
            {trackingInfo.estimatedDelivery && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Est. Delivery
                </p>
                <p className="text-sm font-bold text-green-700 dark:text-green-300">
                  {format(new Date(trackingInfo.estimatedDelivery), "MMM dd")}
                </p>
              </div>
            )}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Total
              </p>
              <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                {formatPrice(order.totalAmount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Current Status */}
      {currentEvent && (
        <Card className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  Latest Update
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {currentEvent.description}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {format(new Date(currentEvent.timestamp), "MMM dd, h:mm a")}
                  </span>
                  {currentEvent.location && (
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {currentEvent.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Tracking Timeline */}
      <Card className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-0 shadow-lg">
        <CardContent className="p-0">
          <button
            onClick={() => toggleSection("timeline")}
            className="w-full p-4 flex items-center justify-between"
          >
            <h3 className="font-medium text-gray-900 dark:text-white">
              Tracking Timeline
            </h3>
            {expandedSections.timeline ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.timeline && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  <div className="space-y-4">
                    {trackingInfo.events?.map((event: any, index: number) => (
                      <motion.div
                        key={event._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3"
                      >
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {event.description}
                          </p>
                          <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span>
                              {format(
                                new Date(event.timestamp),
                                "MMM dd, h:mm a"
                              )}
                            </span>
                            {event.location && (
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {event.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      {/* Order Items */}
      <Card className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-0 shadow-lg">
        <CardContent className="p-0">
          <button
            onClick={() => toggleSection("items")}
            className="w-full p-4 flex items-center justify-between"
          >
            <h3 className="font-medium text-gray-900 dark:text-white">
              Items ({order.items.length})
            </h3>
            {expandedSections.items ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.items && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3">
                  {order.items.map((item: any) => (
                    <div
                      key={item._id}
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
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      {/* Delivery Address */}
      <Card className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-0 shadow-lg">
        <CardContent className="p-0">
          <button
            onClick={() => toggleSection("address")}
            className="w-full p-4 flex items-center justify-between"
          >
            <h3 className="font-medium text-gray-900 dark:text-white">
              Delivery Address
            </h3>
            {expandedSections.address ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.address && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="font-medium text-gray-900 dark:text-white mb-1">
                      {order.shippingAddress.firstName}{" "}
                      {order.shippingAddress.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.shippingAddress.address1}
                    </p>
                    {order.shippingAddress.address2 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.shippingAddress.address2}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.province}{" "}
                      {order.shippingAddress.zip}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      {/* Action Buttons */}
      <Card className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" className="w-full">
              <Phone className="w-4 h-4 mr-2" />
              Call Support
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              Live Chat
            </Button>
          </div>
          {trackingInfo.trackingNumber && (
            <Button variant="outline" size="sm" className="w-full mt-3">
              <ExternalLink className="w-4 h-4 mr-2" />
              Track with {trackingInfo.shippingCarrier || "Carrier"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to calculate progress percentage
function getProgressPercentage(status: string): number {
  const statusProgress = {
    pending: 10,
    payment_confirmed: 20,
    processing: 40,
    shipped: 60,
    in_transit: 80,
    out_for_delivery: 90,
    delivered: 100,
    cancelled: 0,
    returned: 0,
  };

  return statusProgress[status as keyof typeof statusProgress] || 0;
}
