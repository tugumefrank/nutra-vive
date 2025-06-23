// hooks/usePromotions.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  IPromotion,
  PromotionFilters,
  PromotionStats,
  CreatePromotionData,
  UpdatePromotionData,
  PromotionResponse,
  PromotionsResponse,
  ExportResponse,
  BulkUpdateResponse,
  Notification,
} from "@/types/promotions";
import {
  createPromotion as createPromotionAction,
  updatePromotion as updatePromotionAction,
  deletePromotion as deletePromotionAction,
  getPromotions as getPromotionsAction,
  getPromotionStats as getPromotionStatsAction,
  togglePromotionStatus as togglePromotionStatusAction,
  exportPromotions as exportPromotionsAction,
  bulkUpdatePromotions as bulkUpdatePromotionsAction,
} from "@/lib/actions/promotionsServerActions";

// Notifications Hook
export const useNotifications = () => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = useCallback(
    (type: Notification["type"], message: string) => {
      setNotification({ type, message });
    },
    []
  );

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    showNotification,
    hideNotification,
  };
};

// Main Promotions Hook
export const usePromotions = () => {
  const [promotions, setPromotions] = useState<IPromotion[]>([]);
  const [stats, setStats] = useState<PromotionStats>({
    totalPromotions: 0,
    activePromotions: 0,
    scheduledPromotions: 0,
    totalRedemptions: 0,
    totalRevenue: 0,
    averageDiscountValue: 0,
    topPerformingPromotions: [],
    recentPromotions: [],
    promotionsByType: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<PromotionFilters>({
    type: "all",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 20,
  });

  // Fetch promotions
  const fetchPromotions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Map unsupported filter types to undefined for compatibility
      const { type, ...restFilters } = filters;
      const allowedTypes = ["seasonal", "custom", "flash_sale"];
      const mappedType = allowedTypes.includes(type) ? type : undefined;
      const response: PromotionsResponse = await getPromotionsAction({
        ...restFilters,
        ...(mappedType
          ? { type: mappedType as "seasonal" | "custom" | "flash_sale" }
          : {}),
      });

      if (response.error) {
        setError(response.error);
      } else {
        setPromotions(response.promotions);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch promotions"
      );
      setPromotions([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await getPromotionStatsAction();
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch promotion stats:", err);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<PromotionFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Create promotion
  const createPromotion = useCallback(
    async (data: CreatePromotionData): Promise<PromotionResponse> => {
      try {
        const result = await createPromotionAction(data);

        if (result.success && result.promotion) {
          setPromotions((prev) => [result.promotion!, ...prev]);
          await fetchStats(); // Refresh stats
        }

        return result;
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error ? err.message : "Failed to create promotion",
        };
      }
    },
    [fetchStats]
  );

  // Update promotion
  const updatePromotion = useCallback(
    async (
      id: string,
      data: UpdatePromotionData
    ): Promise<PromotionResponse> => {
      try {
        const result = await updatePromotionAction(id, data);

        if (result.success && result.promotion) {
          setPromotions((prev) =>
            prev.map((p) => (p._id === id ? result.promotion! : p))
          );
          await fetchStats(); // Refresh stats
        }

        return result;
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error ? err.message : "Failed to update promotion",
        };
      }
    },
    [fetchStats]
  );

  // Toggle promotion status
  const togglePromotionStatus = useCallback(
    async (
      id: string
    ): Promise<{ success: boolean; isActive?: boolean; error?: string }> => {
      try {
        const result = await togglePromotionStatusAction(id);

        if (result.success) {
          setPromotions((prev) =>
            prev.map((p) =>
              p._id === id
                ? { ...p, isActive: result.isActive ?? !p.isActive }
                : p
            )
          );
          await fetchStats(); // Refresh stats
        }

        return result;
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error
              ? err.message
              : "Failed to toggle promotion status",
        };
      }
    },
    [fetchStats]
  );

  // Delete promotion
  const deletePromotion = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const result = await deletePromotionAction(id);

        if (result.success) {
          setPromotions((prev) => prev.filter((p) => p._id !== id));
          await fetchStats(); // Refresh stats
        }

        return result;
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error ? err.message : "Failed to delete promotion",
        };
      }
    },
    [fetchStats]
  );

  // Export promotions
  const exportPromotions = useCallback(async (): Promise<ExportResponse> => {
    try {
      // Map unsupported filter types to undefined for compatibility
      const { type, ...restFilters } = filters;
      const allowedTypes = ["seasonal", "custom", "flash_sale"];
      const mappedType = allowedTypes.includes(type) ? type : undefined;
      const result = await exportPromotionsAction({
        ...restFilters,
        ...(mappedType
          ? { type: mappedType as "seasonal" | "custom" | "flash_sale" }
          : {}),
      });

      if (result.success && result.data) {
        // Create and download CSV file
        const blob = new Blob([result.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `promotions-export-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      return result;
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error ? err.message : "Failed to export promotions",
      };
    }
  }, [filters]);

  // Bulk update promotions
  const bulkUpdatePromotions = useCallback(
    async (
      promotionIds: string[],
      updates: { isActive?: boolean; type?: string; tags?: string[] }
    ): Promise<BulkUpdateResponse> => {
      try {
        const result = await bulkUpdatePromotionsAction(promotionIds, updates);

        if (result.success) {
          // Refresh promotions and stats
          await fetchPromotions();
          await fetchStats();
        }

        return result;
      } catch (err) {
        return {
          success: false,
          updated: 0,
          error:
            err instanceof Error
              ? err.message
              : "Failed to bulk update promotions",
        };
      }
    },
    [fetchPromotions, fetchStats]
  );

  // Refetch data
  const refetch = useCallback(async () => {
    await Promise.all([fetchPromotions(), fetchStats()]);
  }, [fetchPromotions, fetchStats]);

  // Effects
  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    // Data
    promotions,
    stats,
    isLoading,
    error,
    filters,

    // Actions
    updateFilters,
    createPromotion,
    updatePromotion,
    togglePromotionStatus,
    deletePromotion,
    exportPromotions,
    bulkUpdatePromotions,
    refetch,
  };
};

// Individual promotion hook
export const usePromotion = (id: string) => {
  const [promotion, setPromotion] = useState<IPromotion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotion = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      // This would need to be implemented in the server actions
      // const result = await getPromotionAction(id);
      // For now, we'll fetch from the list
      const response = await getPromotionsAction({
        page: 1,
        limit: 1000,
      });
      const found = response.promotions.find((p) => p._id === id);

      if (found) {
        setPromotion(found);
      } else {
        setError("Promotion not found");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch promotion"
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPromotion();
  }, [fetchPromotion]);

  return {
    promotion,
    isLoading,
    error,
    refetch: fetchPromotion,
  };
};
