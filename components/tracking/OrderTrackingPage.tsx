"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  RefreshCw,
  MapPin,
  Package,
  Star,
  Heart,
  ShoppingCart,
  Calendar,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TrackingForm from "@/components/tracking/TrackingForm";
import TrackingTimeline from "@/components/tracking/TrackingTimeline";
import EnhancedDesktopTimeline from "@/components/tracking/EnhancedDesktopTimeline";
import MobileTrackingView from "@/components/tracking/MobileTrackingView";
import EnhancedMobileTimeline from "@/components/tracking/EnhancedMobileTimeline";
import RelatedProducts from "@/components/tracking/RelatedProducts";
import WhileYouWaitProducts from "@/components/tracking/WhileYouWaitProducts";
import { trackOrder } from "@/lib/actions/orderTrackingServerActions";
import Link from "next/link";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return matches;
}

interface OrderTrackingPageProps {
  initialOrderNumber?: string;
  initialEmail?: string;
}

export default function OrderTrackingPage({
  initialOrderNumber,
  initialEmail,
}: OrderTrackingPageProps) {
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Use a media query hook to detect mobile
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Auto-track if initial data is provided
  useEffect(() => {
    if (initialOrderNumber) {
      handleAutoTrack();
    }
  }, [initialOrderNumber, initialEmail]);

  const handleAutoTrack = async () => {
    if (!initialOrderNumber) return;

    setIsLoading(true);
    try {
      const result = await trackOrder({
        identifier: initialOrderNumber,
        email: initialEmail,
      });

      if (result.success && result.trackingInfo && result.order) {
        setTrackingInfo(result.trackingInfo);
        setOrder(result.order);
        setShowForm(false);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error("Auto-tracking error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackingFound = (newTrackingInfo: any, newOrder: any) => {
    setTrackingInfo(newTrackingInfo);
    setOrder(newOrder);
    setShowForm(false);
    setLastRefresh(new Date());
  };

  const handleRefresh = async () => {
    if (!trackingInfo?.orderNumber) return;

    setIsLoading(true);
    try {
      const result = await trackOrder({
        identifier: trackingInfo.orderNumber,
        email: order?.email,
      });

      if (result.success && result.trackingInfo && result.order) {
        setTrackingInfo(result.trackingInfo);
        setOrder(result.order);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSearch = () => {
    setTrackingInfo(null);
    setOrder(null);
    setShowForm(true);
    setLastRefresh(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900/20">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center"
              >
                <Package className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Nutra-Vive
              </span>
            </Link>

            <div className="flex items-center space-x-3">
              {trackingInfo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/20"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              )}
              <Link href="/shop">
                <Button variant="outline" size="sm">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <TrackingForm onTrackingFound={handleTrackingFound} />

              {/* Marketing Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-12"
              >
                <Card className="backdrop-blur-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-0 shadow-xl">
                  <CardContent className="p-8 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      While You Wait...
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Discover more organic wellness products to enhance your
                      healthy lifestyle
                    </p>
                    <WhileYouWaitProducts categoryName="juice" limit={3} />
                    <div className="mt-6">
                      <Link href="/shop">
                        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                          Shop Now
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="tracking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Header with Order Info */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Order Tracking
                  </h1>
                  <div className="flex flex-wrap items-center gap-4">
                    <Badge
                      variant="outline"
                      className="bg-white/50 dark:bg-gray-800/50"
                    >
                      <Package className="w-3 h-3 mr-1" />
                      {trackingInfo.orderNumber}
                    </Badge>
                    {trackingInfo.trackingNumber && (
                      <Badge
                        variant="outline"
                        className="bg-white/50 dark:bg-gray-800/50"
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        {trackingInfo.trackingNumber}
                      </Badge>
                    )}
                    {lastRefresh && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Last updated: {lastRefresh.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleNewSearch}
                    className="border-gray-200 dark:border-gray-700"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Track Another Order
                  </Button>
                </div>
              </motion.div>

              {/* Status Overview */}
              {trackingInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="backdrop-blur-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-0 shadow-xl">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Status
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {trackingInfo.status.replace("_", " ")}
                          </p>
                        </div>
                        {trackingInfo.shippingCarrier && (
                          <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              Carrier
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {trackingInfo.shippingCarrier}
                            </p>
                          </div>
                        )}
                        {trackingInfo.currentLocation && (
                          <div className="text-center">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                              <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              Location
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {trackingInfo.currentLocation}
                            </p>
                          </div>
                        )}
                        {trackingInfo.estimatedDelivery && (
                          <div className="text-center">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              Est. Delivery
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(
                                trackingInfo.estimatedDelivery
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Render Mobile or Desktop View */}
              {isMobile ? (
                /* Enhanced Mobile Timeline replaces original mobile view */
                trackingInfo?.events ? (
                  <EnhancedMobileTimeline
                    events={trackingInfo.events}
                    currentStatus={trackingInfo.status}
                    estimatedDelivery={trackingInfo.estimatedDelivery}
                    orderNumber={trackingInfo.orderNumber}
                    order={order}
                    trackingInfo={trackingInfo}
                    onRefresh={handleRefresh}
                  />
                ) : (
                  <MobileTrackingView
                    order={order}
                    trackingInfo={trackingInfo}
                    onRefresh={handleRefresh}
                    isLoading={isLoading}
                  />
                )
              ) : (
                <>
                  {/* Enhanced Desktop Tracking Timeline */}
                  {trackingInfo?.events ? (
                    <EnhancedDesktopTimeline
                      events={trackingInfo.events}
                      currentStatus={trackingInfo.status}
                      estimatedDelivery={trackingInfo.estimatedDelivery}
                      orderNumber={trackingInfo.orderNumber}
                      order={order}
                      trackingInfo={trackingInfo}
                      onRefresh={handleRefresh}
                    />
                  ) : (
                    <TrackingTimeline
                      events={trackingInfo.events || []}
                      currentStatus={trackingInfo.status}
                      estimatedDelivery={trackingInfo.estimatedDelivery}
                    />
                  )}

                </>
              )}

              {/* Recommendations Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                      Loved your order? Explore more wellness products
                    </h3>
                    <RelatedProducts orderNumber={trackingInfo.orderNumber} />
                    <div className="text-center mt-6">
                      <Link href="/shop">
                        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                          Shop All Products
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
