# Mobile App Checkout Data Persistence Implementation Guide

## 📋 Overview

This guide explains how to implement checkout data persistence in the Nutra-Vive mobile app to match the web application's functionality. Users will have their shipping addresses, delivery preferences, and contact information automatically saved and auto-filled for future checkouts.

## 🗄️ Backend Data Structure

### UserProfile Database Schema
The checkout data is stored in the `UserProfile` collection with the following structure:

```typescript
interface IUserProfile {
  // Default shipping address (auto-fills checkout)
  defaultShippingAddress?: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };

  // Multiple saved addresses with labels
  savedAddresses: {
    id: string;
    label: string; // "Home", "Work", "Other"
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
    isDefault: boolean;
    createdAt: Date;
  }[];

  // User preferences
  preferredDeliveryMethod: "standard" | "express" | "pickup";
  deliveryInstructions?: string;
  marketingOptIn: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
}
```

### Key Server Actions Available
- `getUserProfile()` - Retrieves user profile with saved addresses
- `saveCheckoutPreferences()` - Saves checkout data after successful order
- `deleteSavedAddress()` - Removes a saved address
- `updateUserInfo()` - Updates basic user information

## 🔌 Required Mobile API Endpoints

### 1. Get User Profile (Already Available)
```
GET /api/mobile/auth/user
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "profile": {
      "defaultShippingAddress": {
        "firstName": "John",
        "lastName": "Doe",
        "address1": "123 Main St",
        "address2": "Apt 4B",
        "city": "San Francisco",
        "state": "CA",
        "zipCode": "94105",
        "country": "US",
        "phone": "+1234567890"
      },
      "savedAddresses": [
        {
          "id": "addr_123",
          "label": "Home",
          "firstName": "John",
          "lastName": "Doe",
          "address1": "123 Main St",
          "address2": "Apt 4B",
          "city": "San Francisco",
          "state": "CA",
          "zipCode": "94105",
          "country": "US",
          "phone": "+1234567890",
          "isDefault": true,
          "createdAt": "2024-01-15T10:30:00Z"
        }
      ],
      "preferredDeliveryMethod": "standard",
      "deliveryInstructions": "Leave at front door",
      "marketingOptIn": false,
      "smsNotifications": true,
      "emailNotifications": true
    }
  }
}
```

### 2. Save Checkout Preferences (New Endpoint Needed)

**Endpoint:** `POST /api/mobile/auth/user/save-checkout-preferences`

**Request Body:**
```typescript
{
  address?: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  deliveryMethod?: "standard" | "express" | "pickup";
  deliveryInstructions?: string;
  marketingOptIn?: boolean;
  setAsDefault?: boolean;
  addressLabel?: string;
}
```

**Implementation:** Create this endpoint in `/app/api/mobile/auth/user/save-checkout-preferences/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { saveCheckoutPreferences } from "@/lib/actions/userProfileServerActions";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    const data = await request.json();
    
    const result = await saveCheckoutPreferences(data);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Checkout preferences saved successfully"
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Save checkout preferences error:", error);
    return NextResponse.json(
      { error: "Failed to save checkout preferences" },
      { status: 500 }
    );
  }
}
```

### 3. Delete Saved Address (New Endpoint Needed)

**Endpoint:** `DELETE /api/mobile/auth/user/delete-address`

**Request Body:**
```json
{
  "addressId": "addr_123"
}
```

**Implementation:** Create this endpoint in `/app/api/mobile/auth/user/delete-address/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteSavedAddress } from "@/lib/actions/userProfileServerActions";

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    const { addressId } = await request.json();
    
    if (!addressId) {
      return NextResponse.json(
        { error: "Address ID is required" },
        { status: 400 }
      );
    }
    
    const result = await deleteSavedAddress(addressId);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Address deleted successfully"
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Delete address error:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}
```

## 📱 Mobile App Implementation

### 1. First-Time Checkout Flow

