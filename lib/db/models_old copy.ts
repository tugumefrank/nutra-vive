import mongoose, { Schema, Document, Model } from "mongoose";

// Interfaces for TypeScript
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

export interface IProduct extends Document {
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
  metaTitle?: string;
  metaDescription?: string;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReview extends Document {
  _id: string;
  product: mongoose.Types.ObjectId; // Product ID
  user: mongoose.Types.ObjectId; // User ID
  rating: number;
  title?: string;
  content?: string;
  isVerified: boolean;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrder extends Document {
  _id: string;
  orderNumber: string;
  user?: string; // User ID
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
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
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
    product: string; // Product ID
    productName: string;
    productSlug: string;
    productImage: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }[];
  notes?: string;
  trackingNumber?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICart extends Document {
  _id: string;
  user?: string; // User ID
  sessionId?: string;
  clerkUserId: { type: string };
  items: {
    product: string; // Product ID
    quantity: number;
    price: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IFavorite extends Document {
  _id: string;
  user: string; // Clerk userId instead of ObjectId reference
  product: mongoose.Types.ObjectId; // Product ID
  createdAt: Date;
}

export interface IDiscountCode extends Document {
  _id: string;
  code: string;
  type: "percentage" | "fixed_amount";
  value: number;
  minimumAmount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  startsAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification extends Document {
  _id: string;
  user?: string; // User ID
  type: "order" | "inventory" | "review" | "payment" | "system";
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

// Schemas
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

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    shortDescription: String,
    price: { type: Number, required: true },
    compareAtPrice: Number,
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
    metaTitle: String,
    metaDescription: String,
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

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
        totalPrice: { type: Number, required: true },
      },
    ],
    notes: String,
    trackingNumber: String,
    shippedAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true }
);

const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    sessionId: String,
    clerkUserId: { type: String },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

const favoriteSchema = new Schema<IFavorite>(
  {
    user: { type: String, required: true }, // Store Clerk userId directly
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  },
  { timestamps: true }
);

const discountCodeSchema = new Schema<IDiscountCode>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    type: {
      type: String,
      enum: ["percentage", "fixed_amount"],
      required: true,
    },
    value: { type: Number, required: true },
    minimumAmount: Number,
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startsAt: Date,
    expiresAt: Date,
  },
  { timestamps: true }
);

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["order", "inventory", "review", "payment", "system"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: Schema.Types.Mixed,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Add indexes
userSchema.index({ clerkId: 1 });
userSchema.index({ email: 1 });
categorySchema.index({ slug: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
reviewSchema.index({ product: 1 });
reviewSchema.index({ user: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });
favoriteSchema.index({ user: 1 }); // For efficient user queries
favoriteSchema.index({ product: 1 }); // For efficient product queries
favoriteSchema.index({ user: 1, product: 1 }, { unique: true });

// Models
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", categorySchema);
export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);
export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);
export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
export const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>("Cart", cartSchema);
export const Favorite: Model<IFavorite> =
  mongoose.models.Favorite ||
  mongoose.model<IFavorite>("Favorite", favoriteSchema);
export const DiscountCode: Model<IDiscountCode> =
  mongoose.models.DiscountCode ||
  mongoose.model<IDiscountCode>("DiscountCode", discountCodeSchema);
export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);

// Consultation Interface
export interface IConsultation extends Document {
  _id: string;
  consultationNumber: string;
  user?: string; // User ID if logged in

  // Personal Information
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    age: number;
    gender: "male" | "female" | "other" | "prefer-not-to-say";
    occupation?: string;
  };

  // Health Information
  healthInfo: {
    currentWeight: number;
    goalWeight: number;
    height: string;
    activityLevel:
      | "sedentary"
      | "lightly-active"
      | "moderately-active"
      | "very-active"
      | "extremely-active";
    dietaryRestrictions: string[];
    allergies?: string;
    medicalConditions?: string;
    currentMedications?: string;
    previousDietExperience?: string;
  };

  // Goals & Lifestyle
  goalsAndLifestyle: {
    primaryGoals: string[];
    motivationLevel: number; // 1-10
    biggestChallenges: string[];
    currentEatingHabits?: string;
    mealPrepExperience: "none" | "beginner" | "intermediate" | "advanced";
    cookingSkills: "none" | "basic" | "intermediate" | "advanced";
    budgetRange: "under-50" | "50-100" | "100-150" | "150-200" | "over-200";
  };

  // Service Preferences
  servicePreferences: {
    servicesInterested: string[]; // consultation, meal-plan, coaching
    preferredConsultationTime: string;
    preferredDate: string;
    timeZone: string;
    communicationPreference: "email" | "phone" | "video-call" | "text";
    urgencyLevel: "3-5-days" | "1-week" | "2-weeks" | "1-month" | "";
  };

  // Additional Information
  additionalNotes?: string;
  howDidYouHear?: string;
  agreeToTerms: boolean;
  agreeToMarketing: boolean;

  // Payment & Booking Info
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentIntentId?: string; // Stripe payment intent
  totalAmount: number;
  currency: string;

  // Consultation Status
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled";
  scheduledAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;

  // Consultant Notes
  consultantNotes?: string;
  followUpRequired: boolean;
  followUpDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

