// app/(account)/account/memberships/components/CurrentMembershipCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Crown,
  Calendar,
  CreditCard,
  Settings,
  Zap,
  Gift,
  Star,
  XCircle,
  AlertTriangle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { cancelMembershipSubscription } from "@/lib/actions/membershipSubscriptionActions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CurrentMembershipCardProps {
  membership: {
    _id: string;
    membership: {
      _id: string;
      name: string;
      tier: string;
      price: number;
      billingFrequency: string;
      features: string[];
      customBenefits: Array<{
        title: string;
        description: string;
        type: string;
      }>;
    };
    status: string;
    startDate: string;
    nextBillingDate?: string;
    currentPeriodEnd: string;
    productUsage: Array<{
      categoryId: string;
      categoryName: string;
      allocatedQuantity: number;
      usedQuantity: number;
      availableQuantity: number;
    }>;
    autoRenewal: boolean;
  };
  onRefresh: () => void;
}

const tierConfig = {
  basic: {
    icon: Gift,
    color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    gradient: "from-emerald-500 via-emerald-600 to-emerald-700",
    badgeVariant: "default" as const,
    glowColor: "shadow-emerald-500/30",
    bgColor: "bg-emerald-50/80",
    borderColor: "border-emerald-200/60",
    textColor: "text-emerald-600",
  },
  premium: {
    icon: Star,
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
    gradient: "from-blue-500 via-blue-600 to-blue-700", 
    badgeVariant: "default" as const,
    glowColor: "shadow-blue-500/30",
    bgColor: "bg-blue-50/80",
    borderColor: "border-blue-200/60",
    textColor: "text-blue-600",
  },
  vip: {
    icon: Crown,
    color: "bg-gradient-to-br from-purple-500 to-purple-600",
    gradient: "from-purple-500 via-purple-600 to-purple-700",
    badgeVariant: "secondary" as const,
    glowColor: "shadow-purple-500/30",
    bgColor: "bg-purple-50/80",
    borderColor: "border-purple-200/60",
    textColor: "text-purple-600",
  },
  elite: {
    icon: Zap,
    color: "bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600",
    gradient: "from-amber-500 via-orange-500 to-amber-600",
    badgeVariant: "destructive" as const,
    glowColor: "shadow-amber-500/30",
    bgColor: "bg-amber-50/80",
    borderColor: "border-amber-200/60",
    textColor: "text-amber-600",
  },
};

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    return `${Math.abs(diffInDays)} days ago`;
  } else if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Tomorrow";
  } else if (diffInDays < 7) {
    return `In ${diffInDays} days`;
  } else if (diffInDays < 30) {
    const weeks = Math.ceil(diffInDays / 7);
    return `In ${weeks} week${weeks > 1 ? "s" : ""}`;
  } else {
    const months = Math.ceil(diffInDays / 30);
    return `In ${months} month${months > 1 ? "s" : ""}`;
  }
}

