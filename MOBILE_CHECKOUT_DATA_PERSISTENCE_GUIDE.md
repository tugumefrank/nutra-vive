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

### 1. Integration with Your Existing CheckoutScreen

Based on your current React Native checkout implementation, here's how to add data persistence:

```typescript
// Add these imports to your existing CheckoutScreen.tsx
import { getUserProfile, saveCheckoutPreferences } from '@/services/userProfileService';

// Add these new state variables to your existing CheckoutScreen component
const CheckoutScreen = () => {
  // ... your existing state variables ...
  
  // Add these new state variables for data persistence
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [saveAddressOption, setSaveAddressOption] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);

  // Add this useEffect to your existing component (after your current state definitions)
  useEffect(() => {
    loadUserCheckoutData();
  }, []);

  const loadUserCheckoutData = async () => {
    if (!user?.id) return; // Only load if user is authenticated
    
    setProfileLoading(true);
    try {
      const profile = await getUserProfile(); // Call your user profile service
      
      if (profile && (profile.savedAddresses?.length > 0 || profile.defaultShippingAddress)) {
        setIsFirstTimeUser(false);
        setSavedAddresses(profile.savedAddresses || []);
        
        // Auto-fill your existing customerInfo state with saved data
        setCustomerInfo({
          email: user.emailAddresses?.[0]?.emailAddress || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: profile.defaultShippingAddress?.phone || '',
        });
        
        // Auto-fill your existing shippingAddress state with saved data
        if (profile.defaultShippingAddress) {
          setShippingAddress({
            line1: profile.defaultShippingAddress.address1 || '',
            line2: profile.defaultShippingAddress.address2 || '',
            city: profile.defaultShippingAddress.city || '',
            state: profile.defaultShippingAddress.state || '',
            postal_code: profile.defaultShippingAddress.zipCode || '',
            country: profile.defaultShippingAddress.country || 'US',
          });
        }
        
        // Auto-fill delivery method if saved
        if (profile.preferredDeliveryMethod) {
          setDeliveryMethod(profile.preferredDeliveryMethod);
        }
      }
    } catch (error) {
      console.error('Failed to load user checkout data:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  // Modify your existing handlePayment function to include data saving
  // Add this function call after successful payment confirmation but before clearing cart

  const saveUserCheckoutData = async () => {
    // Only save if it's first time user or they opted to save address
    if (!isFirstTimeUser && !saveAddressOption) return;
    
    try {
      await saveCheckoutPreferences({
        address: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          address1: shippingAddress.line1,
          address2: shippingAddress.line2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.postal_code,
          country: shippingAddress.country,
          phone: customerInfo.phone
        },
        deliveryMethod: deliveryMethod,
        setAsDefault: true,
        addressLabel: "Home" // or let user choose
      });
      
      console.log('✅ Checkout preferences saved for future use');
      // Optionally show a toast message
      Alert.alert('Success', 'Address saved for faster checkout next time!');
    } catch (error) {
      console.error('❌ Failed to save checkout preferences:', error);
    }
  };

  // Update your existing handlePayment function - add this call after successful payment
  // Insert this line after: console.log('✅ Order completed successfully');
  // and before: clearCart();
  
  // await saveUserCheckoutData();
```

### 2. Required Service File

Create a new service file for handling user profile API calls:

```typescript
// services/userProfileService.ts
import { useAuth } from '@clerk/clerk-expo';

interface UserProfile {
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
  savedAddresses: Array<{
    id: string;
    label: string;
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
    createdAt: string;
  }>;
  preferredDeliveryMethod: 'standard' | 'express' | 'pickup';
  deliveryInstructions?: string;
  marketingOptIn: boolean;
}

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { getToken } = useAuth();
    const token = await getToken();
    
    const response = await fetch('/api/mobile/auth/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    const result = await response.json();
    return result.success ? result.user.profile : null;
  } catch (error) {
    console.error('getUserProfile error:', error);
    return null;
  }
};

export const saveCheckoutPreferences = async (data: {
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
  deliveryMethod?: 'standard' | 'express' | 'pickup';
  deliveryInstructions?: string;
  marketingOptIn?: boolean;
  setAsDefault?: boolean;
  addressLabel?: string;
}) => {
  try {
    const { getToken } = useAuth();
    const token = await getToken();
    
    const response = await fetch('/api/mobile/auth/user/save-checkout-preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save checkout preferences');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('saveCheckoutPreferences error:', error);
    throw error;
  }
};
```

### 3. UI Components to Add to Your Existing Checkout

Add these components to your existing checkout screen for enhanced user experience:

