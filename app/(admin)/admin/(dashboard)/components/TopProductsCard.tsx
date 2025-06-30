"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, TrendingUp, Package, ArrowRight } from "lucide-react";
import Link from "next/link";
import AnimatedCounter from "@/components/ui/animated-counter";

interface TopProductsCardProps {
  data: Array<{
    productName: string;
    totalSold: number;
    revenue: number;
  }>;
}

export default function TopProductsCard({ data }: TopProductsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-900 dark:to-orange-950/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600">
                <Award className="h-4 w-4 text-white" />
              </div>
              Top Products
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Best performing products by revenue
            </p>
          </div>

          <Link href="/admin/products">
            <Button variant="ghost" size="sm" className="gap-1">
              View All
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent>
          {data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No product data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.slice(0, 5).map((product, index) => (
                <motion.div
                  key={product.productName}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl hover:bg-white/70 dark:hover:bg-slate-800/70 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-sm truncate max-w-[150px]">
                        {product.productName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {product.totalSold} sold
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-sm text-green-600">
                      <AnimatedCounter
                        value={product.revenue}
                        format="currency"
                        delay={index * 0.1}
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      Revenue
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
