# Mobile App Stripe Payment Integration Guide

## 🎯 **Overview**

This guide shows you exactly how to implement Stripe payments in your React Native mobile app to work with the Nutra-Vive backend. The backend is already set up and ready to receive your payment requests.

## 📋 **Prerequisites**

- React Native app with Expo
- Clerk authentication already implemented
- Access to Nutra-Vive backend API

## 🔧 **Step 1: Install Dependencies**

```bash
# Install Stripe React Native SDK
npm install @stripe/stripe-react-native

# Install additional dependencies for address/forms
npm install react-native-elements react-native-vector-icons
npx expo install expo-location

# For iOS, you may need:
cd ios && pod install
```

## 🏗️ **Step 2: Setup Stripe Provider**

### **App.tsx / _layout.tsx Setup**

```typescript
import { StripeProvider } from '@stripe/stripe-react-native';

const STRIPE_PUBLISHABLE_KEY = "pk_test_your_publishable_key_here"; // Get from Stripe Dashboard

export default function App() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <ClerkProvider>
        {/* Your app content */}
      </ClerkProvider>
    </StripeProvider>
  );
}
```

## 💳 **Step 3: Payment Service**

Create `services/paymentService.ts`:

```typescript
import { useAuth } from '@clerk/clerk-expo';

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

export interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface CheckoutData {
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  customer: CustomerInfo;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  appliedPromotion?: {
    code: string;
    name: string;
    discountAmount: number;
    promotionId: string;
  };
  membershipInfo?: {
    membershipId: string;
    membershipDiscount: number;
    freeItems: Array<{
      productId: string;
      quantity: number;
    }>;
  };
  paymentMethodTypes?: string[];
  notes?: string;
}

export interface PaymentIntentResponse {
  success: boolean;
  paymentIntent: {
    id: string;
    clientSecret: string;
    amount: number;
    currency: string;
    status: string;
  };
  customer: {
    id: string;
    email: string;
  };
  orderSummary: CheckoutData;
}

class PaymentService {
  private baseURL: string;
  private getToken: () => Promise<string | null>;

  constructor(baseURL: string, getToken: () => Promise<string | null>) {
    this.baseURL = baseURL;
    this.getToken = getToken;
  }

  async createPaymentIntent(checkoutData: CheckoutData): Promise<PaymentIntentResponse> {
    const token = await this.getToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('🔵 Creating payment intent with data:', checkoutData);

    const response = await fetch(`${this.baseURL}/api/mobile/checkout/create-payment-intent`, {
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

    const result = await response.json();
    console.log('✅ Payment intent created:', result.paymentIntent.id);
    
    return result;
  }

  async confirmOrder(paymentIntentId: string, expectedAmount: number) {
    const token = await this.getToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('🔵 Confirming order for payment intent:', paymentIntentId);

    const response = await fetch(`${this.baseURL}/api/mobile/checkout/confirm-order`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId,
        expectedAmount,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to confirm order');
    }

    const result = await response.json();
    console.log('✅ Order confirmed:', result.order.orderNumber);
    
    return result;
  }
}

export const usePaymentService = () => {
  const { getToken } = useAuth();
  
  return new PaymentService(
    process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
    getToken
  );
};
```

## 🛒 **Step 4: Checkout Screen Component**

Create `screens/CheckoutScreen.tsx`:

