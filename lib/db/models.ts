// // Export all User models
// export * from "../db/models/user";

// // Export all Product models (Category, Product, Review)
// export * from "../db/models/product";

// Export all Order models (Order, TrackingEvent)
// export * from "../db/models/order";

// // Export all Cart models (Cart, Favorite, DiscountCode)
// export * from "../db/models/cart";

// Export all Consultation models
export * from "../db/models/consultation";

// // Export all Promotion models
// export * from "../db/models/promotion";

// Export all Notification models
export * from "../db/models/notification";

// Re-export mongoose types for convenience
export { Document, Schema, Model } from "mongoose";

import mongoose, { Schema, Document, Model } from "mongoose";

// User Interface (Missing from your models - needed for promotions)
export interface IUser extends Document {
  _id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

// Category Interface
export interface ICategory extends Document {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced Product Interface with Promotion Support
export interface IProduct extends Document {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number; // Original price (for showing discounts)
  costPrice?: number;
  sku?: string;
  barcode?: string;
  category?: string; // Category ID
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

  // Promotion-related fields
  isDiscounted: boolean; // Flag to indicate if product has active discounts
  promotionEligible: boolean; // Can this product be included in promotions
  promotionTags: string[]; // Special tags for promotion targeting

  metaTitle?: string;
  metaDescription?: string;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Review Interface
export interface IReview extends Document {
  _id: string;
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  content?: string;
  isVerified: boolean;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced Cart Interface with Promotion Support
export interface ICart extends Document {
  _id: string;
  user?: mongoose.Types.ObjectId; // User ID
  clerkUserId?: string; // Clerk User ID for compatibility
  sessionId?: string; // For guest users
  items: {
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    originalPrice?: number; // Store original price for comparison
  }[];

  // Promotion fields
  promotionId?: mongoose.Types.ObjectId;
  promotionCode?: string;
  promotionName?: string;
  promotionDiscount?: number;

  // Cart totals (calculated fields)
  subtotal?: number;
  totalDiscount?: number;
  finalTotal?: number;

  createdAt: Date;
  updatedAt: Date;
}

// Order Interface with Promotion Support
export interface IOrder extends Document {
  _id: string;
  orderNumber: string;
  user?: mongoose.Types.ObjectId;
  email: string;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  paymentStatus:
    | "pending"
    | "paid"
    | "failed"
    | "refunded"
    | "partially_refunded";
  paymentIntentId?: string;

  // Pricing
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;

  // Promotion tracking
  appliedPromotion?: {
    promotionId: mongoose.Types.ObjectId;
    code: string;
    name: string;
    discountAmount: number;
    discountType: "percentage" | "fixed_amount" | "buy_x_get_y";
  };

  shippingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
  };

  billingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
  };

  items: {
    product: string;
    productName: string;
    productSlug: string;
    productImage: string;
    quantity: number;
    price: number;
    originalPrice?: number; // Price before any promotions
    totalPrice: number;
    appliedDiscount?: number; // Discount applied to this specific item
  }[];

