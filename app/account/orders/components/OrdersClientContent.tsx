"use client"; // IMPORTANT: Mark this file as a Client Component

import { useState } from "react"; // Example: if you add state later
import { motion } from "framer-motion";
import { Download, RefreshCw, ShoppingBag, Search } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link"; // Link from next/link is fine in client components

// Make sure to import your SerializedOrder type if it's external
import { SerializedOrder } from "@/lib/utils/serialization"; // Adjust path if needed

import { OrderCard, OrderStats } from "./OrderComponents"; // Adjust path if needed
import { EmptyState } from "../../components/Consultationscomponents"; // Adjust path if needed

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

interface OrdersContentProps {
  data: OrdersPageData;
}

export function OrdersClientContent({ data }: OrdersContentProps) {
  const { orders, stats, success, error } = data;

  // You can now add client-side state/effects here if needed
  // const [searchTerm, setSearchTerm] = useState('');

  // Handle error state
  if (!success) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Unable to Load Orders
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm mb-4">
              {error || "An error occurred while loading your orders."}
            </p>
            <Button
              onClick={() => window.location.reload()} // This onClick is now fine
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Order History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage all your orders
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="glass-effect">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="glass-effect"
            onClick={() => window.location.reload()} // This onClick is now fine
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link href="/shop">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div>
        <OrderStats
          total={stats.total}
          delivered={stats.delivered}
          pending={stats.pending}
          shipped={stats.shipped}
          totalSpent={stats.totalSpent}
        />
      </div>

      {/* Filters */}
      <div>
        <Card className="glass-effect border-green-200/50 dark:border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search orders by number or product..."
                    className="pl-10 glass-input"
                    // Add onChange handler if you want interactive search
                  />
                </div>
              </div>

              <Select>
                <SelectTrigger className="w-full md:w-40 glass-input">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-full md:w-40 glass-input">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-full md:w-40 glass-input">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount-high">
                    Amount: High to Low
                  </SelectItem>
                  <SelectItem value="amount-low">
                    Amount: Low to High
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div>
          <EmptyState
            title="No orders yet"
            description="Start shopping to see your orders here. Discover our range of organic juices and wellness products."
            actionLabel="Start Shopping"
            actionHref="/shop"
            icon="📦"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <div
              key={order._id}
              className="transform hover:scale-[1.01] transition-transform duration-200"
            >
              <OrderCard order={order} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {orders.length > 10 && (
        <div className="flex items-center justify-center pt-6">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="glass-effect"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400 px-4">
              Page 1 of 1
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="glass-effect"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div>
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-blue-200/50 dark:border-blue-700/50 overflow-hidden">
          <CardContent className="p-6 relative">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-green-100/30 dark:from-blue-900/10 dark:to-green-900/10" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Need Help with Your Order?
                </h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Our customer service team is ready to assist you with any
                  questions about your orders.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/30"
                >
                  Contact Support
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/30"
                >
                  <Link href="/account/tracking">Track Orders</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
