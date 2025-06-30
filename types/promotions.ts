// types/promotions.ts

export interface IPromotion {
  _id: string;
  name: string;
  description?: string;
  type: "seasonal" | "custom" | "flash_sale";

  // Discount Configuration
  discountType: "percentage" | "fixed_amount" | "buy_x_get_y";
  discountValue: number;
  buyXGetYConfig?: {
    buyQuantity: number;
    getQuantity: number;
    getDiscountPercentage: number;
  };

  // Applicability
  applicabilityScope:
    | "entire_store"
    | "categories"
    | "products"
    | "collections"
    | "customer_segments";
  targetCategories: string[];
  targetProducts: string[];
  targetCollections: string[];
  customerSegments:
    | "new_customers"
    | "returning_customers"
    | "vip_customers"
    | "all";

  // Usage Limits
  usageLimit?: number;
  usageLimitPerCustomer?: number;

  // Requirements
  minimumPurchaseAmount?: number;
  minimumQuantity?: number;

  // Exclusions
  excludedCategories: string[];
  excludedProducts: string[];
  excludedCollections: string[];
  excludeDiscountedItems: boolean;

  // Timing
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
  isScheduled: boolean;

  // Codes
  codes: Array<{
    code: string;
    isPublic: boolean;
    usageLimit?: number;
    usedCount: number;
    isActive: boolean;
    createdAt: string;
  }>;

  // Assigned Customers
  assignedCustomers: Array<{
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    type: "permanent" | "temporary";
    isActive: boolean;
    assignedAt: string;
    expiresAt?: string;
  }>;

  // Statistics
  totalRedemptions: number;
  totalRevenue: number;
  usedCount: number;

  // Metadata
  tags: string[];
  notes?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionFilters {
  type: "all" | "active" | "inactive" | "seasonal" | "custom" | "flash_sale";
  isActive?: boolean;
  isScheduled?: boolean;
  discountType?: "percentage" | "fixed_amount" | "buy_x_get_y";
  search: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy:
    | "name"
    | "createdAt"
    | "totalRedemptions"
    | "totalRevenue"
    | "startsAt"
    | "endsAt";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

export interface PromotionStats {
  totalPromotions: number;
  activePromotions: number;
  scheduledPromotions: number;
  totalRedemptions: number;
  totalRevenue: number;
  averageDiscountValue: number;
  topPerformingPromotions: Array<{
    name: string;
    totalRedemptions: number;
    totalRevenue: number;
    redemptionRate: number;
  }>;
  recentPromotions: IPromotion[];
  promotionsByType: Array<{
    type: string;
    count: number;
    revenue: number;
  }>;
}

export interface CreatePromotionData {
  name: string;
  description?: string;
  type: "seasonal" | "custom" | "flash_sale";
  discountType: "percentage" | "fixed_amount" | "buy_x_get_y";
  discountValue: number;
  buyXGetYConfig?: {
    buyQuantity: number;
    getQuantity: number;
    getDiscountPercentage: number;
  };
  applicabilityScope:
    | "entire_store"
    | "categories"
    | "products"
    | "collections"
    | "customer_segments";
  targetCategories: string[];
  targetProducts: string[];
  targetCollections: string[];
  customerSegments:
    | "new_customers"
    | "returning_customers"
    | "vip_customers"
    | "all";
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  minimumPurchaseAmount?: number;
  minimumQuantity?: number;
  excludedCategories: string[];
  excludedProducts: string[];
  excludedCollections: string[];
  excludeDiscountedItems: boolean;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
  isScheduled: boolean;
  generateCode: boolean;
  customCodes: string[];
  tags: string[];
  notes?: string;
}

export interface UpdatePromotionData extends Partial<CreatePromotionData> {}

export interface AssignCustomerData {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  type: "permanent" | "temporary";
  expiresAt?: string;
}

export interface PromotionResponse {
  success: boolean;
  promotion?: IPromotion;
  error?: string;
}

export interface PromotionsResponse {
  promotions: IPromotion[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  error?: string;
}

export interface PromotionStatsResponse extends PromotionStats {}

export interface ExportResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export interface BulkUpdateResponse {
  success: boolean;
  updated: number;
  error?: string;
}

export interface Notification {
  type: "success" | "error" | "info" | "warning";
  message: string;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku?: string;
  barcode?: string;
  category?: ICategory | null;
  images: string[];
  tags: string[];
  features: string[];
  ingredients: string[];
  nutritionFacts?: {
    servingSize?: string;
    calories?: number;
    totalFat?: string;
    sodium?: string;
    totalCarbs?: string;
    sugars?: string;
    protein?: string;
    vitaminC?: string;
    [key: string]: string | number | undefined;
  };
  inventory: number;
  trackQuantity: boolean;
  allowBackorder: boolean;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: "in" | "cm";
  };
  isActive: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}
