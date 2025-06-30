"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  CreditCard,
  Factory,
  Truck,
  MapPin,
  Home,
  CheckCircle,
  Clock,
  Zap,
  ArrowRight,
  Navigation,
  Warehouse,
  Plane,
  Users,
  ShoppingBag,
  Heart,
  Star,
  TrendingUp,
  Award,
  Sparkles,
  Rocket,
  Target,
  Calendar,
  Timer,
  Activity,
  BarChart3,
  TruckIcon,
  Box,
  Shield,
  AlertTriangle,
  RefreshCw,
  Coffee,
  Leaf,
  Phone,
  MessageCircle,
  Share2,
  Gift,
  Crown,
  ThumbsUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import MobileOrderDetails from "./MobileOrderDetails";

interface TrackingEvent {
  _id: string;
  status: string;
  description: string;
  timestamp: string;
  location?: string;
  carrier?: string;
  metadata?: {
    facility?: string;
    city?: string;
    state?: string;
    country?: string;
    temperature?: string;
    quality?: string;
    packager?: string;
    vehicle?: string;
    driver?: string;
  };
}

interface EnhancedMobileTimelineProps {
  events: TrackingEvent[];
  currentStatus: string;
  estimatedDelivery?: string;
  orderNumber: string;
  order?: any;
  trackingInfo?: any;
  onRefresh: () => void;
}

const statusConfig = {
  order_placed: {
    icon: ShoppingBag,
    label: "Order Placed",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    textColor: "text-blue-600 dark:text-blue-400",
    ringColor: "ring-blue-200 dark:ring-blue-800",
    description: "Your premium organic order has been received!",
    emoji: "🛒",
    celebrationIcons: [Heart, Star, Gift],
  },
  payment_confirmed: {
    icon: CreditCard,
    label: "Payment Secured",
    color: "from-emerald-500 to-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    textColor: "text-green-600 dark:text-green-400",
    ringColor: "ring-green-200 dark:ring-green-800",
    description: "Payment verified & processing initiated",
    emoji: "💳",
    celebrationIcons: [Shield, CheckCircle, Crown],
  },
  processing: {
    icon: Factory,
    label: "Preparing Your Order",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    textColor: "text-amber-600 dark:text-amber-400",
    ringColor: "ring-amber-200 dark:ring-amber-800",
    description: "Your order is being carefully prepared and packaged",
    emoji: "📦",
    celebrationIcons: [Coffee, Leaf, Sparkles],
  },
  shipped: {
    icon: Truck,
    label: "On The Way",
    color: "from-purple-500 to-indigo-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    textColor: "text-purple-600 dark:text-purple-400",
    ringColor: "ring-purple-200 dark:ring-purple-800",
    description: "Your order is in transit and heading your way",
    emoji: "🚛",
    celebrationIcons: [Rocket, TrendingUp, Target],
  },
  in_transit: {
    icon: Navigation,
    label: "En Route to You",
    color: "from-cyan-500 to-blue-600",
    bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
    textColor: "text-cyan-600 dark:text-cyan-400",
    ringColor: "ring-cyan-200 dark:ring-cyan-800",
    description: "Traveling through our premium network",
    emoji: "✈️",
    celebrationIcons: [Navigation, Activity, BarChart3],
  },
  out_for_delivery: {
    icon: TruckIcon,
    label: "Almost There",
    color: "from-orange-500 to-red-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    textColor: "text-orange-600 dark:text-orange-400",
    ringColor: "ring-orange-200 dark:ring-orange-800",
    description: "Final mile - your wellness awaits!",
    emoji: "🚛",
    celebrationIcons: [Timer, Zap, Award],
  },
  delivered: {
    icon: CheckCircle,
    label: "Delivered",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    textColor: "text-green-600 dark:text-green-400",
    ringColor: "ring-green-200 dark:ring-green-800",
    description: "Your order has been successfully delivered",
    emoji: "✅",
    celebrationIcons: [ThumbsUp, Crown, Heart],
  },
  exception: {
    icon: AlertTriangle,
    label: "Attention Needed",
    color: "from-red-500 to-pink-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    textColor: "text-red-600 dark:text-red-400",
    ringColor: "ring-red-200 dark:ring-red-800",
    description: "We're resolving this quickly for you",
    emoji: "⚠️",
    celebrationIcons: [Shield, Users, Phone],
  },
};

