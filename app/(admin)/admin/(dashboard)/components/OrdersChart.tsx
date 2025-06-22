"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface OrdersChartProps {
  data: {
    pendingOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
  };
}

export default function OrdersChart({ data }: OrdersChartProps) {
  const chartData = [
    {
      name: "Pending",
      value: data.pendingOrders,
      color: "#f59e0b",
      icon: Package,
    },
    {
      name: "Processing",
      value: data.processingOrders,
      color: "#3b82f6",
      icon: ShoppingBag,
    },
    {
      name: "Shipped",
      value: data.shippedOrders,
      color: "#8b5cf6",
      icon: Truck,
    },
    {
      name: "Delivered",
      value: data.deliveredOrders,
      color: "#10b981",
      icon: CheckCircle,
    },
    {
      name: "Cancelled",
      value: data.cancelledOrders,
      color: "#ef4444",
      icon: XCircle,
    },
  ];

  const totalOrders = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-blue-950/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            Order Status Distribution
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Overview of all order statuses
          </p>
        </CardHeader>

        <CardContent>
          {/* Order Status Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {chartData.map((item, index) => {
              const IconComponent = item.icon;
              const percentage =
                totalOrders > 0 ? (item.value / totalOrders) * 100 : 0;

              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-white/20 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <IconComponent
                        className="h-4 w-4"
                        style={{ color: item.color }}
                      />
                    </div>
                    <div>
                      <div className="font-bold text-lg">{item.value}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.name}
                      </div>
                      <div
                        className="text-xs font-medium"
                        style={{ color: item.color }}
                      >
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bar Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="name"
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [value, "Orders"]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
