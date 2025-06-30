import { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Package, Truck, MapPin, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdminTrackingDashboard from "@/components/tracking/admin/AdminTrackingDashboard";
import { User } from "@/lib/db/models";
import { getOrders, getOrderStats } from "@/lib/actions/orderServerActions";
import { connectToDatabase } from "@/lib/db";

export const metadata: Metadata = {
  title: "Order Tracking Management | Nutra-Vive Admin",
  description: "Manage and monitor order tracking for all customer orders",
};

// Loading component for Suspense
function TrackingPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="flex space-x-3">
          <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dashboard Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Server Component for fetching data
async function TrackingPageContent() {
  // Check authentication and admin access
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  await connectToDatabase();
  const user = await User.findOne({ clerkId: userId });

  //   if (!user || user.role !== "admin") {
  //     redirect("/");
  //   }

  // Fetch initial data
  const [ordersResult, statsResult] = await Promise.all([
    getOrders({
      page: 1,
      limit: 50,
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
    getOrderStats(),
  ]);

  const orders = ordersResult.orders || [];
  const stats = statsResult || {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
  };

  // Calculate tracking-specific stats
  const trackingStats = {
    totalOrders: stats.totalOrders,
    inTransit: stats.shippedOrders,
    delivered: stats.deliveredOrders,
    pending: stats.pendingOrders + stats.processingOrders,
    needsAttention: orders.filter(
      (o) => !o.trackingNumber && ["processing", "shipped"].includes(o.status)
    ).length,
  };

  return <AdminTrackingDashboard initialOrders={orders} />;
}

// Main Page Component
export default function AdminTrackingPage() {
  return (
    <Suspense fallback={<TrackingPageSkeleton />}>
      <TrackingPageContent />
    </Suspense>
  );
}

// Export revalidate for ISR (optional)
export const revalidate = 300; // Revalidate every 5 minutes