const FloatingIcon = ({
  Icon,
  delay = 0,
  className = "",
}: {
  Icon: any;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, y: 20 }}
    animate={{
      opacity: [0, 1, 1, 0],
      scale: [0, 1.2, 1, 0],
      y: [20, -30, -50, -80],
    }}
    transition={{
      duration: 3,
      delay,
      ease: "easeOut",
      repeat: Infinity,
      repeatDelay: 5,
    }}
    className={`absolute ${className}`}
  >
    <Icon className="w-4 h-4 text-white/80" />
  </motion.div>
);

const PulsingDot = ({
  color,
  size = "w-3 h-3",
}: {
  color: string;
  size?: string;
}) => (
  <motion.div
    animate={{
      scale: [1, 1.5, 1],
      opacity: [0.5, 1, 0.5],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    className={`${size} ${color} rounded-full`}
  />
);

const ConnectingLine = ({
  isActive,
  isCompleted,
  height = "h-16",
}: {
  isActive?: boolean;
  isCompleted?: boolean;
  height?: string;
}) => (
  <div className={`w-0.5 ${height} relative`}>
    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full" />

    {(isActive || isCompleted) && (
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: "100%" }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute inset-0 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full"
      />
    )}

    {isActive && (
      <motion.div
        animate={{ y: [-10, 50, -10] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 w-1 h-3 bg-white rounded-full shadow-lg"
      />
    )}
  </div>
);

const StatusCard = ({
  event,
  config,
  index,
  isLatest,
  isNext = false,
  isActive = true,
  isCurrent = false,
}: {
  event?: TrackingEvent;
  config: any;
  index: number;
  isLatest?: boolean;
  isNext?: boolean;
  isActive?: boolean;
  isCurrent?: boolean;
}) => {
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (isLatest) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isLatest]);

  const Icon = config.icon;
  const timeInfo = event
    ? {
        date: format(new Date(event.timestamp), "MMM dd, yyyy"),
        time: format(new Date(event.timestamp), "h:mm a"),
      }
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.15,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      className="relative"
    >
      {/* Status Icon */}
      <div className="flex items-start space-x-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: index * 0.15 + 0.3,
            type: "spring",
            stiffness: 300,
            damping: 15,
          }}
          className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${
            !isActive
              ? "from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700"
              : config.color
          } shadow-lg ${
            isLatest
              ? `ring-3 ring-white dark:ring-gray-900 shadow-xl`
              : !isActive
                ? "opacity-50"
                : ""
          }`}
        >
          <Icon className="w-5 h-5 text-white" />

          {/* Celebration animation */}
          {isLatest &&
            showCelebration &&
            config.celebrationIcons.map(
              (
                CelebIcon: React.ComponentType<{ className?: string }>,
                i: number
              ) => (
                <FloatingIcon
                  key={i}
                  Icon={CelebIcon}
                  delay={i * 0.5}
                  className={`${
                    i === 0
                      ? "-top-2 -left-2"
                      : i === 1
                        ? "-top-3 -right-1"
                        : "-bottom-2 left-0"
                  }`}
                />
              )
            )}

          {/* Pulsing effect for active status */}
          {isLatest && (
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${config.color} opacity-30`}
            />
          )}

          {/* Emoji overlay */}
          {isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="absolute -top-1 -right-1 text-sm filter drop-shadow-lg"
            >
              {config.emoji}
            </motion.div>
          )}
        </motion.div>

        {/* Event Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.15 + 0.4 }}
          className="flex-1 min-w-0"
        >
          <div
            className={`p-3 rounded-xl border ${
              !isActive
                ? "bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 opacity-60"
                : `${config.bgColor} border-transparent`
            } ${isLatest ? `${config.ringColor} ring-2 shadow-lg` : ""}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h3
                  className={`font-semibold text-sm ${
                    !isActive
                      ? "text-gray-500 dark:text-gray-400"
                      : config.textColor
                  }`}
                >
                  {config.label}
                </h3>
                {isLatest && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                  </motion.div>
                )}
              </div>

              {event && timeInfo && (
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    {timeInfo.date}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {timeInfo.time}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <p
              className={`text-xs font-medium mb-2 leading-relaxed ${
                !isActive
                  ? "text-gray-500 dark:text-gray-500"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {event?.description || config.description}
            </p>

            {/* Metadata badges */}
            {event &&
              (event.location || event.carrier || event.metadata) &&
              isActive && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {event.location && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                    >
                      <MapPin className="w-2 h-2 mr-1" />
                      {event.location}
                    </Badge>
                  )}
                  {event.carrier && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                    >
                      <Truck className="w-2 h-2 mr-1" />
                      {event.carrier}
                    </Badge>
                  )}
                  {event.metadata?.temperature && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    >
                      🌡️ {event.metadata.temperature}
                    </Badge>
                  )}
                </div>
              )}

            {/* Special indicators */}
            {isLatest && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center space-x-1 text-xs font-semibold"
              >
                <PulsingDot color="bg-green-500" size="w-2 h-2" />
                <span className="text-green-600 dark:text-green-400">
                  Latest Update
                </span>
              </motion.div>
            )}

            {!isActive && (
              <div className="flex items-center space-x-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                <span>Pending</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default function EnhancedMobileTimeline({
  events,
  currentStatus,
  estimatedDelivery,
  orderNumber,
  onRefresh,
}: EnhancedMobileTimelineProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const getStatusConfig = (status: string) => {
    return (
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.order_placed
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const shareTracking = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Order ${orderNumber} Tracking`,
          text: `Track my Nutra-Vive order: ${orderNumber}`,
          url: window.location.href,
        });
      } catch (err) {
        toast("Sharing cancelled");
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast("Tracking link copied! 📋");
      } catch (err) {
        toast("Failed to copy link");
      }
    }
  };

  // Essential customer-facing timeline steps
  const allSteps = ["order_placed", "processing", "shipped", "delivered"];

  // Create timeline with all steps, marking which ones are active
  const timelineSteps = allSteps.map((stepStatus) => {
    const actualEvent = sortedEvents.find(
      (event) => event.status === stepStatus
    );
    const stepIndex = allSteps.indexOf(stepStatus);
    const currentStepIndex = allSteps.indexOf(currentStatus);

    return {
      status: stepStatus,
      config: getStatusConfig(stepStatus),
      event: actualEvent,
      isActive: stepIndex <= currentStepIndex,
      isLatest: stepStatus === currentStatus && actualEvent,
      isCurrent: stepStatus === currentStatus,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-20"
    >
      {/* Header with refresh and share */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Tracking Timeline
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Order {orderNumber}
          </p>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 w-9 p-0 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80"
          >
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.div>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={shareTracking}
            className="h-9 w-9 p-0 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* ETA Card */}
      {estimatedDelivery && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="backdrop-blur-lg bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Estimated Delivery
                  </p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {format(new Date(estimatedDelivery), "EEEE, MMM dd")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Main timeline line */}
        <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 rounded-full" />

        {/* Completed progress line */}
        <motion.div
          initial={{ height: 0 }}
          animate={{
            height: `${(timelineSteps.filter((step) => step.isActive).length / allSteps.length) * 100}%`,
          }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute left-7 top-0 w-0.5 bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 rounded-full z-10"
        />

        <div className="space-y-6">
          {/* All timeline steps */}
          {timelineSteps.map((step, index) => (
            <div key={step.status} className="relative">
              <StatusCard
                event={step.event}
                config={step.config}
                index={index}
                isLatest={!!step.isLatest}
                isNext={!step.isActive}
                isActive={step.isActive}
                isCurrent={step.isCurrent}
              />

              {/* Connecting line to next step */}
              {index < timelineSteps.length - 1 && (
                <div className="absolute left-7 top-14 transform -translate-x-1/2">
                  <ConnectingLine
                    isCompleted={step.isActive}
                    isActive={step.isCurrent}
                    height="h-6"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Support Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full backdrop-blur-sm bg-white/50 dark:bg-gray-800/50"
              >
                <Phone className="w-4 h-4 mr-2" />
                Support
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full backdrop-blur-sm bg-white/50 dark:bg-gray-800/50"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
