// lib/utils/serialization.ts

import { Types } from "mongoose";

/**
 * Recursively converts MongoDB ObjectIds to strings and handles Date objects
 * to ensure objects can be safely passed from Server Components to Client Components
 */
export function serializeDocument<T>(doc: any): T {
  if (doc === null || doc === undefined) {
    return doc;
  }

  // Handle arrays
  if (Array.isArray(doc)) {
    return doc.map((item) => serializeDocument(item)) as T;
  }

  // Handle Date objects
  if (doc instanceof Date) {
    return doc.toISOString() as T;
  }

  // Handle MongoDB ObjectId (has _id property with buffer) - This check might be
  // redundant or less robust than checking instanceof Types.ObjectId or value.toString().
  // Relying on `value.toString()` for ObjectIds in the generic serializeValue is safer.
  // This block might not be strictly necessary if serializeValue is used consistently.
  if (doc._id && typeof doc._id === "object" && doc._id.buffer) {
    return doc._id.toString() as T;
  }

  // Handle plain objects
  if (typeof doc === "object" && doc !== null) {
    const serialized: any = {};

    for (const [key, value] of Object.entries(doc)) {
      // Convert _id fields to strings
      // This logic is also covered by serializeValue
      if (
        key === "_id" &&
        value &&
        typeof value === "object" &&
        value.toString
      ) {
        serialized[key] = value.toString();
      }
      // Recursively serialize nested objects
      else if (typeof value === "object") {
        serialized[key] = serializeDocument(value);
      }
      // Keep primitive values as is
      else {
        serialized[key] = value;
      }
    }

    return serialized as T;
  }

  // Return primitive values as is
  return doc as T;
}

/**
 * Utility functions for serializing MongoDB data for client components
 */

// Generic serialization function for ObjectIds and Dates
export function serializeValue(value: any): any {
  if (value === null || value === undefined) {
    return value;
  }

  // Handle MongoDB ObjectId
  if (value instanceof Types.ObjectId) {
    return value.toString();
  }
  // This additional check handles plain objects that might have an _id field
  // that's already an ObjectId or similar object with a toString method.
  if (
    typeof value === "object" &&
    value !== null &&
    value._id instanceof Types.ObjectId
  ) {
    return value._id.toString();
  }

  // Handle Date objects
  if (value instanceof Date) {
    return value.toISOString();
  }
  // Added a check to see if it's already a string that looks like an ISO date
  // or if it's a number that could represent a timestamp.
  // However, the best practice is to ensure it's a Date object before this point.
  // If it's already a string, we don't need to call toISOString().
  // If it's a string that *should* be a Date, convert it first.
  if (typeof value === "string" && !isNaN(new Date(value).getTime())) {
    // If it's a valid date string, keep it as is (assuming it's already ISO format)
    // or convert it to ensure consistent ISO format.
    // For safety, let's explicitly convert it to a Date and then to ISO string.
    try {
      const date = new Date(value);
      return date.toISOString();
    } catch (e) {
      // Fallback to original value if conversion fails
      return value;
    }
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  // Handle nested objects
  if (typeof value === "object" && value !== null) {
    const serialized: any = {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        serialized[key] = serializeValue(value[key]);
      }
    }
    return serialized;
  }

  return value;
}

// Specific serialization functions for different data types

export interface SerializedOrder {
  _id: string;
  orderNumber: string;
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
  items: SerializedOrderItem[];
  notes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  appliedPromotion?: {
    promotionId: string;
    code: string;
    name: string;
    discountAmount: number;
    discountType: "percentage" | "fixed_amount" | "buy_x_get_y";
  };
}

export interface SerializedOrderItem {
  _id: string;
  product: string; // This should be `string` as it's an ObjectId string
  productName: string;
  productSlug: string;
  productImage: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  totalPrice: number;
  appliedDiscount?: number;
}

