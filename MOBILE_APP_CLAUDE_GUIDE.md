# Nutra-Vive Mobile App - Complete Development Guide for Claude

## 🚨 CRITICAL: Webapp Knowledge for Mobile Development

This document contains COMPLETE knowledge about the Nutra-Vive Next.js webapp that you MUST understand before developing the mobile app. You will be coding in a NEW PROJECT, so this knowledge is essential.

## Project Architecture Overview

### **Core Technology Stack**
- **Backend**: Next.js 15 with App Router + TypeScript + MongoDB + Mongoose
- **Authentication**: Clerk (same users will access both web and mobile)
- **Payment**: Stripe (payment intents, subscriptions)
- **Database**: MongoDB with Mongoose ODM
- **State Management**: Zustand stores (unified cart system)
- **Email**: Resend with React Email templates
- **File Uploads**: UploadThing
- **Deployment**: Vercel

### **Database Architecture (MongoDB + Mongoose)**

The webapp uses a sophisticated database schema with the following core models:

#### **User Models**
```typescript
// IUser - Core user data from Clerk
interface IUser {
  _id: string;
  clerkId: string; // Links to Clerk auth
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role: "user" | "admin";
  stripeCustomerId?: string;
  phone?: string;
}

// IUserProfile - Extended user preferences
interface IUserProfile {
  user: string; // Reference to User
  defaultShippingAddress: Address;
  savedAddresses: SavedAddress[];
  preferredDeliveryMethod: "standard" | "express" | "pickup";
  marketingOptIn: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
}
```

#### **Product Models**
```typescript
// IProduct - Complete product data
interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number; // For showing discounts
  category?: string; // Category ID
  images: string[];
  tags: string[];
  features: string[];
  ingredients: string[];
  nutritionFacts?: NutritionFacts;
  inventory: number;
  trackQuantity: boolean;
  allowBackorder: boolean;
  isActive: boolean;
  isFeatured: boolean;
  
  // Promotion fields
  isDiscounted: boolean;
  promotionEligible: boolean;
  promotionTags: string[];
  
  averageRating: number;
  reviewCount: number;
}

// ICategory
interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

// IReview
interface IReview {
  _id: string;
  product: string;
  user: string;
  rating: number; // 1-5
  title?: string;
  content?: string;
  isVerified: boolean;
  isVisible: boolean;
}
```

#### **Cart & Order Models**
```typescript
// ICart - Enhanced with promotion support
interface ICart {
  _id: string;
  user?: string;
  clerkUserId?: string;
  sessionId?: string; // For guest users
  items: CartItem[];
  
  // Promotion fields
  promotionId?: string;
  promotionCode?: string;
  promotionName?: string;
  promotionDiscount?: number;
  
  // Calculated totals
  subtotal?: number;
  totalDiscount?: number;
  finalTotal?: number;
}

// IOrder - Complete order with promotion tracking
interface IOrder {
  _id: string;
  orderNumber: string; // Auto-generated: "NV-000001"
  user?: string;
  email: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "partially_refunded";
  paymentIntentId?: string;
  
  // Pricing
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  
  // Applied promotion tracking
  appliedPromotion?: {
    promotionId: string;
    code: string;
    name: string;
    discountAmount: number;
    discountType: "percentage" | "fixed_amount" | "buy_x_get_y";
  };
  
  shippingAddress: Address;
  billingAddress?: Address;
  items: OrderItem[];
  trackingNumber?: string;
}
```

