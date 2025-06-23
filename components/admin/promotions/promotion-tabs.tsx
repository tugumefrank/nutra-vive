// components/admin/promotions/promotion-tabs.tsx

import React from "react";
import {
  Search,
  Filter,
  Plus,
  Gift,
  Zap,
  TrendingUp,
  Users,
  UserPlus,
  BarChart3,
  FileText,
  Download,
} from "lucide-react";
import {
  PromotionCard,
  EmptyState,
  LoadingSpinner,
} from "./promotion-components";
import {
  IPromotion,
  PromotionFilters,
  PromotionStats,
} from "@/types/promotions";

// Overview Tab Component Props
interface OverviewTabProps {
  promotions: IPromotion[];
  stats: PromotionStats;
}

// Overview Tab Component
export const OverviewTab: React.FC<OverviewTabProps> = ({
  promotions,
  stats,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Performance Overview */}
    <div className="rounded-xl border bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5" />
        Performance Overview
      </h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm">Redemption Rate</span>
          <span className="font-semibold">68%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: "68%" }}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm">Customer Engagement</span>
          <span className="font-semibold">84%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            className="bg-green-600 h-2 rounded-full"
            style={{ width: "84%" }}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm">Revenue Impact</span>
          <span className="font-semibold">92%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            className="bg-purple-600 h-2 rounded-full"
            style={{ width: "92%" }}
          />
        </div>
      </div>
    </div>

    {/* Top Performing Promotions */}
    <div className="rounded-xl border bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5" />
        Top Performing Promotions
      </h3>
      <div className="space-y-4">
        {stats.topPerformingPromotions.slice(0, 3).map((promotion, index) => (
          <div
            key={`${promotion.name}-${index}`}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/50"
          >
            <div>
              <p className="font-medium">{promotion.name}</p>
              <p className="text-sm text-muted-foreground">
                {promotion.totalRedemptions || 0} redemptions
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                ${(promotion.totalRevenue || 0).toLocaleString()}
              </p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                #{index + 1}
              </span>
            </div>
          </div>
        ))}
        {stats.topPerformingPromotions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No performance data available yet
          </p>
        )}
      </div>
    </div>
  </div>
);

// Promotions Tab Component Props
interface PromotionsTabProps {
  promotions: IPromotion[];
  filters: PromotionFilters;
  onFiltersChange: (filters: Partial<PromotionFilters>) => void;
  onCreatePromotion: () => void;
  onEditPromotion: (promotion: IPromotion) => void;
  onTogglePromotion: (promotionId: string) => void;
  onDeletePromotion: (promotionId: string) => void;
  onViewPromotion: (promotion: IPromotion) => void;
  onDuplicatePromotion: (promotion: IPromotion) => void;
  isLoading: boolean;
}

// Promotions Tab Component
export const PromotionsTab: React.FC<PromotionsTabProps> = ({
  promotions,
  filters,
  onFiltersChange,
  onCreatePromotion,
  onEditPromotion,
  onTogglePromotion,
  onDeletePromotion,
  onViewPromotion,
  onDuplicatePromotion,
  isLoading,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ search: e.target.value });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ type: e.target.value as PromotionFilters["type"] });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search promotions..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <select
            value={filters.type}
            onChange={handleTypeChange}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Promotions</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="seasonal">Seasonal</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <LoadingSpinner message="Loading promotions..." />}

      {/* Promotions Grid */}
      {!isLoading && promotions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promotion) => (
            <PromotionCard
              key={promotion._id}
              promotion={promotion}
              onEdit={onEditPromotion}
              onToggle={onTogglePromotion}
              onDelete={onDeletePromotion}
              onView={onViewPromotion}
              onDuplicate={onDuplicatePromotion}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && promotions.length === 0 && (
        <EmptyState
          icon={Gift}
          title="No promotions found"
          description={
            filters.search || filters.type !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first promotion"
          }
          actionLabel="Create Promotion"
          onAction={onCreatePromotion}
        />
      )}
    </div>
  );
};

// Customers Tab Component Props
interface CustomersTabProps {}

// Customers Tab Component
export const CustomersTab: React.FC<CustomersTabProps> = () => (
  <div className="space-y-6">
    <div className="rounded-xl border bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <UserPlus className="h-5 w-5" />
        Customer Assignment Management
      </h3>
      <p className="text-muted-foreground mb-6">
        Assign promotions to specific customers or customer segments
      </p>
      <div className="space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search customers..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            <UserPlus className="h-4 w-4" />
            Assign Promotion
          </button>
        </div>

        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No customer assignments yet</p>
          <p className="text-sm">
            Start by assigning promotions to customers or segments
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Analytics Tab Component Props
interface AnalyticsTabProps {
  onExport: () => void;
}

// Analytics Tab Component
export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ onExport }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue by Promotion Type */}
      <div className="rounded-xl border bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5" />
          Revenue by Promotion Type
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Seasonal</span>
            <span className="font-semibold">$18,200</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: "75%" }}
            />
          </div>

          <div className="flex justify-between items-center">
            <span>Custom</span>
            <span className="font-semibold">$8,450</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: "35%" }}
            />
          </div>

          <div className="flex justify-between items-center">
            <span>Flash Sale</span>
            <span className="font-semibold">$2,000</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              className="bg-purple-600 h-2 rounded-full"
              style={{ width: "8%" }}
            />
          </div>
        </div>
      </div>

      {/* Export & Reports */}
      <div className="rounded-xl border bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5" />
          Export & Reports
        </h3>
        <div className="space-y-3">
          <button
            onClick={onExport}
            className="w-full flex items-center justify-start gap-2 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export All Promotions (CSV)
          </button>
          <button className="w-full flex items-center justify-start gap-2 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Download className="h-4 w-4" />
            Export Usage Data (Excel)
          </button>
          <button className="w-full flex items-center justify-start gap-2 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <FileText className="h-4 w-4" />
            Generate Performance Report
          </button>
        </div>
      </div>
    </div>
  </div>
);
