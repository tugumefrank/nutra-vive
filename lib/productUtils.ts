// utils/productUtils.ts

import {
  IProduct,
  IProductStats,
  IProductFormData,
} from "../types/product.types";
import { stockThresholds } from "../data/mockData";

/**
 * Generate a URL-friendly slug from a product name
 */
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

/**
 * Generate a unique SKU for a product
 */
export const generateSKU = (name: string, category: string): string => {
  const categoryPrefix = category.substring(0, 3).toUpperCase();
  const namePrefix = name
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 3)
    .toUpperCase();
  const timestamp = Date.now().toString().slice(-3);
  return `${categoryPrefix}-${namePrefix}-${timestamp}`;
};

/**
 * Calculate product statistics from an array of products
 */
export const calculateProductStats = (products: IProduct[]): IProductStats => {
  return {
    total: products.length,
    active: products.filter((p) => p.isActive).length,
    featured: products.filter((p) => p.isFeatured).length,
    lowStock: products.filter(
      (p) =>
        p.inventory <= stockThresholds.LOW_STOCK &&
        p.inventory > stockThresholds.OUT_OF_STOCK
    ).length,
    outOfStock: products.filter(
      (p) => p.inventory === stockThresholds.OUT_OF_STOCK
    ).length,
    revenue: products.reduce((sum, p) => sum + p.price * (p.inventory || 0), 0),
  };
};

/**
 * Get stock status for a product
 */
export const getStockStatus = (
  inventory: number
): "in-stock" | "low-stock" | "out-of-stock" => {
  if (inventory === stockThresholds.OUT_OF_STOCK) return "out-of-stock";
  if (inventory <= stockThresholds.LOW_STOCK) return "low-stock";
  return "in-stock";
};

/**
 * Get stock status color classes
 */
export const getStockStatusColor = (inventory: number): string => {
  const status = getStockStatus(inventory);
  switch (status) {
    case "out-of-stock":
      return "text-red-600";
    case "low-stock":
      return "text-orange-600";
    case "in-stock":
      return "text-emerald-600";
    default:
      return "text-gray-600";
  }
};

/**
 * Format price with currency symbol
 */
export const formatPrice = (
  price: number,
  currency: string = "USD"
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(price);
};

/**
 * Calculate discount percentage
 */
export const calculateDiscountPercentage = (
  originalPrice: number,
  salePrice: number
): number => {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

/**
 * Validate product form data
 */
export const validateProductForm = (
  formData: IProductFormData
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields validation
  if (!formData.name.trim()) {
    errors.push("Product name is required");
  }

  if (!formData.slug.trim()) {
    errors.push("Product slug is required");
  } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
    errors.push(
      "Slug can only contain lowercase letters, numbers, and hyphens"
    );
  }

  if (!formData.category) {
    errors.push("Category is required");
  }

  const price =
    typeof formData.price === "string"
      ? parseFloat(formData.price)
      : formData.price;
  if (!price || price <= 0 || isNaN(price)) {
    errors.push("Price must be greater than 0");
  }

  if (formData.inventory < 0) {
    errors.push("Inventory cannot be negative");
  }

  if (formData.compareAtPrice && formData.compareAtPrice <= formData.price) {
    errors.push("Compare at price must be higher than the regular price");
  }

  // Length validations
  if (formData.name.length > 100) {
    errors.push("Product name cannot exceed 100 characters");
  }

  if (formData.shortDescription && formData.shortDescription.length > 200) {
    errors.push("Short description cannot exceed 200 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Filter products based on search criteria
 */
export const filterProducts = (
  products: IProduct[],
  filters: {
    searchTerm?: string;
    category?: string;
    status?: "active" | "inactive" | "";
    stockStatus?: "in-stock" | "low-stock" | "out-of-stock" | "";
    featured?: boolean;
  }
): IProduct[] => {
  return products.filter((product) => {
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(searchLower) ||
        product.category.name.toLowerCase().includes(searchLower) ||
        product.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) ||
        product.sku?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    // Category filter
    if (filters.category && product.category._id !== filters.category) {
      return false;
    }

    // Status filter
    if (filters.status) {
      if (filters.status === "active" && !product.isActive) return false;
      if (filters.status === "inactive" && product.isActive) return false;
    }

    // Stock status filter
    if (filters.stockStatus) {
      const productStockStatus = getStockStatus(product.inventory);
      if (productStockStatus !== filters.stockStatus) return false;
    }

    // Featured filter
    if (
      filters.featured !== undefined &&
      product.isFeatured !== filters.featured
    ) {
      return false;
    }

    return true;
  });
};

/**
 * Sort products based on criteria
 */
export const sortProducts = (
  products: IProduct[],
  sortBy: "name" | "price" | "created" | "stock" | "rating",
  sortOrder: "asc" | "desc" = "asc"
): IProduct[] => {
  return [...products].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "price":
        comparison = a.price - b.price;
        break;
      case "created":
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "stock":
        comparison = a.inventory - b.inventory;
        break;
      case "rating":
        comparison = a.averageRating - b.averageRating;
        break;
      default:
        return 0;
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });
};

