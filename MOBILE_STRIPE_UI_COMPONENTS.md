# Mobile Stripe Payment UI Components Guide

## 💳 **How to Render Stripe Payment Elements in React Native**

This guide shows you exactly how to create the payment form UI with Stripe card input fields, similar to Stripe Elements on the web but for mobile.

## 🛠️ **Step 1: Enhanced Payment Screen with Card Input**

Replace the previous `CheckoutScreen.tsx` with this complete implementation:

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  useStripe,
  CardField,
  StripeProvider,
  confirmPayment,
  CardFieldInput,
} from '@stripe/stripe-react-native';
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
  const [cardComplete, setCardComplete] = useState(false);
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details | null>(null);
  
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

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'google_pay'>('card');

  const handlePayment = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!cardComplete && paymentMethod === 'card') {
      Alert.alert('Error', 'Please complete your card information');
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
        paymentMethodTypes: getPaymentMethodTypes(),
        notes: 'Mobile app order',
      };

      console.log('🔵 Creating payment intent...');
      const paymentIntentResponse = await paymentService.createPaymentIntent(checkoutData);
      
      // Step 2: Confirm Payment with Stripe
      const { paymentIntent } = paymentIntentResponse;
      
      console.log('💳 Confirming payment with Stripe...');
      
      let confirmResult;
      
      if (paymentMethod === 'card') {
        // Card payment
        confirmResult = await confirmPayment(paymentIntent.clientSecret, {
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
      } else if (paymentMethod === 'apple_pay') {
        // Apple Pay (iOS only)
        confirmResult = await confirmPayment(paymentIntent.clientSecret, {
          paymentMethodType: 'ApplePay',
          paymentMethodData: {
            billingDetails: {
              email: customerInfo.email,
              name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            },
          },
        });
      } else if (paymentMethod === 'google_pay') {
        // Google Pay (Android only)
        confirmResult = await confirmPayment(paymentIntent.clientSecret, {
          paymentMethodType: 'GooglePay',
          paymentMethodData: {
            billingDetails: {
              email: customerInfo.email,
              name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            },
          },
        });
      }

      if (confirmResult?.error) {
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
        'Order Complete! 🎉',
        `Your order ${orderResult.order.orderNumber} has been placed successfully. You'll receive an email confirmation shortly.`,
        [
          {
            text: 'View Order',
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

  const getPaymentMethodTypes = () => {
    const methods = ['card'];
    if (Platform.OS === 'ios') {
      methods.push('apple_pay');
    }
    if (Platform.OS === 'android') {
      methods.push('google_pay');
    }
    return methods;
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

  const onCardChange = (cardDetails: CardFieldInput.Details) => {
    setCardDetails(cardDetails);
    setCardComplete(cardDetails.complete);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Secure Checkout</Text>
          
          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📦 Order Summary</Text>
            {cartItems.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
            
            <View style={styles.totals}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax:</Text>
                <Text style={styles.totalValue}>${taxAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Shipping:</Text>
                <Text style={styles.totalValue}>${shippingAmount.toFixed(2)}</Text>
              </View>
              {discountAmount > 0 && (
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, styles.discount]}>Discount:</Text>
                  <Text style={[styles.totalValue, styles.discount]}>-${discountAmount.toFixed(2)}</Text>
                </View>
              )}
              <View style={[styles.totalRow, styles.finalTotal]}>
                <Text style={styles.finalTotalLabel}>Total:</Text>
                <Text style={styles.finalTotalValue}>${totalAmount.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Payment Method Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💳 Payment Method</Text>
            <View style={styles.paymentMethods}>
              <TouchableOpacity
                style={[
                  styles.paymentMethodButton,
                  paymentMethod === 'card' && styles.paymentMethodActive
                ]}
                onPress={() => setPaymentMethod('card')}
              >
                <Text style={[
                  styles.paymentMethodText,
                  paymentMethod === 'card' && styles.paymentMethodActiveText
                ]}>
                  💳 Credit Card
                </Text>
              </TouchableOpacity>
              
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={[
                    styles.paymentMethodButton,
                    paymentMethod === 'apple_pay' && styles.paymentMethodActive
                  ]}
                  onPress={() => setPaymentMethod('apple_pay')}
                >
                  <Text style={[
                    styles.paymentMethodText,
                    paymentMethod === 'apple_pay' && styles.paymentMethodActiveText
                  ]}>
                    🍎 Apple Pay
                  </Text>
                </TouchableOpacity>
              )}
              
              {Platform.OS === 'android' && (
                <TouchableOpacity
                  style={[
                    styles.paymentMethodButton,
                    paymentMethod === 'google_pay' && styles.paymentMethodActive
                  ]}
                  onPress={() => setPaymentMethod('google_pay')}
                >
                  <Text style={[
                    styles.paymentMethodText,
                    paymentMethod === 'google_pay' && styles.paymentMethodActiveText
                  ]}>
                    🟢 Google Pay
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Credit Card Input (show only if card payment selected) */}
          {paymentMethod === 'card' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💳 Card Information</Text>
              <View style={styles.cardFieldContainer}>
                <CardField
                  postalCodeEnabled={true}
                  placeholders={{
                    number: '4242 4242 4242 4242',
                    expiration: 'MM/YY',
                    cvc: 'CVC',
                    postalCode: 'ZIP',
                  }}
                  cardStyle={{
                    backgroundColor: '#FFFFFF',
                    textColor: '#000000',
                    fontSize: 16,
                    placeholderColor: '#A0A0A0',
                    borderWidth: 1,
                    borderColor: cardComplete ? '#4CAF50' : '#E0E0E0',
                    borderRadius: 8,
                  }}
                  style={styles.cardField}
                  onCardChange={onCardChange}
                />
              </View>
              {cardDetails && !cardComplete && (
                <Text style={styles.cardError}>Please complete your card information</Text>
              )}
            </View>
          )}

          {/* Customer Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Customer Information</Text>
            <Input
              placeholder="Email Address"
              value={customerInfo.email}
              onChangeText={(text) => setCustomerInfo({...customerInfo, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={{ type: 'material', name: 'email', color: '#666' }}
              containerStyle={styles.inputContainer}
            />
            <Input
              placeholder="First Name"
              value={customerInfo.firstName}
              onChangeText={(text) => setCustomerInfo({...customerInfo, firstName: text})}
              leftIcon={{ type: 'material', name: 'person', color: '#666' }}
              containerStyle={styles.inputContainer}
            />
            <Input
              placeholder="Last Name"
              value={customerInfo.lastName}
              onChangeText={(text) => setCustomerInfo({...customerInfo, lastName: text})}
              leftIcon={{ type: 'material', name: 'person', color: '#666' }}
              containerStyle={styles.inputContainer}
            />
            <Input
              placeholder="Phone Number (optional)"
              value={customerInfo.phone}
              onChangeText={(text) => setCustomerInfo({...customerInfo, phone: text})}
              keyboardType="phone-pad"
              leftIcon={{ type: 'material', name: 'phone', color: '#666' }}
              containerStyle={styles.inputContainer}
            />
          </View>

          {/* Shipping Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚚 Shipping Address</Text>
            <Input
              placeholder="Street Address"
              value={shippingAddress.line1}
              onChangeText={(text) => setShippingAddress({...shippingAddress, line1: text})}
              leftIcon={{ type: 'material', name: 'home', color: '#666' }}
              containerStyle={styles.inputContainer}
            />
            <Input
              placeholder="Apartment, suite, etc. (optional)"
              value={shippingAddress.line2}
              onChangeText={(text) => setShippingAddress({...shippingAddress, line2: text})}
              leftIcon={{ type: 'material', name: 'apartment', color: '#666' }}
              containerStyle={styles.inputContainer}
            />
            <View style={styles.addressRow}>
              <Input
                placeholder="City"
                value={shippingAddress.city}
                onChangeText={(text) => setShippingAddress({...shippingAddress, city: text})}
                containerStyle={[styles.inputContainer, styles.halfWidth]}
              />
              <Input
                placeholder="State"
                value={shippingAddress.state}
                onChangeText={(text) => setShippingAddress({...shippingAddress, state: text})}
                containerStyle={[styles.inputContainer, styles.halfWidth]}
              />
            </View>
            <Input
              placeholder="ZIP Code"
              value={shippingAddress.postal_code}
              onChangeText={(text) => setShippingAddress({...shippingAddress, postal_code: text})}
              keyboardType="numeric"
              leftIcon={{ type: 'material', name: 'local-post-office', color: '#666' }}
              containerStyle={styles.inputContainer}
            />
          </View>

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <Text style={styles.securityText}>
              🔒 Your payment information is encrypted and secure. We never store your card details.
            </Text>
          </View>

          {/* Payment Button */}
          <Button
            title={loading ? "Processing Payment..." : `Pay $${totalAmount.toFixed(2)} Securely`}
            onPress={handlePayment}
            loading={loading}
            disabled={loading || !validateForm() || (paymentMethod === 'card' && !cardComplete)}
            buttonStyle={[
              styles.payButton,
              (!validateForm() || (paymentMethod === 'card' && !cardComplete)) && styles.payButtonDisabled
            ]}
            titleStyle={styles.payButtonText}
            icon={{
              name: 'lock',
              type: 'material',
              size: 20,
              color: 'white',
            }}
          />
          
          <View style={styles.poweredBy}>
            <Text style={styles.poweredByText}>Powered by Stripe</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  totals: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  discount: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  finalTotal: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  finalTotalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  finalTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  paymentMethodButton: {
    flex: 1,
    minWidth: 120,
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  paymentMethodActive: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  paymentMethodActiveText: {
    color: '#007AFF',
  },
  cardFieldContainer: {
    marginVertical: 10,
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 10,
  },
  cardError: {
    color: '#f44336',
    fontSize: 14,
    marginTop: 5,
  },
  inputContainer: {
    marginBottom: 10,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  halfWidth: {
    flex: 1,
  },
  securityNotice: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  securityText: {
    fontSize: 14,
    color: '#2e7d32',
    textAlign: 'center',
    lineHeight: 20,
  },
  payButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 10,
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  poweredBy: {
    alignItems: 'center',
    marginBottom: 20,
  },
  poweredByText: {
    fontSize: 12,
    color: '#999',
  },
});
```

## 🎨 **Step 2: Payment Method Components**

Create separate components for different payment methods:

### **components/ApplePayButton.tsx:**

```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useApplePay } from '@stripe/stripe-react-native';

interface ApplePayButtonProps {
  amount: number;
  onPress: () => void;
  disabled?: boolean;
}

export default function ApplePayButton({ amount, onPress, disabled }: ApplePayButtonProps) {
  const { isApplePaySupported } = useApplePay();
  
  if (Platform.OS !== 'ios' || !isApplePaySupported) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.applePayButton, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.applePayText}>
        🍎 Pay with Apple Pay - ${amount.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  applePayButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  disabled: {
    backgroundColor: '#ccc',
  },
  applePayText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

### **components/GooglePayButton.tsx:**

```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useGooglePay } from '@stripe/stripe-react-native';

interface GooglePayButtonProps {
  amount: number;
  onPress: () => void;
  disabled?: boolean;
}

export default function GooglePayButton({ amount, onPress, disabled }: GooglePayButtonProps) {
  const { isGooglePaySupported } = useGooglePay();
  
  if (Platform.OS !== 'android' || !isGooglePaySupported) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.googlePayButton, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.googlePayText}>
        G Pay - ${amount.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  googlePayButton: {
    backgroundColor: '#4285f4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  disabled: {
    backgroundColor: '#ccc',
  },
  googlePayText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

## 🔧 **Step 3: Enhanced App Setup**

Update your main app file to include proper Stripe initialization:

### **App.tsx or _layout.tsx:**

```typescript
import React, { useEffect, useState } from 'react';
import { StripeProvider, initStripe } from '@stripe/stripe-react-native';
import { ClerkProvider } from '@clerk/clerk-expo';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

export default function App() {
  const [stripeInitialized, setStripeInitialized] = useState(false);

  useEffect(() => {
    const initializeStripe = async () => {
      await initStripe({
        publishableKey: STRIPE_PUBLISHABLE_KEY,
        merchantIdentifier: 'merchant.com.nutravive.app', // iOS only
        urlScheme: 'nutravive', // iOS only
      });
      setStripeInitialized(true);
    };

    initializeStripe();
  }, []);

  if (!stripeInitialized) {
    return null; // or loading screen
  }

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
        {/* Your app navigation */}
      </ClerkProvider>
    </StripeProvider>
  );
}
```

## 📱 **Step 4: Test Card Input**

For testing, the mobile developer can use these test cards directly in the CardField:

```typescript
// Test cards for development
const TEST_CARDS = {
  visa: '4242424242424242',
  visaDeclined: '4000000000000002',
  mastercard: '5555555555554444',
  amex: '378282246310005',
  requiresAuth: '4000002500003155',
};
```

## 🎯 **Key Features of This Implementation:**

### ✅ **Card Input Field:**
- Real Stripe `CardField` component
- Live validation and formatting
- Secure input (card details never stored locally)

### ✅ **Multiple Payment Methods:**
- Credit/Debit Cards
- Apple Pay (iOS)
- Google Pay (Android)

### ✅ **Professional UI:**
- Clean, modern design
- Loading states
- Error handling
- Responsive layout

### ✅ **Security Features:**
- PCI compliance through Stripe
- No card data stored locally
- Encrypted transmission

### ✅ **User Experience:**
- Real-time form validation
- Clear error messages
- Professional payment flow
- Mobile-optimized design

## 🚀 **How the Payment Flow Works:**

1. **User fills form** → Customer info + shipping address
2. **User enters card** → Stripe CardField handles securely
3. **User taps "Pay"** → Creates payment intent with backend
4. **Stripe processes** → Card validation and authorization
5. **Backend confirms** → Creates order and clears cart
6. **Success shown** → Order confirmation to user

This provides the complete Stripe payment UI that works exactly like Stripe Elements on the web, but optimized for React Native mobile apps!