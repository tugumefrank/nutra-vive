// data/mockData.ts

import { ICategory, IProduct } from "../types/product.types";

export const mockCategories: ICategory[] = [
  {
    _id: "cat1",
    name: "Juices",
    slug: "juices",
    description: "Fresh and natural fruit juices",
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    _id: "cat2",
    name: "Teas",
    slug: "teas",
    description: "Herbal and traditional teas",
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    _id: "cat3",
    name: "Seasonal",
    slug: "seasonal",
    description: "Limited time seasonal offerings",
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    _id: "cat4",
    name: "Smoothies",
    slug: "smoothies",
    description: "Nutritious blended beverages",
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
];

export const mockProducts: IProduct[] = [
  {
    _id: "1",
    name: "Berry Day Juice",
    slug: "berry-day-juice",
    description:
      "A delicious blend of strawberries and blackberries, packed with antioxidants and natural sweetness.",
    shortDescription:
      "Antioxidant-rich berry blend for a healthy start to your day",
    price: 8.87,
    compareAtPrice: 10.99,
    images: [
      "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400",
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
    ],
    category: mockCategories[0], // Juices
    tags: ["antioxidant", "berry", "natural", "organic"],
    features: [
      "100% Natural",
      "No Added Sugar",
      "Rich in Vitamin C",
      "Raw & Fresh",
    ],
    ingredients: ["Strawberries", "Blackberries", "Natural Spring Water"],
    nutritionFacts: {
      servingSize: "8 fl oz",
      calories: 120,
      totalFat: "0g",
      sodium: "5mg",
      totalCarbs: "30g",
      sugars: "28g",
      protein: "1g",
      vitaminC: "60mg",
    },
    inventory: 50,
    trackQuantity: true,
    allowBackorder: false,
    weight: 12,
    dimensions: {
      length: 2.5,
      width: 2.5,
      height: 8,
      unit: "in",
    },
    isActive: true,
    isFeatured: true,
    metaTitle: "Berry Day Juice - Organic Antioxidant Blend",
    metaDescription:
      "Start your day with our organic berry juice blend, packed with natural antioxidants and vitamins.",
    averageRating: 4.8,
    reviewCount: 24,
    createdAt: new Date("2024-01-15"),
    sku: "BDJ-001",
  },
  {
    _id: "2",
    name: "Green Matcha Tea Latte",
    slug: "green-matcha-tea-latte",
    description:
      "Premium ceremonial-grade matcha powder blended into a smooth, energizing latte.",
    shortDescription: "Ceremonial-grade matcha for focused energy and calm",
    price: 10.5,
    images: [
      "https://images.unsplash.com/photo-1563822249366-3efced1ac053?w=400",
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
    ],
    category: mockCategories[1], // Teas
    tags: ["matcha", "energy", "focus", "ceremonial"],
    features: [
      "Ceremonial Grade Matcha",
      "L-theanine for Focus",
      "Natural Caffeine",
      "Antioxidant Rich",
    ],
    ingredients: ["Organic Matcha Powder", "Coconut Milk", "Natural Sweetener"],
    nutritionFacts: {
      servingSize: "12 fl oz",
      calories: 95,
      totalFat: "3g",
      sodium: "15mg",
      totalCarbs: "18g",
      sugars: "12g",
      protein: "2g",
      vitaminC: "15mg",
    },
    inventory: 5,
    trackQuantity: true,
    allowBackorder: false,
    weight: 14,
    isActive: true,
    isFeatured: false,
    averageRating: 4.6,
    reviewCount: 18,
    createdAt: new Date("2024-01-10"),
    sku: "GMT-002",
  },
  {
    _id: "3",
    name: "Watermelon Lemonade",
    slug: "watermelon-lemonade",
    description:
      "Refreshing summer blend of fresh watermelon and zesty lemon, perfect for hot days.",
    shortDescription: "Hydrating summer refresher with natural electrolytes",
    price: 10.0,
    compareAtPrice: 12.5,
    images: [
      "https://images.unsplash.com/photo-1546173159-315724a31696?w=400",
      "https://images.unsplash.com/photo-1553530979-7e83b6146b56?w=400",
    ],
    category: mockCategories[2], // Seasonal
    tags: ["summer", "hydrating", "refreshing", "electrolytes"],
    features: [
      "95% Water Content",
      "Natural Electrolytes",
      "Vitamin C Rich",
      "Low Calorie",
    ],
    ingredients: ["Fresh Watermelon", "Lemon Juice", "Mint", "Honey"],
    nutritionFacts: {
      servingSize: "16 fl oz",
      calories: 80,
      totalFat: "0g",
      sodium: "10mg",
      totalCarbs: "20g",
      sugars: "18g",
      protein: "1g",
      vitaminC: "25mg",
    },
    inventory: 0,
    trackQuantity: true,
    allowBackorder: true,
    weight: 18,
    isActive: false,
    isFeatured: false,
    averageRating: 4.9,
    reviewCount: 31,
    createdAt: new Date("2024-01-05"),
    sku: "WML-003",
  },
  {
    _id: "4",
    name: "Nutra-Reset Herbal Tea",
    slug: "nutra-reset-herbal-tea",
    description:
      "Detoxifying blend of green tea, dandelion root, and nettle for natural cleansing.",
    shortDescription: "Natural detox blend to reset and revitalize your body",
    price: 8.87,
    images: [
      "https://images.unsplash.com/photo-1597318278269-d5a1a773c040?w=400",
    ],
    category: mockCategories[1], // Teas
    tags: ["detox", "herbal", "cleanse", "wellness"],
    features: [
      "Natural Detoxification",
      "Digestive Support",
      "Antioxidant Rich",
      "Caffeine-Free",
    ],
    ingredients: [
      "Green Tea",
      "Dandelion Root",
      "Nettle",
      "Grapefruit",
      "Lemon",
    ],
    inventory: 25,
    trackQuantity: true,
    allowBackorder: false,
    isActive: true,
    isFeatured: true,
    averageRating: 4.5,
    reviewCount: 12,
    createdAt: new Date("2024-01-08"),
    sku: "NRT-004",
  },
  {
    _id: "5",
    name: "Strawberry Hibiscus Tea",
    slug: "strawberry-hibiscus-tea",
    description:
      "Sweet and tart combination of real strawberries and hibiscus flowers.",
    shortDescription:
      "Naturally sweet herbal fusion with heart-healthy benefits",
    price: 8.89,
    images: [
      "https://images.unsplash.com/photo-1564890273004-36ed8046d7f4?w=400",
    ],
    category: mockCategories[1], // Teas
    tags: ["fruity", "hibiscus", "heart-healthy", "vitamin-c"],
    features: [
      "Real Fruit Infusion",
      "Heart Health Support",
      "High in Vitamin C",
      "Naturally Caffeine-Free",
    ],
    ingredients: ["Hibiscus Petals", "Dried Strawberries", "Natural Flavor"],
    inventory: 35,
    trackQuantity: true,
    allowBackorder: false,
    isActive: true,
    isFeatured: false,
    averageRating: 4.7,
    reviewCount: 16,
    createdAt: new Date("2024-01-12"),
    sku: "SHT-005",
  },
];

// Service pricing configuration
export const servicesPricing = {
  consultation: 20,
  "meal-plan": 20,
  coaching: 35,
} as const;

// Default form data for new products
export const defaultProductFormData = {
  name: "",
  slug: "",
  price: "",
  compareAtPrice: "",
  category: "",
  inventory: 0,
  shortDescription: "",
  images: [],
  isActive: true,
  isFeatured: false,
  description: "",
  tags: [],
  features: [],
  ingredients: [],
};

// Product validation rules
export const productValidationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  slug: {
    required: true,
    pattern: /^[a-z0-9-]+$/,
  },
  price: {
    required: true,
    min: 0,
  },
  inventory: {
    required: true,
    min: 0,
  },
  category: {
    required: true,
  },
} as const;

// Stock level thresholds
export const stockThresholds = {
  LOW_STOCK: 10,
  OUT_OF_STOCK: 0,
} as const;

// Default pagination settings
export const paginationDefaults = {
  page: 1,
  limit: 12,
  maxLimit: 100,
} as const;
