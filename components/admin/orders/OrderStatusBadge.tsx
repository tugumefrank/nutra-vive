"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  CreditCard,
  AlertCircle,
  DollarSign,
  Ban,
} from "lucide-react";

interface OrderStatusBadgeProps {
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

interface PaymentStatusBadgeProps {
  status: "pending" | "paid" | "failed" | "refunded" | "partially_refunded";
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    className:
      "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
    pulseColor: "bg-orange-500",
  },
  processing: {
    label: "Processing",
    icon: Package,
    className:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    pulseColor: "bg-blue-500",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    className:
      "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
    pulseColor: "bg-purple-500",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    className:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    pulseColor: "bg-green-500",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    pulseColor: "bg-red-500",
  },
  refunded: {
    label: "Refunded",
    icon: RefreshCw,
    className:
      "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/20 dark:text-slate-400 dark:border-slate-700",
    pulseColor: "bg-slate-500",
  },
};

const paymentStatusConfig = {
  pending: {
    label: "Payment Pending",
    icon: Clock,
    className:
      "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
    pulseColor: "bg-orange-500",
  },
  paid: {
    label: "Paid",
    icon: CheckCircle,
    className:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    pulseColor: "bg-green-500",
  },
  failed: {
    label: "Payment Failed",
    icon: AlertCircle,
    className:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    pulseColor: "bg-red-500",
  },
  refunded: {
    label: "Refunded",
    icon: DollarSign,
    className:
      "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
    pulseColor: "bg-purple-500",
  },
  partially_refunded: {
    label: "Partially Refunded",
    icon: Ban,
    className:
      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
    pulseColor: "bg-yellow-500",
  },
};

const sizeClasses = {
  sm: "text-xs px-2 py-1",
  md: "text-sm px-2.5 py-1.5",
  lg: "text-sm px-3 py-2",
};

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

export function OrderStatusBadge({
  status,
  showIcon = true,
  size = "md",
  animated = true,
}: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={animated ? { opacity: 0, scale: 0.8 } : {}}
      animate={animated ? { opacity: 1, scale: 1 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative"
    >
      <Badge
        variant="outline"
        className={cn(
          "relative overflow-hidden border font-medium",
          config.className,
          sizeClasses[size]
        )}
      >
        {/* Animated background for active statuses */}
        {animated && (status === "processing" || status === "shipped") && (
          <motion.div
            className={cn("absolute inset-0 opacity-10", config.pulseColor)}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        <div className="relative flex items-center gap-1.5">
          {showIcon && (
            <Icon className={cn(iconSizes[size], "flex-shrink-0")} />
          )}
          <span className="font-medium">{config.label}</span>
        </div>

        {/* Pulse indicator for pending/processing */}
        {animated && (status === "pending" || status === "processing") && (
          <motion.div
            className={cn(
              "absolute -top-1 -right-1 h-2 w-2 rounded-full",
              config.pulseColor
            )}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </Badge>
    </motion.div>
  );
}

export function PaymentStatusBadge({
  status,
  showIcon = true,
  size = "md",
  animated = true,
}: PaymentStatusBadgeProps) {
  const config = paymentStatusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={animated ? { opacity: 0, scale: 0.8 } : {}}
      animate={animated ? { opacity: 1, scale: 1 } : {}}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: 0.1,
      }}
      className="relative"
    >
      <Badge
        variant="outline"
        className={cn(
          "relative overflow-hidden border font-medium",
          config.className,
          sizeClasses[size]
        )}
      >
        {/* Animated background for processing payment */}
        {animated && status === "pending" && (
          <motion.div
            className={cn("absolute inset-0 opacity-10", config.pulseColor)}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        <div className="relative flex items-center gap-1.5">
          {showIcon && (
            <motion.div
              animate={
                animated && status === "pending"
                  ? {
                      rotate: [0, 360],
                    }
                  : {}
              }
              transition={
                animated && status === "pending"
                  ? {
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }
                  : {}
              }
            >
              <Icon className={cn(iconSizes[size], "flex-shrink-0")} />
            </motion.div>
          )}
          <span className="font-medium">{config.label}</span>
        </div>

        {/* Success checkmark animation */}
        {animated && status === "paid" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
              delay: 0.2,
            }}
            className="absolute -top-1 -right-1"
          >
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </motion.div>
        )}

        {/* Error indicator for failed payments */}
        {animated && status === "failed" && (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-1 -right-1"
          >
            <div className="h-2 w-2 bg-red-500 rounded-full" />
          </motion.div>
        )}
      </Badge>
    </motion.div>
  );
}

// Combined status component for compact displays
export function CombinedStatusBadge({
  orderStatus,
  paymentStatus,
  size = "sm",
}: {
  orderStatus: OrderStatusBadgeProps["status"];
  paymentStatus: PaymentStatusBadgeProps["status"];
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className="flex flex-col gap-1">
      <OrderStatusBadge status={orderStatus} size={size} showIcon={false} />
      <PaymentStatusBadge status={paymentStatus} size={size} showIcon={false} />
    </div>
  );
}

// Status timeline component
export function StatusTimeline({
  orderStatus,
  createdAt,
  shippedAt,
  deliveredAt,
}: {
  orderStatus: OrderStatusBadgeProps["status"];
  createdAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
}) {
  const steps = [
    {
      status: "pending",
      label: "Order Placed",
      date: createdAt,
      completed: true,
    },
    {
      status: "processing",
      label: "Processing",
      completed: ["processing", "shipped", "delivered"].includes(orderStatus),
    },
    {
      status: "shipped",
      label: "Shipped",
      date: shippedAt,
      completed: ["shipped", "delivered"].includes(orderStatus),
    },
    {
      status: "delivered",
      label: "Delivered",
      date: deliveredAt,
      completed: orderStatus === "delivered",
    },
  ];

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={step.status} className="flex items-center gap-3">
          <div
            className={cn(
              "flex-shrink-0 w-2 h-2 rounded-full transition-colors",
              step.completed ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"
            )}
          />
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-sm font-medium",
                step.completed
                  ? "text-slate-900 dark:text-slate-100"
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              {step.label}
            </p>
            {step.date && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step.date.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
