// types/product.ts
export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface INutritionFacts {
  servingSize?: string;
  calories?: number;
  totalFat?: string;
  sodium?: string;
  totalCarbs?: string;
  sugars?: string;
  protein?: string;
  vitaminC?: string;
  [key: string]: string | number | undefined;
}

export interface IDimensions {
  length?: number;
  width?: number;
  height?: number;
  unit?: "in" | "cm";
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
  nutritionFacts?: INutritionFacts;
  inventory: number;
  trackQuantity: boolean;
  allowBackorder: boolean;
  weight?: number;
  dimensions?: IDimensions;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductListResponse {
  products: IProduct[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface IProductFilters {
  category?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
  sortBy?: "name" | "price" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Component prop types
export interface ProductGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

export interface AddToCartButtonProps {
  productId: string;
  className?: string;
  variant?: "default" | "outline";
  size?: "sm" | "default" | "lg";
}

export interface NutritionFactsProps {
  nutritionFacts?: INutritionFacts;
}

export interface ProductReviewsProps {
  productId: string;
}

export interface RelatedProductsProps {
  products: IProduct[];
}

export interface ProductInfoProps {
  product: IProduct;
}
