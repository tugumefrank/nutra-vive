import mongoose, { Schema, Document, Model } from "mongoose";

// Cart Interface
export interface ICart extends Document {
  _id: string;
  user?: string; // User ID
  clerkUserId?: string; // Clerk User ID for compatibility
  sessionId?: string; // For guest users
  items: {
    product: string; // Product ID
    quantity: number;
    price: number;
  }[];

  // NEW: Promotion fields
  promotionId?: string; // Reference to Promotion
  promotionCode?: string; // Applied promotion code
  promotionName?: string; // Display name of promotion
  promotionDiscount?: number; // Discount amount applied

  createdAt: Date;
  updatedAt: Date;
}

// Favorite Interface
export interface IFavorite extends Document {
  _id: string;
  user: string; // Clerk userId instead of ObjectId reference
  product: string; // Product ID
  createdAt: Date;
}

// Discount Code Interface
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

// Cart Schema
const cartSchema = new Schema<ICart>(
  {
    user: { type: String, ref: "User" },
    sessionId: String,
    clerkUserId: { type: String },
    items: [
      {
        product: {
          type: String,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    // NEW: Promotion fields
    promotionId: { type: String, ref: "Promotion" },
    promotionCode: { type: String, uppercase: true },
    promotionName: String,
    promotionDiscount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Favorite Schema
const favoriteSchema = new Schema<IFavorite>(
  {
    user: { type: String, required: true }, // Store Clerk userId directly
    product: { type: String, ref: "Product", required: true },
  },
  { timestamps: true }
);

// Discount Code Schema
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

// Add indexes
cartSchema.index({ clerkUserId: 1 });
cartSchema.index({ promotionCode: 1 });
cartSchema.index({ promotionId: 1 });
cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });
favoriteSchema.index({ user: 1 }); // For efficient user queries
favoriteSchema.index({ product: 1 }); // For efficient product queries
favoriteSchema.index({ user: 1, product: 1 }, { unique: true });

// Models
export const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>("Cart", cartSchema);

export const Favorite: Model<IFavorite> =
  mongoose.models.Favorite ||
  mongoose.model<IFavorite>("Favorite", favoriteSchema);

export const DiscountCode: Model<IDiscountCode> =
  mongoose.models.DiscountCode ||
  mongoose.model<IDiscountCode>("DiscountCode", discountCodeSchema);
