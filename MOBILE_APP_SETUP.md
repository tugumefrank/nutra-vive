# Nutra-Vive Mobile App Setup Guide

## Architecture Overview

**Recommended Architecture: API Gateway Pattern**
- Mobile app communicates with Next.js backend via REST API endpoints
- Next.js API routes wrap existing server actions for mobile consumption
- Shared authentication via Clerk (same users, different platform)
- MongoDB remains single source of truth
- Minimal code duplication by reusing existing business logic

## Project Structure

```
nutra-vive-mobile/
├── app/                    # Expo Router app directory
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   ├── products/          # Product screens
│   ├── cart/              # Cart screens
│   ├── profile/           # User profile screens
│   └── membership/        # Membership screens
├── components/            # Reusable components
├── constants/             # App constants
├── hooks/                 # Custom React hooks
├── services/              # API services
├── store/                 # State management (Zustand)
├── types/                 # TypeScript types
└── utils/                 # Utility functions
```

## Step 1: Initialize Expo Project

```bash
# Create new Expo project
npx create-expo-app@latest nutra-vive-mobile --template blank-typescript

cd nutra-vive-mobile

# Install essential dependencies
npx expo install expo-router expo-font expo-linking expo-constants expo-status-bar
npx expo install @expo/vector-icons expo-image expo-image-picker
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-reanimated react-native-gesture-handler

# Install state management
npm install zustand @tanstack/react-query

# Install Clerk for authentication
npm install @clerk/clerk-expo
npx expo install expo-secure-store expo-web-browser

# Install UI/styling
npm install nativewind tailwindcss react-native-svg
npm install @shopify/flash-list
```

## Step 2: Configure Expo Router

Update `app.json`:
```json
{
  "expo": {
    "name": "Nutra-Vive",
    "slug": "nutra-vive-mobile",
    "scheme": "nutra-vive",
    "platforms": ["ios", "android"],
    "plugins": [
      "expo-router",
      "expo-secure-store",
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow Nutra-Vive to access your photos to upload product images."
        }
      ]
    ]
  }
}
```

## Step 3: Setup Authentication with Clerk

Create `app/_layout.tsx`:
```typescript
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { Slot } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export default function RootLayout() {
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <ClerkLoaded>
        <Slot />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
```

## Step 4: API Service Layer

Create `services/api.ts`:
```typescript
import { useAuth } from '@clerk/clerk-expo';

class ApiService {
  private baseURL = process.env.EXPO_PUBLIC_API_URL!;
  
  constructor(private getToken: () => Promise<string | null>) {}

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getToken();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Product methods
  async getProducts(params?: { page?: number; limit?: number; category?: string }) {
    const searchParams = new URLSearchParams(params as any);
    return this.request(`/api/mobile/products?${searchParams}`);
  }

  async getProduct(id: string) {
    return this.request(`/api/mobile/products/${id}`);
  }

  // Cart methods
  async getCart() {
    return this.request('/api/mobile/cart');
  }

  async addToCart(productId: string, quantity: number) {
    return this.request('/api/mobile/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  // User methods
  async getProfile() {
    return this.request('/api/mobile/user/profile');
  }

  // Order methods
  async getOrders() {
    return this.request('/api/mobile/orders');
  }
}

export const useApi = () => {
  const { getToken } = useAuth();
  return new ApiService(getToken);
};
```

## Step 5: State Management with Zustand

