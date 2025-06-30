// types/product.types.ts

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
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
  category: ICategory;
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
  updatedAt?: Date;
}

export interface IProductFormData {
  name: string;
  slug: string;
  price: number | string;
  compareAtPrice: number | string;
  category: string;
  inventory: number;
  shortDescription: string;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  description?: string;
  tags?: string[];
  features?: string[];
  ingredients?: string[];
  weight?: number;
  sku?: string;
  barcode?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface IProductStats {
  total: number;
  active: number;
  featured: number;
  lowStock: number;
  outOfStock: number;
  revenue: number;
}

export interface INotification {
  message: string;
  type: "success" | "error" | "info" | "warning";
}

export interface IProductFilters {
  searchTerm: string;
  selectedCategory: string;
  status?: "active" | "inactive" | "";
  stockStatus?: "in-stock" | "low-stock" | "out-of-stock" | "";
  sortBy?: "name" | "price" | "created" | "stock" | "";
}

export type ViewMode = "grid" | "list";

export type ProductStatus = "active" | "inactive";
export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";
export type SortBy = "name" | "price" | "created" | "stock";

// Form step type for multi-step product form
export type ProductFormStep = 1 | 2 | 3 | 4 | 5;
export const PRODUCT_FORM_STEPS = [
  "Basic Info",
  "Pricing",
  "Images",
  "Settings",
] as const;

// Color variants for stats cards
export type StatCardColor =
  | "from-blue-500 to-blue-600"
  | "from-emerald-500 to-emerald-600"
  | "from-yellow-500 to-yellow-600"
  | "from-orange-500 to-orange-600"
  | "from-red-500 to-red-600"
  | "from-purple-500 to-purple-600";

export interface IStatCard {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  subtitle?: string;
  color: StatCardColor;
  trend?: number;
}

// API Response types
export interface IProductResponse {
  success: boolean;
  data?: IProduct;
  message?: string;
  error?: string;
}

export interface IProductListResponse {
  success: boolean;
  data?: IProduct[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  error?: string;
}

export interface ICategoryResponse {
  success: boolean;
  data?: ICategory[];
  message?: string;
  error?: string;
}

// Validation schemas (for use with libraries like Zod)
export interface IProductValidation {
  name: {
    required: true;
    minLength: 2;
    maxLength: 100;
  };
  slug: {
    required: true;
    pattern: "/^[a-z0-9-]+$/";
  };
  price: {
    required: true;
    min: 0;
  };
  inventory: {
    required: true;
    min: 0;
  };
  category: {
    required: true;
  };
}
