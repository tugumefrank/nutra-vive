"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedCounter from "./animated-counter";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  format?: "number" | "currency" | "percentage";
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export default function StatCard({
  title,
  value,
  format = "number",
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardContent className="p-6">
        {/* Background Gradient */}
        <div
          className={cn(
            "absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300",
            className
          )}
        />

        {/* Icon */}
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-3 rounded-xl shadow-lg", className)}>
            <Icon className="h-6 w-6 text-white" />
          </div>

          {trend && (
            <motion.div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                trend.isPositive
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.value}%
            </motion.div>
          )}
        </div>

        {/* Value */}
        <div className="space-y-2">
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            <AnimatedCounter value={value} format={format} delay={0.3} />
          </h3>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full bg-white/10 opacity-20" />
        <div className="absolute bottom-0 left-0 w-24 h-24 -ml-12 -mb-12 rounded-full bg-white/5 opacity-30" />
      </CardContent>
    </Card>
  );
}
