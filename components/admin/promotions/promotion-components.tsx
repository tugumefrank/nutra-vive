// components/admin/promotions/promotion-components.tsx

import React from "react";
import {
  TrendingUp,
  MoreHorizontal,
  Edit,
  Eye,
  Copy,
  ToggleLeft,
  ToggleRight,
  Trash2,
  DollarSign,
  Percent,
  X,
  LucideIcon,
} from "lucide-react";
import {
  IPromotion,
  Notification as PromotionNotification,
} from "@/types/promotions";

// StatCard Component Props
interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  color?:
    | "blue"
    | "green"
    | "orange"
    | "purple"
    | "emerald"
    | "indigo"
    | "red"
    | "yellow";
}

// StatCard Component
export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  color = "blue",
}) => (
  <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
    <div
      className={`absolute inset-0 bg-gradient-to-r from-${color}-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity`}
    />
    <div className="p-6 relative">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div
          className={`p-3 rounded-full bg-gradient-to-br from-${color}-500 to-purple-500 text-white`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-green-500 font-medium">{trend}</span>
          <span className="text-muted-foreground ml-1">vs last month</span>
        </div>
      )}
    </div>
  </div>
);

// PromotionCard Component Props
interface PromotionCardProps {
  promotion: IPromotion;
  onEdit: (promotion: IPromotion) => void;
  onToggle: (promotionId: string) => void;
  onDelete: (promotionId: string) => void;
  onView: (promotion: IPromotion) => void;
  onDuplicate: (promotion: IPromotion) => void;
}

// PromotionCard Component
export const PromotionCard: React.FC<PromotionCardProps> = ({
  promotion,
  onEdit,
  onToggle,
  onDelete,
  onView,
  onDuplicate,
}) => (
  <div className="group relative overflow-hidden rounded-xl border bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="p-6 relative">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{promotion.name}</h3>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                promotion.isActive
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              }`}
            >
              {promotion.isActive ? "Active" : "Inactive"}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
              {promotion.type}
            </span>
          </div>
        </div>
        <div className="relative">
          <div className="group/menu relative">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg py-1 min-w-[160px] opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50">
              <button
                onClick={() => onEdit(promotion)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => onView(promotion)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>
              <button
                onClick={() => onDuplicate(promotion)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </button>
              <div className="border-t my-1"></div>
              <button
                onClick={() => onToggle(promotion._id)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {promotion.isActive ? (
                  <ToggleLeft className="h-4 w-4" />
                ) : (
                  <ToggleRight className="h-4 w-4" />
                )}
                {promotion.isActive ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={() => onDelete(promotion._id)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Discount</p>
            <p className="font-semibold flex items-center">
              {promotion.discountType === "percentage" ? (
                <>
                  <Percent className="h-4 w-4 mr-1" />
                  {promotion.discountValue}%
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-1" />
                  {promotion.discountValue}
                </>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Redemptions</p>
            <p className="font-semibold">{promotion.totalRedemptions || 0}</p>
          </div>
        </div>

        {promotion.usageLimit && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Usage Progress</span>
              <span>
                {Math.round(
                  ((promotion.totalRedemptions || 0) / promotion.usageLimit) *
                    100
                )}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(((promotion.totalRedemptions || 0) / promotion.usageLimit) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            {promotion.codes?.slice(0, 2).map((code, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              >
                {typeof code === "string" ? code : code.code}
              </span>
            ))}
            {promotion.codes && promotion.codes.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{promotion.codes.length - 2} more
              </span>
            )}
          </div>
          <div className="text-sm font-semibold text-green-600">
            ${(promotion.totalRevenue || 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Notification Component Props
interface NotificationProps {
  notification: PromotionNotification | null;
  onClose: () => void;
}

// Notification Component
export const Notification: React.FC<NotificationProps> = ({
  notification,
  onClose,
}) => {
  if (!notification) return null;

  const getBgColor = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-100 text-green-800 border border-green-200";
      case "error":
        return "bg-red-100 text-red-800 border border-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "info":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg max-w-sm ${getBgColor()}`}
      >
        <span className="font-medium">{notification.message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-70">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Empty State Component Props
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

// Empty State Component
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="text-center py-12">
    <Icon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
      {title}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

// Loading Component Props
interface LoadingSpinnerProps {
  message?: string;
}

// Loading Component
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
}) => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">{message}</span>
  </div>
);