```typescript
// Add this component to show "Change Address" button for returning users
const ChangeAddressButton = ({ onPress, savedAddressesCount }: { onPress: () => void, savedAddressesCount: number }) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 flex-row items-center justify-between"
  >
    <View className="flex-row items-center">
      <Text className="text-orange-500 text-lg mr-2">📍</Text>
      <View>
        <Text className="text-orange-700 font-quicksand-semibold text-sm">
          Change Address
        </Text>
        <Text className="text-orange-600 font-quicksand-medium text-xs">
          You have {savedAddressesCount} saved address{savedAddressesCount !== 1 ? 'es' : ''}
        </Text>
      </View>
    </View>
    <Text className="text-orange-500 text-xl">→</Text>
  </TouchableOpacity>
);

// Add this component for first-time users to save their address
const SaveAddressOption = ({ 
  saveAddressOption, 
  onToggle 
}: { 
  saveAddressOption: boolean, 
  onToggle: () => void 
}) => (
  <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
    <TouchableOpacity 
      className="flex-row items-center"
      onPress={onToggle}
    >
      <View className={`w-6 h-6 rounded-md border-2 mr-3 items-center justify-center ${
        saveAddressOption ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
      }`}>
        {saveAddressOption && <Text className="text-white text-sm">✓</Text>}
      </View>
      <View className="flex-1">
        <Text className="text-blue-700 font-quicksand-semibold text-sm">
          💾 Save this address for faster checkout
        </Text>
        <Text className="text-blue-600 font-quicksand-medium text-xs mt-1">
          Your address will be securely stored for future orders
        </Text>
      </View>
    </TouchableOpacity>
  </View>
);

// Add this component to show loading state when fetching saved data
const LoadingOverlay = () => (
  <View className="absolute inset-0 bg-black/20 items-center justify-center z-50">
    <View className="bg-white rounded-2xl p-6 items-center">
      <Text className="text-orange-500 text-2xl mb-2">⏳</Text>
      <Text className="text-gray-700 font-quicksand-semibold">Loading saved data...</Text>
    </View>
  </View>
);
```

### 4. Integration Points in Your Existing Code

Here are the specific places to modify in your current checkout screen:

**A. Add after your existing imports:**
```typescript
import { getUserProfile, saveCheckoutPreferences } from '@/services/userProfileService';
```

**B. Add to your state variables:**
```typescript
const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
const [saveAddressOption, setSaveAddressOption] = useState(true);
const [savedAddresses, setSavedAddresses] = useState([]);
const [profileLoading, setProfileLoading] = useState(false);
```

**C. Add the data loading useEffect:**
```typescript
useEffect(() => {
  loadUserCheckoutData();
}, []);
```

**D. Add after your Shipping Address section (inside the white container):**
```typescript
{!isFirstTimeUser && savedAddresses.length > 0 && (
  <ChangeAddressButton 
    onPress={() => {/* Navigate to address selection screen */}} 
    savedAddressesCount={savedAddresses.length}
  />
)}
```

**E. Add after your Shipping Address section (as a separate container):**
```typescript
{isFirstTimeUser && deliveryMethod !== 'pickup' && (
  <SaveAddressOption 
    saveAddressOption={saveAddressOption}
    onToggle={() => setSaveAddressOption(!saveAddressOption)}
  />
)}
```

**F. Add in your handlePayment function after successful order:**
```typescript
// Add this line after: console.log('✅ Order completed successfully');
// and before: clearCart();
await saveUserCheckoutData();
```

**G. Add loading overlay to your main return:**
```typescript
return (
  <SafeAreaView className="flex-1" style={{ backgroundColor: '#F5F5F5' }}>
    <CustomHeader title="Checkout" />
    
    {profileLoading && <LoadingOverlay />}
    
    {/* Your existing ScrollView content */}
  </SafeAreaView>
);
```

### 5. Complete handlePayment Function Integration

Here's how to integrate the data saving into your existing `handlePayment` function:

```typescript
// Add this line after your successful order confirmation
// Insert it after: console.log('✅ Order completed successfully');
// and before: clearCart();

try {
  await saveUserCheckoutData();
} catch (error) {
  // Don't block the success flow if saving fails
  console.error('Failed to save checkout data:', error);
}
```

## 🚀 Quick Implementation Checklist

Follow these steps to integrate checkout data persistence into your existing app:

### Step 1: Create the Required API Endpoints
1. ✅ Create `/app/api/mobile/auth/user/save-checkout-preferences/route.ts`
2. ✅ Create `/app/api/mobile/auth/user/delete-address/route.ts`

### Step 2: Create the Service File
1. ✅ Create `/services/userProfileService.ts` with the code provided above