  notes?: string;
  trackingNumber?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
// Tracking Event Interface
export interface ITrackingEvent extends Document {
  _id: string;
  order: mongoose.Types.ObjectId; // Order ID
  status:
    | "order_placed"
    | "payment_confirmed"
    | "processing"
    | "shipped"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "exception"
    | "returned";
  location?: string;
  description: string;
  timestamp: Date;
  carrier?: string;
  estimatedDelivery?: Date;
  metadata?: {
    facility?: string;
    city?: string;
    state?: string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  isPublic: boolean; // Whether to show this event to customers
  createdAt: Date;
  updatedAt: Date;
}

// Extended Order Tracking Info Interface
export interface IOrderTrackingInfo {
  orderNumber: string;
  trackingNumber?: string;
  status: string;
  estimatedDelivery?: Date;
  shippingCarrier?: string;
  currentLocation?: string;
  events: ITrackingEvent[];
  canTrack: boolean;
  isDelivered: boolean;
  daysInTransit?: number;
}

// Favorites Interface
export interface IFavorite extends Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  createdAt: Date;
}

// Promotion Interface (Enhanced)
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
  targetCategories: mongoose.Types.ObjectId[];
  targetProducts: mongoose.Types.ObjectId[];
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
  excludedCategories: mongoose.Types.ObjectId[];
  excludedProducts: mongoose.Types.ObjectId[];
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
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  tags: string[];
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

// Customer Promotion Usage Interface
export interface ICustomerPromotionUsage extends Document {
  _id: string;
  promotion: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId; // Changed from 'customer' to 'user' for consistency
  customerEmail: string;
  code: string;
  order?: mongoose.Types.ObjectId;
  discountAmount: number;
  orderTotal: number;
  usedAt: Date;
  metadata?: {
    location?: string;
    device?: string;
    source?: string;
    originalTotal?: number;
    finalTotal?: number;
  };
}

// SCHEMAS

// User Schema
const userSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    firstName: String,
    lastName: String,
    imageUrl: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

// Category Schema
const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    imageUrl: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Enhanced Product Schema
const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    shortDescription: String,
    price: { type: Number, required: true },
    compareAtPrice: Number, // Important for showing "was/now" pricing
    costPrice: Number,
    sku: { type: String, unique: true, sparse: true },
    barcode: String,
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    images: [String],
    tags: [String],
    features: [String],
    ingredients: [String],
    nutritionFacts: {
      servingSize: String,
      calories: Number,
      totalFat: String,
      sodium: String,
      totalCarbs: String,
      sugars: String,
      protein: String,
      vitaminC: String,
    },
    inventory: { type: Number, default: 0 },
    trackQuantity: { type: Boolean, default: true },
    allowBackorder: { type: Boolean, default: false },
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: { type: String, enum: ["in", "cm"] },
    },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },

    // Promotion-related fields
    isDiscounted: { type: Boolean, default: false },
    promotionEligible: { type: Boolean, default: true },
    promotionTags: [String],

    metaTitle: String,
    metaDescription: String,
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Review Schema
const reviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    content: String,
    isVerified: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Enhanced Cart Schema with Promotion Support
const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    clerkUserId: String, // For Clerk integration
    sessionId: String,
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        originalPrice: Number, // Store original price for comparison
      },
    ],

    // Promotion fields
    promotionId: { type: Schema.Types.ObjectId, ref: "Promotion" },
    promotionCode: { type: String, uppercase: true },
    promotionName: String,
    promotionDiscount: { type: Number, default: 0 },

    // Calculated totals (virtual or computed)
    subtotal: Number,
    totalDiscount: Number,
    finalTotal: Number,
  },
  { timestamps: true }
);

// Enhanced Order Schema
const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    email: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending",
    },
    paymentIntentId: String,
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    shippingAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: "USD" },

    // Applied promotion tracking
    appliedPromotion: {
      promotionId: { type: Schema.Types.ObjectId, ref: "Promotion" },
      code: String,
      name: String,
      discountAmount: Number,
      discountType: {
        type: String,
        enum: ["percentage", "fixed_amount", "buy_x_get_y"],
      },
    },

    shippingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      company: String,
      address1: { type: String, required: true },
      address2: String,
      city: { type: String, required: true },
      province: { type: String, required: true },
      country: { type: String, required: true },
      zip: { type: String, required: true },
      phone: String,
    },

    billingAddress: {
      firstName: String,
      lastName: String,
      company: String,
      address1: String,
      address2: String,
      city: String,
      province: String,
      country: String,
      zip: String,
      phone: String,
    },

    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: { type: String, required: true },
        productSlug: { type: String, required: true },
        productImage: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        originalPrice: Number, // Price before promotions
        totalPrice: { type: Number, required: true },
        appliedDiscount: Number, // Discount applied to this item
      },
    ],

    notes: String,
    trackingNumber: String,
    shippedAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true }
);
// Tracking Event Schema
const trackingEventSchema = new Schema<ITrackingEvent>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    status: {
      type: String,
      enum: [
        "order_placed",
        "payment_confirmed",
        "processing",
        "shipped",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "exception",
        "returned",
      ],
      required: true,
    },
    location: String,
    description: { type: String, required: true },
    timestamp: { type: Date, required: true },
    carrier: String,
    estimatedDelivery: Date,
    metadata: {
      facility: String,
      city: String,
      state: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);
