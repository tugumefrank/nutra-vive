import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton"; // Ensure Skeleton is imported for the fallback

// Import server actions and utilities
import { getUserOrders } from "@/lib/actions/orderServerActions";
import {
  serializeOrders,
  SerializedOrder,
  safeSerialize,
} from "@/lib/utils/serialization";

// Import the new Client Component
import { OrdersClientContent } from "./components/OrdersClientContent"; // Adjusted import path

// Types for the page data
interface OrdersPageData {
  orders: SerializedOrder[];
  stats: {
    total: number;
    delivered: number;
    pending: number;
    shipped: number;
    totalSpent: number;
  };
  success: boolean;
  error?: string;
}

// Server function to fetch and serialize data
async function getOrdersPageData(): Promise<OrdersPageData> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  try {
    const ordersResult = await getUserOrders();

    if (!ordersResult.success) {
      return {
        orders: [],
        stats: {
          total: 0,
          delivered: 0,
          pending: 0,
          shipped: 0,
          totalSpent: 0,
        },
        success: false,
        error: ordersResult.error || "Failed to fetch orders",
      };
    }

    const rawOrders = ordersResult.orders || [];

    // Safely serialize the orders
    const orders = safeSerialize(
      rawOrders,
      serializeOrders,
      [] as SerializedOrder[]
    );

    // Calculate stats from serialized data
    const stats = {
      total: orders.length,
      delivered: orders.filter((order) => order.status === "delivered").length,
      pending: orders.filter(
        (order) => order.status === "pending" || order.status === "processing"
      ).length,
      shipped: orders.filter((order) => order.status === "shipped").length,
      totalSpent: orders
        .filter((order) => order.paymentStatus === "paid")
        .reduce((sum, order) => sum + order.totalAmount, 0),
    };

    return {
      orders,
      stats,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching orders page data:", error);
    return {
      orders: [],
      stats: { total: 0, delivered: 0, pending: 0, shipped: 0, totalSpent: 0 },
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

// Server component wrapper
async function OrdersData() {
  const data = await getOrdersPageData();
  // Pass the data to the Client Component
  return <OrdersClientContent data={data} />;
}

// Enhanced loading skeleton (remains a Server Component)
function OrdersSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-24 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div>
        <Skeleton className="h-16 rounded-lg" />
      </div>

      {/* List Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-40 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersSkeleton />}>
      <OrdersData />
    </Suspense>
  );
}
