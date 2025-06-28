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
  Navigation,
  Warehouse,
  TruckIcon,
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
  Sparkles,
  Rocket,
  Target,
  Calendar,
  Timer,
  Activity,
  BarChart3,
  Award,
  TrendingUp,
  Star,
  Heart,
  Users,
  ShoppingBag,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

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

interface EnhancedDesktopTimelineProps {
  events: TrackingEvent[];
  currentStatus: string;
  estimatedDelivery?: string;
  orderNumber: string;
  order?: any;
  trackingInfo?: any;
  onRefresh: () => void;
  className?: string;
}

const statusConfig = {
  order_placed: {
    icon: ShoppingBag,
    label: "Order Placed",
    gradient: "from-blue-500 to-blue-600",
    bgGradient:
      "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
    textColor: "text-blue-700 dark:text-blue-300",
    ringColor: "ring-blue-300 dark:ring-blue-700",
    description: "Your premium organic order has been received and confirmed!",
    emoji: "🛒",
    celebrationIcons: [Heart, Star, Gift],
    accentColor: "blue",
  },
  payment_confirmed: {
    icon: CreditCard,
    label: "Payment Secured",
    gradient: "from-emerald-500 to-green-600",
    bgGradient:
      "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
    textColor: "text-green-700 dark:text-green-300",
    ringColor: "ring-green-300 dark:ring-green-700",
    description: "Payment verified & processing initiated",
    emoji: "💳",
    celebrationIcons: [Shield, CheckCircle, Crown],
    accentColor: "green",
  },
  processing: {
    icon: Factory,
    label: "Preparing Your Order",
    gradient: "from-amber-500 to-orange-600",
    bgGradient:
      "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
    textColor: "text-amber-700 dark:text-amber-300",
    ringColor: "ring-amber-300 dark:ring-amber-700",
    description: "Your order is being carefully prepared and packaged",
    emoji: "📦",
    celebrationIcons: [Coffee, Leaf, Sparkles],
    accentColor: "amber",
  },
  shipped: {
    icon: Truck,
    label: "On The Way",
    gradient: "from-purple-500 to-indigo-600",
    bgGradient:
      "from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20",
    textColor: "text-purple-700 dark:text-purple-300",
    ringColor: "ring-purple-300 dark:ring-purple-700",
    description: "Your order is in transit and heading your way",
    emoji: "🚛",
    celebrationIcons: [Rocket, TrendingUp, Target],
    accentColor: "purple",
  },
  in_transit: {
    icon: Navigation,
    label: "En Route to You",
    gradient: "from-cyan-500 to-blue-600",
    bgGradient:
      "from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20",
    textColor: "text-cyan-700 dark:text-cyan-300",
    ringColor: "ring-cyan-300 dark:ring-cyan-700",
    description: "Traveling through our premium network",
    emoji: "✈️",
    celebrationIcons: [Navigation, Activity, BarChart3],
    accentColor: "cyan",
  },
  out_for_delivery: {
    icon: TruckIcon,
    label: "Almost There",
    gradient: "from-orange-500 to-red-600",
    bgGradient:
      "from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20",
    textColor: "text-orange-700 dark:text-orange-300",
    ringColor: "ring-orange-300 dark:ring-orange-700",
    description: "Final mile - your wellness awaits!",
    emoji: "🚛",
    celebrationIcons: [Timer, Zap, Award],
    accentColor: "orange",
  },
  delivered: {
    icon: CheckCircle,
    label: "Delivered",
    gradient: "from-green-500 to-emerald-600",
    bgGradient:
      "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
    textColor: "text-green-700 dark:text-green-300",
    ringColor: "ring-green-300 dark:ring-green-700",
    description: "Your order has been successfully delivered",
    emoji: "✅",
    celebrationIcons: [ThumbsUp, Crown, Heart],
    accentColor: "green",
  },
  exception: {
    icon: AlertTriangle,
    label: "Attention Needed",
    gradient: "from-red-500 to-pink-600",
    bgGradient:
      "from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20",
    textColor: "text-red-700 dark:text-red-300",
    ringColor: "ring-red-300 dark:ring-red-700",
    description: "We're resolving this quickly for you",
    emoji: "⚠️",
    celebrationIcons: [Shield, Users, Phone],
    accentColor: "red",
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
    <Icon className="w-5 h-5 text-white/80" />
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
  height = "h-20",
  color = "emerald",
}: {
  isActive?: boolean;
  isCompleted?: boolean;
  height?: string;
  color?: string;
}) => (
  <div className={`w-1 ${height} relative mx-auto`}>
    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full" />

    {(isActive || isCompleted) && (
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: "100%" }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className={`absolute inset-0 bg-gradient-to-b from-${color}-400 to-${color}-600 rounded-full`}
      />
    )}

    {isActive && (
      <motion.div
        animate={{ y: [-10, 60, -10] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 w-2 h-4 bg-white rounded-full shadow-lg"
        style={{ left: "50%", transform: "translateX(-50%)" }}
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
      const timer = setTimeout(() => setShowCelebration(false), 8000);
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
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.2,
        type: "spring",
        stiffness: 200,
        damping: 25,
      }}
      className="relative"
    >
      <div className="flex items-start space-x-6">
        {/* Status Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: index * 0.2 + 0.3,
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${
            !isActive
              ? "from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700"
              : config.gradient
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
                  delay={i * 0.7}
                  className={`${
                    i === 0
                      ? "-top-3 -left-3"
                      : i === 1
                        ? "-top-4 -right-2"
                        : "-bottom-3 left-1"
                  }`}
                />
              )
            )}

          {/* Pulsing effect for active status */}
          {isLatest && (
            <motion.div
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${config.gradient} opacity-40`}
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
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.2 + 0.5 }}
          className="flex-1 min-w-0"
        >
          <Card
            className={`backdrop-blur-lg ${
              !isActive
                ? "bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 opacity-60"
                : `bg-gradient-to-r ${config.bgGradient} border-transparent shadow-lg`
            } border ${
              isLatest ? `${config.ringColor} ring-2 shadow-xl` : ""
            } transition-all duration-300`}
          >
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h3
                    className={`font-semibold text-base ${
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
                        duration: 3,
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
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default function EnhancedDesktopTimeline({
  events,
  currentStatus,
  estimatedDelivery,
  orderNumber,
  order,
  trackingInfo,
  onRefresh,
  className = "",
}: EnhancedDesktopTimelineProps) {
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-0 shadow-2xl">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Tracking Timeline
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Order {orderNumber}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {estimatedDelivery && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl border border-emerald-200 dark:border-emerald-800"
                >
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Estimated Delivery
                    </p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {format(new Date(estimatedDelivery), "EEEE, MMM dd")}
                    </p>
                  </div>
                </motion.div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-800"
              >
                <motion.div
                  animate={isRefreshing ? { rotate: 360 } : {}}
                  transition={{
                    duration: 1,
                    repeat: isRefreshing ? Infinity : 0,
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                </motion.div>
                Refresh
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={shareTracking}
                className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-800"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="relative">
            {/* Main timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-700 rounded-full" />

            {/* Completed progress line */}
            <motion.div
              initial={{ height: 0 }}
              animate={{
                height: `${(timelineSteps.filter((step) => step.isActive).length / allSteps.length) * 100}%`,
              }}
              transition={{ duration: 2.5, ease: "easeOut" }}
              className="absolute left-8 top-0 w-1 bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 rounded-full z-10"
            />

            <div className="space-y-4">
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
                    <div className="absolute left-8 top-12 transform -translate-x-1/2">
                      <ConnectingLine
                        isCompleted={step.isActive}
                        isActive={step.isCurrent}
                        height="h-4"
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
            transition={{ delay: 0.8 }}
            className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Need Assistance?
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Our wellness support team is here to help
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Support
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Live Chat
                </Button>
                {trackingInfo?.trackingNumber && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Track with Carrier
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
