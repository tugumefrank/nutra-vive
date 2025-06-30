import { Category, Order, Product, Review, User } from "@/lib/db/schema";
import {
  IUser,
  IProduct,
  IOrder,
  IReview,
  ICategory,
  ICart,
  IFavorite,
  INotification,
} from "../lib/db/models";

// Re-export database types
export type {
  IUser as User,
  IProduct as Product,
  IOrder as Order,
  IReview as Review,
  ICategory as Category,
  ICart as Cart,
  IFavorite as Favorite,
  INotification as Notification,
} from "../lib/db/models";

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// (removed duplicate interfaces using IProduct, IReview, etc.; use the ones below that use Product, Review, etc.)
// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface CartSummary {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

// Product Types
export interface ProductWithReviews extends Product {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
  category?: Category;
}

export interface ProductFilters {
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  inStock?: boolean;
  featured?: boolean;
  sortBy?:
    | "price-asc"
    | "price-desc"
    | "name-asc"
    | "name-desc"
    | "rating"
    | "newest";
  search?: string;
}

// Order Types
export interface OrderWithProducts extends Order {
  itemsWithProducts: Array<{
    productId: string;
    product: Product;
    quantity: number;
    price: number;
    totalPrice: number;
  }>;
}

// User Types
export interface UserProfile extends User {
  orderCount: number;
  totalSpent: number;
  favoriteCount: number;
}

// Review Types
export interface ReviewWithUser extends Review {
  user: Pick<User, "firstName" | "lastName" | "imageUrl">;
}

// Navigation Types
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  disabled?: boolean;
  external?: boolean;
}

// Form Types
export interface AddressForm {
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
}

export interface CheckoutForm {
  email: string;
  shippingAddress: AddressForm;
  billingAddress: AddressForm;
  useShippingAsBilling: boolean;
  paymentMethod: "card" | "paypal";
  notes?: string;
}

// Search Types
export interface SearchResult {
  products: Product[];
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Analytics Types
export interface AnalyticsData {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  orders: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  customers: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  products: {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
  topProducts: Array<{
    product: Product;
    revenue: number;
    orderCount: number;
  }>;
  recentOrders: OrderWithProducts[];
}

// Notification Types
export interface NotificationWithData extends Notification {
  formattedMessage: string;
  actionUrl?: string;
}

// Store Types (for Zustand)
export interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export interface FavoritesStore {
  items: string[]; // Product IDs
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  isInFavorites: (productId: string) => boolean;
  clearFavorites: () => void;
}

export interface NotificationStore {
  notifications: NotificationWithData[];
  addNotification: (
    notification: Omit<NotificationWithData, "id" | "createdAt">
  ) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

// Component Props Types
export interface ProductCardProps {
  product: Product;
  showQuickAdd?: boolean;
  className?: string;
}

export interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  columns?: 2 | 3 | 4;
  showFilters?: boolean;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

// Error Types
export interface FormError {
  field: string;
  message: string;
}

export interface ApiError extends Error {
  status: number;
  code: string;
}

// Theme Types
export type Theme = "light" | "dark" | "system";

// File Upload Types
export interface UploadedFile {
  url: string;
  name: string;
  size: number;
  type: string;
}

// Stripe Types
export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

// Constants
export const PRODUCT_CATEGORIES = [
  "Cold Pressed Juices",
  "Herbal Teas",
  "Iced Teas",
  "Detox Blends",
  "Energy Boosters",
  "Immune Support",
  "Tea Bags",
] as const;

export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
] as const;

export const NOTIFICATION_TYPES = [
  "order",
  "inventory",
  "review",
  "payment",
  "system",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
