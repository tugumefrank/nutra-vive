"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import AnimatedCounter from "@/components/ui/animated-counter";

interface LowStockAlertProps {
  data: {
    total: number;
    active: number;
    inactive: number;
    featured: number;
    lowStock: number;
    outOfStock: number;
    categories: number;
  };
}

export default function LowStockAlert({ data }: LowStockAlertProps) {
  const hasStockIssues = data.lowStock > 0 || data.outOfStock > 0;
  const stockPercentage =
    data.total > 0
      ? ((data.total - data.lowStock - data.outOfStock) / data.total) * 100
      : 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Card
        className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
          hasStockIssues
            ? "bg-gradient-to-br from-white to-red-50/30 dark:from-slate-900 dark:to-red-950/20"
            : "bg-gradient-to-br from-white to-green-50/30 dark:from-slate-900 dark:to-green-950/20"
        }`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <div
                className={`p-2 rounded-lg bg-gradient-to-r ${
                  hasStockIssues
                    ? "from-red-500 to-orange-600"
                    : "from-green-500 to-emerald-600"
                }`}
              >
                {hasStockIssues ? (
                  <AlertTriangle className="h-4 w-4 text-white" />
                ) : (
                  <Package className="h-4 w-4 text-white" />
                )}
              </div>
              Inventory Status
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {hasStockIssues ? "Attention required" : "All good"}
            </p>
          </div>

          <Link href="/admin/products">
            <Button variant="ghost" size="sm" className="gap-1">
              Manage
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Overall Status */}
          <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
            <div
              className={`text-3xl font-bold ${
                hasStockIssues ? "text-red-600" : "text-green-600"
              }`}
            >
              <AnimatedCounter
                value={stockPercentage}
                format="percentage"
                delay={0.3}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Products with healthy stock
            </div>
          </div>

          {/* Stock Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg text-center">
              <div className="text-xl font-bold text-yellow-600">
                <AnimatedCounter value={data.lowStock} delay={0.5} />
              </div>
              <div className="text-xs text-yellow-600/80">Low Stock</div>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg text-center">
              <div className="text-xl font-bold text-red-600">
                <AnimatedCounter value={data.outOfStock} delay={0.7} />
              </div>
              <div className="text-xs text-red-600/80">Out of Stock</div>
            </div>
          </div>

          {/* Product Stats */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total Products:</span>
              <Badge variant="outline">{data.total}</Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Active:</span>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                {data.active}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Featured:</span>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                {data.featured}
              </Badge>
            </div>
          </div>

          {/* Action Button */}
          {hasStockIssues && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.4 }}
            >
              <Link href="/admin/products?filter=low-stock">
                <Button className="w-full gap-2 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700">
                  <AlertTriangle className="h-4 w-4" />
                  View Stock Issues
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
