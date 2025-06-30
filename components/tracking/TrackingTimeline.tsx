"use client";

import { motion } from "framer-motion";
import {
  Package,
  CreditCard,
  Wrench,
  Truck,
  MapPin,
  Home,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  };
}

interface TrackingTimelineProps {
  events: TrackingEvent[];
  currentStatus: string;
  estimatedDelivery?: string;
  className?: string;
}

const statusConfig = {
  order_placed: {
    icon: Package,
    label: "Order Placed",
    color: "bg-blue-500",
    textColor: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  payment_confirmed: {
    icon: CreditCard,
    label: "Payment Confirmed",
    color: "bg-green-500",
    textColor: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
  },
  processing: {
    icon: Wrench,
    label: "Processing",
    color: "bg-yellow-500",
    textColor: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
  },
  shipped: {
    icon: Truck,
    label: "Shipped",
    color: "bg-purple-500",
    textColor: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
  in_transit: {
    icon: MapPin,
    label: "In Transit",
    color: "bg-indigo-500",
    textColor: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    borderColor: "border-indigo-200 dark:border-indigo-800",
  },
  out_for_delivery: {
    icon: Truck,
    label: "Out for Delivery",
    color: "bg-orange-500",
    textColor: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
  delivered: {
    icon: Home,
    label: "Delivered",
    color: "bg-green-600",
    textColor: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
  },
  exception: {
    icon: AlertTriangle,
    label: "Exception",
    color: "bg-red-500",
    textColor: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
  },
  returned: {
    icon: RefreshCw,
    label: "Returned",
    color: "bg-gray-500",
    textColor: "text-gray-600",
    bgColor: "bg-gray-50 dark:bg-gray-900/20",
    borderColor: "border-gray-200 dark:border-gray-800",
  },
};

export default function TrackingTimeline({
  events,
  currentStatus,
  estimatedDelivery,
  className = "",
}: TrackingTimelineProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const getStatusConfig = (status: string) => {
    return (
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.order_placed
    );
  };

  const isEventCompleted = (eventIndex: number) => {
    return eventIndex < sortedEvents.length;
  };

  const formatEventTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: format(date, "MMM dd, yyyy"),
      time: format(date, "h:mm a"),
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Tracking Timeline
            </CardTitle>
            {estimatedDelivery && (
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
              >
                <Clock className="w-3 h-3 mr-1" />
                ETA: {format(new Date(estimatedDelivery), "MMM dd")}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />

            {/* Timeline Events */}
            <div className="space-y-6">
              {sortedEvents.map((event, index) => {
                const config = getStatusConfig(event.status);
                const Icon = config.icon;
                const timeInfo = formatEventTime(event.timestamp);
                const isLatest = index === sortedEvents.length - 1;

                return (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex items-start space-x-4"
                  >
                    {/* Timeline Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: index * 0.1 + 0.2,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${config.color} shadow-lg ${
                        isLatest
                          ? "ring-4 ring-white dark:ring-gray-900 shadow-xl"
                          : ""
                      }`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                      {isLatest && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 rounded-full bg-white/30"
                        />
                      )}
                    </motion.div>

                    {/* Event Details */}
                    <div className="flex-1 min-w-0">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className={`p-4 rounded-xl border ${config.bgColor} ${config.borderColor} ${
                          isLatest
                            ? "ring-2 ring-green-200 dark:ring-green-800"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-semibold ${config.textColor}`}>
                            {config.label}
                          </h3>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {timeInfo.date}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {timeInfo.time}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {event.description}
                        </p>

                        {(event.location ||
                          event.carrier ||
                          event.metadata?.facility) && (
                          <div className="flex flex-wrap gap-2 text-xs">
                            {event.location && (
                              <Badge
                                variant="outline"
                                className="bg-white/50 dark:bg-gray-800/50"
                              >
                                <MapPin className="w-3 h-3 mr-1" />
                                {event.location}
                              </Badge>
                            )}
                            {event.carrier && (
                              <Badge
                                variant="outline"
                                className="bg-white/50 dark:bg-gray-800/50"
                              >
                                <Truck className="w-3 h-3 mr-1" />
                                {event.carrier}
                              </Badge>
                            )}
                            {event.metadata?.facility && (
                              <Badge
                                variant="outline"
                                className="bg-white/50 dark:bg-gray-800/50"
                              >
                                {event.metadata.facility}
                              </Badge>
                            )}
                          </div>
                        )}

                        {isLatest && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-3 flex items-center text-xs text-green-600 dark:text-green-400"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Latest Update
                          </motion.div>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Future Status Placeholder */}
            {currentStatus !== "delivered" && currentStatus !== "cancelled" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: sortedEvents.length * 0.1 + 0.5 }}
                className="relative flex items-start space-x-4 mt-6"
              >
                <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Next Update Coming Soon
                    </h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      We'll notify you when there's a new update on your order
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