#### **Membership Models (IMPORTANT for Mobile)**
```typescript
// IMembership - Subscription tiers
interface IMembership {
  _id: string;
  name: string;
  tier: "basic" | "premium" | "vip" | "elite";
  price: number;
  billingFrequency: "monthly" | "quarterly" | "yearly";
  
  // Product allocations (FREE products per month)
  productAllocations: {
    categoryId: string;
    categoryName: string;
    quantity: number; // How many free items per month
    allowedProducts?: string[]; // Specific products if restricted
  }[];
  
  customBenefits: CustomBenefit[];
  features: string[];
  maxProductsPerMonth?: number;
  deliveryFrequency: "weekly" | "bi-weekly" | "monthly";
  freeDelivery: boolean;
  prioritySupport: boolean;
  stripePriceId?: string;
}

// IUserMembership - User's active membership
interface IUserMembership {
  _id: string;
  user: string;
  membership: string;
  subscriptionId?: string; // Stripe subscription ID
  status: "active" | "cancelled" | "expired" | "paused" | "trial" | "incomplete";
  
  // Usage tracking (CRITICAL for mobile app)
  productUsage: {
    categoryId: string;
    categoryName: string;
    allocatedQuantity: number; // How many allocated this period
    usedQuantity: number; // How many used so far
    availableQuantity: number; // How many remaining
    lastUsed?: Date;
  }[];
  
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  nextBillingDate?: Date;
}
```

#### **Promotion Models**
```typescript
// IPromotion - Advanced promotion system
interface IPromotion {
  _id: string;
  name: string;
  type: "seasonal" | "custom" | "flash_sale";
  discountType: "percentage" | "fixed_amount" | "buy_x_get_y";
  discountValue: number;
  
  applicabilityScope: "entire_store" | "categories" | "products" | "collections" | "customer_segments";
  targetCategories: string[];
  targetProducts: string[];
  customerSegments: "new_customers" | "returning_customers" | "vip_customers" | "all";
  
  // Usage limits
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  usedCount: number;
  
  // Requirements
  minimumPurchaseAmount?: number;
  minimumQuantity?: number;
  
  // Codes
  codes: {
    code: string;
    isPublic: boolean;
    usageLimit?: number;
    usedCount: number;
    isActive: boolean;
  }[];
  
  // Timing
  startsAt?: Date;
  endsAt?: Date;
  isActive: boolean;
}
```

### **Authentication System (Clerk Integration)**

The webapp uses Clerk for authentication with these key points:

1. **User Creation**: New users are automatically created in MongoDB via Clerk webhook at `/api/webhook/clerk`
2. **User Roles**: `user` (default) and `admin`
3. **Middleware**: `middleware.ts` handles auth routing for all pages
4. **Server Actions**: Use `auth()` from `@clerk/nextjs/server` to get current user
5. **API Routes**: Use `auth()` to protect endpoints

### **State Management Architecture**

#### **Unified Cart System** (Most Important for Mobile)
The webapp recently transitioned to a unified cart system that handles:

- **Regular products** (paid items)
- **Membership products** (free/discounted via membership)
- **Promotions/discounts**
- **Complex pricing calculations**

Key Zustand stores:
- `unifiedCartStore.ts` - Main cart with all pricing logic
- `favoritesStore.ts` - User wishlist
- `membershipCartStore.tsx` - Membership-specific cart operations
- `themeStore.ts`, `searchStore.ts`, `userStore.ts` - Utility stores

### **Server Actions Architecture** (CRITICAL for Mobile API Design)

The webapp primarily uses Next.js server actions for database operations. Key server action files:

#### **Product Actions** (`lib/actions/productServerActions.ts`)
- `getProducts(filters)` - List products with pagination/filtering
- `getProductBySlug(slug)` - Get single product
- `createProduct(data)` - Admin: create product
- `updateProduct(id, data)` - Admin: update product
- `deleteProduct(id)` - Admin: delete product

#### **Cart Actions** (`lib/actions/unifiedCartServerActions.ts`)
- `addToCart(productId, quantity)` - Add item with unified pricing
- `updateCartItem(productId, quantity)` - Update quantity
- `removeFromCart(productId)` - Remove item
- `getCart()` - Get user's cart with all pricing
- `clearCart()` - Empty cart
- `applyPromotionToCart(code)` - Apply promotion code
- `removePromotionFromCart()` - Remove promotion

#### **Order Actions** (`lib/actions/orderServerActions.ts`)
- `createOrder(orderData)` - Create new order
- `getUserOrders(userId)` - Get user's order history
- `getOrderById(orderId)` - Get specific order
- `updateOrderStatus(orderId, status)` - Update order status