```typescript
// CheckoutScreen.tsx
import React, { useState, useEffect } from 'react';

const CheckoutScreen = () => {
  const [checkoutForm, setCheckoutForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    deliveryMethod: 'standard',
    deliveryInstructions: '',
    marketingOptIn: false
  });
  
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [saveAddressOption, setSaveAddressOption] = useState(true);

  // Load existing user data on screen mount
  useEffect(() => {
    loadUserCheckoutData();
  }, []);

  const loadUserCheckoutData = async () => {
    try {
      const token = await getAuthToken(); // Your auth token method
      
      const response = await fetch('/api/mobile/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (result.success && result.user.profile) {
        const profile = result.user.profile;
        const user = result.user;
        
        // Check if user has saved addresses
        if (profile.savedAddresses?.length > 0 || profile.defaultShippingAddress) {
          setIsFirstTimeUser(false);
          
          // Auto-fill form with saved data
          setCheckoutForm({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            
            // Use default shipping address if available
            address: profile.defaultShippingAddress?.address1 || '',
            apartment: profile.defaultShippingAddress?.address2 || '',
            city: profile.defaultShippingAddress?.city || '',
            state: profile.defaultShippingAddress?.state || '',
            zipCode: profile.defaultShippingAddress?.zipCode || '',
            country: profile.defaultShippingAddress?.country || 'US',
            
            // Use saved preferences
            deliveryMethod: profile.preferredDeliveryMethod || 'standard',
            deliveryInstructions: profile.deliveryInstructions || '',
            marketingOptIn: profile.marketingOptIn || false
          });
        }
      }
    } catch (error) {
      console.error('Failed to load user checkout data:', error);
    }
  };

  const handleSuccessfulPayment = async (paymentResult) => {
    // After successful payment, save checkout preferences if it's a new address or first time
    if (isFirstTimeUser || saveAddressOption) {
      await saveUserCheckoutData();
    }
    
    // Navigate to success screen
    navigation.navigate('OrderSuccess', { orderId: paymentResult.orderId });
  };

  const saveUserCheckoutData = async () => {
    try {
      const token = await getAuthToken();
      
      const response = await fetch('/api/mobile/auth/user/save-checkout-preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: {
            firstName: checkoutForm.firstName,
            lastName: checkoutForm.lastName,
            address1: checkoutForm.address,
            address2: checkoutForm.apartment,
            city: checkoutForm.city,
            state: checkoutForm.state,
            zipCode: checkoutForm.zipCode,
            country: checkoutForm.country,
            phone: checkoutForm.phone
          },
          deliveryMethod: checkoutForm.deliveryMethod,
          deliveryInstructions: checkoutForm.deliveryInstructions,
          marketingOptIn: checkoutForm.marketingOptIn,
          setAsDefault: true,
          addressLabel: "Home" // or let user choose
        })
      });
      
      const result = await response.json();
      if (result.success) {
        console.log('Checkout preferences saved for future use');
        // Show success message to user
        showSuccessMessage('Address saved for faster checkout next time!');
      }
    } catch (error) {
      console.error('Failed to save checkout preferences:', error);
    }
  };

  return (
    <ScrollView>
      {/* Contact Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        <TextInput
          placeholder="First Name"
          value={checkoutForm.firstName}
          onChangeText={(text) => setCheckoutForm({...checkoutForm, firstName: text})}
          style={styles.input}
        />
        
        <TextInput
          placeholder="Last Name"
          value={checkoutForm.lastName}
          onChangeText={(text) => setCheckoutForm({...checkoutForm, lastName: text})}
          style={styles.input}
        />
        
        <TextInput
          placeholder="Email"
          value={checkoutForm.email}
          onChangeText={(text) => setCheckoutForm({...checkoutForm, email: text})}
          keyboardType="email-address"
          style={styles.input}
        />
        
        <TextInput
          placeholder="Phone Number"
          value={checkoutForm.phone}
          onChangeText={(text) => setCheckoutForm({...checkoutForm, phone: text})}
          keyboardType="phone-pad"
          style={styles.input}
        />
      </View>

      {/* Shipping Address Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        
        {!isFirstTimeUser && (
          <TouchableOpacity 
            style={styles.changeAddressButton}
            onPress={() => navigation.navigate('SelectAddress')}
          >
            <Text style={styles.changeAddressText}>Change Address</Text>
          </TouchableOpacity>
        )}
        
        <TextInput
          placeholder="Street Address"
          value={checkoutForm.address}
          onChangeText={(text) => setCheckoutForm({...checkoutForm, address: text})}
          style={styles.input}
        />
        
        <TextInput
          placeholder="Apartment, Suite, etc. (Optional)"
          value={checkoutForm.apartment}
          onChangeText={(text) => setCheckoutForm({...checkoutForm, apartment: text})}
          style={styles.input}
        />
        
        <View style={styles.row}>
          <TextInput
            placeholder="City"
            value={checkoutForm.city}
            onChangeText={(text) => setCheckoutForm({...checkoutForm, city: text})}
            style={[styles.input, styles.halfWidth]}
          />
          
          <TextInput
            placeholder="State"
            value={checkoutForm.state}
            onChangeText={(text) => setCheckoutForm({...checkoutForm, state: text})}
            style={[styles.input, styles.halfWidth]}
          />
        </View>
        
        <TextInput
          placeholder="ZIP Code"
          value={checkoutForm.zipCode}
          onChangeText={(text) => setCheckoutForm({...checkoutForm, zipCode: text})}
          keyboardType="numeric"
          style={styles.input}
        />
      </View>

      {/* Save Address Option for First-Time Users */}
      {isFirstTimeUser && (
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => setSaveAddressOption(!saveAddressOption)}
          >
            <View style={[styles.checkbox, saveAddressOption && styles.checkboxChecked]}>
              {saveAddressOption && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              Save this address for faster checkout next time
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Delivery Method Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Method</Text>
        
        {['standard', 'express', 'pickup'].map((method) => (
          <TouchableOpacity
            key={method}
            style={[
              styles.deliveryOption,
              checkoutForm.deliveryMethod === method && styles.deliveryOptionSelected
            ]}
            onPress={() => setCheckoutForm({...checkoutForm, deliveryMethod: method})}
          >
            <Text style={styles.deliveryMethodText}>
              {method.charAt(0).toUpperCase() + method.slice(1)} Delivery
            </Text>
          </TouchableOpacity>
        ))}
        
        <TextInput
          placeholder="Delivery Instructions (Optional)"
          value={checkoutForm.deliveryInstructions}
          onChangeText={(text) => setCheckoutForm({...checkoutForm, deliveryInstructions: text})}
          multiline
          style={[styles.input, styles.textArea]}
        />
      </View>

      {/* Marketing Opt-in */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.checkboxRow}
          onPress={() => setCheckoutForm({...checkoutForm, marketingOptIn: !checkoutForm.marketingOptIn})}
        >
          <View style={[styles.checkbox, checkoutForm.marketingOptIn && styles.checkboxChecked]}>
            {checkoutForm.marketingOptIn && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I'd like to receive marketing emails about new products and offers
          </Text>
        </TouchableOpacity>
      </View>

      {/* Payment Button */}
      <TouchableOpacity 
        style={styles.paymentButton}
        onPress={handlePayment}
      >
        <Text style={styles.paymentButtonText}>Proceed to Payment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
```

