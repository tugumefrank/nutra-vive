import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import {
  Truck,
  Search,
  Package,
  Clock,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ArrowRight,
  Calendar,
  Info,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

// Import server actions
import { getUserOrders } from "@/lib/actions/orderServerActions";
import {
  RecentShipments,
  TrackingForm,
  TrackingWidget,
} from "./components/TrackingComponents";

// Component imports

async function TrackingData() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const ordersResult = await getUserOrders();
  const orders = ordersResult?.orders || [];

  // Filter orders that have tracking info
  const trackableOrders = orders.filter(
    (order) =>
      order.trackingNumber &&
      (order.status === "shipped" || order.status === "delivered")
  );

  const activeShipments = trackableOrders.filter(
    (order) => order.status === "shipped"
  );
  const recentDeliveries = orders
    .filter((order) => order.status === "delivered")
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Track Your Orders 📦</h1>
            <p className="text-blue-100">
              Stay updated on your wellness journey deliveries
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Truck className="w-10 h-10" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <p className="text-2xl font-bold">{activeShipments.length}</p>
            <p className="text-xs text-blue-100">In Transit</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{recentDeliveries.length}</p>
            <p className="text-xs text-blue-100">Delivered</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{trackableOrders.length}</p>
            <p className="text-xs text-blue-100">Total Tracked</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {Math.round(
                (recentDeliveries.length /
                  Math.max(trackableOrders.length, 1)) *
                  100
              )}
              %
            </p>
            <p className="text-xs text-blue-100">Success Rate</p>
          </div>
        </div>
      </div>

      {/* Track New Order */}
      <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-green-600" />
            <span>Track a New Order</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TrackingForm />
        </CardContent>
      </Card>

      {/* Active Shipments */}
      {activeShipments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Active Shipments
          </h2>
          <div className="grid gap-4">
            {activeShipments.map((order) => (
              <div>
                <TrackingWidget order={order} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Shipments */}
      <RecentShipments orders={trackableOrders.slice(0, 5)} />

      {/* Shipping Info */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Delivery Information */}
        <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-green-600" />
              <span>Delivery Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Standard Delivery</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    3-5 business days • Free on orders over $25
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Truck className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Express Delivery</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    1-2 business days • $9.99 shipping fee
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Local Pickup</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Same day pickup available • Free
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>• Orders placed before 2 PM ship same day</p>
              <p>• Tracking information provided within 24 hours</p>
              <p>• Contactless delivery available upon request</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-green-600" />
              <span>Need Help?</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Can't find your tracking information or have questions about your
              delivery?
            </p>

            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                Call Support: 1-800-NUTRA-VIVE
              </Button>

              <Button className="w-full justify-start" variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Email: support@nutraviveholistic.com
              </Button>

              <Button
                asChild
                className="w-full justify-start"
                variant="outline"
              >
                <Link href="/track" target="_blank">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Advanced Tracking Portal
                </Link>
              </Button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>Pro Tip:</strong> Save your tracking numbers for quick
                access. You can also track by order number if you don't have the
                tracking number.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200/50 dark:border-green-700/50">
        <CardContent className="p-6">
          <h3 className="font-semibold text-green-900 dark:text-green-100 mb-4">
            Frequently Asked Questions
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-1">
                  When will I receive tracking information?
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  You'll receive tracking information within 24 hours of your
                  order being shipped.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-1">
                  Can I change my delivery address?
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Contact us immediately if you need to change your delivery
                  address before shipping.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-1">
                  What if my package is delayed?
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  We'll notify you of any delays and provide updated delivery
                  estimates.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-1">
                  Do you offer weekend delivery?
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Weekend delivery is available for express orders in select
                  areas.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TrackingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <Skeleton className="h-48 w-full rounded-2xl" />

      {/* Track Form Skeleton */}
      <Skeleton className="h-32 w-full rounded-lg" />

      {/* Shipments Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>

      {/* Info Cards Skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<TrackingSkeleton />}>
      <TrackingData />
    </Suspense>
  );
}
