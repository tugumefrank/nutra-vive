// Application Configuration
export const APP_CONFIG = {
  name: "Nutra-Vive",
  description: "Premium organic juices and teas for a healthier lifestyle",
  version: "1.0.0",
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
} as const;

// Stock Management
export const STOCK_THRESHOLDS = {
  LOW_STOCK: 10,
  OUT_OF_STOCK: 0,
  CRITICAL_STOCK: 5,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
  MOBILE_PAGE_SIZE: 6,
} as const;

// Product Configuration
export const PRODUCT_CONFIG = {
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_SHORT_DESCRIPTION_LENGTH: 200,
  MAX_IMAGES: 5,
  MAX_TAGS: 10,
  MAX_FEATURES: 10,
  MAX_INGREDIENTS: 20,
  MIN_PRICE: 0.01,
  MAX_PRICE: 9999.99,
  SKU_LENGTH: 10,
} as const;

// Image Configuration
export const IMAGE_CONFIG = {
  MAX_FILE_SIZE: 4 * 1024 * 1024, // 4MB
  ALLOWED_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ] as const,
  THUMBNAIL_SIZE: { width: 300, height: 300 },
  LARGE_SIZE: { width: 800, height: 800 },
} as const;

// Form Validation
export const VALIDATION = {
  SLUG_PATTERN: /^[a-z0-9-]+$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^\+?[\d\s\-\(\)]+$/,
  PASSWORD_MIN_LENGTH: 8,
  SEARCH_MIN_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
} as const;

// Product Categories
export const PRODUCT_CATEGORIES = {
  JUICES: "juices",
  TEAS: "teas",
  SMOOTHIES: "smoothies",
  SEASONAL: "seasonal",
  DETOX: "detox",
  ENERGY: "energy",
} as const;

// Product Tags
export const PRODUCT_TAGS = {
  ORGANIC: "organic",
  NATURAL: "natural",
  VEGAN: "vegan",
  GLUTEN_FREE: "gluten-free",
  SUGAR_FREE: "sugar-free",
  LOW_CALORIE: "low-calorie",
  HIGH_PROTEIN: "high-protein",
  ANTIOXIDANT: "antioxidant",
  VITAMIN_C: "vitamin-c",
  CAFFEINE_FREE: "caffeine-free",
  DETOX: "detox",
  ENERGY: "energy",
  IMMUNE_BOOST: "immune-boost",
  DIGESTIVE: "digestive",
  HYDRATING: "hydrating",
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
  PARTIALLY_REFUNDED: "partially_refunded",
} as const;

// User Roles
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  ORDER: "order",
  INVENTORY: "inventory",
  REVIEW: "review",
  PAYMENT: "payment",
  SYSTEM: "system",
  PROMOTION: "promotion",
} as const;

// Activity Levels (for consultations)
export const ACTIVITY_LEVELS = {
  SEDENTARY: "sedentary",
  LIGHTLY_ACTIVE: "lightly-active",
  MODERATELY_ACTIVE: "moderately-active",
  VERY_ACTIVE: "very-active",
  EXTREMELY_ACTIVE: "extremely-active",
} as const;

// Consultation Status
export const CONSULTATION_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  RESCHEDULED: "rescheduled",
} as const;

// UI Constants
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  NOTIFICATION_DURATION: 5000,
  SEARCH_DEBOUNCE: 300,
  SCROLL_OFFSET: 100,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: "Something went wrong. Please try again.",
  NETWORK: "Network error. Please check your connection.",
  VALIDATION: "Please check your input and try again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  FILE_TOO_LARGE: "File size exceeds the maximum limit.",
  INVALID_FILE_TYPE: "Invalid file type. Please upload a valid image.",
  REQUIRED_FIELD: "This field is required.",
  INVALID_EMAIL: "Please enter a valid email address.",
  INVALID_PHONE: "Please enter a valid phone number.",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters long.",
  PRICE_INVALID: "Price must be a positive number.",
  INVENTORY_INVALID: "Inventory must be zero or positive.",
  SLUG_INVALID:
    "Slug can only contain lowercase letters, numbers, and hyphens.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  PRODUCT_CREATED: "Product created successfully!",
  PRODUCT_UPDATED: "Product updated successfully!",
  PRODUCT_DELETED: "Product deleted successfully!",
  STATUS_UPDATED: "Status updated successfully!",
  ORDER_PLACED: "Order placed successfully!",
  ORDER_UPDATED: "Order updated successfully!",
  PROFILE_UPDATED: "Profile updated successfully!",
  SETTINGS_SAVED: "Settings saved successfully!",
  EMAIL_SENT: "Email sent successfully!",
  REVIEW_SUBMITTED: "Review submitted successfully!",
  CONSULTATION_BOOKED: "Consultation booked successfully!",
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  PRODUCTS: "/api/products",
  CATEGORIES: "/api/categories",
  ORDERS: "/api/orders",
  USERS: "/api/users",
  REVIEWS: "/api/reviews",
  CONSULTATIONS: "/api/consultations",
  CART: "/api/cart",
  FAVORITES: "/api/favorites",
  PAYMENTS: "/api/payments",
  UPLOAD: "/api/upload",
  AUTH: "/api/auth",
  NEWSLETTER: "/api/newsletter",
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  CART: "nutravive_cart",
  FAVORITES: "nutravive_favorites",
  USER_PREFERENCES: "nutravive_preferences",
  THEME: "nutravive_theme",
  LANGUAGE: "nutravive_language",
  RECENT_SEARCHES: "nutravive_recent_searches",
} as const;

