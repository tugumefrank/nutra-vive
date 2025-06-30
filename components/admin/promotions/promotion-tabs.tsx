// components/admin/promotions/promotion-tabs.tsx

import React, { useState } from "react";
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
  DollarSign,
  X,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
interface CustomersTabProps {
  promotions?: IPromotion[];
}

// Customers Tab Component
export const CustomersTab: React.FC<CustomersTabProps> = ({ promotions = [] }) => {
  const [selectedPromotion, setSelectedPromotion] = React.useState<string>("");
  const [selectedSegment, setSelectedSegment] = React.useState<string>("");
  const [selectedCustomers, setSelectedCustomers] = React.useState<string[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [customerTargeting, setCustomerTargeting] = React.useState<any>(null);
  const [assignments, setAssignments] = React.useState<any[]>([]);

  React.useEffect(() => {
    loadCustomerTargeting();
    loadAssignments();
  }, []);

  const loadCustomerTargeting = async () => {
    try {
      // Import the server action dynamically to avoid SSR issues
      const { getPromotionTargetingOptions } = await import('@/lib/actions/promotionServerActions');
      const data = await getPromotionTargetingOptions();
      if (data.success) {
        setCustomerTargeting(data);
      }
    } catch (error) {
      console.error('Failed to load customer targeting data:', error);
    }
  };

  const loadAssignments = async () => {
    try {
      // Import the server action dynamically
      const { getPromotionAssignments } = await import('@/lib/actions/promotionServerActions');
      const data = await getPromotionAssignments();
      if (data.success) {
        setAssignments(data.assignments || []);
      }
    } catch (error) {
      console.error('Failed to load assignments:', error);
    }
  };

  const handleAssignPromotion = async () => {
    if (!selectedPromotion) {
      toast.error('Please select a promotion');
      return;
    }

    if (!selectedSegment && selectedCustomers.length === 0) {
      toast.error('Please select a customer segment or individual customers');
      return;
    }

    setIsLoading(true);
    try {
      const { assignPromotionToCustomers } = await import('@/lib/actions/promotionServerActions');
      const result = await assignPromotionToCustomers({
        promotionId: selectedPromotion,
        customerSegment: selectedSegment || undefined,
        customerIds: selectedCustomers.length > 0 ? selectedCustomers : undefined,
        sendNotification: true
      });

      if (result.success) {
        toast.success(`Promotion assigned to ${result.assignedCount} customers successfully!`);
        loadAssignments();
        setSelectedPromotion("");
        setSelectedSegment("");
        setSelectedCustomers([]);
      } else {
        throw new Error(result.error || 'Failed to assign promotion');
      }
    } catch (error) {
      console.error('Assignment error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to assign promotion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAssignment = (assignmentId: string) => {
    setAssignmentToRemove(assignmentId);
    setRemoveAssignmentDialogOpen(true);
  };

  const confirmRemoveAssignment = async () => {
    if (!assignmentToRemove) return;

    try {
      const { removePromotionAssignment } = await import('@/lib/actions/promotionServerActions');
      const result = await removePromotionAssignment(assignmentToRemove);
      
      if (result.success) {
        toast.success('Promotion assignment removed successfully!');
        loadAssignments();
      } else {
        toast.error(result.error || 'Failed to remove assignment');
      }
    } catch (error) {
      console.error('Failed to remove assignment:', error);
      toast.error('Failed to remove assignment');
    } finally {
      // Close dialog and reset state
      setRemoveAssignmentDialogOpen(false);
      setAssignmentToRemove(null);
    }
  };

  const activePromotions = promotions.filter(p => p.isActive);
  const filteredCustomers = customerTargeting?.customers?.filter((customer: any) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Assignment Form */}
      <div className="rounded-xl border bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <UserPlus className="h-5 w-5" />
          Assign Promotions to Customers
        </h3>
        <p className="text-muted-foreground mb-6">
          Target specific customers or segments with promotions
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Promotion Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Promotion</label>
              <select
                value={selectedPromotion}
                onChange={(e) => setSelectedPromotion(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose promotion...</option>
                {activePromotions.map(promotion => (
                  <option key={promotion._id} value={promotion._id}>
                    {promotion.name} - {promotion.discountType === 'percentage' ? `${promotion.discountValue}%` : `$${promotion.discountValue}`} OFF
                  </option>
                ))}
              </select>
            </div>

            {/* Segment Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Target Customer Segment
                <span className="text-xs text-muted-foreground ml-2">(Choose segment OR individual customers below)</span>
              </label>
              <select
                value={selectedSegment}
                onChange={(e) => {
                  setSelectedSegment(e.target.value);
                  // Clear individual selections when segment is selected
                  if (e.target.value) {
                    setSelectedCustomers([]);
                  }
                }}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a customer segment...</option>
                <option value="new_customers">New Customers ({customerTargeting?.segments?.new_customers || 0})</option>
                <option value="returning_customers">Returning Customers ({customerTargeting?.segments?.returning_customers || 0})</option>
                <option value="vip_customers">VIP Customers ({customerTargeting?.segments?.vip_customers || 0})</option>
                <option value="high_value">High Value ({customerTargeting?.segments?.high_value || 0})</option>
                <option value="at_risk">At Risk ({customerTargeting?.segments?.at_risk || 0})</option>
                <option value="recent_buyers">Recent Buyers ({customerTargeting?.segments?.recent_buyers || 0})</option>
              </select>
              {selectedSegment && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Targeting: {selectedSegment.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} segment
                </p>
              )}
            </div>
          </div>

          {/* Individual Customer Selection */}
          <div className={`space-y-4 ${selectedSegment ? 'opacity-50' : ''}`}>
            <div>
              <label className="block text-sm font-medium mb-2">
                Or Select Individual Customers
                <span className="text-xs text-muted-foreground ml-2">(Disabled when segment is selected)</span>
              </label>
              <input
                type="text"
                placeholder={selectedSegment ? "Customer segment selected..." : "Search customers..."}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // Clear segment when individual search starts
                  if (e.target.value && selectedSegment) {
                    setSelectedSegment("");
                  }
                }}
                disabled={!!selectedSegment}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                {selectedSegment ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Customer segment selected</p>
                    <p className="text-xs">Individual selection is disabled</p>
                  </div>
                ) : (
                  filteredCustomers.slice(0, 10).map((customer: any) => (
                    <label key={customer._id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer._id)}
                        onChange={(e) => {
                          // Clear segment when individual customer is selected
                          if (e.target.checked && selectedSegment) {
                            setSelectedSegment("");
                          }
                          if (e.target.checked) {
                            setSelectedCustomers([...selectedCustomers, customer._id]);
                          } else {
                            setSelectedCustomers(selectedCustomers.filter(id => id !== customer._id));
                          }
                        }}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                      </div>
                    </label>
                  ))
                )}
                {!selectedSegment && searchTerm && filteredCustomers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">No customers found</p>
                )}
              </div>
              {selectedCustomers.length > 0 && (
                <p className="text-sm text-blue-600 mt-2">{selectedCustomers.length} customers selected</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleAssignPromotion}
            disabled={isLoading || !selectedPromotion}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Assigning...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Assign Promotion
              </>
            )}
          </button>
        </div>
      </div>

      {/* Current Assignments */}
      <div className="rounded-xl border bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Users className="h-5 w-5" />
          Active Assignments
        </h3>

        {assignments.length > 0 ? (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment._id} className="flex items-center justify-between p-4 rounded-lg border bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{assignment.promotionName}</h4>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      assignment.promotion?.discountType === 'percentage'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {assignment.promotion?.discountType === 'percentage'
                        ? `${assignment.promotion.discountValue}% OFF`
                        : `$${assignment.promotion?.discountValue} OFF`
                      }
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {assignment.targetType === 'segment' ? (
                      `${assignment.customerSegment?.replace('_', ' ').toUpperCase()} segment - ${assignment.customerCount} customers`
                    ) : (
                      `${assignment.customerCount} individual customers`
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Assigned {new Date(assignment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-green-600">
                    {assignment.redemptionCount || 0} used
                  </span>
                  <button
                    onClick={() => handleRemoveAssignment(assignment._id)}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-red-500 hover:text-red-600"
                    title="Remove assignment"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No promotion assignments yet</p>
            <p className="text-sm">
              Start by assigning promotions to customers or segments above
            </p>
          </div>
        )}
      </div>

      {/* Segment Overview */}
      {customerTargeting?.segments && (
        <div className="rounded-xl border bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5" />
            Customer Segments Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(customerTargeting.segments).map(([segment, count]) => (
              <div key={segment} className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="text-2xl font-bold text-blue-600">{count as number}</div>
                <div className="text-xs text-muted-foreground capitalize">
                  {segment.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Analytics Tab Component Props
interface AnalyticsTabProps {
  onExport: () => void;
}

// Analytics Tab Component
export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ onExport }) => {
  const [analytics, setAnalytics] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [timeRange, setTimeRange] = React.useState('7d');

  React.useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const { getPromotionAnalytics } = await import('@/lib/actions/promotionServerActions');
      const data = await getPromotionAnalytics({ timeRange });
      if (data.success) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportUsageData = async () => {
    try {
      const response = await fetch('/api/promotions/export-usage');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `promotion-usage-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export usage data:', error);
    }
  };

  const generateReport = async () => {
    try {
      const response = await fetch('/api/promotions/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeRange })
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `promotion-performance-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="animate-pulse h-8 bg-gray-200 rounded w-48"></div>
          <div className="animate-pulse h-8 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border bg-gray-100 h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Promotion Analytics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Usage</p>
              <p className="text-2xl font-bold">{analytics?.analytics?.totalUsage || 0}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">${(analytics?.analytics?.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold">${(analytics?.analytics?.avgOrderValue || 0).toFixed(2)}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unique Customers</p>
              <p className="text-2xl font-bold">{analytics?.analytics?.uniqueCustomerCount || 0}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="rounded-xl border bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5" />
            Revenue Trend
          </h3>
          {analytics?.timeSeriesData && analytics.timeSeriesData.length > 0 ? (
            <div className="space-y-3">
              {analytics.timeSeriesData.slice(-7).map((point: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">
                    {new Date(point._id.year, point._id.month - 1, point._id.day).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-4 flex-1 ml-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ 
                          width: `${Math.min(100, (point.revenue / Math.max(...analytics.timeSeriesData.map((p: any) => p.revenue))) * 100)}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold min-w-[60px]">
                      ${point.revenue.toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No revenue data available for the selected period</p>
            </div>
          )}
        </div>

        {/* Top Performing Promotions */}
        <div className="rounded-xl border bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5" />
            Top Performing Promotions
          </h3>
          {analytics?.topPromotions && analytics.topPromotions.length > 0 ? (
            <div className="space-y-3">
              {analytics.topPromotions.slice(0, 5).map((promo: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{promo.name}</p>
                    <p className="text-xs text-gray-600">
                      {promo.usage} uses • {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `$${promo.discountValue}`} off
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${promo.revenue.toFixed(0)}</p>
                    <p className="text-xs text-gray-500">#{index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No promotion data available</p>
            </div>
          )}
        </div>

        {/* Customer Engagement */}
        <div className="rounded-xl border bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Users className="h-5 w-5" />
            Customer Engagement
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Redemption Rate</span>
              <span className="font-semibold">
                {analytics?.analytics?.totalUsage && analytics?.analytics?.totalPromotions
                  ? `${((analytics.analytics.totalUsage / analytics.analytics.totalPromotions) * 100).toFixed(1)}%`
                  : '0%'
                }
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ 
                  width: `${analytics?.analytics?.totalUsage && analytics?.analytics?.totalPromotions
                    ? Math.min(100, (analytics.analytics.totalUsage / analytics.analytics.totalPromotions) * 100)
                    : 0
                  }%` 
                }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Avg Discount %</span>
              <span className="font-semibold">
                {analytics?.analytics?.discountPercentage?.toFixed(1) || '0'}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${Math.min(100, analytics?.analytics?.discountPercentage || 0)}%` }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Customer Satisfaction</span>
              <span className="font-semibold">92%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: "92%" }}
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
            <button 
              onClick={exportUsageData}
              className="w-full flex items-center justify-start gap-2 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export Usage Data (Excel)
            </button>
            <button 
              onClick={generateReport}
              className="w-full flex items-center justify-start gap-2 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Generate Performance Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Discounts Tab Component Props
interface ProductDiscountsTabProps {
  onCreateDiscount: () => void;
}

// Product Discounts Tab Component
export const ProductDiscountsTab: React.FC<ProductDiscountsTabProps> = ({
  onCreateDiscount,
}) => {
  const [campaigns, setCampaigns] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedCampaigns, setSelectedCampaigns] = React.useState<string[]>([]);
  const [bulkActionsOpen, setBulkActionsOpen] = React.useState(false);
  
  // Confirmation dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [campaignToDelete, setCampaignToDelete] = React.useState<string | null>(null);
  const [assignmentToRemove, setAssignmentToRemove] = React.useState<string | null>(null);
  const [removeAssignmentDialogOpen, setRemoveAssignmentDialogOpen] = React.useState(false);
  
  const [filters, setFilters] = React.useState({
    search: '',
    isActive: undefined as boolean | undefined,
    scope: '',
  });

  // Load product discount campaigns
  const loadCampaigns = React.useCallback(async () => {
    try {
      setLoading(true);
      const { getProductDiscounts } = await import('@/lib/actions/promotionServerActions');
      const result = await getProductDiscounts(filters);
      
      if (result.success) {
        setCampaigns(result.campaigns || []);
      } else {
        toast.error(result.error || 'Failed to load campaigns');
        setCampaigns([]);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Failed to load discount campaigns');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const handleToggleStatus = async (campaignId: string) => {
    try {
      const { toggleProductDiscountStatus } = await import('@/lib/actions/promotionServerActions');
      const result = await toggleProductDiscountStatus(campaignId);
      
      if (result.success) {
        toast.success(result.message);
        loadCampaigns(); // Reload campaigns
      } else {
        toast.error(result.error || 'Failed to toggle status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to toggle campaign status');
    }
  };

  const handleDeleteCampaign = (campaignId: string) => {
    setCampaignToDelete(campaignId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCampaign = async () => {
    if (!campaignToDelete) return;

    const deletePromise = new Promise(async (resolve, reject) => {
      try {
        const { deleteProductDiscountCampaign } = await import('@/lib/actions/promotionServerActions');
        const result = await deleteProductDiscountCampaign(campaignToDelete);
        
        if (result.success) {
          loadCampaigns(); // Reload campaigns
          resolve(result.message || 'Campaign deleted successfully');
        } else {
          reject(new Error(result.error || 'Failed to delete campaign'));
        }
      } catch (error) {
        console.error('Error deleting campaign:', error);
        reject(new Error('Failed to delete campaign'));
      }
    });

    // Show confirmation and execute with toast feedback
    toast.promise(deletePromise, {
      loading: 'Deleting discount campaign...',
      success: (message) => `${message}`,
      error: (error) => `${error.message}`,
    });

    // Close dialog and reset state
    setDeleteDialogOpen(false);
    setCampaignToDelete(null);
  };

  // Bulk action handlers
  const handleSelectCampaign = (campaignId: string, selected: boolean) => {
    if (selected) {
      setSelectedCampaigns(prev => [...prev, campaignId]);
    } else {
      setSelectedCampaigns(prev => prev.filter(id => id !== campaignId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedCampaigns(campaigns.map(c => c._id));
    } else {
      setSelectedCampaigns([]);
    }
  };

  const handleBulkActivate = async () => {
    if (selectedCampaigns.length === 0) return;
    
    try {
      const { toggleProductDiscountStatus } = await import('@/lib/actions/promotionServerActions');
      const promises = selectedCampaigns.map(id => toggleProductDiscountStatus(id));
      await Promise.all(promises);
      
      toast.success(`Activated ${selectedCampaigns.length} campaigns`);
      setSelectedCampaigns([]);
      setBulkActionsOpen(false);
      loadCampaigns();
    } catch (error) {
      toast.error('Failed to activate campaigns');
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedCampaigns.length === 0) return;
    
    try {
      const { toggleProductDiscountStatus } = await import('@/lib/actions/promotionServerActions');
      const promises = selectedCampaigns.map(id => toggleProductDiscountStatus(id));
      await Promise.all(promises);
      
      toast.success(`Deactivated ${selectedCampaigns.length} campaigns`);
      setSelectedCampaigns([]);
      setBulkActionsOpen(false);
      loadCampaigns();
    } catch (error) {
      toast.error('Failed to deactivate campaigns');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCampaigns.length === 0) return;
    
    // Use toast.promise for better UX instead of blocking confirm dialog
    const bulkDeletePromise = new Promise(async (resolve, reject) => {
      try {
        const { deleteProductDiscountCampaign } = await import('@/lib/actions/promotionServerActions');
        const promises = selectedCampaigns.map(id => deleteProductDiscountCampaign(id));
        await Promise.all(promises);
        
        setSelectedCampaigns([]);
        setBulkActionsOpen(false);
        loadCampaigns();
        resolve(`Successfully deleted ${selectedCampaigns.length} campaigns`);
      } catch (error) {
        reject(new Error('Failed to delete campaigns'));
      }
    });

    // Show loading and confirmation with toast feedback
    toast.promise(bulkDeletePromise, {
      loading: `Deleting ${selectedCampaigns.length} discount campaigns...`,
      success: (message) => `${message}`,
      error: (error) => `${error.message}`,
    });
  };

  const getStatusBadge = (campaign: any) => {
    const now = new Date();
    const startsAt = new Date(campaign.startsAt);
    const endsAt = campaign.endsAt ? new Date(campaign.endsAt) : null;

    if (!campaign.isActive) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Inactive</span>;
    }

    if (startsAt > now) {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Scheduled</span>;
    }

    if (endsAt && endsAt < now) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Expired</span>;
    }

    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</span>;
  };

  const getScopeLabel = (scope: string) => {
    switch (scope) {
      case 'all_products': return 'All Products';
      case 'categories': return 'Categories';
      case 'specific_products': return 'Specific Products';
      default: return scope;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Product Discount Campaigns</h2>
          <p className="text-muted-foreground">
            Manage automated product discounts with scheduling and duration controls
          </p>
        </div>
        <button
          onClick={onCreateDiscount}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Campaign
        </button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCampaigns.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
            {selectedCampaigns.length} campaign{selectedCampaigns.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkActivate}
              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Activate
            </button>
            <button
              onClick={handleBulkDeactivate}
              className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
            >
              Deactivate
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedCampaigns([])}
              className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedCampaigns.length === campaigns.length && campaigns.length > 0}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">Select All</span>
        </div>
        
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            />
          </div>
        </div>
        
        <select
          value={filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'}
          onChange={(e) => setFilters(prev => ({ 
            ...prev, 
            isActive: e.target.value === 'all' ? undefined : e.target.value === 'active'
          }))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={filters.scope}
          onChange={(e) => setFilters(prev => ({ ...prev, scope: e.target.value }))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
        >
          <option value="">All Scopes</option>
          <option value="all_products">All Products</option>
          <option value="categories">Categories</option>
          <option value="specific_products">Specific Products</option>
        </select>
      </div>

      {/* Campaigns List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="No discount campaigns"
          description="Create your first product discount campaign to get started"
          actionLabel="Create Campaign"
          onAction={onCreateDiscount}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign._id}
              className="rounded-xl border bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg p-6 hover:shadow-xl transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedCampaigns.includes(campaign._id)}
                    onChange={(e) => handleSelectCampaign(campaign._id, e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{campaign.name}</h3>
                    {campaign.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {campaign.description}
                      </p>
                    )}
                    {getStatusBadge(campaign)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(campaign._id)}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      campaign.isActive
                        ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300'
                        : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                    }`}
                  >
                    {campaign.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteCampaign(campaign._id)}
                    className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Discount:</span>
                  <span className="font-medium">
                    {campaign.discountType === 'percentage' 
                      ? `${campaign.discountValue}%` 
                      : `$${campaign.discountValue}`}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Scope:</span>
                  <span className="text-sm">{getScopeLabel(campaign.scope)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Products:</span>
                  <span className="text-sm font-medium">{campaign.affectedProductCount}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Priority:</span>
                  <span className="text-sm">{campaign.priority}</span>
                </div>

                {campaign.endsAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Ends:</span>
                    <span className="text-sm">{formatDateTime(campaign.endsAt)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Created:</span>
                  <span className="text-sm">{formatDateTime(campaign.createdAt)}</span>
                </div>

                {campaign.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-600 dark:text-gray-400">{campaign.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Campaign Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Discount Campaign
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this discount campaign? This action cannot be undone and will:
              <ul className="mt-2 ml-4 list-disc text-sm">
                <li>Remove the discount from all affected products</li>
                <li>Stop any ongoing discount applications</li>
                <li>Delete all campaign analytics</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCampaignToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCampaign}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Assignment Confirmation Dialog */}
      <AlertDialog open={removeAssignmentDialogOpen} onOpenChange={setRemoveAssignmentDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Remove Promotion Assignment
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this promotion assignment? The customer will no longer have access to this promotion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAssignmentToRemove(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveAssignment}
              className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
            >
              <X className="h-4 w-4 mr-2" />
              Remove Assignment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
