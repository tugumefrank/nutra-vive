"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  FileText,
  Users,
  Settings,
  Download,
  Bell,
  BarChart3,
  Package,
} from "lucide-react";
import Link from "next/link";

export default function QuickActions() {
  const actions = [
    {
      title: "Add Product",
      description: "Create new product",
      icon: Plus,
      href: "/admin/products/new",
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "View Orders",
      description: "Manage orders",
      icon: Package,
      href: "/admin/orders",
      color: "from-blue-500 to-cyan-600",
    },
    {
      title: "Generate Report",
      description: "Sales analytics",
      icon: BarChart3,
      href: "/admin/reports",
      color: "from-purple-500 to-violet-600",
    },
    {
      title: "Export Data",
      description: "Download CSV",
      icon: Download,
      href: "/admin/export",
      color: "from-orange-500 to-red-600",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600">
              <Settings className="h-4 w-4 text-white" />
            </div>
            Quick Actions
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {actions.map((action, index) => {
            const IconComponent = action.icon;

            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <Link href={action.href}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto p-4 hover:bg-gradient-to-r hover:from-white/50 hover:to-slate-50/50 dark:hover:from-slate-800/50 dark:hover:to-slate-700/50 group transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm">
                          {action.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