export interface SerializedProduct {
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
  category?: SerializedCategory;
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
  isDiscounted: boolean;
  promotionEligible: boolean;
  promotionTags: string[];
  metaTitle?: string;
  metaDescription?: string;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedUser {
  _id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface SerializedConsultation {
  _id: string;
  consultationNumber: string;
  user?: string; // This should be `string` as it's an ObjectId string
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    age: number;
    gender: "male" | "female" | "other" | "prefer-not-to-say";
    occupation?: string;
  };
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
  goalsAndLifestyle: {
    primaryGoals: string[];
    motivationLevel: number;
    biggestChallenges: string[];
    currentEatingHabits?: string;
    mealPrepExperience: "none" | "beginner" | "intermediate" | "advanced";
    cookingSkills: "none" | "basic" | "intermediate" | "advanced";
    budgetRange: "under-50" | "50-100" | "100-150" | "150-200" | "over-200";
  };
  servicePreferences: {
    servicesInterested: string[];
    preferredConsultationTime: string;
    preferredDate: string;
    timeZone: string;
    communicationPreference: "email" | "phone" | "video-call" | "text";
    urgencyLevel: "3-5-days" | "1-week" | "2-weeks" | "1-month";
  };
  additionalNotes?: string;
  howDidYouHear?: string;
  agreeToTerms: boolean;
  agreeToMarketing: boolean;
  paymentIntentId?: string;
  totalAmount: number;
  currency: string;
  paymentStatus: "pending" | "paid" | "failed";
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled";
  scheduledAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  consultantNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedCart {
  _id: string;
  items: SerializedCartItem[];
  subtotal: number;
  promotionDiscount: number;
  promotionCode?: string;
  promotionName?: string;
  promotionId?: string;
  finalTotal: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  hasPromotionApplied: boolean;
}

export interface SerializedCartItem {
  _id: string;
  product: SerializedProduct; // Changed to SerializedProduct as you're embedding it
  quantity: number;
  price: number;
  originalPrice?: number;
}

// Serialization functions
export function serializeOrder(order: any): SerializedOrder {
  return {
    _id: serializeValue(order._id), // Use serializeValue
    orderNumber: order.orderNumber,
    email: order.email,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    taxAmount: order.taxAmount,
    shippingAmount: order.shippingAmount,
    discountAmount: order.discountAmount,
    totalAmount: order.totalAmount,
    currency: order.currency,
    shippingAddress: order.shippingAddress,
    billingAddress: order.billingAddress,
    items: order.items?.map((item: any) => serializeOrderItem(item)) || [],
    notes: order.notes,
    trackingNumber: order.trackingNumber,
    createdAt: serializeValue(order.createdAt), // Use serializeValue
    updatedAt: serializeValue(order.updatedAt), // Use serializeValue
    shippedAt: serializeValue(order.shippedAt), // Use serializeValue
    deliveredAt: serializeValue(order.deliveredAt), // Use serializeValue
    cancelledAt: serializeValue(order.cancelledAt), // Use serializeValue
    appliedPromotion: order.appliedPromotion
      ? {
          promotionId: serializeValue(order.appliedPromotion.promotionId), // Use serializeValue
          code: order.appliedPromotion.code,
          name: order.appliedPromotion.name,
          discountAmount: order.appliedPromotion.discountAmount,
          discountType: order.appliedPromotion.discountType,
        }
      : undefined,
  };
}

export function serializeOrderItem(item: any): SerializedOrderItem {
  return {
    _id: serializeValue(item._id), // Use serializeValue
    product: serializeValue(item.product), // Use serializeValue for ObjectId
    productName: item.productName,
    productSlug: item.productSlug,
    productImage: item.productImage,
    quantity: item.quantity,
    price: item.price,
    originalPrice: item.originalPrice,
    totalPrice: item.totalPrice,
    appliedDiscount: item.appliedDiscount,
  };
}

export function serializeProduct(product: any): SerializedProduct {
  return {
    _id: serializeValue(product._id), // Use serializeValue
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    costPrice: product.costPrice,
    sku: product.sku,
    barcode: product.barcode,
    category: product.category
      ? serializeCategory(product.category)
      : undefined,
    images: product.images || [],
    tags: product.tags || [],
    features: product.features || [],
    ingredients: product.ingredients || [],
    nutritionFacts: product.nutritionFacts,
    inventory: product.inventory,
    trackQuantity: product.trackQuantity,
    allowBackorder: product.allowBackorder,
    weight: product.weight,
    dimensions: product.dimensions,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    isDiscounted: product.isDiscounted,
    promotionEligible: product.promotionEligible,
    promotionTags: product.promotionTags || [],
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    averageRating: product.averageRating,
    reviewCount: product.reviewCount,
    createdAt: serializeValue(product.createdAt), // Use serializeValue
    updatedAt: serializeValue(product.updatedAt), // Use serializeValue
  };
}

export function serializeCategory(category: any): SerializedCategory {
  return {
    _id: serializeValue(category._id), // Use serializeValue
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl,
    isActive: category.isActive,
    createdAt: serializeValue(category.createdAt), // Use serializeValue
    updatedAt: serializeValue(category.updatedAt), // Use serializeValue
  };
}

export function serializeUser(user: any): SerializedUser {
  return {
    _id: serializeValue(user._id), // Use serializeValue
    clerkId: user.clerkId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    role: user.role,
    createdAt: serializeValue(user.createdAt), // Use serializeValue
    updatedAt: serializeValue(user.updatedAt), // Use serializeValue
  };
}

export function serializeConsultation(
  consultation: any
): SerializedConsultation {
  return {
    _id: serializeValue(consultation._id), // Use serializeValue
    consultationNumber: consultation.consultationNumber,
    user: serializeValue(consultation.user), // Use serializeValue for ObjectId
    personalInfo: consultation.personalInfo,
    healthInfo: consultation.healthInfo,
    goalsAndLifestyle: consultation.goalsAndLifestyle,
    servicePreferences: consultation.servicePreferences,
    additionalNotes: consultation.additionalNotes,
    howDidYouHear: consultation.howDidYouHear,
    agreeToTerms: consultation.agreeToTerms,
    agreeToMarketing: consultation.agreeToMarketing,
    paymentIntentId: consultation.paymentIntentId,
    totalAmount: consultation.totalAmount,
    currency: consultation.currency,
    paymentStatus: consultation.paymentStatus,
    status: consultation.status,
    scheduledAt: serializeValue(consultation.scheduledAt), // Use serializeValue
    completedAt: serializeValue(consultation.completedAt), // Use serializeValue
    cancelledAt: serializeValue(consultation.cancelledAt), // Use serializeValue
    consultantNotes: consultation.consultantNotes,
    createdAt: serializeValue(consultation.createdAt), // Use serializeValue
    updatedAt: serializeValue(consultation.updatedAt), // Use serializeValue
  };
}

export function serializeCart(cart: any): SerializedCart {
  const subtotal =
    cart.items?.reduce(
      (sum: number, item: any) => sum + item.quantity * item.price,
      0
    ) || 0;

  const promotionDiscount = cart.promotionDiscount || 0;
  const finalTotal = Math.max(0, subtotal - promotionDiscount);

  // Calculate shipping and tax (you can adjust these based on your business logic)
  const shippingAmount = finalTotal >= 25 ? 0 : 5.99;
  const taxAmount = Math.round(finalTotal * 0.08 * 100) / 100; // 8% tax
  const totalAmount = finalTotal + shippingAmount + taxAmount;

  return {
    _id: serializeValue(cart._id), // Use serializeValue
    items:
      cart.items?.map((item: any) => ({
        _id: serializeValue(item._id), // Use serializeValue
        product: serializeProduct(item.product), // Assuming product is an embedded object needing full serialization
        quantity: item.quantity,
        price: item.price,
        originalPrice: item.originalPrice,
      })) || [],
    subtotal,
    promotionDiscount,
    promotionCode: cart.promotionCode,
    promotionName: cart.promotionName,
    promotionId: serializeValue(cart.promotionId), // Use serializeValue
    finalTotal,
    shippingAmount,
    taxAmount,
    totalAmount,
    hasPromotionApplied: !!(cart.promotionCode && promotionDiscount > 0),
  };
}

// Batch serialization functions
export function serializeOrders(orders: any[]): SerializedOrder[] {
  return orders.map(serializeOrder);
}

export function serializeProducts(products: any[]): SerializedProduct[] {
  return products.map(serializeProduct);
}

export function serializeCategories(categories: any[]): SerializedCategory[] {
  return categories.map(serializeCategory);
}

export function serializeUsers(users: any[]): SerializedUser[] {
  return users.map(serializeUser);
}

export function serializeConsultations(
  consultations: any[]
): SerializedConsultation[] {
  return consultations.map(serializeConsultation);
}

// Utility for handling pagination with serialized data
export interface SerializedPaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function serializePaginatedResult<T>(
  result: any,
  serializer: (item: any) => T
): SerializedPaginatedResult<T> {
  return {
    data: result.data?.map(serializer) || [],
    pagination: {
      total: result.total || 0,
      totalPages: result.totalPages || 0,
      currentPage: result.currentPage || 1,
      hasNextPage: result.hasNextPage || false,
      hasPrevPage: result.hasPrevPage || false,
    },
  };
}

// Error handling for serialization
export function safeSerialize<T>(
  data: any,
  serializer: (data: any) => T,
  fallback: T
): T {
  try {
    if (!data) return fallback;
    return serializer(data);
  } catch (error) {
    console.error("Serialization error:", error);
    return fallback;
  }
}