### Step 3: Update Your Checkout Screen
1. ✅ Add the new imports and state variables
2. ✅ Add the `loadUserCheckoutData()` function
3. ✅ Add the `saveUserCheckoutData()` function  
4. ✅ Add the UI components (ChangeAddressButton, SaveAddressOption, LoadingOverlay)
5. ✅ Integrate the components into your existing JSX
6. ✅ Add the data saving call to your `handlePayment` function

### Step 4: Create Address Management Screen (Optional but Recommended)

Create a new screen for users to manage their saved addresses:

```typescript
// screens/SavedAddressesScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import CustomHeader from '@/components/ui/CustomHeader';
import { getUserProfile, deleteSavedAddress } from '@/services/userProfileService';

export default function SavedAddressesScreen() {
  const router = useRouter();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedAddresses();
  }, []);

  const loadSavedAddresses = async () => {
    try {
      const profile = await getUserProfile();
      setSavedAddresses(profile?.savedAddresses || []);
    } catch (error) {
      console.error('Failed to load addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSavedAddress(addressId);
              loadSavedAddresses(); // Refresh the list
              Alert.alert('Success', 'Address deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete address');
            }
          }
        }
      ]
    );
  };

  const AddressCard = ({ address }: { address: any }) => (
    <View className="bg-white rounded-2xl p-4 mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-gray-900 font-quicksand-bold text-base">
          {address.label}
        </Text>
        {address.isDefault && (
          <View className="bg-orange-100 px-2 py-1 rounded-full">
            <Text className="text-orange-600 font-quicksand-semibold text-xs">Default</Text>
          </View>
        )}
      </View>
      
      <Text className="text-gray-700 font-quicksand-semibold text-sm">
        {address.firstName} {address.lastName}
      </Text>
      
      <Text className="text-gray-600 font-quicksand-medium text-sm mt-1">
        {address.address1}
        {address.address2 && `, ${address.address2}`}
      </Text>
      
      <Text className="text-gray-600 font-quicksand-medium text-sm">
        {address.city}, {address.state} {address.zipCode}
      </Text>
      
      <View className="flex-row mt-3 space-x-3">
        <TouchableOpacity
          onPress={() => router.push(`/edit-address/${address.id}`)}
          className="flex-1 bg-orange-50 border border-orange-200 rounded-xl py-2"
        >
          <Text className="text-orange-600 font-quicksand-semibold text-center text-sm">
            Edit
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => handleDeleteAddress(address.id)}
          className="flex-1 bg-red-50 border border-red-200 rounded-xl py-2"
        >
          <Text className="text-red-600 font-quicksand-semibold text-center text-sm">
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F5F5F5' }}>
      <CustomHeader title="Saved Addresses" />
      
      <ScrollView className="flex-1 px-6">
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 font-quicksand-medium">Loading addresses...</Text>
          </View>
        ) : savedAddresses.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-6xl mb-4">📍</Text>
            <Text className="text-gray-900 font-quicksand-bold text-lg mb-2 text-center">
              No saved addresses yet
            </Text>
            <Text className="text-gray-500 font-quicksand-medium text-center mb-6">
              Your saved addresses will appear here for faster checkout.
            </Text>
          </View>
        ) : (
          <>
            <Text className="text-gray-700 font-quicksand-medium text-sm mb-6">
              Manage your saved addresses for faster checkout
            </Text>
            
            {savedAddresses.map((address) => (
              <AddressCard key={address.id} address={address} />
            ))}
          </>
        )}
        
        <TouchableOpacity
          onPress={() => router.push('/add-address')}
          className="bg-orange-500 rounded-2xl py-4 mb-6"
        >
          <Text className="text-white font-quicksand-bold text-center text-base">
            + Add New Address
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
```

## 🎯 Key Benefits After Implementation

1. **Faster Checkout**: Returning users see pre-filled forms
2. **Better UX**: Smooth address selection for multiple saved addresses  
3. **User Retention**: Reduced friction in the purchase process
4. **Data Insights**: Track user preferences and behavior
5. **Cross-platform Sync**: Addresses saved on web are available on mobile

## 🔧 Testing Your Implementation

1. **First-Time User Flow**:
   - Complete checkout with new address
   - Verify "save address" option appears
   - Confirm address is saved after successful payment

2. **Returning User Flow**:
   - Login and go to checkout
   - Verify form auto-fills with saved data
   - Test "Change Address" functionality

3. **Address Management**:
   - Navigate to saved addresses screen
   - Test edit/delete functionality
   - Verify default address handling

4. **Error Handling**:
   - Test with poor network conditions
   - Verify graceful fallbacks when API fails
   - Ensure checkout still works if data saving fails

This implementation will provide the same seamless checkout experience as your web application while maintaining the native mobile feel and performance.