#### **Membership Actions** (`lib/actions/membershipServerActions.ts`)
- `getMemberships()` - Get available membership tiers
- `getUserMembership(userId)` - Get user's active membership
- `createMembershipSubscription(membershipId, userId)` - Subscribe to membership
- `cancelMembership(userMembershipId)` - Cancel subscription

#### **User Actions** (`lib/actions/userServerActions.ts`)
- `getUserProfile(userId)` - Get user profile data
- `updateUserProfile(userId, data)` - Update profile
- `createUserProfile(userId, data)` - Create initial profile

#### **Favorites Actions** (`lib/actions/favouriteServerActions.ts`)
- `getFavorites(userId)` - Get user's favorites
- `addToFavorites(userId, productId)` - Add to favorites
- `removeFromFavorites(userId, productId)` - Remove from favorites

### **Payment Integration (Stripe)**

- **Payment Intents**: Created via `/api/stripe/create-payment-intent`
- **Webhooks**: Stripe events handled at `/api/webhook/stripe`
- **Subscriptions**: Membership subscriptions managed through Stripe
- **Customer Creation**: Automatic via Clerk webhook

### **Environment Variables**
```env
# Database
MONGODB_URI=mongodb://...

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Payments
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...

# File Upload
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...
```

---

## 🚀 Mobile App Development Phases

### **Phase 1: Authentication & Setup**
**Goal**: Get user login working between web and mobile

#### Backend Tasks (Next.js):
1. Create mobile API endpoints for authentication
2. Test Clerk token validation
3. Ensure user sync between platforms

#### Mobile Tasks:
1. Set up Expo project with Clerk
2. Implement login/signup screens
3. Test authentication flow

### **Phase 2: Product Browsing**
**Goal**: Users can browse and search products

#### Backend Tasks:
1. Create mobile product API endpoints
2. Optimize product data for mobile
3. Add image optimization

#### Mobile Tasks:
1. Create product list/grid components
2. Implement search and filtering
3. Product detail screens

### **Phase 3: Cart & Membership Integration**
**Goal**: Full cart functionality with membership benefits

#### Backend Tasks:
1. Create mobile cart API endpoints
2. Ensure membership pricing works via API
3. Create membership status endpoints

#### Mobile Tasks:
1. Implement cart functionality
2. Show membership benefits/savings
3. Cart persistence and sync

### **Phase 4: Checkout & Orders**
**Goal**: Complete purchase flow

#### Backend Tasks:
1. Create mobile checkout endpoints
2. Payment integration (Stripe)
3. Order management APIs

#### Mobile Tasks:
1. Checkout flow with Stripe
2. Order confirmation
3. Order history screens

### **Phase 5: Profile & Settings**
**Goal**: User profile management

#### Backend Tasks:
1. Profile management APIs
2. Address management
3. Preferences sync

#### Mobile Tasks:
1. Profile screens
2. Settings management
3. Address book

---

## 📱 Mobile API Endpoints to Create

Based on the server actions, you need to create these API routes in the Next.js app:

### **Authentication APIs**
```
POST /api/mobile/auth/validate-token - Validate Clerk token
GET /api/mobile/auth/user - Get current user data
PUT /api/mobile/auth/user - Update user profile
```

### **Product APIs**
```
GET /api/mobile/products - List products (pagination, search, filters)
GET /api/mobile/products/[id] - Get product by ID
GET /api/mobile/products/slug/[slug] - Get product by slug
GET /api/mobile/categories - List categories
GET /api/mobile/products/featured - Get featured products
GET /api/mobile/products/search - Search products
```

### **Cart APIs**
```
GET /api/mobile/cart - Get user's cart with pricing
POST /api/mobile/cart/add - Add item to cart
PUT /api/mobile/cart/update - Update cart item quantity
DELETE /api/mobile/cart/remove - Remove item from cart
DELETE /api/mobile/cart/clear - Clear entire cart
POST /api/mobile/cart/promotion/apply - Apply promotion code
DELETE /api/mobile/cart/promotion/remove - Remove promotion
POST /api/mobile/cart/refresh - Refresh cart pricing
```

### **Order APIs**
```
GET /api/mobile/orders - Get user's order history
GET /api/mobile/orders/[id] - Get specific order
POST /api/mobile/orders - Create new order
GET /api/mobile/orders/[id]/tracking - Get order tracking info
```