```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { Button, Input } from 'react-native-elements';
import { usePaymentService, CheckoutData, CartItem } from '../services/paymentService';

interface CheckoutScreenProps {
  cartItems: CartItem[];
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
}

export default function CheckoutScreen({
  cartItems,
  subtotal,
  taxAmount,
  shippingAmount,
  discountAmount,
  totalAmount,
}: CheckoutScreenProps) {
  const { confirmPayment } = useStripe();
  const paymentService = usePaymentService();
  
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  
  const [shippingAddress, setShippingAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
  });

  const handlePayment = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create Payment Intent
      const checkoutData: CheckoutData = {
        items: cartItems,
        subtotal,
        taxAmount,
        shippingAmount,
        discountAmount,
        totalAmount,
        currency: 'usd',
        customer: customerInfo,
        shippingAddress,
        paymentMethodTypes: ['card'],
        notes: 'Mobile app order',
      };

      console.log('🔵 Starting payment process...');
      const paymentIntentResponse = await paymentService.createPaymentIntent(checkoutData);
      
      // Step 2: Confirm Payment with Stripe
      const { paymentIntent } = paymentIntentResponse;
      
      console.log('💳 Confirming payment with Stripe...');
      const confirmResult = await confirmPayment(paymentIntent.clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            email: customerInfo.email,
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            phone: customerInfo.phone,
            address: {
              line1: shippingAddress.line1,
              line2: shippingAddress.line2,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postalCode: shippingAddress.postal_code,
              country: shippingAddress.country,
            },
          },
        },
      });

      if (confirmResult.error) {
        console.log('❌ Payment confirmation failed:', confirmResult.error);
        Alert.alert(
          'Payment Failed',
          confirmResult.error.message || 'Payment could not be processed'
        );
        return;
      }

      console.log('✅ Payment confirmed with Stripe');

      // Step 3: Confirm Order with Backend
      console.log('🔵 Confirming order with backend...');
      const orderResult = await paymentService.confirmOrder(
        paymentIntent.id,
        totalAmount
      );

      console.log('✅ Order completed successfully');

      // Step 4: Show Success
      Alert.alert(
        'Order Complete!',
        `Your order ${orderResult.order.orderNumber} has been placed successfully.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to order confirmation screen
              // navigation.navigate('OrderConfirmation', { order: orderResult.order });
            },
          },
        ]
      );

    } catch (error) {
      console.error('❌ Payment process failed:', error);
      Alert.alert(
        'Payment Error',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    return (
      customerInfo.email &&
      customerInfo.firstName &&
      customerInfo.lastName &&
      shippingAddress.line1 &&
      shippingAddress.city &&
      shippingAddress.state &&
      shippingAddress.postal_code
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      
      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cartItems.map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <Text>{item.name}</Text>
            <Text>Qty: {item.quantity}</Text>
            <Text>${(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
        
        <View style={styles.totals}>
          <Text>Subtotal: ${subtotal.toFixed(2)}</Text>
          <Text>Tax: ${taxAmount.toFixed(2)}</Text>
          <Text>Shipping: ${shippingAmount.toFixed(2)}</Text>
          {discountAmount > 0 && (
            <Text style={styles.discount}>Discount: -${discountAmount.toFixed(2)}</Text>
          )}
          <Text style={styles.total}>Total: ${totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      {/* Customer Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <Input
          placeholder="Email"
          value={customerInfo.email}
          onChangeText={(text) => setCustomerInfo({...customerInfo, email: text})}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          placeholder="First Name"
          value={customerInfo.firstName}
          onChangeText={(text) => setCustomerInfo({...customerInfo, firstName: text})}
        />
        <Input
          placeholder="Last Name"
          value={customerInfo.lastName}
          onChangeText={(text) => setCustomerInfo({...customerInfo, lastName: text})}
        />
        <Input
          placeholder="Phone (optional)"
          value={customerInfo.phone}
          onChangeText={(text) => setCustomerInfo({...customerInfo, phone: text})}
          keyboardType="phone-pad"
        />
      </View>

      {/* Shipping Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        <Input
          placeholder="Address Line 1"
          value={shippingAddress.line1}
          onChangeText={(text) => setShippingAddress({...shippingAddress, line1: text})}
        />
        <Input
          placeholder="Address Line 2 (optional)"
          value={shippingAddress.line2}
          onChangeText={(text) => setShippingAddress({...shippingAddress, line2: text})}
        />
        <Input
          placeholder="City"
          value={shippingAddress.city}
          onChangeText={(text) => setShippingAddress({...shippingAddress, city: text})}
        />
        <Input
          placeholder="State"
          value={shippingAddress.state}
          onChangeText={(text) => setShippingAddress({...shippingAddress, state: text})}
        />
        <Input
          placeholder="ZIP Code"
          value={shippingAddress.postal_code}
          onChangeText={(text) => setShippingAddress({...shippingAddress, postal_code: text})}
          keyboardType="numeric"
        />
      </View>

      {/* Payment Button */}
      <Button
        title={loading ? "Processing..." : `Pay $${totalAmount.toFixed(2)}`}
        onPress={handlePayment}
        loading={loading}
        disabled={loading || !validateForm()}
        buttonStyle={styles.payButton}
        titleStyle={styles.payButtonText}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totals: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  discount: {
    color: 'green',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  payButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

## 🔐 **Step 5: Environment Configuration**

### **Create `.env` file in your mobile app root:**

```env
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000
# For production: EXPO_PUBLIC_API_URL=https://your-domain.com

# Clerk Configuration
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here

# Stripe Configuration (Publishable Key only - never include secret keys!)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

## 📱 **Step 6: Integration with Your Cart**

```typescript
// Example: How to call CheckoutScreen from your cart
import { useNavigation } from '@react-navigation/native';

export default function CartScreen() {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // Calculate totals (implement your pricing logic)
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = subtotal * 0.08; // 8% tax example
  const shippingAmount = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  const discountAmount = 0; // Apply promotions/membership discounts
  const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

  const proceedToCheckout = () => {
    navigation.navigate('Checkout', {
      cartItems,
      subtotal,
      taxAmount,
      shippingAmount,
      discountAmount,
      totalAmount,
    });
  };

  return (
    <View>
      {/* Your cart UI */}
      <Button title="Proceed to Checkout" onPress={proceedToCheckout} />
    </View>
  );
}
```

## 🧪 **Step 7: Testing**

### **Test with Stripe Test Cards:**

```typescript
// For testing, use these test card numbers:
const TEST_CARDS = {
  successful: '4242424242424242',
  declined: '4000000000000002',
  requiresAuth: '4000002500003155',
};
```

### **Test the Flow:**

1. **Add items to cart**
2. **Navigate to checkout**
3. **Fill in customer information**
4. **Use test card: 4242424242424242**
5. **Complete payment**
6. **Verify order in backend logs**

## ⚠️ **Important Security Notes**

1. **Never include Stripe secret keys in mobile app**
2. **Always validate on backend** - the mobile app data is just for UI
3. **Use HTTPS** for all API calls
4. **Validate amounts** on backend before processing

## 🚀 **What Happens When You Pay:**

1. **Mobile app** collects checkout data
2. **Mobile app** → `POST /api/mobile/checkout/create-payment-intent`
3. **Backend** creates Stripe PaymentIntent, returns `clientSecret`
4. **Mobile app** uses Stripe SDK to confirm payment
5. **Mobile app** → `POST /api/mobile/checkout/confirm-order`
6. **Backend** verifies payment, creates order, clears cart
7. **Mobile app** shows order confirmation

## 📞 **Backend API Endpoints Ready:**

- ✅ `POST /api/mobile/checkout/create-payment-intent` - Creates payment intent
- ✅ `POST /api/mobile/checkout/confirm-order` - Confirms order after payment
- ✅ Comprehensive logging for debugging
- ✅ Full validation and error handling
- ✅ Membership and promotion support

## 🎯 **Next Steps:**

1. **Implement the checkout screen** using the code above
2. **Test with Stripe test cards**
3. **Add proper navigation** between cart and checkout
4. **Style the UI** to match your app design
5. **Add order confirmation screen**
6. **Test thoroughly** before production

The backend is ready to receive your payments! Follow this guide exactly and your mobile payments will work seamlessly with the Nutra-Vive system.