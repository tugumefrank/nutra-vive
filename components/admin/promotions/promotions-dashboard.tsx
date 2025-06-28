// components/admin/promotions/promotions-dashboard.tsx

"use client";

import React, { useState } from "react";
import {
  Plus,
  Download,
  Target,
  CheckCircle,
  Clock,
  ShoppingCart,
  DollarSign,
  Percent,
  BarChart3,
  Gift,
  Users,
  TrendingUp,
  Package,
  Tag,
} from "lucide-react";
import { useNotifications, usePromotions } from "@/hooks/usePromotions";
import { Notification } from "@/components/admin/promotions/promotion-components";

import { IPromotion, ICategory, IProduct } from "@/types/promotions";
import { StatCard } from "@/components/admin/promotions/promotion-components";
import {
  AnalyticsTab,
  CustomersTab,
  OverviewTab,
  PromotionsTab,
  ProductDiscountsTab,
} from "@/components/admin/promotions/promotion-tabs";
import PromotionForm from "@/components/admin/promotions/promotion-form";
import ProductDiscountModal from "@/components/admin/promotions/ProductDiscountModal";

interface PromotionsDashboardProps {
  categories?: ICategory[];
  products?: IProduct[];
}

type TabId = "overview" | "promotions" | "product-discounts" | "customers" | "analytics";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function PromotionsDashboard({
  categories = [],
  products = [],
}: PromotionsDashboardProps) {
  const {
    promotions,
    stats,
    isLoading,
    filters,
    updateFilters,
    createPromotion,
    updatePromotion,
    togglePromotionStatus,
    deletePromotion,
    exportPromotions,
    refetch,
  } = usePromotions();

  const { notification, showNotification, hideNotification } =
    useNotifications();

  const [selectedTab, setSelectedTab] = useState<TabId>("promotions");
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isProductDiscountModalOpen, setIsProductDiscountModalOpen] = useState<boolean>(false);
  const [editingPromotion, setEditingPromotion] = useState<IPromotion | null>(
    null
  );

  // Filter promotions based on current filters
  const filteredPromotions = promotions.filter((promotion) => {
    const matchesSearch =
      !filters.search ||
      promotion.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      promotion.codes?.some((code) => {
        const codeString = typeof code === "string" ? code : code.code;
        return codeString?.toLowerCase().includes(filters.search.toLowerCase());
      });

    const matchesType =
      filters.type === "all" ||
      (filters.type === "active" && promotion.isActive) ||
      (filters.type === "inactive" && !promotion.isActive) ||
      (filters.type === "seasonal" && promotion.type === "seasonal") ||
      (filters.type === "custom" && promotion.type === "custom") ||
      (filters.type === "flash_sale" && promotion.type === "flash_sale");

    return matchesSearch && matchesType;
  });

  // Handler functions
  const handleCreatePromotion = () => {
    setEditingPromotion(null);
    setIsFormOpen(true);
  };

  const handleEditPromotion = (promotion: IPromotion) => {
    setEditingPromotion(promotion);
    setIsFormOpen(true);
  };

  const handleFormSuccess = async (promotion: IPromotion) => {
    if (editingPromotion) {
      showNotification("success", "Promotion updated successfully!");
    } else {
      showNotification("success", "Promotion created successfully!");
    }
    setIsFormOpen(false);
    setEditingPromotion(null);
    await refetch(); // Refresh data
  };

  const handleTogglePromotion = async (promotionId: string) => {
    const result = await togglePromotionStatus(promotionId);
    if (result.success) {
      const promotion = promotions.find((p) => p._id === promotionId);
      showNotification(
        "success",
        `Promotion ${promotion?.isActive ? "deactivated" : "activated"} successfully!`
      );
    } else {
      showNotification(
        "error",
        result.error || "Failed to toggle promotion status"
      );
    }
  };

  const handleDeletePromotion = async (promotionId: string) => {
    if (window.confirm("Are you sure you want to delete this promotion?")) {
      const result = await deletePromotion(promotionId);
      if (result.success) {
        showNotification("success", "Promotion deleted successfully!");
      } else {
        showNotification("error", result.error || "Failed to delete promotion");
      }
    }
  };

  const handleViewPromotion = (promotion: IPromotion) => {
    // TODO: Implement view promotion details modal
    console.log("View promotion:", promotion);
  };

  const handleDuplicatePromotion = (promotion: IPromotion) => {
    // Create a copy of the promotion without the ID
    const duplicatedPromotion: IPromotion = {
      ...promotion,
      _id: "", // Will be generated on creation
      name: `${promotion.name} (Copy)`,
      isActive: false, // Deactivate by default
      totalRedemptions: 0,
      totalRevenue: 0,
      usedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingPromotion(duplicatedPromotion);
    setIsFormOpen(true);
  };

  const handleExportPromotions = async () => {
    const result = await exportPromotions();
    if (result.success) {
      showNotification("success", "Promotions exported successfully!");
    } else {
      showNotification("error", result.error || "Failed to export promotions");
    }
  };

  const handleOpenProductDiscountModal = () => {
    setIsProductDiscountModalOpen(true);
  };

  const tabs: Tab[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "promotions", label: "Promotions", icon: Gift },
    { id: "product-discounts", label: "Product Discounts", icon: Tag },
    { id: "customers", label: "Customers", icon: Users },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900/50">
      {/* Notification */}
      <Notification notification={notification} onClose={hideNotification} />

      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Promotions Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage discounts, campaigns, and customer incentives
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPromotions}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={handleOpenProductDiscountModal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all"
            >
              <Package className="h-4 w-4" />
              Product Discounts
            </button>
            <button
              onClick={handleCreatePromotion}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <Plus className="h-4 w-4" />
              Create Promotion
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard
            icon={Target}
            title="Total Promotions"
            value={stats.totalPromotions}
            trend="+12%"
            color="blue"
          />
          <StatCard
            icon={CheckCircle}
            title="Active"
            value={stats.activePromotions}
            subtitle="Currently running"
            color="green"
          />
          <StatCard
            icon={Clock}
            title="Scheduled"
            value={stats.scheduledPromotions}
            subtitle="Upcoming"
            color="orange"
          />
          <StatCard
            icon={ShoppingCart}
            title="Redemptions"
            value={stats.totalRedemptions.toLocaleString()}
            trend="+24%"
            color="purple"
          />
          <StatCard
            icon={DollarSign}
            title="Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            trend="+18%"
            color="emerald"
          />
          <StatCard
            icon={Percent}
            title="Avg Discount"
            value={`${stats.averageDiscountValue.toFixed(1)}%`}
            subtitle="Average value"
            color="indigo"
          />
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {selectedTab === "overview" && (
          <OverviewTab promotions={filteredPromotions} stats={stats} />
        )}

        {selectedTab === "promotions" && (
          <PromotionsTab
            promotions={filteredPromotions}
            filters={filters}
            onFiltersChange={updateFilters}
            onCreatePromotion={handleCreatePromotion}
            onEditPromotion={handleEditPromotion}
            onTogglePromotion={handleTogglePromotion}
            onDeletePromotion={handleDeletePromotion}
            onViewPromotion={handleViewPromotion}
            onDuplicatePromotion={handleDuplicatePromotion}
            isLoading={isLoading}
          />
        )}

        {selectedTab === "product-discounts" && (
          <ProductDiscountsTab
            onCreateDiscount={handleOpenProductDiscountModal}
          />
        )}

        {selectedTab === "customers" && <CustomersTab promotions={promotions} />}

        {selectedTab === "analytics" && (
          <AnalyticsTab onExport={handleExportPromotions} />
        )}

        {/* Promotion Form */}
        <PromotionForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingPromotion(null);
          }}
          onSuccess={handleFormSuccess}
          editingPromotion={editingPromotion}
          onCreatePromotion={createPromotion}
          onUpdatePromotion={updatePromotion}
          categories={categories}
          products={products}
        />

        {/* Product Discount Modal */}
        <ProductDiscountModal
          isOpen={isProductDiscountModalOpen}
          onClose={() => setIsProductDiscountModalOpen(false)}
        />
      </div>
    </div>
  );
}