/**
 * Generate product search keywords for better searchability
 */
export const generateProductKeywords = (product: IProduct): string[] => {
  const keywords = [
    product.name,
    product.category.name,
    ...(product.tags || []),
    ...(product.ingredients || []),
    ...(product.features || []),
  ];

  // Add additional contextual keywords
  if (product.isActive) keywords.push("available");
  if (product.isFeatured) keywords.push("featured", "popular");
  if (product.inventory === 0) keywords.push("out of stock");
  if (product.inventory <= stockThresholds.LOW_STOCK)
    keywords.push("low stock");

  return keywords
    .map((keyword) => keyword.toLowerCase().trim())
    .filter((keyword) => keyword.length > 0)
    .filter((keyword, index, arr) => arr.indexOf(keyword) === index); // Remove duplicates
};

/**
 * Check if product is eligible for discount
 */
export const isDiscountEligible = (product: IProduct): boolean => {
  return (
    product.compareAtPrice !== undefined &&
    product.compareAtPrice > product.price &&
    product.isActive
  );
};

/**
 * Get product availability text
 */
export const getAvailabilityText = (product: IProduct): string => {
  if (!product.isActive) return "Unavailable";
  if (product.inventory === 0) return "Out of Stock";
  if (product.inventory <= stockThresholds.LOW_STOCK)
    return `Only ${product.inventory} left`;
  return "In Stock";
};

/**
 * Format product creation date
 */
export const formatCreatedDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};

/**
 * Calculate estimated shipping weight
 */
export const calculateShippingWeight = (
  products: { product: IProduct; quantity: number }[]
): number => {
  return products.reduce((total, item) => {
    const weight = item.product.weight || 0;
    return total + weight * item.quantity;
  }, 0);
};

/**
 * Generate product URL for SEO
 */
export const generateProductUrl = (
  product: IProduct,
  baseUrl: string = ""
): string => {
  return `${baseUrl}/products/${product.slug}`;
};

/**
 * Debounce function for search input
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Convert form data to product object
 */
export const formDataToProduct = (
  formData: IProductFormData,
  existingProduct?: IProduct
): Partial<IProduct> => {
  return {
    ...existingProduct,
    name: formData.name,
    slug: formData.slug || generateSlug(formData.name),
    price:
      typeof formData.price === "string"
        ? parseFloat(formData.price)
        : formData.price,
    compareAtPrice: formData.compareAtPrice
      ? typeof formData.compareAtPrice === "string"
        ? parseFloat(formData.compareAtPrice)
        : formData.compareAtPrice
      : undefined,
    inventory: formData.inventory,
    shortDescription: formData.shortDescription,
    description: formData.description,
    images: formData.images,
    isActive: formData.isActive,
    isFeatured: formData.isFeatured,
    tags: formData.tags || [],
    features: formData.features || [],
    ingredients: formData.ingredients || [],
    weight: formData.weight,
    sku:
      formData.sku ||
      existingProduct?.sku ||
      generateSKU(formData.name, "DEFAULT"),
    metaTitle: formData.metaTitle,
    metaDescription: formData.metaDescription,
    updatedAt: new Date(),
  };
};
