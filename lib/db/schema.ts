import {
  boolean,
  timestamp,
  pgTable,
  text,
  integer,
  decimal,
  json,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (extends Clerk user data)
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(), // Clerk user ID
    email: text("email").notNull().unique(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    imageUrl: text("image_url"),
    role: text("role", { enum: ["user", "admin"] })
      .default("user")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
  })
);

// Product Categories
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Products
export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    shortDescription: text("short_description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
    costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
    sku: text("sku").unique(),
    barcode: text("barcode"),
    categoryId: uuid("category_id").references(() => categories.id),
    images: json("images").$type<string[]>().notNull().default([]),
    tags: json("tags").$type<string[]>().notNull().default([]),
    features: json("features").$type<string[]>().notNull().default([]),
    ingredients: json("ingredients").$type<string[]>().notNull().default([]),
    nutritionFacts: json("nutrition_facts").$type<{
      servingSize?: string;
      calories?: number;
      totalFat?: string;
      sodium?: string;
      totalCarbs?: string;
      sugars?: string;
      protein?: string;
      vitaminC?: string;
      [key: string]: string | number | undefined;
    }>(),
    inventory: integer("inventory").default(0).notNull(),
    trackQuantity: boolean("track_quantity").default(true).notNull(),
    allowBackorder: boolean("allow_backorder").default(false).notNull(),
    weight: decimal("weight", { precision: 8, scale: 2 }),
    dimensions: json("dimensions").$type<{
      length?: number;
      width?: number;
      height?: number;
      unit?: "in" | "cm";
    }>(),
    isActive: boolean("is_active").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index("product_slug_idx").on(table.slug),
    categoryIdx: index("product_category_idx").on(table.categoryId),
    activeIdx: index("product_active_idx").on(table.isActive),
    featuredIdx: index("product_featured_idx").on(table.isFeatured),
  })
);

// Product Reviews
export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    rating: integer("rating").notNull(), // 1-5 stars
    title: text("title"),
    content: text("content"),
    isVerified: boolean("is_verified").default(false).notNull(),
    isVisible: boolean("is_visible").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    productIdx: index("review_product_idx").on(table.productId),
    userIdx: index("review_user_idx").on(table.userId),
    ratingIdx: index("review_rating_idx").on(table.rating),
  })
);

// Carts
export const carts = pgTable(
  "carts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    sessionId: text("session_id"), // For guest users
    items: json("items")
      .$type<
        {
          productId: string;
          quantity: number;
          price: number;
        }[]
      >()
      .notNull()
      .default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("cart_user_idx").on(table.userId),
    sessionIdx: index("cart_session_idx").on(table.sessionId),
  })
);

// Favorites/Wishlist
export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("favorite_user_idx").on(table.userId),
    productIdx: index("favorite_product_idx").on(table.productId),
    userProductIdx: index("favorite_user_product_idx").on(
      table.userId,
      table.productId
    ),
  })
);

// Orders
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderNumber: text("order_number").notNull().unique(),
    userId: text("user_id").references(() => users.id),
    email: text("email").notNull(),
    status: text("status", {
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
    })
      .default("pending")
      .notNull(),
    paymentStatus: text("payment_status", {
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
    })
      .default("pending")
      .notNull(),
    paymentIntentId: text("payment_intent_id"), // Stripe payment intent ID
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    taxAmount: decimal("tax_amount", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    shippingAmount: decimal("shipping_amount", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    discountAmount: decimal("discount_amount", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").default("USD").notNull(),

    // Shipping Information
    shippingAddress: json("shipping_address")
      .$type<{
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
      }>()
      .notNull(),

    // Billing Information
    billingAddress: json("billing_address").$type<{
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
    }>(),

    // Order Items
    items: json("items")
      .$type<
        {
          productId: string;
          productName: string;
          productSlug: string;
          productImage: string;
          quantity: number;
          price: number;
          totalPrice: number;
        }[]
      >()
      .notNull(),

    notes: text("notes"),
    trackingNumber: text("tracking_number"),
    shippedAt: timestamp("shipped_at"),
    deliveredAt: timestamp("delivered_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    orderNumberIdx: index("order_number_idx").on(table.orderNumber),
    userIdx: index("order_user_idx").on(table.userId),
    statusIdx: index("order_status_idx").on(table.status),
    paymentStatusIdx: index("order_payment_status_idx").on(table.paymentStatus),
    createdAtIdx: index("order_created_at_idx").on(table.createdAt),
  })
);

// Discount Codes
export const discountCodes = pgTable(
  "discount_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull().unique(),
    type: text("type", { enum: ["percentage", "fixed_amount"] }).notNull(),
    value: decimal("value", { precision: 10, scale: 2 }).notNull(),
    minimumAmount: decimal("minimum_amount", { precision: 10, scale: 2 }),
    usageLimit: integer("usage_limit"),
    usedCount: integer("used_count").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    startsAt: timestamp("starts_at"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    codeIdx: index("discount_code_idx").on(table.code),
    activeIdx: index("discount_active_idx").on(table.isActive),
  })
);

// Notifications
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: ["order", "inventory", "review", "payment", "system"],
    }).notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    data: json("data").$type<Record<string, any>>(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("notification_user_idx").on(table.userId),
    typeIdx: index("notification_type_idx").on(table.type),
    isReadIdx: index("notification_read_idx").on(table.isRead),
  })
);

// Analytics Events
export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventType: text("event_type").notNull(), // 'page_view', 'product_view', 'add_to_cart', 'purchase', etc.
    userId: text("user_id").references(() => users.id),
    sessionId: text("session_id"),
    productId: uuid("product_id").references(() => products.id),
    orderId: uuid("order_id").references(() => orders.id),
    properties: json("properties").$type<Record<string, any>>(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => ({
    eventTypeIdx: index("analytics_event_type_idx").on(table.eventType),
    timestampIdx: index("analytics_timestamp_idx").on(table.timestamp),
    userIdx: index("analytics_user_idx").on(table.userId),
  })
);

// Zod Schemas for Validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertCategorySchema = createInsertSchema(categories);
export const selectCategorySchema = createSelectSchema(categories);

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);

export const insertReviewSchema = createInsertSchema(reviews);
export const selectReviewSchema = createSelectSchema(reviews);

export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);

export const insertDiscountCodeSchema = createInsertSchema(discountCodes);
export const selectDiscountCodeSchema = createSelectSchema(discountCodes);

// Additional validation schemas
export const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  compareAtPrice: z.number().min(0).optional(),
  categoryId: z.string().uuid().optional(),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  ingredients: z.array(z.string()).default([]),
  inventory: z.number().int().min(0).default(0),
  trackQuantity: z.boolean().default(true),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const reviewFormSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  content: z.string().min(10, "Review must be at least 10 characters"),
});

export const orderFormSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().min(1),
    })
  ),
  shippingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    address1: z.string().min(1),
    city: z.string().min(1),
    province: z.string().min(1),
    country: z.string().min(1),
    zip: z.string().min(1),
    phone: z.string().optional(),
  }),
  billingAddress: z
    .object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      address1: z.string().min(1),
      city: z.string().min(1),
      province: z.string().min(1),
      country: z.string().min(1),
      zip: z.string().min(1),
    })
    .optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type DiscountCode = typeof discountCodes.$inferSelect;
export type NewDiscountCode = typeof discountCodes.$inferInsert;

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