### 2. Address Selection Screen (For Returning Users)

```typescript
// SelectAddressScreen.tsx
import React, { useState, useEffect } from 'react';

const SelectAddressScreen = ({ navigation }) => {
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  useEffect(() => {
    loadSavedAddresses();
  }, []);

  const loadSavedAddresses = async () => {
    try {
      const token = await getAuthToken();
      
      const response = await fetch('/api/mobile/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (result.success && result.user.profile) {
        setSavedAddresses(result.user.profile.savedAddresses || []);
        
        // Find default address
        const defaultAddress = result.user.profile.savedAddresses?.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        }
      }
    } catch (error) {
      console.error('Failed to load saved addresses:', error);
    }
  };

  const selectAddress = (addressId) => {
    setSelectedAddressId(addressId);
    const selectedAddress = savedAddresses.find(addr => addr.id === addressId);
    
    // Return selected address to checkout screen
    navigation.navigate('Checkout', { selectedAddress });
  };

  const deleteAddress = async (addressId) => {
    try {
      const token = await getAuthToken();
      
      const response = await fetch('/api/mobile/auth/user/delete-address', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ addressId })
      });
      
      if (response.ok) {
        // Refresh addresses list
        loadSavedAddresses();
        showSuccessMessage('Address deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete address:', error);
      showErrorMessage('Failed to delete address');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Select Shipping Address</Text>
      
      {savedAddresses.map((address) => (
        <TouchableOpacity
          key={address.id}
          style={[
            styles.addressCard,
            selectedAddressId === address.id && styles.addressCardSelected
          ]}
          onPress={() => selectAddress(address.id)}
        >
          <View style={styles.addressHeader}>
            <Text style={styles.addressLabel}>{address.label}</Text>
            {address.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.addressName}>
            {address.firstName} {address.lastName}
          </Text>
          
          <Text style={styles.addressText}>
            {address.address1}
            {address.address2 && `, ${address.address2}`}
          </Text>
          
          <Text style={styles.addressText}>
            {address.city}, {address.state} {address.zipCode}
          </Text>
          
          <Text style={styles.addressText}>{address.country}</Text>
          
          {address.phone && (
            <Text style={styles.addressText}>{address.phone}</Text>
          )}
          
          <View style={styles.addressActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('EditAddress', { address })}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteAddress(address.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity
        style={styles.addNewButton}
        onPress={() => navigation.navigate('AddNewAddress')}
      >
        <Text style={styles.addNewButtonText}>+ Add New Address</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
```

