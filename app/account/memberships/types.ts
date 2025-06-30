// app/(account)/account/memberships/types.ts
export interface UserMembership {
  _id: string;
  membership: {
    _id: string;
    name: string;
    tier: string;
    price: number;
    billingFrequency: string;
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
    freeDelivery: boolean;
    prioritySupport: boolean;
    deliveryFrequency: string;
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

export interface Membership {
  _id: string;
  name: string;
  description?: string;
  tier: "basic" | "premium" | "vip" | "elite";
  price: number;
  billingFrequency: "monthly" | "quarterly" | "yearly";
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
  deliveryFrequency: "weekly" | "bi-weekly" | "monthly";
  freeDelivery: boolean;
  prioritySupport: boolean;
  isActive: boolean;
  isPopular: boolean;
  color?: string;
  icon?: string;
}

export interface MembershipCartItem {
  productId: string;
  categoryId: string;
  quantity: number;
  isFree: boolean;
  membershipPrice: number;
  regularPrice: number;
  savings: number;
}

// Helper functions for membership integration
export const getMembershipBenefits = (membership: UserMembership) => {
  const totalProducts = membership.productUsage.reduce(
    (sum, usage) => sum + usage.allocatedQuantity,
    0
  );
  const usedProducts = membership.productUsage.reduce(
    (sum, usage) => sum + usage.usedQuantity,
    0
  );
  const availableProducts = membership.productUsage.reduce(
    (sum, usage) => sum + usage.availableQuantity,
    0
  );

  return {
    totalProducts,
    usedProducts,
    availableProducts,
    usagePercentage:
      totalProducts > 0 ? (usedProducts / totalProducts) * 100 : 0,
    hasFreeDelivery: membership.membership.freeDelivery,
    hasPrioritySupport: membership.membership.prioritySupport,
    tier: membership.membership.tier,
  };
};

export const canClaimFreeProduct = (
  membership: UserMembership,
  categoryId: string,
  quantity: number = 1
): boolean => {
  const categoryUsage = membership.productUsage.find(
    (usage) => usage.categoryId === categoryId
  );
  return categoryUsage ? categoryUsage.availableQuantity >= quantity : false;
};

export const getTierColor = (tier: string) => {
  const colors = {
    basic: "emerald",
    premium: "blue",
    vip: "purple",
    elite: "amber",
  };
  return colors[tier as keyof typeof colors] || "gray";
};

export const getTierIcon = (tier: string) => {
  const icons = {
    basic: "Gift",
    premium: "Star",
    vip: "Crown",
    elite: "Zap",
  };
  return icons[tier as keyof typeof icons] || "Package";
};
