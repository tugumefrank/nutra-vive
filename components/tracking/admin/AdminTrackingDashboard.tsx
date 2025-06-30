"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  MapPin,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  Edit,
  Eye,
  Copy,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import OrderStatusIndicator, {
  PaymentStatusIndicator,
} from "@/components/tracking/OrderStatusIndicator";
import { toast } from "sonner";

interface AdminTrackingDashboardProps {
  initialOrders?: any[];
  onOrderSelect?: (order: any) => void;
  onBulkAction?: (action: string, orderIds: string[]) => void;
}

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminTrackingDashboard({
  initialOrders = [],
  onOrderSelect,
  onBulkAction,
}: AdminTrackingDashboardProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  const mockOrders = [
    {
      _id: "1",
      orderNumber: "NV-000123",
      email: "customer@example.com",
      status: "shipped",
      paymentStatus: "paid",
      totalAmount: 89.99,
      currency: "USD",
      trackingNumber: "1Z999AA1234567890",
      shippingCarrier: "UPS",
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      shippingAddress: {
        firstName: "John",
        lastName: "Doe",
        city: "New York",
        province: "NY",
      },
      items: [{ productName: "Green Detox Juice", quantity: 2, price: 44.99 }],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      shippedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      _id: "2",
      orderNumber: "NV-000124",
      email: "jane@example.com",
      status: "processing",
      paymentStatus: "paid",
      totalAmount: 127.5,
      currency: "USD",
      trackingNumber: null,
      shippingCarrier: null,
      estimatedDelivery: null,
      shippingAddress: {
        firstName: "Jane",
        lastName: "Smith",
        city: "Los Angeles",
        province: "CA",
      },
      items: [{ productName: "Berry Antioxidant", quantity: 3, price: 42.5 }],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      shippedAt: null,
    },
  ];

  useEffect(() => {
    if (initialOrders.length === 0) {
      setOrders(mockOrders);
    }
  }, [initialOrders]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((order) => order._id));
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedOrders.length === 0) {
      toast("no oders selected");
      return;
    }

    onBulkAction?.(action, selectedOrders);
    setSelectedOrders([]);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("copied");
    } catch (err) {
      toast("failed to copy");
    }
  };

  const formatPrice = (price: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Tracking Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Monitor and manage order tracking for all shipments
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import Tracking
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Tracking Event
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Total Orders
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {orders.length}
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        In Transit
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {orders.filter((o) => o.status === "shipped").length}
                      </p>
                    </div>
                    <Truck className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Delivered
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {orders.filter((o) => o.status === "delivered").length}
                      </p>
                    </div>
                    <MapPin className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Pending
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {orders.filter((o) => o.status === "processing").length}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search orders, tracking numbers, customer names..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>

              {selectedOrders.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      {selectedOrders.length} order(s) selected
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction("mark_shipped")}
                      >
                        Mark as Shipped
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction("update_carrier")}
                      >
                        Update Carrier
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction("export_selected")}
                      >
                        Export Selected
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Orders ({filteredOrders.length})</span>
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedOrders.length === filteredOrders.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={
                            selectedOrders.length === filteredOrders.length &&
                            filteredOrders.length > 0
                          }
                          onChange={handleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Tracking</TableHead>
                      <TableHead>Carrier</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order._id)}
                            onChange={() => handleSelectOrder(order._id)}
                            className="rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {order.orderNumber}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {order.items.length} item(s)
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {order.shippingAddress.firstName}{" "}
                              {order.shippingAddress.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {order.email}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {order.shippingAddress.city},{" "}
                              {order.shippingAddress.province}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <OrderStatusIndicator
                            status={order.status}
                            size="sm"
                          />
                        </TableCell>
                        <TableCell>
                          <PaymentStatusIndicator
                            status={order.paymentStatus}
                            size="sm"
                          />
                        </TableCell>
                        <TableCell>
                          {order.trackingNumber ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-mono text-gray-900 dark:text-white">
                                {order.trackingNumber}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                onClick={() =>
                                  copyToClipboard(
                                    order.trackingNumber,
                                    "Tracking number"
                                  )
                                }
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Not assigned
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {order.shippingCarrier ? (
                            <Badge variant="outline">
                              {order.shippingCarrier}
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatPrice(order.totalAmount, order.currency)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-900 dark:text-white">
                              {format(new Date(order.createdAt), "MMM dd")}
                            </p>
                            {order.estimatedDelivery && (
                              <p className="text-xs text-green-600 dark:text-green-400">
                                ETA:{" "}
                                {format(
                                  new Date(order.estimatedDelivery),
                                  "MMM dd"
                                )}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => onOrderSelect?.(order)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Tracking
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  copyToClipboard(
                                    order.orderNumber,
                                    "Order number"
                                  )
                                }
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Order #
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No orders found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
