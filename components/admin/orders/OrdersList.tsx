"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

import { IOrder } from "@/lib/db/models";
import { updateOrderStatus } from "@/lib/actions/orderServerActions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Pagination } from "@/components/admin/orders/pagination";
import { OrderStatusBadge, PaymentStatusBadge } from "./OrderStatusBadge";
import { OrderActions } from "./OrderActions";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  Search,
  Calendar,
} from "lucide-react";

interface OrdersListProps {
  orders: IOrder[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  error?: string;
}

export function OrdersList({ orders, pagination, error }: OrdersListProps) {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders((prev) => [...prev, orderId]);
    } else {
      setSelectedOrders((prev) => prev.filter((id) => id !== orderId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map((order) => order._id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleQuickStatusUpdate = async (orderId: string, status: string) => {
    setIsUpdating(orderId);
    try {
      const result = await updateOrderStatus(
        orderId,
        status as
          | "pending"
          | "processing"
          | "shipped"
          | "delivered"
          | "cancelled"
          | "refunded"
      );

      if (result.success) {
        toast.success(`Order status updated to ${status}`);
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update order status");
    } finally {
      setIsUpdating(null);
    }
  };

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardContent className="p-6 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Error Loading Orders
          </h3>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-12 text-center">
          <Package className="h-16 w-16 text-slate-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No Orders Found
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            No orders match your current filters. Try adjusting your search
            criteria.
          </p>
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="font-medium text-emerald-900 dark:text-emerald-100">
                  {selectedOrders.length} order
                  {selectedOrders.length > 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  Mark as Processing
                </Button>
                <Button size="sm" variant="outline">
                  Mark as Shipped
                </Button>
                <Button size="sm" variant="outline">
                  Export Selected
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedOrders([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orders Table - Desktop */}
      <div className="hidden lg:block">
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedOrders.length === orders.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-2">
                    Order
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Payment</TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-2">
                    Total
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-2">
                    Date
                    <Calendar className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, index) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedOrders.includes(order._id)}
                      onCheckedChange={(checked) =>
                        handleSelectOrder(order._id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                      >
                        {order.orderNumber}
                      </Link>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {order.items.length} item
                        {order.items.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-400 text-white text-xs">
                          {order.shippingAddress.firstName[0]}
                          {order.shippingAddress.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {order.shippingAddress.firstName}{" "}
                          {order.shippingAddress.lastName}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {order.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <OrderStatusBadge status={order.status} />
                      {order.status === "shipped" && order.trackingNumber && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Tracking: {order.trackingNumber}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </TableCell>
                  <TableCell>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {order.currency.toUpperCase()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">
                        {format(new Date(order.createdAt), "MMM dd")}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        {format(new Date(order.createdAt), "yyyy")}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isUpdating === order._id}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/orders/${order._id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {order.status === "pending" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleQuickStatusUpdate(order._id, "processing")
                            }
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Mark as Processing
                          </DropdownMenuItem>
                        )}
                        {order.status === "processing" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleQuickStatusUpdate(order._id, "shipped")
                            }
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            Mark as Shipped
                          </DropdownMenuItem>
                        )}
                        {order.status === "shipped" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleQuickStatusUpdate(order._id, "delivered")
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Delivered
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Orders Cards - Mobile */}
      <div className="lg:hidden space-y-4">
        {orders.map((order, index) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedOrders.includes(order._id)}
                        onCheckedChange={(checked) =>
                          handleSelectOrder(order._id, checked as boolean)
                        }
                      />
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="font-semibold text-emerald-600 dark:text-emerald-400"
                      >
                        {order.orderNumber}
                      </Link>
                    </div>
                    <OrderActions
                      orderId={order._id}
                      currentStatus={order.status}
                    />
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-400 text-white">
                        {order.shippingAddress.firstName[0]}
                        {order.shippingAddress.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">
                        {order.shippingAddress.firstName}{" "}
                        {order.shippingAddress.lastName}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {order.email}
                      </p>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Status
                      </p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Payment
                      </p>
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                    <div>
                      <p className="text-lg font-semibold">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {order.items.length} item
                        {order.items.length > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {format(new Date(order.createdAt), "MMM dd, yyyy")}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {format(new Date(order.createdAt), "h:mm a")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center pt-6">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
        />
      </div>
    </div>
  );
}