// Social Media Links
export const SOCIAL_LINKS = {
  FACEBOOK: "https://facebook.com/nutravive",
  INSTAGRAM: "https://instagram.com/nutravive",
  TWITTER: "https://twitter.com/nutravive",
  YOUTUBE: "https://youtube.com/nutravive",
  LINKEDIN: "https://linkedin.com/company/nutravive",
} as const;

// Currency Configuration
export const CURRENCY = {
  DEFAULT: "USD",
  SYMBOL: "$",
  DECIMAL_PLACES: 2,
} as const;

// Time Zones (for consultations)
export const TIME_ZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
] as const;

// Communication Preferences
export const COMMUNICATION_PREFERENCES = {
  EMAIL: "email",
  PHONE: "phone",
  VIDEO_CALL: "video-call",
  TEXT: "text",
} as const;

// Urgency Levels
export const URGENCY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

// Meal Prep Experience Levels
export const MEAL_PREP_EXPERIENCE = {
  NONE: "none",
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
} as const;

// Cooking Skill Levels
export const COOKING_SKILLS = {
  NONE: "none",
  BASIC: "basic",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
} as const;

// Budget Ranges
export const BUDGET_RANGES = {
  UNDER_50: "under-50",
  FIFTY_TO_100: "50-100",
  HUNDRED_TO_150: "100-150",
  HUNDRED_FIFTY_TO_200: "150-200",
  OVER_200: "over-200",
} as const;

// Gender Options
export const GENDER_OPTIONS = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
  PREFER_NOT_TO_SAY: "prefer-not-to-say",
} as const;

// Dietary Restrictions
export const DIETARY_RESTRICTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Soy-Free",
  "Paleo",
  "Keto",
  "Low-Carb",
  "Low-Fat",
  "Low-Sodium",
  "Sugar-Free",
  "Organic Only",
  "Raw Food",
  "Mediterranean",
] as const;

// Primary Health Goals
export const PRIMARY_GOALS = [
  "Weight Loss",
  "Weight Gain",
  "Muscle Building",
  "Improved Energy",
  "Better Digestion",
  "Detoxification",
  "Immune Support",
  "Stress Reduction",
  "Better Sleep",
  "Heart Health",
  "Skin Health",
  "Mental Clarity",
  "Anti-Aging",
  "Athletic Performance",
  "General Wellness",
] as const;

// Biggest Challenges
export const BIGGEST_CHALLENGES = [
  "Finding Time to Cook",
  "Meal Planning",
  "Grocery Shopping",
  "Portion Control",
  "Cravings",
  "Eating Out",
  "Late Night Snacking",
  "Stress Eating",
  "Budget Constraints",
  "Family Preferences",
  "Travel",
  "Work Schedule",
  "Lack of Knowledge",
  "Motivation",
  "Social Situations",
] as const;

// Services Offered
export const SERVICES = {
  CONSULTATION: "consultation",
  MEAL_PLAN: "meal-plan",
  COACHING: "coaching",
} as const;

// Service Pricing
export const SERVICE_PRICING = {
  [SERVICES.CONSULTATION]: 20,
  [SERVICES.MEAL_PLAN]: 20,
  [SERVICES.COACHING]: 35,
} as const;

// Email Templates
export const EMAIL_TEMPLATES = {
  CONSULTATION_CONFIRMATION: "consultation-confirmation",
  PAYMENT_CONFIRMATION: "payment-confirmation",
  ORDER_CONFIRMATION: "order-confirmation",
  SHIPPING_NOTIFICATION: "shipping-notification",
  WELCOME: "welcome",
  PASSWORD_RESET: "password-reset",
  NEWSLETTER: "newsletter",
} as const;

// Dashboard Cards
export const DASHBOARD_CARDS = {
  TOTAL_PRODUCTS: "total-products",
  ACTIVE_PRODUCTS: "active-products",
  FEATURED_PRODUCTS: "featured-products",
  LOW_STOCK: "low-stock",
  OUT_OF_STOCK: "out-of-stock",
  REVENUE: "revenue",
  ORDERS: "orders",
  CUSTOMERS: "customers",
  CONSULTATIONS: "consultations",
  REVIEWS: "reviews",
} as const;
