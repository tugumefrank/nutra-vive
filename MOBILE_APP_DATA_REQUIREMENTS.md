# Mobile App Data Requirements for Checkout

Based on the backend implementation, here's the **exact data structure** the mobile app must send.

## 📋 **Required Request Body for `/api/mobile/checkout/create-payment-intent`**

```typescript
interface MobileCheckoutRequest {
  // Cart items (enhanced structure)
  items: {
    productId: string;           // Required: Product ID from database
    quantity: number;            // Required: Must be >= 1
    price: number;               // Required: Current price per item
    name: string;                // Required: Product name
    slug: string;                // Required: Product slug for URLs (needed for order records)
    image: string;               // Required: Product image URL (needed for order records)
    originalPrice?: number;      // Optional: Price before discounts
    totalSavings?: number;       // Optional: Total savings per item
  }[];

  // Pricing breakdown
  subtotal: number;              // Required: Sum of all items before tax/shipping
  taxAmount: number;             // Optional: Defaults to 0
  shippingAmount: number;        // Optional: Defaults to 0  
  discountAmount: number;        // Optional: Defaults to 0
  totalAmount: number;           // Required: Final total amount
  currency: string;              // Optional: Defaults to "usd"

  // Customer information
  customer: {
    email: string;               // Required: Valid email address
    firstName: string;           // Required: Must not be empty
    lastName: string;            // Required: Must not be empty
    phone?: string;              // Optional: Phone number
  };

  // Shipping address
  shippingAddress: {
    line1: string;               // Required: Street address
    line2?: string;              // Optional: Apartment, suite, etc.
    city: string;                // Required: City name
    state: string;               // Required: State/Province
    postal_code: string;         // Required: ZIP/Postal code
    country: string;             // Optional: Defaults to "US"
  };

  // Billing address (optional, defaults to shipping)
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;             // Defaults to "US"
  };

  // Applied promotions (optional)
  appliedPromotion?: {
    code: string;                // Promotion code used
    name: string;                // Human-readable promotion name
    discountAmount: number;      // Amount discounted
    promotionId: string;         // Promotion ID from database
  };

  // Membership information (optional)
  membershipInfo?: {
    membershipId: string;        // Membership ID from database
    membershipDiscount: number;  // Total membership discount
    freeItems: {
      productId: string;         // Product ID that's free
      quantity: number;          // How many are free
    }[];
  };

  // Payment method types (optional)
  paymentMethodTypes?: string[]; // Defaults to ["card"]

  // Special instructions (optional)
  notes?: string;               // Order notes/instructions

  // **NEW REQUIRED FIELD**
  deliveryMethod: "standard" | "express" | "pickup"; // Required: Delivery method
}
```

## 🧪 **Example Request Body**

```json
{
  "items": [
    {
      "productId": "64a1b2c3d4e5f6789012345",
      "quantity": 2,
      "price": 12.99,
      "name": "Organic Green Juice",
      "slug": "organic-green-juice",
      "image": "https://example.com/green-juice.jpg",
      "originalPrice": 14.99,
      "totalSavings": 4.00
    },
    {
      "productId": "64a1b2c3d4e5f6789012346",
      "quantity": 1,
      "price": 8.99,
      "name": "Herbal Tea Blend",
      "slug": "herbal-tea-blend",
      "image": "https://example.com/tea.jpg"
    }
  ],
  "subtotal": 34.97,
  "taxAmount": 2.80,
  "shippingAmount": 5.99,
  "discountAmount": 5.00,
  "totalAmount": 38.76,
  "currency": "usd",
  "customer": {
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  },
  "shippingAddress": {
    "line1": "123 Main St",
    "line2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "US"
  },
  "deliveryMethod": "standard",
  "appliedPromotion": {
    "code": "SAVE10",
    "name": "10% Off First Order",
    "discountAmount": 3.50,
    "promotionId": "promo_123"
  },
  "membershipInfo": {
    "membershipId": "membership_456",
    "membershipDiscount": 1.50,
    "freeItems": [
      {
        "productId": "64a1b2c3d4e5f6789012347",
        "quantity": 1
      }
    ]
  },
  "notes": "Please leave at front door"
}
```