Create `store/cartStore.ts`:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartStore {
  items: CartItem[];
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  syncWithServer: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      
      addItem: (item) => set((state) => {
        const existingItem = state.items.find(i => i.productId === item.productId);
        const newItems = existingItem
          ? state.items.map(i => i.productId === item.productId 
              ? { ...i, quantity: i.quantity + item.quantity }
              : i)
          : [...state.items, item];
        
        return {
          items: newItems,
          total: newItems.reduce((sum, i) => sum + (i.price * i.quantity), 0)
        };
      }),
      
      removeItem: (productId) => set((state) => {
        const newItems = state.items.filter(i => i.productId !== productId);
        return {
          items: newItems,
          total: newItems.reduce((sum, i) => sum + (i.price * i.quantity), 0)
        };
      }),
      
      updateQuantity: (productId, quantity) => set((state) => {
        const newItems = quantity === 0 
          ? state.items.filter(i => i.productId !== productId)
          : state.items.map(i => i.productId === productId ? { ...i, quantity } : i);
        
        return {
          items: newItems,
          total: newItems.reduce((sum, i) => sum + (i.price * i.quantity), 0)
        };
      }),
      
      clearCart: () => set({ items: [], total: 0 }),
      
      syncWithServer: async () => {
        // Implement server sync logic
      }
    }),
    {
      name: 'cart-storage',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
```

## Backend Modifications Required

### 1. Create Mobile API Routes

Create these new API routes in your Next.js app:

#### `app/api/mobile/products/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getProducts } from "@/lib/actions/productServerActions";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category") || undefined;

    // Reuse existing server action
    const result = await getProducts({ page, limit, category });
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
```

#### `app/api/mobile/cart/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserCart } from "@/lib/actions/unifiedCartServerActions";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await getUserCart();
    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}
```

#### `app/api/mobile/cart/add/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { addToCart } from "@/lib/actions/unifiedCartServerActions";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity } = await request.json();
    
    const result = await addToCart(productId, quantity);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}
```

### 2. Update CORS Settings

Add to your `next.config.js`:
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: "/api/mobile/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};
```

## Environment Variables

### Mobile App `.env`:
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_API_URL=http://your-domain.com
```

### Next.js App (add to existing `.env`):
```
# Add mobile-specific configs if needed
MOBILE_APP_ALLOWED_ORIGINS=exp://192.168.1.100:8081,nutra-vive://
```

## Development Workflow

1. **Start Next.js Backend**: `npm run dev` (port 3000)
2. **Start Mobile App**: `npx expo start` (uses Expo CLI)
3. **Testing**: Use Expo Go app or iOS Simulator/Android Emulator

## Key Benefits of This Architecture

1. **Code Reuse**: Mobile API routes wrap existing server actions
2. **Single Database**: MongoDB remains single source of truth
3. **Shared Auth**: Same Clerk users across web and mobile
4. **Type Safety**: Share TypeScript types between projects
5. **Minimal Backend Changes**: Most logic already exists in server actions

## Next Steps for Implementation

1. Create the mobile project structure
2. Set up authentication flow
3. Create API wrapper routes for core functionality:
   - Products (list, detail, search)
   - Cart operations (add, remove, update, checkout)
   - User profile management
   - Order history
   - Membership management
4. Build core mobile UI components
5. Implement offline support with local state persistence
6. Add push notifications for orders/promotions

## API Endpoints to Create

Based on your server actions, create these mobile API routes:

### Products
- `GET /api/mobile/products` - List products with pagination
- `GET /api/mobile/products/[id]` - Product details
- `GET /api/mobile/products/categories` - Product categories
- `GET /api/mobile/products/search` - Product search

### Cart & Orders
- `GET /api/mobile/cart` - Get user cart
- `POST /api/mobile/cart/add` - Add to cart
- `PUT /api/mobile/cart/update` - Update cart item
- `DELETE /api/mobile/cart/remove` - Remove from cart
- `POST /api/mobile/orders` - Create order
- `GET /api/mobile/orders` - Order history

### User & Profile
- `GET /api/mobile/user/profile` - User profile
- `PUT /api/mobile/user/profile` - Update profile
- `GET /api/mobile/user/favorites` - User favorites
- `POST /api/mobile/user/favorites` - Add favorite

### Membership
- `GET /api/mobile/memberships` - Available memberships
- `GET /api/mobile/user/membership` - User membership status
- `POST /api/mobile/memberships/subscribe` - Subscribe to membership

This architecture ensures rapid development while maintaining consistency with your existing web application.