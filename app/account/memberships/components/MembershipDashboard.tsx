"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

import {
  getCurrentMembership,
  syncUserStripeData,
} from "@/lib/actions/membershipSubscriptionActions";
import {
  getAvailableMemberships,
} from "@/lib/actions/membershipServerActions";
import { MembershipLoadingSkeleton } from "../loading";
import { CurrentMembershipCard } from "./CurrentMembershipCard";
import { ProductAllocations } from "./ProductAllocations";
import { AvailableMemberships } from "./AvailableMemberships";

interface UserMembership {
  _id: string;
  membership: {
    _id: string;
    name: string;
    tier: string;
    price: number;
    billingFrequency: string;
    deliveryFrequency: string;
    productAllocations: Array<{
      categoryId: string;
      categoryName: string;
      quantity: number;
    }>;
    features: string[];
    customBenefits: Array<{
      title: string;
      description: string;
      type: string;
    }>;
  };
  status: string;
  startDate: string;
  nextBillingDate?: string;
  currentPeriodEnd: string;
  productUsage: Array<{
    categoryId: string;
    categoryName: string;
    allocatedQuantity: number;
    usedQuantity: number;
    availableQuantity: number;
  }>;
  autoRenewal: boolean;
}

interface Membership {
  _id: string;
  name: string;
  description?: string;
  tier: string;
  price: number;
  billingFrequency: string;
  productAllocations: Array<{
    categoryId: string;
    categoryName: string;
    quantity: number;
  }>;
  customBenefits: Array<{
    title: string;
    description: string;
    type: string;
  }>;
  features: string[];
  maxProductsPerMonth?: number;
  deliveryFrequency: string;
  freeDelivery: boolean;
  prioritySupport: boolean;
  isActive: boolean;
  isPopular: boolean;
  color?: string;
  icon?: string;
}

export function MembershipDashboard() {
  const [loading, setLoading] = useState(true);
  const [currentMembership, setCurrentMembership] = useState<UserMembership | null>(null);
  const [availableMemberships, setAvailableMemberships] = useState<
    Membership[]
  >([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple calls during development/strict mode
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    
    async function fetchData() {
      try {
        setLoading(true);

        // Get current user's membership
        const membershipResult = await getCurrentMembership();

        if (membershipResult.error) {
          console.error("❌ MembershipDashboard: Membership loading error:", membershipResult.error);
        }
        
        setCurrentMembership(membershipResult.success ? membershipResult.membership : null);

        // Get available memberships
        const availableMembershipsResult = await getAvailableMemberships({
          isActive: true,
          sortBy: "tier",
          sortOrder: "asc",
          limit: 20,
        });

        if (availableMembershipsResult.error) {
          console.error("Available memberships error:", availableMembershipsResult.error);
          toast.error("Failed to load available memberships");
        } else {
          setAvailableMemberships(availableMembershipsResult.memberships || []);
        }
        
      } catch (error) {
        console.error("Error fetching membership data:", error);
        toast.error("Something went wrong loading memberships");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [refreshKey]);

  // Listen for membership update events (e.g., from successful checkout)
  useEffect(() => {
    const handleMembershipUpdate = () => {
      console.log("Received membershipUpdated event, refreshing data...");
      handleRefresh();
    };

    window.addEventListener('membershipUpdated', handleMembershipUpdate);
    
    return () => {
      window.removeEventListener('membershipUpdated', handleMembershipUpdate);
    };
  }, []);

  const handleRefresh = () => {
    hasLoadedRef.current = false;
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return <MembershipLoadingSkeleton />;
  }

  return (
    <div className="space-y-8">
      {currentMembership ? (
        <>
          {/* Current Membership Status */}
          <CurrentMembershipCard
            membership={currentMembership}
            onRefresh={handleRefresh}
          />

          {/* Product Allocations */}
          <ProductAllocations
            productUsage={currentMembership.productUsage}
            membership={currentMembership.membership}
          />

        </>
      ) : (
        <>
          {/* Welcome Section */}
          <div className="text-center py-12 glass-card border-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl rounded-2xl">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                Choose Your Perfect Membership
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Unlock exclusive benefits, free products, and premium perks with
                our membership plans
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Free Monthly Products
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  Priority Support
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Exclusive Content
                </div>
              </div>
            </div>
          </div>

          {/* Available Memberships */}
          <AvailableMemberships
            memberships={availableMemberships}
            onSubscribe={handleRefresh}
            showUpgradeOnly={false}
          />
        </>
      )}
    </div>
  );
}
