"use client";

import { motion } from "framer-motion";
import { Calendar, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardHeader() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
    >
      <div className="space-y-2">
        <motion.h1
          className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Dashboard Overview
        </motion.h1>
        <motion.div
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-medium">{currentDate}</span>
        </motion.div>
      </div>

      <motion.div
        className="flex flex-wrap gap-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Button variant="outline" size="sm" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          Analytics
        </Button>
        <Button className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
          <Sparkles className="h-4 w-4" />
          Generate Report
        </Button>
      </motion.div>
    </motion.div>
  );
}