## 🔄 **Backend Response Structure**

The backend will respond with:

```typescript
interface CheckoutResponse {
  success: true;
  orderId: string;               // Database order ID
  orderNumber: string;           // Human-readable order number (e.g., "NV-000123")
  paymentIntent: {
    id: string;                  // Stripe PaymentIntent ID
    clientSecret: string;        // Use this for payment confirmation
    amount: number;              // Amount in cents
    currency: string;            // Currency code
    status: string;              // Payment intent status
  };
  customer: {
    id: string;                  // Stripe customer ID
    email: string;               // Customer email
  };
  orderSummary: {
    // Echoes back the pricing breakdown
    subtotal: number;
    taxAmount: number;
    shippingAmount: number;
    discountAmount: number;
    totalAmount: number;
    currency: string;
    items: Array<Item>;
    appliedPromotion?: Promotion;
    membershipInfo?: MembershipInfo;
  };
}
```

## 📱 **Updated Mobile Service Code**

```typescript
// Updated PaymentService for mobile app
export const usePaymentService = () => {
  const { getToken } = useAuth();
  
  const createPaymentIntent = async (checkoutData: MobileCheckoutRequest) => {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    // Ensure deliveryMethod is included
    if (!checkoutData.deliveryMethod) {
      checkoutData.deliveryMethod = "standard"; // Default value
    }

    console.log('🔵 Creating payment intent with data:', checkoutData);

    const response = await fetch(`${API_URL}/api/mobile/checkout/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create payment intent');
    }

    return response.json();
  };

  return { createPaymentIntent };
};
```

## 🎯 **Key Changes for Mobile App**

### **1. Enhanced Item Structure**
```typescript
// Old (minimal)
{
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

// New (enhanced)
{
  productId: string;
  quantity: number;
  price: number;
  name: string;
  slug?: string;           // NEW: For URLs/navigation
  image?: string;          // NEW: For order confirmation
  originalPrice?: number;  // NEW: For showing discounts
  totalSavings?: number;   // NEW: For savings display
}
```

### **2. Required deliveryMethod Field**
```typescript
// Must include one of these:
deliveryMethod: "standard" | "express" | "pickup"
```

### **3. Get Order ID in Response**
```typescript
// Backend now returns:
{
  success: true,
  orderId: "64a1b2c3d4e5f6789012348",     // NEW: Database order ID
  orderNumber: "NV-000123",                // NEW: Human-readable number
  paymentIntent: {
    id: "pi_1234567890",
    clientSecret: "pi_1234567890_secret_xyz"
    // ... other fields
  }
}
```

## 🚀 **Testing Instructions**

### **Minimum Required Test Data:**
```json
{
  "items": [
    {
      "productId": "test_product_123",
      "quantity": 1,
      "price": 10.00,
      "name": "Test Product"
    }
  ],
  "subtotal": 10.00,
  "totalAmount": 10.00,
  "customer": {
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User"
  },
  "shippingAddress": {
    "line1": "123 Test St",
    "city": "Test City",
    "state": "CA",
    "postal_code": "12345"
  },
  "deliveryMethod": "standard"
}
```

## ✅ **Validation Summary**

The backend validates:
- ✅ All required fields are present
- ✅ Numbers are >= 0 where appropriate
- ✅ Email format is valid
- ✅ deliveryMethod is one of the allowed values
- ✅ User is authenticated via Clerk JWT

## 🔍 **Backend Process**

1. **Validates** the request data
2. **Creates order** in database with "pending" status
3. **Creates Stripe customer** (or finds existing)
4. **Creates PaymentIntent** with order metadata
5. **Updates order** with PaymentIntent ID
6. **Returns** clientSecret for mobile payment confirmation

This structure ensures the mobile app provides all necessary data for a complete order process!