export function CurrentMembershipCard({
  membership,
  onRefresh,
}: CurrentMembershipCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  // Enhanced debug logging for date fields
  console.log('🔍 Membership Date Debug:', {
    nextBillingDate: membership.nextBillingDate,
    nextBillingDateType: typeof membership.nextBillingDate,
    nextBillingDateValid: membership.nextBillingDate ? !isNaN(new Date(membership.nextBillingDate).getTime()) : false,
    currentPeriodEnd: membership.currentPeriodEnd,
    currentPeriodEndType: typeof membership.currentPeriodEnd,
    currentPeriodEndValid: membership.currentPeriodEnd ? !isNaN(new Date(membership.currentPeriodEnd).getTime()) : false,
    startDate: membership.startDate,
    status: membership.status,
    autoRenewal: membership.autoRenewal
  });
  
  const config =
    tierConfig[membership.membership.tier as keyof typeof tierConfig];
  const IconComponent = config.icon;

  // Unified billing date calculation
  const getBillingDateInfo = () => {
    const hasNextBilling = membership.nextBillingDate && 
      !isNaN(new Date(membership.nextBillingDate).getTime());
    const hasPeriodEnd = membership.currentPeriodEnd && 
      !isNaN(new Date(membership.currentPeriodEnd).getTime());
    
    console.log('🔍 Billing Date Calculation:', {
      hasNextBilling,
      hasPeriodEnd,
      status: membership.status,
      autoRenewal: membership.autoRenewal
    });

    // If subscription is cancelled, show period end
    if (membership.status === 'cancelled') {
      if (hasPeriodEnd) {
        return {
          date: format(new Date(membership.currentPeriodEnd), "MMM dd, yyyy"),
          label: "Access ends",
          relativeText: `Access ends ${formatRelativeTime(new Date(membership.currentPeriodEnd))}`
        };
      }
      return {
        date: "N/A",
        label: "Cancelled",
        relativeText: "Subscription cancelled"
      };
    }

    // If has active subscription with next billing date
    if (hasNextBilling && membership.autoRenewal !== false) {
      return {
        date: format(new Date(membership.nextBillingDate!), "MMM dd, yyyy"),
        label: "Next billing",
        relativeText: `Next billing ${formatRelativeTime(new Date(membership.nextBillingDate!))}`
      };
    }

    // If subscription not set to auto-renew but still active
    if (hasPeriodEnd && membership.autoRenewal === false) {
      return {
        date: format(new Date(membership.currentPeriodEnd), "MMM dd, yyyy"),
        label: "Expires",
        relativeText: `Expires ${formatRelativeTime(new Date(membership.currentPeriodEnd))}`
      };
    }

    // Fallback to current period end
    if (hasPeriodEnd) {
      return {
        date: format(new Date(membership.currentPeriodEnd), "MMM dd, yyyy"),
        label: "Period ends",
        relativeText: `Period ends ${formatRelativeTime(new Date(membership.currentPeriodEnd))}`
      };
    }

    // No valid dates found
    return {
      date: "N/A",
      label: "No upcoming billing",
      relativeText: "No upcoming billing scheduled"
    };
  };

  const billingInfo = getBillingDateInfo();

  const handleCancelMembership = async () => {
    setIsLoading(true);
    try {
      const result = await cancelMembershipSubscription(membership._id);
      
      if (result.success) {
        toast.success("Membership cancellation initiated. You'll receive a confirmation email shortly.");
        onRefresh();
      } else {
        toast.error(result.error || "Failed to cancel membership. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to cancel membership. Please try again.");
      console.error("Cancel membership error:", error);
    } finally {
      setIsLoading(false);
      setShowCancelDialog(false);
    }
  };

  // Calculate period progress
  const startDate = new Date(membership.startDate);
  const endDate = new Date(membership.currentPeriodEnd);
  const now = new Date();
  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysUsed = Math.ceil(
    (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const progressPercentage = Math.min((daysUsed / totalDays) * 100, 100);

  // Calculate total product usage
  const totalAllocated = membership.productUsage.reduce(
    (sum, usage) => sum + usage.allocatedQuantity,
    0
  );
  const totalUsed = membership.productUsage.reduce(
    (sum, usage) => sum + usage.usedQuantity,
    0
  );
  const usagePercentage =
    totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Card className={`relative group glass-card border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl overflow-hidden shadow-2xl ${config.glowColor} transition-all duration-300 hover:shadow-3xl hover:scale-[1.02]`}>
        {/* Animated gradient border */}
        <div className={`h-2 bg-gradient-to-r ${config.gradient} relative overflow-hidden`}>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Floating sparkles animation */}
        <div className="absolute top-4 right-4 opacity-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className={`w-6 h-6 ${config.textColor}`} />
          </motion.div>
        </div>

        <CardHeader className="pb-4 relative">
          {/* Mobile Layout */}
          <div className="block md:hidden space-y-4">
            <div className="flex items-center gap-3">
              <motion.div
                className={`p-3 rounded-2xl ${config.color} text-white shadow-xl ${config.glowColor}`}
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <IconComponent className="w-6 h-6" />
              </motion.div>
              <div className="flex-1">
                <CardTitle className="text-xl font-bold capitalize bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
                  {membership.membership.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={config.badgeVariant} className={`capitalize ${config.bgColor} ${config.borderColor} ${config.textColor} font-semibold px-2 py-1 text-xs`}>
                    <Crown className="w-3 h-3 mr-1" />
                    {membership.membership.tier}
                  </Badge>
                  <Badge variant="outline" className="capitalize font-medium text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                    {membership.status}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Mobile Action Buttons */}
            <div className="flex gap-2 w-full">
              <Button variant="outline" size="sm" className="flex-1 gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200">
                <Settings className="w-4 h-4" />
                Manage
              </Button>
              
              <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 gap-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors duration-200">
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                
                <AlertDialogContent className="mx-4 max-w-sm">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600 text-lg">
                      <AlertTriangle className="w-5 h-5" />
                      Cancel Membership
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3 text-sm">
                      <p>Are you sure you want to cancel your <strong className="capitalize">{membership.membership.tier}</strong> membership?</p>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm text-amber-800 font-medium">
                          What happens next:
                        </p>
                        <ul className="text-xs text-amber-700 mt-2 space-y-1">
                          <li>• Keep access until billing period ends</li>
                          <li>• No more charges will be made</li>
                          <li>• You can reactivate anytime</li>
                        </ul>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0">
                    <AlertDialogCancel className="w-full sm:w-auto">Keep Membership</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelMembership}
                      disabled={isLoading}
                      className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isLoading ? "Canceling..." : "Yes, Cancel"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-start justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className={`p-4 rounded-2xl ${config.color} text-white shadow-xl ${config.glowColor} group-hover:scale-110 transition-transform duration-300`}
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <IconComponent className="w-8 h-8" />
              </motion.div>
              <div>
                <CardTitle className="text-2xl font-bold capitalize bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
                  {membership.membership.name}
                </CardTitle>
                <div className="flex items-center gap-3 mt-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Badge variant={config.badgeVariant} className={`capitalize ${config.bgColor} ${config.borderColor} ${config.textColor} font-semibold px-3 py-1`}>
                      <Crown className="w-3 h-3 mr-1" />
                      {membership.membership.tier}
                    </Badge>
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Badge variant="outline" className="capitalize font-medium">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                      {membership.status}
                    </Badge>
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" size="sm" className="gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200">
                  <Settings className="w-4 h-4" />
                  Manage
                </Button>
              </motion.div>
              
              <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline" size="sm" className="gap-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors duration-200">
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </Button>
                  </motion.div>
                </AlertDialogTrigger>
                
                <AlertDialogContent className="max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="w-5 h-5" />
                      Cancel Membership
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                      <p>Are you sure you want to cancel your <strong className="capitalize">{membership.membership.tier}</strong> membership?</p>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm text-amber-800">
                          <strong>What happens next:</strong>
                        </p>
                        <ul className="text-sm text-amber-700 mt-1 space-y-1">
                          <li>• You'll keep access until your current billing period ends</li>
                          <li>• No more charges will be made</li>
                          <li>• You can reactivate anytime</li>
                        </ul>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Membership</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelMembership}
                      disabled={isLoading}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isLoading ? "Canceling..." : "Yes, Cancel Membership"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>

      <CardContent className="space-y-8">
        {/* Enhanced Billing Information */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.div 
            className="relative group glass-card p-4 md:p-6 bg-gradient-to-br from-emerald-50/80 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10 border border-emerald-200/60 dark:border-emerald-800/50 rounded-2xl shadow-lg hover:shadow-emerald-200/50 transition-all duration-300"
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-3">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold">Monthly Cost</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-emerald-700 dark:text-emerald-300 mb-1">
              ${membership.membership.price}
            </div>
            <div className="text-xs md:text-sm text-emerald-600/80 dark:text-emerald-400/80 capitalize">
              Per {membership.membership.billingFrequency.replace("ly", "")}
            </div>
            <div className="absolute top-3 right-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
          </motion.div>

          <motion.div 
            className="relative group glass-card p-4 md:p-6 bg-gradient-to-br from-blue-50/80 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border border-blue-200/60 dark:border-blue-800/50 rounded-2xl shadow-lg hover:shadow-blue-200/50 transition-all duration-300"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-3">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold">{billingInfo.label}</span>
            </div>
            <div className="text-base md:text-lg font-bold text-blue-700 dark:text-blue-300 mb-1">
              {billingInfo.date}
            </div>
            <div className="text-xs md:text-sm text-blue-600/80 dark:text-blue-400/80">
              {billingInfo.relativeText}
            </div>
            <div className="absolute top-3 right-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div 
            className="relative group glass-card p-4 md:p-6 bg-gradient-to-br from-purple-50/80 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 border border-purple-200/60 dark:border-purple-800/50 rounded-2xl shadow-lg hover:shadow-purple-200/50 transition-all duration-300"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 mb-3">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50">
                <Gift className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold">Products Used</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-purple-700 dark:text-purple-300 mb-1">
              {totalUsed}/{totalAllocated}
            </div>
            <div className="text-xs md:text-sm text-purple-600/80 dark:text-purple-400/80">
              This period
            </div>
            <div className="absolute top-3 right-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Gift className="w-8 h-8 text-purple-500" />
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Period Progress */}
        <motion.div 
          className="space-y-4 bg-gradient-to-r from-gray-50/50 to-gray-100/30 dark:from-gray-800/30 dark:to-gray-900/20 rounded-2xl p-6 border border-gray-200/50"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">Billing Period Progress</span>
            </div>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="relative">
            <Progress value={progressPercentage} className="h-3 bg-gray-200 dark:bg-gray-700" />
            <motion.div
              className="absolute top-0 left-0 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
            <span>Started {format(startDate, "MMM dd")}</span>
            <span>Ends {format(endDate, "MMM dd")}</span>
          </div>
        </motion.div>

        {/* Enhanced Product Usage Overview */}
        <motion.div 
          className="space-y-4 bg-gradient-to-r from-purple-50/50 to-purple-100/30 dark:from-purple-900/20 dark:to-purple-800/10 rounded-2xl p-6 border border-purple-200/50"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-500" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">Product Allocation Usage</span>
            </div>
            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {Math.round(usagePercentage)}% used
            </span>
          </div>
          <div className="relative">
            <Progress value={usagePercentage} className="h-3 bg-gray-200 dark:bg-gray-700" />
            <motion.div
              className="absolute top-0 left-0 h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${usagePercentage}%` }}
              transition={{ delay: 0.9, duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="text-sm font-medium text-purple-600 dark:text-purple-400 text-center">
            🎁 {totalAllocated - totalUsed} products remaining this period
          </div>
        </motion.div>

        {/* Enhanced Key Benefits */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className={`w-5 h-5 ${config.textColor}`} />
            <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">Your Premium Benefits</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {membership.membership.features
              .slice(0, 6)
              .map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-white/60 to-gray-50/40 dark:from-gray-800/60 dark:to-gray-900/40 border border-gray-200/50 hover:shadow-md transition-all duration-200"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                >
                  <div className={`w-3 h-3 ${config.color} rounded-full shadow-lg`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{feature}</span>
                </motion.div>
              ))}
          </div>
        </motion.div>
      </CardContent>
    </Card>
  </motion.div>
  );
}
