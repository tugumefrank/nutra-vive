"use client";

import React from "react"; // ✅ Add this import
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  FileText,
  User,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  XCircle,
  Activity,
  DollarSign,
  MapPin,
  MessageSquare,
  Bell,
  Download,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Types
interface Consultation {
  _id: string;
  consultationNumber: string;
  status: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  totalAmount: number;
  createdAt: string;
  scheduledAt?: string;
  servicePreferences: {
    servicesInterested: string[];
    urgencyLevel: string;
    communicationPreference: string;
  };
}

interface ConsultationCardProps {
  consultation: Consultation;
  unreadNotesCount?: number;
  mealPlanFilesCount?: number;
}

interface ConsultationStatsProps {
  total: number;
  pending: number;
  completed: number;
}

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  icon: string;
}

// ConsultationCard Component
export function ConsultationCard({ 
  consultation, 
  unreadNotesCount = 0, 
  mealPlanFilesCount = 0 
}: ConsultationCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          color:
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          icon: CheckCircle,
          iconColor: "text-green-600",
        };
      case "confirmed":
        return {
          color:
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          icon: Clock,
          iconColor: "text-blue-600",
        };
      case "pending":
        return {
          color:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          icon: AlertCircle,
          iconColor: "text-yellow-600",
        };
      case "cancelled":
        return {
          color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          icon: XCircle,
          iconColor: "text-red-600",
        };
      default:
        return {
          color:
            "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
          icon: Clock,
          iconColor: "text-gray-600",
        };
    }
  };

  const statusConfig = getStatusConfig(consultation.status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all relative">
        {/* Notification badges */}
        {(unreadNotesCount > 0 || mealPlanFilesCount > 0) && (
          <div className="absolute -top-2 -right-2 flex gap-2 z-10">
            {unreadNotesCount > 0 && (
              <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Bell className="w-3 h-3" />
                {unreadNotesCount}
              </div>
            )}
            {mealPlanFilesCount > 0 && (
              <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Download className="w-3 h-3" />
                {mealPlanFilesCount}
              </div>
            )}
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800`}
              >
                <StatusIcon className={`w-5 h-5 ${statusConfig.iconColor}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Consultation #{consultation.consultationNumber}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {consultation.personalInfo.firstName}{" "}
                  {consultation.personalInfo.lastName}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 self-start sm:self-auto">
              <Badge className={`${statusConfig.color} w-fit`}>
                {consultation.status}
              </Badge>
              <span className="text-lg sm:text-sm font-medium text-gray-900 dark:text-white">
                ${consultation.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>
                Created: {new Date(consultation.createdAt).toLocaleDateString()}
              </span>
            </div>

            {consultation.scheduledAt && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>
                  Scheduled:{" "}
                  {new Date(consultation.scheduledAt).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <User className="w-4 h-4" />
              <span>
                {consultation.servicePreferences.communicationPreference}
              </span>
            </div>
          </div>

          {/* Services */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Services:
            </p>
            <div className="flex flex-wrap gap-2">
              {consultation.servicePreferences.servicesInterested.map(
                (service, index) => (
                  <Badge
                    key={`${service}-${index}`}
                    variant="outline"
                    className="text-xs"
                  >
                    {service
                      .replace("-", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                )
              )}
            </div>
          </div>

          {/* Urgency */}
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Urgency:{" "}
                {consultation.servicePreferences.urgencyLevel.replace("-", " ")}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              ID: {consultation._id.slice(-8)}
            </div>

            <Button variant="ghost" size="sm" asChild>
              <Link href={`/account/consultations/${consultation._id}`}>
                View Details
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ConsultationStats Component
export function ConsultationStats({
  total,
  pending,
  completed,
}: ConsultationStatsProps) {
  const stats = [
    {
      title: "Total Consultations",
      value: total,
      icon: FileText,
      color: "from-blue-500 to-blue-600",
      change: `${total} sessions`,
    },
    {
      title: "Active Sessions",
      value: pending,
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
      change: pending > 0 ? "Attention needed" : "All up to date",
    },
    {
      title: "Completed",
      value: completed,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      change: `${Math.round((completed / Math.max(total, 1)) * 100)}% completion rate`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
          >
            <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stat.change}
                    </p>
                  </div>
                  <div
                    className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}
                  >
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

// EmptyState Component
export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {description}
      </p>
      <Button
        asChild
        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
      >
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </motion.div>
  );
}
