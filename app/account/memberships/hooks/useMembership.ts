// app/(account)/account/memberships/hooks/useMembership.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { getUserMemberships } from "@/lib/actions/membershipServerActions";
import {
  UserMembership,
  getMembershipBenefits,
  canClaimFreeProduct,
} from "../types";

export function useMembership() {
  const { user } = useUser();
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembership = useCallback(async () => {
    if (!user) {
      setMembership(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await getUserMemberships({
        search: user.id,
        status: "active",
        limit: 1,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      const activeMembership = result.userMemberships?.[0] || null;
      setMembership(activeMembership);
    } catch (err) {
      console.error("Error fetching membership:", err);
      setError("Failed to load membership data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);

  const benefits = membership ? getMembershipBenefits(membership) : null;

  const checkFreeProductEligibility = useCallback(
    (categoryId: string, quantity: number = 1) => {
      if (!membership) return false;
      return canClaimFreeProduct(membership, categoryId, quantity);
    },
    [membership]
  );

  return {
    membership,
    benefits,
    loading,
    error,
    refetch: fetchMembership,
    checkFreeProductEligibility,
    hasMembership: !!membership,
    tier: membership?.membership.tier || null,
  };
}
