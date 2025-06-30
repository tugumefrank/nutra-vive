"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, TrendingUp, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import AnimatedCounter from "@/components/ui/animated-counter";

interface ConsultationsCardProps {
  data: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    revenue: number;
    recentConsultations: number;
  };
}

export default function ConsultationsCard({ data }: ConsultationsCardProps) {
  const completionRate =
    data.total > 0 ? (data.completed / data.total) * 100 : 0;
  const pendingPercentage =
    data.total > 0 ? (data.pending / data.total) * 100 : 0;
  const confirmedPercentage =
    data.total > 0 ? (data.confirmed / data.total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-900 dark:to-purple-950/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              Consultations
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Health consultations overview
            </p>
          </div>

          <Link href="/admin/consultations">
            <Button variant="ghost" size="sm" className="gap-1">
              View All
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">
                <AnimatedCounter value={data.total} delay={0.3} />
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">
                <AnimatedCounter
                  value={data.revenue}
                  format="currency"
                  delay={0.5}
                />
              </div>
              <div className="text-xs text-muted-foreground">Revenue</div>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="font-medium">
                  {completionRate.toFixed(1)}%
                </span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">
                  {data.pending}
                </div>
                <div className="text-xs text-yellow-600/80">Pending</div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {data.confirmed}
                </div>
                <div className="text-xs text-blue-600/80">Confirmed</div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {data.completed}
                </div>
                <div className="text-xs text-green-600/80">Completed</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg">
            <Clock className="h-4 w-4 text-purple-600" />
            <span className="text-sm">
              <span className="font-medium">{data.recentConsultations}</span>{" "}
              new this week
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
