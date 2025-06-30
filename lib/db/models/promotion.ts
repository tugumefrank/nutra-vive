import mongoose, { Schema, Document, Model } from "mongoose";

// Promotion Interface
export interface IPromotion extends Document {
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
  usedCount: number;

  // Requirements
  minimumPurchaseAmount?: number;
  minimumQuantity?: number;

  // Exclusions
  excludedCategories: string[];
  excludedProducts: string[];
  excludedCollections: string[];
  excludeDiscountedItems: boolean;

  // Codes
  codes: {
    code: string;
    isPublic: boolean;
    usageLimit?: number;
    usedCount: number;
    isActive: boolean;
    createdAt: Date;
  }[];

  // Timing
  startsAt?: Date;
  endsAt?: Date;
  isActive: boolean;
  isScheduled: boolean;

  // Customer Assignment
  assignedCustomers: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    type: "permanent" | "temporary";
    expiresAt?: Date;
    isActive: boolean;
    assignedAt: Date;
  }[];

  // Analytics
  totalRedemptions: number;
  totalRevenue: number;
  averageOrderValue: number;

  // Metadata
  createdBy: string;
  updatedBy?: string;
  tags: string[];
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

// Customer Promotion Usage Interface
export interface ICustomerPromotionUsage extends Document {
  _id: string;
  promotion: string;
  customer: string;
  customerEmail: string;
  code: string;
  order?: string;
  discountAmount: number;
  orderTotal: number;
  usedAt: Date;
  metadata?: {
    location?: string;
    device?: string;
    source?: string;
  };
}

// Promotion Schema
const promotionSchema = new Schema<IPromotion>(
  {
    name: { type: String, required: true },
    description: String,
    type: {
      type: String,
      enum: ["seasonal", "custom", "flash_sale"],
      required: true,
    },

    // Discount Configuration
    discountType: {
      type: String,
      enum: ["percentage", "fixed_amount", "buy_x_get_y"],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    buyXGetYConfig: {
      buyQuantity: { type: Number, min: 1 },
      getQuantity: { type: Number, min: 1 },
      getDiscountPercentage: { type: Number, min: 0, max: 100 },
    },

    // Applicability
    applicabilityScope: {
      type: String,
      enum: [
        "entire_store",
        "categories",
        "products",
        "collections",
        "customer_segments",
      ],
      required: true,
    },
    targetCategories: [{ type: String, ref: "Category" }],
    targetProducts: [{ type: String, ref: "Product" }],
    targetCollections: [String],
    customerSegments: {
      type: String,
      enum: ["new_customers", "returning_customers", "vip_customers", "all"],
      default: "all",
    },

    // Usage Limits
    usageLimit: { type: Number, min: 1 },
    usageLimitPerCustomer: { type: Number, min: 1 },
    usedCount: { type: Number, default: 0 },

    // Requirements
    minimumPurchaseAmount: { type: Number, min: 0 },
    minimumQuantity: { type: Number, min: 1 },

    // Exclusions
    excludedCategories: [{ type: String, ref: "Category" }],
    excludedProducts: [{ type: String, ref: "Product" }],
    excludedCollections: [String],
    excludeDiscountedItems: { type: Boolean, default: false },

    // Codes
    codes: [
      {
        code: { type: String, required: true, uppercase: true },
        isPublic: { type: Boolean, default: true },
        usageLimit: Number,
        usedCount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Timing
    startsAt: Date,
    endsAt: Date,
    isActive: { type: Boolean, default: true },
    isScheduled: { type: Boolean, default: false },

    // Customer Assignment
    assignedCustomers: [
      {
        userId: { type: String, required: true },
        email: { type: String, required: true },
        firstName: String,
        lastName: String,
        type: {
          type: String,
          enum: ["permanent", "temporary"],
          required: true,
        },
        expiresAt: Date,
        isActive: { type: Boolean, default: true },
        assignedAt: { type: Date, default: Date.now },
      },
    ],

    // Analytics
    totalRedemptions: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },

    // Metadata
    createdBy: { type: String, ref: "User", required: true },
    updatedBy: { type: String, ref: "User" },
    tags: [String],
    notes: String,
  },
  { timestamps: true }
);

// Customer Promotion Usage Schema
const customerPromotionUsageSchema = new Schema<ICustomerPromotionUsage>(
  {
    promotion: {
      type: String,
      ref: "Promotion",
      required: true,
    },
    customer: { type: String, ref: "User" },
    customerEmail: { type: String, required: true },
    code: { type: String, required: true },
    order: { type: String, ref: "Order" },
    discountAmount: { type: Number, required: true },
    orderTotal: { type: Number, required: true },
    usedAt: { type: Date, default: Date.now },
    metadata: {
      location: String,
      device: String,
      source: String,
    },
  },
  { timestamps: true }
);

// Add indexes for Promotion
promotionSchema.index({ name: 1 });
promotionSchema.index({ type: 1 });
promotionSchema.index({ isActive: 1 });
promotionSchema.index({ startsAt: 1, endsAt: 1 });
promotionSchema.index({ "codes.code": 1 });
promotionSchema.index({ createdBy: 1 });
promotionSchema.index({ targetCategories: 1 });
promotionSchema.index({ targetProducts: 1 });

// Add indexes for Customer Promotion Usage
customerPromotionUsageSchema.index({ promotion: 1 });
customerPromotionUsageSchema.index({ customer: 1 });
customerPromotionUsageSchema.index({ customerEmail: 1 });
customerPromotionUsageSchema.index({ usedAt: -1 });
customerPromotionUsageSchema.index({ code: 1 });

// Auto-generate promotion codes
promotionSchema.methods.generateCode = function (
  isPublic: boolean = true,
  customCode?: string
) {
  const code =
    customCode ||
    `PROMO${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  this.codes.push({
    code,
    isPublic,
    usageLimit: this.usageLimit,
    usedCount: 0,
    isActive: true,
    createdAt: new Date(),
  });
  return code;
};

// Calculate promotion effectiveness
promotionSchema.methods.calculateEffectiveness = function () {
  const redemptionRate = this.usageLimit
    ? (this.usedCount / this.usageLimit) * 100
    : 0;
  const revenuePerRedemption =
    this.totalRedemptions > 0 ? this.totalRevenue / this.totalRedemptions : 0;

  return {
    redemptionRate,
    revenuePerRedemption,
    totalRedemptions: this.totalRedemptions,
    totalRevenue: this.totalRevenue,
    averageOrderValue: this.averageOrderValue,
  };
};

// Models
export const Promotion: Model<IPromotion> =
  mongoose.models.Promotion ||
  mongoose.model<IPromotion>("Promotion", promotionSchema);

export const CustomerPromotionUsage: Model<ICustomerPromotionUsage> =
  mongoose.models.CustomerPromotionUsage ||
  mongoose.model<ICustomerPromotionUsage>(
    "CustomerPromotionUsage",
    customerPromotionUsageSchema
  );