// Favorites Schema
const favoriteSchema = new Schema<IFavorite>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  },
  { timestamps: true }
);

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
    targetCategories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    targetProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
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
    excludedCategories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    excludedProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
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
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    tags: [String],
    notes: String,
  },
  { timestamps: true }
);

// Customer Promotion Usage Schema
const customerPromotionUsageSchema = new Schema<ICustomerPromotionUsage>(
  {
    promotion: {
      type: Schema.Types.ObjectId,
      ref: "Promotion",
      required: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Changed from 'customer'
    customerEmail: { type: String, required: true },
    code: { type: String, required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    discountAmount: { type: Number, required: true },
    orderTotal: { type: Number, required: true },
    usedAt: { type: Date, default: Date.now },
    metadata: {
      location: String,
      device: String,
      source: String,
      originalTotal: Number,
      finalTotal: Number,
    },
  },
  { timestamps: true }
);

// INDEXES
trackingEventSchema.index({ order: 1 });
trackingEventSchema.index({ status: 1 });
trackingEventSchema.index({ timestamp: -1 });
trackingEventSchema.index({ isPublic: 1 });
// User indexes
userSchema.index({ clerkId: 1 });
userSchema.index({ email: 1 });

// Category indexes
categorySchema.index({ slug: 1 });

// Product indexes
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ promotionEligible: 1 });
productSchema.index({ isDiscounted: 1 });

// Review indexes
reviewSchema.index({ product: 1 });
reviewSchema.index({ user: 1 });

// Cart indexes
cartSchema.index({ user: 1 });
cartSchema.index({ clerkUserId: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ promotionCode: 1 });

// Order indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ "appliedPromotion.promotionId": 1 });

// Favorites indexes
favoriteSchema.index({ user: 1, product: 1 });

// Promotion indexes
promotionSchema.index({ name: 1 });
promotionSchema.index({ type: 1 });
promotionSchema.index({ isActive: 1 });
promotionSchema.index({ startsAt: 1, endsAt: 1 });
promotionSchema.index({ "codes.code": 1 });
promotionSchema.index({ createdBy: 1 });
promotionSchema.index({ targetCategories: 1 });
promotionSchema.index({ targetProducts: 1 });

// Customer Promotion Usage indexes
customerPromotionUsageSchema.index({ promotion: 1 });
customerPromotionUsageSchema.index({ user: 1 }); // Changed from customer
customerPromotionUsageSchema.index({ customerEmail: 1 });
customerPromotionUsageSchema.index({ usedAt: -1 });
customerPromotionUsageSchema.index({ code: 1 });

// VIRTUAL FIELDS AND METHODS

// Cart virtual fields for calculated totals
cartSchema.virtual("calculatedSubtotal").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
});

cartSchema.virtual("calculatedFinalTotal").get(function () {
  const subtotal = this.get("calculatedSubtotal");
  return Math.max(0, subtotal - (this.promotionDiscount || 0));
});

// Auto-generate order number
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `NV-${(count + 1).toString().padStart(6, "0")}`;
  }
  next();
});

// MODELS
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", categorySchema);

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);

export const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>("Cart", cartSchema);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);

export const Favorite: Model<IFavorite> =
  mongoose.models.Favorite ||
  mongoose.model<IFavorite>("Favorite", favoriteSchema);

export const Promotion: Model<IPromotion> =
  mongoose.models.Promotion ||
  mongoose.model<IPromotion>("Promotion", promotionSchema);

export const CustomerPromotionUsage: Model<ICustomerPromotionUsage> =
  mongoose.models.CustomerPromotionUsage ||
  mongoose.model<ICustomerPromotionUsage>(
    "CustomerPromotionUsage",
    customerPromotionUsageSchema
  );
export const TrackingEvent: Model<ITrackingEvent> =
  mongoose.models.TrackingEvent ||
  mongoose.model<ITrackingEvent>("TrackingEvent", trackingEventSchema);
