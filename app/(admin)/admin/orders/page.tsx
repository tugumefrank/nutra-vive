import { Suspense } from "react";
import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import Link from "next/link";

import { getOrders, getOrderStats } from "@/lib/actions/orderServerActions";
import { OrdersList } from "@/components/admin/orders/OrdersList";
import { OrderStats } from "@/components/admin/orders/OrderStats";
import { OrderFilters } from "@/components/admin/orders/OrderFilters";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/orders/PageHeader";
import { OrderExport } from "@/components/admin/orders/OrderExport";
import { LoadingSpinner } from "@/components/admin/orders/loading-spinner";
import { Button } from "@/components/ui/button";
import {
  Package,
  RefreshCw,
  Plus,
  Filter,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Order Management | Nutra-Vive Admin",
  description: "Manage customer orders, track shipments, and process payments",
};

// Cached version of getOrders - cache all orders for 60 seconds
const getCachedOrders = unstable_cache(
  async (filters: any) => {
    // Fetch all orders without status filter and without pagination for caching
    const { status, page, ...filtersWithoutStatusAndPage } = filters;
    return getOrders({ ...filtersWithoutStatusAndPage, limit: 1000 }); // Get more orders for client-side filtering
  },
  ["all-orders"],
  {
    revalidate: 60, // Cache for 60 seconds
    tags: ["orders"], // Tag for revalidation
  }
);

// Cached version of getOrderStats
const getCachedOrderStats = unstable_cache(
  async () => {
    return getOrderStats();
  },
  ["order-stats"],
  {
    revalidate: 300, // Cache for 5 minutes
    tags: ["orders", "stats"],
  }
);

interface OrdersPageProps {
  searchParams: Promise<{
    status?: string;
    paymentStatus?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
    tab?: string;
  }>;
}

async function OrdersContent({ searchParams }: OrdersPageProps) {
  const activeTab = (await searchParams).tab || "all";
  const currentPage = parseInt((await searchParams).page ?? "1");
  const itemsPerPage = 20;
  
  // Get filters from search params (excluding status for caching)
  const filters = {
    paymentStatus: (await searchParams).paymentStatus,
    search: (await searchParams).search,
    dateFrom: (await searchParams).dateFrom,
    dateTo: (await searchParams).dateTo,
    page: currentPage,
  };

  // Fetch cached data in parallel
  const [ordersResult, statsResult] = await Promise.all([
    getCachedOrders(filters),
    getCachedOrderStats(),
  ]);

  // Filter orders client-side based on active tab
  const filteredOrders = activeTab === "all" 
    ? ordersResult.orders 
    : ordersResult.orders.filter((order) => order.status === activeTab);

  // Implement client-side pagination
  const totalFilteredOrders = filteredOrders.length;
  const totalPages = Math.ceil(totalFilteredOrders / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Create pagination object for the filtered results
  const paginationInfo = {
    total: totalFilteredOrders,
    totalPages,
    currentPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section with Glassmorphism */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 dark:from-emerald-500/5 dark:via-teal-500/5 dark:to-green-500/5">
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"></div>
        <div className="relative">
          <PageHeader
            title="Order Management"
            description="Monitor, process, and track customer orders in real-time"
            icon={
              <Package className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            }
          >
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="order-2 sm:order-1">
                <OrderExport />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/20 order-3 sm:order-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg order-1 sm:order-3"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Order
              </Button>
            </div>
          </PageHeader>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* Statistics Cards with 3D Effect */}
        <div className="w-full">
          <OrderStats stats={statsResult} />
        </div>

        {/* Main Content Area */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-0">
              {/* Tab Navigation with Modern Design */}
              <div className="border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-3 lg:p-6 gap-3 lg:gap-4">
                  <div className="overflow-x-auto scrollbar-hide">
                    <div className="grid w-full min-w-max grid-cols-5 gap-1 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm p-1 rounded-md">
                      <Link
                        href="/admin/orders?tab=all&page=1"
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                          activeTab === "all" 
                            ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" 
                            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        }`}
                      >
                        <span className="hidden sm:inline">All Orders</span>
                        <span className="sm:hidden">All</span>
                        <Badge
                          variant="secondary"
                          className="ml-2 bg-slate-200 dark:bg-slate-600 text-xs"
                        >
                          {statsResult.totalOrders}
                        </Badge>
                      </Link>
                      <Link
                        href="/admin/orders?tab=pending&page=1"
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                          activeTab === "pending" 
                            ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" 
                            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        }`}
                      >
                        <span className="hidden sm:inline">Pending</span>
                        <span className="sm:hidden">Pend</span>
                        <Badge
                          variant="secondary"
                          className="ml-1 sm:ml-2 bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 text-xs"
                        >
                          {statsResult.pendingOrders}
                        </Badge>
                      </Link>
                      <Link
                        href="/admin/orders?tab=processing&page=1"
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                          activeTab === "processing" 
                            ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" 
                            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        }`}
                      >
                        <span className="hidden sm:inline">Processing</span>
                        <span className="sm:hidden">Proc</span>
                        <Badge
                          variant="secondary"
                          className="ml-1 sm:ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs"
                        >
                          {statsResult.processingOrders}
                        </Badge>
                      </Link>
                      <Link
                        href="/admin/orders?tab=shipped&page=1"
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                          activeTab === "shipped" 
                            ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" 
                            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        }`}
                      >
                        <span className="hidden sm:inline">Shipped</span>
                        <span className="sm:hidden">Ship</span>
                        <Badge
                          variant="secondary"
                          className="ml-1 sm:ml-2 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 text-xs"
                        >
                          {statsResult.shippedOrders}
                        </Badge>
                      </Link>
                      <Link
                        href="/admin/orders?tab=delivered&page=1"
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                          activeTab === "delivered" 
                            ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" 
                            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        }`}
                      >
                        <span className="hidden sm:inline">Delivered</span>
                        <span className="sm:hidden">Del</span>
                        <Badge
                          variant="secondary"
                          className="ml-1 sm:ml-2 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs"
                        >
                          {statsResult.deliveredOrders}
                        </Badge>
                      </Link>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 min-w-0 overflow-hidden">
                    <div className="flex-1 min-w-0">
                      <OrderFilters currentFilters={filters} />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden sm:flex whitespace-nowrap"
                    >
                      <Filter className="h-4 w-4 sm:mr-2" />
                      <span className="hidden md:inline">More Filters</span>
                      <span className="md:hidden">Filters</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-3 sm:p-4 lg:p-6">
                <OrdersList
                  orders={paginatedOrders}
                  pagination={paginationInfo}
                  error={ordersResult.error}
                />
              </div>
          </CardContent>
        </Card>

        {/* Quick Actions Floating Panel - Mobile */}
        <div className="fixed bottom-20 right-3 sm:right-4 lg:hidden z-50">
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              className="rounded-full h-12 w-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
            >
              <Plus className="h-5 w-5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full h-12 w-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-lg"
            >
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <OrdersContent searchParams={searchParams} />
    </Suspense>
  );
}