// Consultation Notes (for ongoing sessions)
export interface IConsultationNote extends Document {
  _id: string;
  consultation: mongoose.Types.ObjectId;
  consultant: mongoose.Types.ObjectId; // Admin/Consultant user
  session: number; // Session number (1, 2, 3...)
  sessionType: "initial" | "follow-up" | "check-in";
  notes: string;
  recommendations: string[];
  nextSteps?: string;
  nextSessionDate?: Date;
  createdAt: Date;
}

// Meal Plans (created during consultations)
export interface IMealPlan extends Document {
  _id: string;
  consultation: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  duration: number; // days

  meals: {
    day: number;
    breakfast?: {
      name: string;
      ingredients: string[];
      instructions: string;
      calories?: number;
      macros?: {
        protein: number;
        carbs: number;
        fat: number;
      };
    };
    lunch?: {
      name: string;
      ingredients: string[];
      instructions: string;
      calories?: number;
      macros?: {
        protein: number;
        carbs: number;
        fat: number;
      };
    };
    dinner?: {
      name: string;
      ingredients: string[];
      instructions: string;
      calories?: number;
      macros?: {
        protein: number;
        carbs: number;
        fat: number;
      };
    };
    snacks?: {
      name: string;
      ingredients: string[];
      instructions: string;
      calories?: number;
    }[];
  }[];

  shoppingList: string[];
  totalCalories: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schemas
const consultationSchema = new Schema<IConsultation>(
  {
    consultationNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },

    personalInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      age: { type: Number, required: true },
      gender: {
        type: String,
        enum: ["male", "female", "other", "prefer-not-to-say"],
        required: true,
      },
      occupation: String,
    },

    healthInfo: {
      currentWeight: { type: Number, required: true },
      goalWeight: { type: Number, required: true },
      height: { type: String, required: true },
      activityLevel: {
        type: String,
        enum: [
          "sedentary",
          "lightly-active",
          "moderately-active",
          "very-active",
          "extremely-active",
        ],
        required: true,
      },
      dietaryRestrictions: [String],
      allergies: String,
      medicalConditions: String,
      currentMedications: String,
      previousDietExperience: String,
    },

    goalsAndLifestyle: {
      primaryGoals: { type: [String], required: true },
      motivationLevel: { type: Number, min: 1, max: 10, required: true },
      biggestChallenges: [String],
      currentEatingHabits: String,
      mealPrepExperience: {
        type: String,
        enum: ["none", "beginner", "intermediate", "advanced"],
        required: true,
      },
      cookingSkills: {
        type: String,
        enum: ["none", "basic", "intermediate", "advanced"],
        required: true,
      },
      budgetRange: {
        type: String,
        enum: ["under-50", "50-100", "100-150", "150-200", "over-200"],
        required: true,
      },
    },

    servicePreferences: {
      servicesInterested: { type: [String], required: true },
      preferredConsultationTime: { type: String, required: true },
      preferredDate: { type: String, required: true },
      timeZone: { type: String, required: true },
      communicationPreference: {
        type: String,
        enum: ["email", "phone", "video-call", "text"],
        required: true,
      },
      urgencyLevel: {
        type: String,
        enum: ["3-5-days", "1-week", "2-weeks", "1-month"],
        required: true,
      },
    },