### 3. Profile Screen - Address Management

```typescript
// ProfileScreen.tsx - Address Management Section
const AddressManagementSection = () => {
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = await getAuthToken();
      
      const response = await fetch('/api/mobile/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (result.success && result.user.profile) {
        setSavedAddresses(result.user.profile.savedAddresses || []);
        setDefaultAddress(result.user.profile.defaultShippingAddress);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Saved Addresses</Text>
      
      {savedAddresses.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No saved addresses yet</Text>
          <TouchableOpacity
            style={styles.addFirstAddressButton}
            onPress={() => navigation.navigate('AddNewAddress')}
          >
            <Text style={styles.addFirstAddressButtonText}>Add Your First Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {savedAddresses.map((address) => (
            <View key={address.id} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <Text style={styles.addressLabel}>{address.label}</Text>
                {address.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.addressName}>
                {address.firstName} {address.lastName}
              </Text>
              
              <Text style={styles.addressText}>
                {address.address1}
                {address.address2 && `, ${address.address2}`}
              </Text>
              
              <Text style={styles.addressText}>
                {address.city}, {address.state} {address.zipCode}
              </Text>
              
              <View style={styles.addressActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => navigation.navigate('EditAddress', { address })}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                
                {!address.isDefault && (
                  <TouchableOpacity
                    style={styles.setDefaultButton}
                    onPress={() => setAsDefault(address.id)}
                  >
                    <Text style={styles.setDefaultButtonText}>Set as Default</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteAddress(address.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() => navigation.navigate('AddNewAddress')}
          >
            <Text style={styles.addNewButtonText}>+ Add New Address</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};
```

## 🎨 UI/UX Recommendations

### Visual Design
- **Address Cards**: Use cards with clear visual hierarchy
- **Default Badge**: Prominent green badge for default addresses
- **Edit/Delete Actions**: Use icon buttons or action sheets
- **Form Auto-fill**: Smooth animations when form fields populate
- **Success Feedback**: Toast messages for successful saves/deletes

### User Experience
- **One-Tap Selection**: Easy address switching during checkout
- **Address Validation**: Real-time validation with error states
- **Loading States**: Skeleton loaders while fetching data
- **Empty States**: Helpful messaging when no addresses exist
- **Confirmation Dialogs**: Before deleting addresses

### Accessibility
- Use semantic labels for screen readers
- Proper color contrast for badges and buttons
- Touch targets minimum 44pt
- Clear focus indicators

## 🔄 Data Flow Summary

1. **First Checkout**: User enters info → Payment succeeds → Auto-save preferences
2. **Subsequent Checkouts**: Load saved data → Auto-fill form → Allow changes → Update if needed
3. **Profile Management**: View all addresses → Edit/Delete → Set defaults → Add new ones

## 🚨 Error Handling

```typescript
const handleApiError = (error, operation) => {
  console.error(`${operation} failed:`, error);
  
  // Show user-friendly error messages
  switch (error.status) {
    case 401:
      showErrorMessage('Please log in again');
      // Redirect to login
      break;
    case 400:
      showErrorMessage('Invalid data provided');
      break;
    case 500:
      showErrorMessage('Something went wrong. Please try again.');
      break;
    default:
      showErrorMessage('Network error. Check your connection.');
  }
};
```

## ✅ Testing Checklist

- [ ] First-time user can complete checkout and save address
- [ ] Returning user sees auto-filled checkout form
- [ ] User can switch between saved addresses
- [ ] User can add/edit/delete addresses in profile
- [ ] Default address logic works correctly
- [ ] Address validation prevents invalid data
- [ ] Error handling works for network failures
- [ ] Loading states display appropriately
- [ ] Success messages appear after actions

## 📊 Analytics Events to Track

```typescript
// Track these events for insights
analytics.track('checkout_data_loaded', {
  has_saved_addresses: savedAddresses.length > 0,
  has_default_address: !!defaultAddress,
  user_type: isFirstTimeUser ? 'new' : 'returning'
});

analytics.track('address_saved', {
  address_label: addressLabel,
  set_as_default: setAsDefault,
  total_saved_addresses: savedAddresses.length + 1
});

analytics.track('address_selected', {
  address_type: address.isDefault ? 'default' : 'alternative',
  address_label: address.label
});
```

This implementation will provide a seamless checkout experience that matches the web application's functionality while optimizing for mobile usage patterns.