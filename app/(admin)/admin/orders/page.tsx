import { Suspense } from "react";
import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getOrders, getOrderStats } from "@/lib/actions/orderServerActions";
import { OrdersList } from "@/components/admin/orders/OrdersList";
import { OrderStats } from "@/components/admin/orders/OrderStats";
import { OrderFilters } from "@/components/admin/orders/OrderFilters";
import { OrderExport } from "@/components/admin/orders/OrderExport";
import { PageHeader } from "@/components/admin/orders/PageHeader";
import { LoadingSpinner } from "@/components/admin/orders/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  TrendingUp,
  Filter,
  Download,
  RefreshCw,
  Plus,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Order Management | Nutra-Vive Admin",
  description: "Manage customer orders, track shipments, and process payments",
};

interface OrdersPageProps {
  searchParams: {
    status?: string;
    paymentStatus?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
    tab?: string;
  };
}

async function OrdersContent({ searchParams }: OrdersPageProps) {
  // Get filters from search params
  const filters = {
    status: searchParams.status,
    paymentStatus: searchParams.paymentStatus,
    search: searchParams.search,
    dateFrom: searchParams.dateFrom,
    dateTo: searchParams.dateTo,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
  };

  // Fetch orders and stats in parallel
  const [ordersResult, statsResult] = await Promise.all([
    getOrders(filters),
    getOrderStats(),
  ]);

  const activeTab = searchParams.tab || "all";

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
            <div className="flex flex-col sm:flex-row gap-3">
              <OrderExport />
              <Button
                variant="outline"
                size="sm"
                className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Order
              </Button>
            </div>
          </PageHeader>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Statistics Cards with 3D Effect */}
        <div className="w-full">
          <OrderStats stats={statsResult} />
        </div>

        {/* Main Content Area */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <Tabs value={activeTab} className="w-full">
              {/* Tab Navigation with Modern Design */}
              <div className="border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-sm">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between p-4 lg:p-6 gap-4">
                  <div className="overflow-x-auto">
                    <TabsList className="grid w-full min-w-max grid-cols-5 gap-1 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm p-1">
                      <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">All Orders</span>
                        <span className="sm:hidden">All</span>
                        <Badge
                          variant="secondary"
                          className="ml-2 bg-slate-200 dark:bg-slate-600 text-xs"
                        >
                          {statsResult.totalOrders}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger
                        value="pending"
                        className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">Pending</span>
                        <span className="sm:hidden">Pend</span>
                        <Badge
                          variant="secondary"
                          className="ml-1 sm:ml-2 bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 text-xs"
                        >
                          {statsResult.pendingOrders}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger
                        value="processing"
                        className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">Processing</span>
                        <span className="sm:hidden">Proc</span>
                        <Badge
                          variant="secondary"
                          className="ml-1 sm:ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs"
                        >
                          {statsResult.processingOrders}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger
                        value="shipped"
                        className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">Shipped</span>
                        <span className="sm:hidden">Ship</span>
                        <Badge
                          variant="secondary"
                          className="ml-1 sm:ml-2 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 text-xs"
                        >
                          {statsResult.shippedOrders}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger
                        value="delivered"
                        className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">Delivered</span>
                        <span className="sm:hidden">Del</span>
                        <Badge
                          variant="secondary"
                          className="ml-1 sm:ml-2 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs"
                        >
                          {statsResult.deliveredOrders}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Filters */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-1 min-w-0">
                      <OrderFilters currentFilters={filters} />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden lg:flex"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      More Filters
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-4 lg:p-6">
                <TabsContent value="all" className="mt-0">
                  <OrdersList
                    orders={ordersResult.orders}
                    pagination={ordersResult.pagination}
                    error={ordersResult.error}
                  />
                </TabsContent>

                <TabsContent value="pending" className="mt-0">
                  <OrdersList
                    orders={ordersResult.orders.filter(
                      (order) => order.status === "pending"
                    )}
                    pagination={ordersResult.pagination}
                    error={ordersResult.error}
                  />
                </TabsContent>

                <TabsContent value="processing" className="mt-0">
                  <OrdersList
                    orders={ordersResult.orders.filter(
                      (order) => order.status === "processing"
                    )}
                    pagination={ordersResult.pagination}
                    error={ordersResult.error}
                  />
                </TabsContent>

                <TabsContent value="shipped" className="mt-0">
                  <OrdersList
                    orders={ordersResult.orders.filter(
                      (order) => order.status === "shipped"
                    )}
                    pagination={ordersResult.pagination}
                    error={ordersResult.error}
                  />
                </TabsContent>

                <TabsContent value="delivered" className="mt-0">
                  <OrdersList
                    orders={ordersResult.orders.filter(
                      (order) => order.status === "delivered"
                    )}
                    pagination={ordersResult.pagination}
                    error={ordersResult.error}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions Floating Panel - Mobile */}
        <div className="fixed bottom-20 right-4 lg:hidden z-50">
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