### **Membership APIs**
```
GET /api/mobile/memberships - Get available memberships
GET /api/mobile/user/membership - Get user's membership status
POST /api/mobile/memberships/subscribe - Subscribe to membership
PUT /api/mobile/memberships/cancel - Cancel membership
GET /api/mobile/user/membership/usage - Get membership usage stats
```

### **Favorites APIs**
```
GET /api/mobile/favorites - Get user's favorites
POST /api/mobile/favorites/add - Add to favorites
DELETE /api/mobile/favorites/remove - Remove from favorites
```

### **User Profile APIs**
```
GET /api/mobile/user/profile - Get user profile
PUT /api/mobile/user/profile - Update user profile
GET /api/mobile/user/addresses - Get saved addresses
POST /api/mobile/user/addresses - Add new address
PUT /api/mobile/user/addresses/[id] - Update address
DELETE /api/mobile/user/addresses/[id] - Delete address
```

---

## 🔧 Implementation Strategy

### **API Wrapper Pattern**
Each mobile API endpoint should wrap existing server actions:

```typescript
// Example: /api/mobile/products/route.ts
import { getProducts } from "@/lib/actions/productServerActions";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { searchParams } = new URL(request.url);
  const filters = {
    page: parseInt(searchParams.get("page") || "1"),
    limit: parseInt(searchParams.get("limit") || "20"),
    category: searchParams.get("category") || undefined,
    search: searchParams.get("search") || undefined,
  };
  
  const result = await getProducts(filters);
  return NextResponse.json(result);
}
```

### **Mobile-Optimized Responses**
- Smaller image sizes
- Essential data only
- Pagination for large lists
- Cached responses where possible

### **Error Handling**
- Consistent error format across all APIs
- Proper HTTP status codes
- Detailed error messages for development

### **Type Safety**
- Share TypeScript types between web and mobile
- Create mobile-specific response types
- Use Zod for request validation

---

## 📋 Development Checklist

### **Phase 1: Authentication Setup**
- [ ] Create authentication API endpoints
- [ ] Test Clerk token validation
- [ ] Set up mobile project with Expo
- [ ] Implement login screens
- [ ] Test user sync between platforms

### **Phase 2: Product Browsing**
- [ ] Create product API endpoints
- [ ] Implement product listing in mobile
- [ ] Add search and filtering
- [ ] Create product detail screens
- [ ] Test image loading and performance

### **Phase 3: Cart & Membership**
- [ ] Create cart API endpoints
- [ ] Implement unified cart in mobile
- [ ] Handle membership pricing and benefits
- [ ] Add cart persistence
- [ ] Test complex pricing scenarios

### **Phase 4: Checkout & Orders**
- [ ] Create checkout API endpoints
- [ ] Integrate Stripe payment in mobile
- [ ] Implement order flow
- [ ] Add order history
- [ ] Test payment processing

### **Phase 5: Profile & Extras**
- [ ] Create profile management APIs
- [ ] Implement user profile screens
- [ ] Add favorites functionality
- [ ] Create settings screens
- [ ] Add push notifications

---

## 🚨 CRITICAL NOTES FOR MOBILE DEVELOPMENT

1. **Unified Cart**: The webapp uses a complex unified cart system that automatically handles membership benefits, promotions, and pricing. Your mobile API must preserve this logic exactly.

2. **Membership System**: Users get FREE products based on their membership tier and monthly allocations. This is tracked in `IUserMembership.productUsage`. Mobile app must show this clearly.

3. **Server Actions**: All business logic is in server actions. Mobile APIs should be thin wrappers that call these actions.

4. **Type Safety**: The webapp is strictly typed. Maintain this in mobile APIs and share types.

5. **Authentication**: Same Clerk users across web and mobile. Use JWT token validation for mobile API access.

6. **Error Handling**: Follow webapp patterns for consistent error handling.

7. **Database**: Never bypass server actions to access database directly. Always go through the established patterns.

This guide ensures you have complete webapp knowledge before starting mobile development. When you begin coding the mobile app in a new project, refer back to this guide for all technical decisions and API integrations.