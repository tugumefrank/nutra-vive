import mongoose, { Schema, Document, Model } from "mongoose";

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

// Product Interface
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

// Review Interface
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

// Product Schema
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

// Add indexes
categorySchema.index({ slug: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
reviewSchema.index({ product: 1 });
reviewSchema.index({ user: 1 });

// Models
export const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", categorySchema);

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);