    additionalNotes: String,
    howDidYouHear: String,
    agreeToTerms: { type: Boolean, required: true },
    agreeToMarketing: { type: Boolean, default: false },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentIntentId: String,
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: "USD" },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "rescheduled"],
      default: "pending",
    },
    scheduledAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancellationReason: String,

    consultantNotes: String,
    followUpRequired: { type: Boolean, default: false },
    followUpDate: Date,
  },
  { timestamps: true }
);

const consultationNoteSchema = new Schema<IConsultationNote>(
  {
    consultation: {
      type: Schema.Types.ObjectId,
      ref: "Consultation",
      required: true,
    },
    consultant: { type: Schema.Types.ObjectId, ref: "User", required: true },
    session: { type: Number, required: true },
    sessionType: {
      type: String,
      enum: ["initial", "follow-up", "check-in"],
      required: true,
    },
    notes: { type: String, required: true },
    recommendations: [String],
    nextSteps: String,
    nextSessionDate: Date,
  },
  { timestamps: true }
);

const mealPlanSchema = new Schema<IMealPlan>(
  {
    consultation: {
      type: Schema.Types.ObjectId,
      ref: "Consultation",
      required: true,
    },
    title: { type: String, required: true },
    description: String,
    duration: { type: Number, required: true },

    meals: [
      {
        day: { type: Number, required: true },
        breakfast: {
          name: String,
          ingredients: [String],
          instructions: String,
          calories: Number,
          macros: {
            protein: Number,
            carbs: Number,
            fat: Number,
          },
        },
        lunch: {
          name: String,
          ingredients: [String],
          instructions: String,
          calories: Number,
          macros: {
            protein: Number,
            carbs: Number,
            fat: Number,
          },
        },
        dinner: {
          name: String,
          ingredients: [String],
          instructions: String,
          calories: Number,
          macros: {
            protein: Number,
            carbs: Number,
            fat: Number,
          },
        },
        snacks: [
          {
            name: String,
            ingredients: [String],
            instructions: String,
            calories: Number,
          },
        ],
      },
    ],

    shoppingList: [String],
    totalCalories: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Add indexes
consultationSchema.index({ consultationNumber: 1 });
consultationSchema.index({ user: 1 });
consultationSchema.index({ status: 1 });
consultationSchema.index({ paymentStatus: 1 });
consultationSchema.index({ scheduledAt: 1 });
consultationSchema.index({ "personalInfo.email": 1 });

consultationNoteSchema.index({ consultation: 1 });
consultationNoteSchema.index({ consultant: 1 });

mealPlanSchema.index({ consultation: 1 });

// Auto-generate consultation number
consultationSchema.pre("save", async function (next) {
  if (!this.consultationNumber) {
    const count = await mongoose.model("Consultation").countDocuments();
    this.consultationNumber = `CONS-${(count + 1).toString().padStart(6, "0")}`;
  }
  next();
});

// Models
export const Consultation: Model<IConsultation> =
  mongoose.models.Consultation ||
  mongoose.model<IConsultation>("Consultation", consultationSchema);

export const ConsultationNote: Model<IConsultationNote> =
  mongoose.models.ConsultationNote ||
  mongoose.model<IConsultationNote>("ConsultationNote", consultationNoteSchema);

export const MealPlan: Model<IMealPlan> =
  mongoose.models.MealPlan ||
  mongoose.model<IMealPlan>("MealPlan", mealPlanSchema);
// Tracking Event Interface - for detailed tracking history
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
// Add indexes for tracking events
trackingEventSchema.index({ order: 1 });
trackingEventSchema.index({ status: 1 });
trackingEventSchema.index({ timestamp: -1 });
trackingEventSchema.index({ isPublic: 1 });

// Export the new model
export const TrackingEvent: Model<ITrackingEvent> =
  mongoose.models.TrackingEvent ||
  mongoose.model<ITrackingEvent>("TrackingEvent", trackingEventSchema);

// Add these interfaces to your existing models.ts file

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
  customer: mongoose.Types.ObjectId;
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
    customer: { type: Schema.Types.ObjectId, ref: "User" },
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

// Export the models (add these to your existing exports)
export const Promotion: Model<IPromotion> =
  mongoose.models.Promotion ||
  mongoose.model<IPromotion>("Promotion", promotionSchema);

export const CustomerPromotionUsage: Model<ICustomerPromotionUsage> =
  mongoose.models.CustomerPromotionUsage ||
  mongoose.model<ICustomerPromotionUsage>(
    "CustomerPromotionUsage",
    customerPromotionUsageSchema
  );
