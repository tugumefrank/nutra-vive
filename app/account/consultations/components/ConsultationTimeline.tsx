"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ConsultationTimelineProps {
  consultation: {
    _id: string;
    status: string;
    createdAt: string;
    scheduledAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    paymentStatus: string;
    consultantNotes?: string;
  };
}

export function ConsultationTimeline({ consultation }: ConsultationTimelineProps) {
  const timelineEvents = [
    {
      id: 1,
      title: "Consultation Requested",
      description: "Initial consultation form submitted",
      date: consultation.createdAt,
      status: "completed",
      icon: FileText,
    },
    {
      id: 2,
      title: "Payment Processed",
      description: `Payment ${consultation.paymentStatus}`,
      date: consultation.createdAt,
      status: consultation.paymentStatus === "completed" ? "completed" : "pending",
      icon: CheckCircle,
    },
    ...(consultation.scheduledAt ? [{
      id: 3,
      title: "Consultation Scheduled",
      description: "Meeting time confirmed",
      date: consultation.scheduledAt,
      status: "completed",
      icon: Calendar,
    }] : []),
    ...(consultation.completedAt ? [{
      id: 4,
      title: "Consultation Completed",
      description: "Session finished successfully",
      date: consultation.completedAt,
      status: "completed",
      icon: CheckCircle,
    }] : consultation.status === "confirmed" ? [{
      id: 4,
      title: "Awaiting Consultation",
      description: "Scheduled consultation pending",
      date: consultation.scheduledAt || new Date().toISOString(),
      status: "pending",
      icon: Clock,
    }] : []),
    ...(consultation.cancelledAt ? [{
      id: 5,
      title: "Consultation Cancelled",
      description: "Session was cancelled",
      date: consultation.cancelledAt,
      status: "cancelled",
      icon: AlertCircle,
    }] : []),
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30";
      case "pending":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30";
      case "cancelled":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Consultation Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timelineEvents.map((event, index) => {
            const Icon = event.icon;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(event.status)}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </h4>
                    <Badge className={`text-xs ${getStatusColor(event.status)} border-0`}>
                      {event.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {event.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {formatDate(event.date)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {consultation.consultantNotes && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Consultant Notes:
                </span>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1 whitespace-pre-wrap">
                  {consultation.consultantNotes}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}