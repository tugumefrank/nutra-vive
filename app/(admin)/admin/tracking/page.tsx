// import { Suspense } from "react";
// import { Metadata } from "next";
// import { redirect } from "next/navigation";
// import { auth } from "@clerk/nextjs/server";
// import { Package, Truck, MapPin, TrendingUp, AlertCircle } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";

// import { User } from "@/lib/db/models";
// import { getOrders, getOrderStats } from "@/lib/actions/orderServerActions";
// import { connectToDatabase } from "@/lib/db";
// import AdminTrackingDashboard from "@/components/tracking/admin/AdminTrackingDashboard";

// export const metadata: Metadata = {
//   title: "Order Tracking Management | Nutra-Vive Admin",
//   description: "Manage and monitor order tracking for all customer orders",
// };

// // Loading component for Suspense
// function TrackingPageSkeleton() {
//   return (
//     <div className="space-y-6">
//       {/* Header Skeleton */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div className="space-y-2">
//           <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
//           <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
//         </div>
//         <div className="flex space-x-3">
//           <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
//           <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
//         </div>
//       </div>

//       {/* Stats Cards Skeleton */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         {[1, 2, 3, 4].map((i) => (
//           <Card key={i}>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div className="space-y-2">
//                   <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
//                   <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
//                 </div>
//                 <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Dashboard Skeleton */}
//       <Card>
//         <CardContent className="p-6">
//           <div className="space-y-4">
//             <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
//             <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// // Server Component for fetching data
// async function TrackingPageContent() {
//   // Check authentication and admin access
//   const { userId } = await auth();
//   if (!userId) {
//     redirect("/sign-in");
//   }

//   await connectToDatabase();
//   const user = await User.findOne({ clerkId: userId });

//   if (!user || user.role !== "admin") {
//     redirect("/");
//   }

//   // Fetch initial data
//   const [ordersResult, statsResult] = await Promise.all([
//     getOrders({
//       page: 1,
//       limit: 50,
//       sortBy: "createdAt",
//       sortOrder: "desc",
//     }),
//     getOrderStats(),
//   ]);

//   const orders = ordersResult.orders || [];
//   const stats = statsResult || {
//     totalOrders: 0,
//     totalRevenue: 0,
//     pendingOrders: 0,
//     processingOrders: 0,
//     shippedOrders: 0,
//     deliveredOrders: 0,
//   };

//   // Calculate tracking-specific stats
//   const trackingStats = {
//     totalOrders: stats.totalOrders,
//     inTransit: stats.shippedOrders,
//     delivered: stats.deliveredOrders,
//     pending: stats.pendingOrders + stats.processingOrders,
//     needsAttention: orders.filter(
//       (o) => !o.trackingNumber && ["processing", "shipped"].includes(o.status)
//     ).length,
//   };

//   const handleOrderSelect = (order: any) => {
//     // This would be handled client-side
//     console.log("Selected order:", order);
//   };

//   const handleBulkAction = (action: string, orderIds: string[]) => {
//     // This would be handled client-side
//     console.log("Bulk action:", action, orderIds);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Page Header */}
//         <div className="mb-8">
//           <div className="flex items-center space-x-3 mb-4">
//             <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
//               <Package className="w-5 h-5 text-white" />
//             </div>
//             <div>
//               <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
//                 Tracking Management
//               </h1>
//               <p className="text-gray-600 dark:text-gray-400">
//                 Monitor and manage order tracking for all shipments
//               </p>
//             </div>
//           </div>

//           {/* Quick Stats Summary */}
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//             <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-lg">
//               <CardContent className="p-4 text-center">
//                 <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg mx-auto mb-2">
//                   <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//                 </div>
//                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {trackingStats.totalOrders}
//                 </p>
//                 <p className="text-xs text-gray-600 dark:text-gray-400">
//                   Total Orders
//                 </p>
//               </CardContent>
//             </Card>

//             <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-lg">
//               <CardContent className="p-4 text-center">
//                 <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg mx-auto mb-2">
//                   <Truck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
//                 </div>
//                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {trackingStats.inTransit}
//                 </p>
//                 <p className="text-xs text-gray-600 dark:text-gray-400">
//                   In Transit
//                 </p>
//               </CardContent>
//             </Card>

//             <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-lg">
//               <CardContent className="p-4 text-center">
//                 <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg mx-auto mb-2">
//                   <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
//                 </div>
//                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {trackingStats.delivered}
//                 </p>
//                 <p className="text-xs text-gray-600 dark:text-gray-400">
//                   Delivered
//                 </p>
//               </CardContent>
//             </Card>

//             <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-lg">
//               <CardContent className="p-4 text-center">
//                 <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg mx-auto mb-2">
//                   <TrendingUp className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
//                 </div>
//                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {trackingStats.pending}
//                 </p>
//                 <p className="text-xs text-gray-600 dark:text-gray-400">
//                   Pending
//                 </p>
//               </CardContent>
//             </Card>

//             <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-lg">
//               <CardContent className="p-4 text-center">
//                 <div className="flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg mx-auto mb-2">
//                   <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
//                 </div>
//                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {trackingStats.needsAttention}
//                 </p>
//                 <p className="text-xs text-gray-600 dark:text-gray-400">
//                   Need Tracking
//                   {trackingStats.needsAttention > 0 && (
//                     <Badge variant="destructive" className="ml-1 text-xs px-1">
//                       !
//                     </Badge>
//                   )}
//                 </p>
//               </CardContent>
//             </Card>
//           </div>
//         </div>

//         {/* Main Dashboard */}
//         <AdminTrackingDashboard
//           initialOrders={orders}
//           onOrderSelect={handleOrderSelect}
//           onBulkAction={handleBulkAction}
//         />
//       </div>
//     </div>
//   );
// }

// // Main Page Component
// export default function AdminTrackingPage() {
//   return (
//     <Suspense fallback={<TrackingPageSkeleton />}>
//       <TrackingPageContent />
//     </Suspense>
//   );
// }

// // Export revalidate for ISR (optional)
// export const revalidate = 300; // Revalidate every 5 minutes
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
