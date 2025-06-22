import { Suspense } from "react";
import { Metadata } from "next";
import DashboardHeader from "./components/DashboardHeader";
import StatsGrid from "./components/StatsGrid";
import RevenueChart from "./components/RevenueChart";
import OrdersChart from "./components/OrdersChart";
import TopProductsCard from "./components/TopProductsCard";
import RecentOrdersCard from "./components/RecentOrdersCard";
import ConsultationsCard from "./components/ConsultationsCard";
import LowStockAlert from "./components/LowStockAlert";
import QuickActions from "./components/QuickActions";
import { getDashboardData } from "@/lib/dashboard-cache";
import DashboardSkeleton from "./loading";

export const metadata: Metadata = {
  title: "Dashboard Overview | Nutra-Vive Admin",
  description: "Complete overview of your business metrics and performance",
};

export default async function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20 dark:from-slate-950 dark:via-green-950/30 dark:to-emerald-950/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <DashboardHeader />

        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </div>
    </div>
  );
}

async function DashboardContent() {
  // Direct data fetching without caching to avoid auth issues
  const data = await getDashboardData();

  return (
    <>
      {/* Stats Grid */}
      <StatsGrid data={data} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          <RevenueChart data={data.orderStats.monthlyRevenue} />
          <OrdersChart data={data.orderStats} />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-8">
          <QuickActions />
          <ConsultationsCard data={data.consultationStats} />
          <LowStockAlert data={data.productStats} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TopProductsCard data={data.orderStats.topProducts} />
        <RecentOrdersCard data={data.orderStats.recentOrders} />
      </div>
    </>
  );
}
