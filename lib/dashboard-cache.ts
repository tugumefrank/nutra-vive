import { getOrderStats } from "@/lib/actions/orderServerActions";
import { getProductStats } from "@/lib/actions/productServerActions";
import { getConsultationStats } from "@/lib/actions/consultation";
import { getUserStats } from "@/lib/actions/userServerActions";

export interface DashboardData {
  orderStats: Awaited<ReturnType<typeof getOrderStats>>;
  productStats: Awaited<ReturnType<typeof getProductStats>>;
  consultationStats: Awaited<ReturnType<typeof getConsultationStats>>;
  userStats: Awaited<ReturnType<typeof getUserStats>>;
}

// Removed caching - direct data fetch
export async function getDashboardData(): Promise<DashboardData> {
  try {
    console.log("🔄 Fetching dashboard data...");

    const [orderStats, productStats, consultationStats, userStats] =
      await Promise.all([
        getOrderStats().catch((err) => {
          console.error("❌ Order stats error:", err);
          return getDefaultOrderStats();
        }),
        getProductStats().catch((err) => {
          console.error("❌ Product stats error:", err);
          return getDefaultProductStats();
        }),
        getConsultationStats().catch((err) => {
          console.error("❌ Consultation stats error:", err);
          return getDefaultConsultationStats();
        }),
        getUserStats().catch((err) => {
          console.error("❌ User stats error:", err);
          return getDefaultUserStats();
        }),
      ]);

    console.log("✅ Dashboard data fetched successfully");

    return {
      orderStats,
      productStats,
      consultationStats,
      userStats,
    };
  } catch (error) {
    console.error("❌ Error fetching dashboard data:", error);

    // Return default values to prevent crashes
    return {
      orderStats: getDefaultOrderStats(),
      productStats: getDefaultProductStats(),
      consultationStats: getDefaultConsultationStats(),
      userStats: getDefaultUserStats(),
    };
  }
}

// Default fallback data
function getDefaultOrderStats() {
  return {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    refundedOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    recentOrders: [],
    monthlyRevenue: [
      { month: "Jan", revenue: 0, orders: 0 },
      { month: "Feb", revenue: 0, orders: 0 },
      { month: "Mar", revenue: 0, orders: 0 },
      { month: "Apr", revenue: 0, orders: 0 },
      { month: "May", revenue: 0, orders: 0 },
      { month: "Jun", revenue: 0, orders: 0 },
    ],
  };
}

function getDefaultProductStats() {
  return {
    total: 0,
    active: 0,
    inactive: 0,
    featured: 0,
    lowStock: 0,
    outOfStock: 0,
    categories: 0,
  };
}

function getDefaultConsultationStats() {
  return {
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    revenue: 0,
    recentConsultations: 0,
  };
}

function getDefaultUserStats() {
  return {
    total: 0,
    totalUsers: 0,
    totalAdmins: 0,
    recentUsers: 0,
    activeUsers: 0,
  };
}
