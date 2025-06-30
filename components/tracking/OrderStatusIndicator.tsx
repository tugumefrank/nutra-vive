"use client";

import { motion } from "framer-motion";
import {
  Package,
  CreditCard,
  Wrench,
  Truck,
  Home,
  AlertTriangle,
  RefreshCw,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OrderStatusIndicatorProps {
  status: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Pending",
    color: "bg-yellow-500",
    badgeClass:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
    description: "Order is being reviewed",
  },
  processing: {
    icon: Wrench,
    label: "Processing",
    color: "bg-blue-500",
    badgeClass:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
    description: "Preparing your order",
  },
  shipped: {
    icon: Truck,
    label: "Shipped",
    color: "bg-purple-500",
    badgeClass:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
    description: "On its way to you",
  },
  delivered: {
    icon: Home,
    label: "Delivered",
    color: "bg-green-500",
    badgeClass:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
    description: "Successfully delivered",
  },
  cancelled: {
    icon: AlertTriangle,
    label: "Cancelled",
    color: "bg-red-500",
    badgeClass: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
    description: "Order was cancelled",
  },
  refunded: {
    icon: RefreshCw,
    label: "Refunded",
    color: "bg-gray-500",
    badgeClass:
      "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
    description: "Payment refunded",
  },
};

const sizeConfig = {
  sm: {
    iconSize: "w-3 h-3",
    badgeSize: "text-xs px-2 py-1",
    iconContainerSize: "w-6 h-6",
  },
  md: {
    iconSize: "w-4 h-4",
    badgeSize: "text-sm px-3 py-1",
    iconContainerSize: "w-8 h-8",
  },
  lg: {
    iconSize: "w-5 h-5",
    badgeSize: "text-base px-4 py-2",
    iconContainerSize: "w-10 h-10",
  },
};

export default function OrderStatusIndicator({
  status,
  size = "md",
  showIcon = true,
  showText = true,
  animated = true,
  className = "",
}: OrderStatusIndicatorProps) {
  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    whileHover: { scale: 1.05 },
  };

  const iconVariants = {
    initial: { rotate: 0 },
    animate: status === "processing" ? { rotate: 360 } : { rotate: 0 },
  };

  if (!showText) {
    // Icon only mode
    return (
      <motion.div
        variants={animated ? containerVariants : undefined}
        initial={animated ? "initial" : undefined}
        animate={animated ? "animate" : undefined}
        whileHover={animated ? "whileHover" : undefined}
        transition={{ duration: 0.3 }}
        className={cn(
          "inline-flex items-center justify-center rounded-full",
          config.color,
          sizeStyles.iconContainerSize,
          className
        )}
        title={`${config.label}: ${config.description}`}
      >
        <motion.div
          variants={iconVariants}
          animate={status === "processing" && animated ? "animate" : "initial"}
          transition={
            status === "processing"
              ? { duration: 2, repeat: Infinity, ease: "linear" }
              : { duration: 0.3 }
          }
        >
          <Icon className={cn("text-white", sizeStyles.iconSize)} />
        </motion.div>
      </motion.div>
    );
  }

  if (!showIcon) {
    // Text only mode
    return (
      <motion.div
        variants={animated ? containerVariants : undefined}
        initial={animated ? "initial" : undefined}
        animate={animated ? "animate" : undefined}
        whileHover={animated ? "whileHover" : undefined}
        transition={{ duration: 0.3 }}
        className={className}
      >
        <Badge className={cn(config.badgeClass, sizeStyles.badgeSize)}>
          {config.label}
        </Badge>
      </motion.div>
    );
  }

  // Full mode with icon and text
  return (
    <motion.div
      variants={animated ? containerVariants : undefined}
      initial={animated ? "initial" : undefined}
      animate={animated ? "animate" : undefined}
      whileHover={animated ? "whileHover" : undefined}
      transition={{ duration: 0.3 }}
      className={cn("inline-flex items-center space-x-2", className)}
    >
      <motion.div
        variants={iconVariants}
        animate={status === "processing" && animated ? "animate" : "initial"}
        transition={
          status === "processing"
            ? { duration: 2, repeat: Infinity, ease: "linear" }
            : { duration: 0.3 }
        }
        className={cn(
          "flex items-center justify-center rounded-full",
          config.color,
          sizeStyles.iconContainerSize
        )}
      >
        <Icon className={cn("text-white", sizeStyles.iconSize)} />
      </motion.div>
      <Badge className={cn(config.badgeClass, sizeStyles.badgeSize)}>
        {config.label}
      </Badge>
    </motion.div>
  );
}

// Payment Status Indicator Component
interface PaymentStatusIndicatorProps {
  status: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

const paymentStatusConfig = {
  pending: {
    icon: Clock,
    label: "Payment Pending",
    color: "bg-yellow-500",
    badgeClass:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
  },
  paid: {
    icon: CheckCircle,
    label: "Paid",
    color: "bg-green-500",
    badgeClass:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  },
  failed: {
    icon: AlertTriangle,
    label: "Payment Failed",
    color: "bg-red-500",
    badgeClass: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
  },
  refunded: {
    icon: RefreshCw,
    label: "Refunded",
    color: "bg-gray-500",
    badgeClass:
      "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
  },
  partially_refunded: {
    icon: RefreshCw,
    label: "Partially Refunded",
    color: "bg-orange-500",
    badgeClass:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
  },
};

export function PaymentStatusIndicator({
  status,
  size = "md",
  showIcon = true,
  showText = true,
  animated = true,
  className = "",
}: PaymentStatusIndicatorProps) {
  const config =
    paymentStatusConfig[status as keyof typeof paymentStatusConfig] ||
    paymentStatusConfig.pending;
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  const containerVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    whileHover: { scale: 1.05 },
  };

  if (!showText) {
    return (
      <motion.div
        variants={animated ? containerVariants : undefined}
        initial={animated ? "initial" : undefined}
        animate={animated ? "animate" : undefined}
        whileHover={animated ? "whileHover" : undefined}
        transition={{ duration: 0.3 }}
        className={cn(
          "inline-flex items-center justify-center rounded-full",
          config.color,
          sizeStyles.iconContainerSize,
          className
        )}
        title={config.label}
      >
        <Icon className={cn("text-white", sizeStyles.iconSize)} />
      </motion.div>
    );
  }

  if (!showIcon) {
    return (
      <motion.div
        variants={animated ? containerVariants : undefined}
        initial={animated ? "initial" : undefined}
        animate={animated ? "animate" : undefined}
        whileHover={animated ? "whileHover" : undefined}
        transition={{ duration: 0.3 }}
        className={className}
      >
        <Badge className={cn(config.badgeClass, sizeStyles.badgeSize)}>
          {config.label}
        </Badge>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={animated ? containerVariants : undefined}
      initial={animated ? "initial" : undefined}
      animate={animated ? "animate" : undefined}
      whileHover={animated ? "whileHover" : undefined}
      transition={{ duration: 0.3 }}
      className={cn("inline-flex items-center space-x-2", className)}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full",
          config.color,
          sizeStyles.iconContainerSize
        )}
      >
        <Icon className={cn("text-white", sizeStyles.iconSize)} />
      </div>
      <Badge className={cn(config.badgeClass, sizeStyles.badgeSize)}>
        {config.label}
      </Badge>
    </motion.div>
  );
}
