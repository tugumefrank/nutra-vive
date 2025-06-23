"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  MapPin,
  Truck,
  ExternalLink,
  RefreshCw,
  ChevronRight,
  Calendar,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { format } from "date-fns";
import Link from "next/link";
import OrderStatusIndicator from "@/components/tracking/OrderStatusIndicator";
import { trackOrder } from "@/lib/actions/orderTrackingServerActions";

interface QuickTrackingWidgetProps {
  orderNumber?: string;
  trackingNumber?: string;
  initialStatus?: string;
  initialTrackingInfo?: any;
  compact?: boolean;
  showActions?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
  className?: string;
  onViewDetails?: () => void;
}

export default function QuickTrackingWidget({
  orderNumber,
  trackingNumber,
  initialStatus,
  initialTrackingInfo,
  compact = false,
  showActions = true,
  autoRefresh = false,
  refreshInterval = 30,
  className = "",
  onViewDetails,
}: QuickTrackingWidgetProps) {
  const [trackingInfo, setTrackingInfo] = useState(initialTrackingInfo);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderNumber && !initialTrackingInfo) {
      fetchTrackingInfo();
    }
  }, [orderNumber]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchTrackingInfo(true);
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, orderNumber]);

  const fetchTrackingInfo = async (silent = false) => {
    if (!orderNumber && !trackingNumber) return;

    if (!silent) setIsLoading(true);
    setError(null);

    try {
      const result = await trackOrder({
        identifier: orderNumber || trackingNumber!,
      });

      if (result.success && result.trackingInfo) {
        setTrackingInfo(result.trackingInfo);
        setLastUpdate(new Date());
      } else {
        setError(result.error || "Failed to fetch tracking information");
      }
    } catch (err) {
      setError("An error occurred while fetching tracking information");
      console.error("Tracking fetch error:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const getProgressPercentage = (status: string): number => {
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
  };

  const getStatusMessage = (status: string): string => {
    const messages = {
      pending: "Your order has been received and is being processed",
      payment_confirmed: "Payment confirmed, preparing your order",
      processing: "Your order is being prepared for shipment",
      shipped: "Your order is on its way!",
      in_transit: "Package is moving towards its destination",
      out_for_delivery: "Package is out for delivery today",
      delivered: "Your order has been delivered successfully",
      cancelled: "This order has been cancelled",
      returned: "Package has been returned",
    };

    return (
      messages[status as keyof typeof messages] ||
      "Tracking information available"
    );
  };

  const currentStatus = trackingInfo?.status || initialStatus;
  const latestEvent = trackingInfo?.events?.[trackingInfo.events.length - 1];
  const progressPercentage = currentStatus
    ? getProgressPercentage(currentStatus)
    : 0;

  if (error && !trackingInfo) {
    return (
      <Card
        className={`border-red-200 bg-red-50 dark:bg-red-900/20 ${className}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                Unable to load tracking information
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
            {showActions && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchTrackingInfo()}
                disabled={isLoading}
                className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentStatus) {
    return (
      <Card
        className={`border-gray-200 bg-gray-50 dark:bg-gray-800/50 ${className}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tracking information not available
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Please check back later
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={className}
      >
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <OrderStatusIndicator
                  status={currentStatus}
                  size="sm"
                  showText={false}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {orderNumber || trackingNumber}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {currentStatus.replace("_", " ")}
                  </p>
                </div>
              </div>
              {showActions && (
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchTrackingInfo()}
                    disabled={isLoading}
                    className="h-6 w-6 p-0"
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`}
                    />
                  </Button>
                  {onViewDetails ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onViewDetails}
                      className="h-6 w-6 p-0"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  ) : (
                    <Link
                      href={`/track?order=${orderNumber || trackingNumber}`}
                    >
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Order Tracking
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {orderNumber || trackingNumber}
                </p>
              </div>
            </div>
            {showActions && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchTrackingInfo()}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
                {onViewDetails ? (
                  <Button variant="outline" size="sm" onClick={onViewDetails}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                ) : (
                  <Link href={`/track?order=${orderNumber || trackingNumber}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Full Tracking
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Status Indicator */}
          <div className="mb-4">
            <OrderStatusIndicator
              status={currentStatus}
              size="md"
              animated={true}
            />
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Status Message */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {getStatusMessage(currentStatus)}
            </p>
          </div>

          {/* Latest Update */}
          {latestEvent && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Latest Update
              </h4>
              <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    {latestEvent.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-blue-600 dark:text-blue-400">
                    <span>
                      {format(
                        new Date(latestEvent.timestamp),
                        "MMM dd, h:mm a"
                      )}
                    </span>
                    {latestEvent.location && (
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {latestEvent.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {trackingInfo?.estimatedDelivery && (
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Est. Delivery:
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {format(new Date(trackingInfo.estimatedDelivery), "MMM dd")}
                </span>
              </div>
            )}
            {trackingInfo?.shippingCarrier && (
              <div className="flex items-center space-x-2 text-sm">
                <Truck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Carrier:
                </span>
                <Badge variant="outline" className="text-xs">
                  {trackingInfo.shippingCarrier}
                </Badge>
              </div>
            )}
          </div>

          {/* Last Update Time */}
          {lastUpdate && (
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Last updated: {format(lastUpdate, "MMM dd, h:mm a")}
              {autoRefresh && (
                <span className="ml-2">• Auto-refresh enabled</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
