// import { Suspense } from "react";
// import { Metadata } from "next";
// import { auth } from "@clerk/nextjs/server";
// import { redirect, notFound } from "next/navigation";
// import Link from "next/link";

// import { getOrder } from "@/lib/actions/orderServerActions";
// import { OrderDetails } from "@/components/admin/orders/OrderDetails";
// import { LoadingSpinner } from "@/components/admin/orders/loading-spinner";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import { ArrowLeft, Download, Printer, Share, AlertCircle } from "lucide-react";

// interface OrderDetailPageProps {
//   params: {
//     id: string;
//   };
// }

// export async function generateMetadata({
//   params,
// }: OrderDetailPageProps): Promise<Metadata> {
//   const { order } = await getOrder(params.id);

//   if (!order) {
//     return {
//       title: "Order Not Found | Nutra-Vive Admin",
//       description: "The requested order could not be found.",
//     };
//   }

//   return {
//     title: `Order ${order.orderNumber} | Nutra-Vive Admin`,
//     description: `Order details for ${order.orderNumber} - ${order.shippingAddress?.firstName ?? ""} ${order.shippingAddress?.lastName ?? ""}`,
//   };
// }

// async function OrderDetailContent({ orderId }: { orderId: string }) {
//   const { order, error } = await getOrder(orderId);

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
//         <div className="container mx-auto px-4 py-8">
//           <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
//             <CardContent className="p-8 text-center">
//               <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
//               <h1 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-4">
//                 Error Loading Order
//               </h1>
//               <p className="text-red-700 dark:text-red-300 mb-6">{error}</p>
//               <div className="flex gap-3 justify-center">
//                 <Button variant="outline" asChild>
//                   <Link href="/admin/orders">
//                     <ArrowLeft className="h-4 w-4 mr-2" />
//                     Back to Orders
//                   </Link>
//                 </Button>
//                 <Button onClick={() => window.location.reload()}>
//                   Try Again
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     );
//   }

//   if (!order) {
//     notFound();
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
//       {/* Hero Section with Glassmorphism */}
//       <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 dark:from-emerald-500/5 dark:via-teal-500/5 dark:to-green-500/5">
//         <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"></div>
//         <div className="relative">
//           <div className="container mx-auto px-4 py-8">
//             <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
//               {/* Navigation & Title */}
//               <div className="space-y-4">
//                 <div className="flex items-center gap-3">
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     asChild
//                     className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/20"
//                   >
//                     <Link href="/admin/orders">
//                       <ArrowLeft className="h-4 w-4 mr-2" />
//                       Back to Orders
//                     </Link>
//                   </Button>
//                   <Badge
//                     variant="secondary"
//                     className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
//                   >
//                     Order Details
//                   </Badge>
//                 </div>

//                 <div>
//                   <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">
//                     Order {order.orderNumber}
//                   </h1>
//                   <p className="text-slate-600 dark:text-slate-400 mt-2">
//                     Manage and track order details, customer information, and
//                     fulfillment status
//                   </p>
//                 </div>
//               </div>

//               {/* Quick Actions */}
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/20 gap-2"
//                 >
//                   <Share className="h-4 w-4" />
//                   Share
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/20 gap-2"
//                 >
//                   <Printer className="h-4 w-4" />
//                   Print Invoice
//                 </Button>
//                 <Button
//                   size="sm"
//                   className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg gap-2"
//                 >
//                   <Download className="h-4 w-4" />
//                   Download PDF
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="container mx-auto px-4 py-8">
//         <OrderDetails order={order} />
//       </div>

//       {/* Floating Action Button - Mobile */}
//       <div className="fixed bottom-20 right-4 lg:hidden">
//         <div className="flex flex-col gap-2">
//           <Button
//             size="sm"
//             className="rounded-full h-12 w-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
//           >
//             <Download className="h-5 w-5" />
//           </Button>
//           <Button
//             size="sm"
//             variant="outline"
//             className="rounded-full h-12 w-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-lg"
//           >
//             <Printer className="h-5 w-5" />
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default async function OrderDetailPage({
//   params,
// }: OrderDetailPageProps) {
//   const { userId } = await auth();

//   if (!userId) {
//     redirect("/sign-in");
//   }

//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
//           <div className="container mx-auto px-4 py-8">
//             {/* Header Skeleton */}
//             <div className="space-y-4 mb-8">
//               <div className="flex items-center gap-3">
//                 <div className="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
//                 <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
//               </div>
//               <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
//               <div className="h-5 w-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
//             </div>

//             {/* Content Skeleton */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               <div className="lg:col-span-2 space-y-6">
//                 <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
//                 <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
//               </div>
//               <div className="space-y-6">
//                 <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
//                 <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
//                 <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
//               </div>
//             </div>
//           </div>
//         </div>
//       }
//     >
//       <OrderDetailContent orderId={params.id} />
//     </Suspense>
//   );
// }
import { Suspense } from "react";
import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

import { getOrder } from "@/lib/actions/orderServerActions";
import { OrderDetails } from "@/components/admin/orders/OrderDetails";
import { LoadingSpinner } from "@/components/admin/orders/loading-spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Printer, Share, AlertCircle } from "lucide-react";

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const { order } = await getOrder(id);

  if (!order) {
    return {
      title: "Order Not Found | Nutra-Vive Admin",
      description: "The requested order could not be found.",
    };
  }

  return {
    title: `Order ${order.orderNumber} | Nutra-Vive Admin`,
    description: `Order details for ${order.orderNumber} - ${order.shippingAddress?.firstName ?? ""} ${order.shippingAddress?.lastName ?? ""}`,
  };
}

async function OrderDetailContent({ orderId }: { orderId: string }) {
  const { order, error } = await getOrder(orderId);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4 py-8">
          <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-4">
                Error Loading Order
              </h1>
              <p className="text-red-700 dark:text-red-300 mb-6">{error}</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/admin/orders">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Orders
                  </Link>
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section with Glassmorphism */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 dark:from-emerald-500/5 dark:via-teal-500/5 dark:to-green-500/5">
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"></div>
        <div className="relative">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Navigation & Title */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/20"
                  >
                    <Link href="/admin/orders">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Orders
                    </Link>
                  </Button>
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
                  >
                    Order Details
                  </Badge>
                </div>

                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">
                    Order {order.orderNumber}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    Manage and track order details, customer information, and
                    fulfillment status
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/20 gap-2"
                >
                  <Share className="h-4 w-4" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/20 gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print Invoice
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <OrderDetails order={order} />
      </div>

      {/* Floating Action Button - Mobile */}
      <div className="fixed bottom-20 right-4 lg:hidden">
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            className="rounded-full h-12 w-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
          >
            <Download className="h-5 w-5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full h-12 w-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-lg"
          >
            <Printer className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <div className="container mx-auto px-4 py-8">
            {/* Header Skeleton */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
              <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-5 w-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <OrderDetailContent orderId={id} />
    </Suspense>
  );
}
