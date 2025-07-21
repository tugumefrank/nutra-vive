# Mobile Membership API Integration Guide

This document provides complete implementation guidance for integrating Nutra-Vive's membership and subscription APIs into the mobile application.

## 📱 API Endpoints Overview

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/mobile/memberships` | GET | Get user's memberships |
| `/api/mobile/memberships/subscriptions` | GET | Get available membership plans |
| `/api/mobile/memberships/subscriptions` | POST | Manage subscriptions |
| `/api/mobile/memberships/usage` | GET | Get usage analytics |
| `/api/mobile/memberships/usage` | POST | Track product usage |

---

## 1. 📋 Get User Memberships

### **Endpoint:** `GET /api/mobile/memberships`

**Purpose:** Retrieve all memberships for the authenticated user with usage tracking and analytics.

### **Headers:**
```javascript
{
  "Authorization": "Bearer <jwt_token>"
}
```

### **Query Parameters:**
```javascript
{
  status?: "active" | "cancelled" | "expired" | "paused" | "trial" | "incomplete",
  includeExpired?: boolean, // default: false
  includeHistory?: boolean  // default: false
}
```

### **Response Structure:**
```javascript
{
  "success": true,
  "memberships": [
    {
      "_id": "membership123",
      "status": "active",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.999Z",
      "nextBillingDate": "2024-02-01T00:00:00.000Z",
      "currentPeriodStart": "2024-01-01T00:00:00.000Z",
      "currentPeriodEnd": "2024-01-31T23:59:59.999Z",
      "usageResetDate": "2024-02-01T00:00:00.000Z",
      "autoRenewal": true,
      "lastPaymentDate": "2024-01-01T00:00:00.000Z",
      "lastPaymentAmount": 99.99,
      "subscriptionId": "sub_stripe123",
      
      "membership": {
        "_id": "plan123",
        "name": "Premium Wellness",
        "description": "Complete wellness package",
        "tier": "premium",
        "price": 99.99,
        "billingFrequency": "monthly",
        "currency": "usd",
        "deliveryFrequency": "monthly",
        "freeDelivery": true,
        "prioritySupport": true,
        "maxProductsPerMonth": 10,
        "features": ["Free delivery", "Priority support", "Exclusive products"],
        "color": "#8b5cf6",
        "icon": "crown",
        "isPopular": true
      },
      
      "productUsage": [
        {
          "categoryId": "cat123",
          "categoryName": "Organic Juices",
          "allocatedQuantity": 5,
          "usedQuantity": 3,
          "availableQuantity": 2,
          "lastUsed": "2024-01-15T10:30:00.000Z",
          "usagePercentage": 60
        }
      ],
      
      "usageStats": {
        "totalCategories": 3,
        "categoriesWithUsage": 2,
        "totalAllocated": 15,
        "totalUsed": 8,
        "overallUsagePercentage": 53
      },
      
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "summary": {
    "totalMemberships": 1,
    "activeMemberships": 1,
    "trialMemberships": 0,
    "expiredMemberships": 0,
    "nextBilling": "2024-02-01T00:00:00.000Z"
  }
}
```

### **Implementation Example:**
```javascript
const getMemberships = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`/api/mobile/memberships?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
    });
    
    const data = await response.json();
    if (data.success) {
      return data.memberships;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Failed to fetch memberships:', error);
    throw error;
  }
};

// Usage
const activeMemberships = await getMemberships({ status: 'active' });
```

---

## 2. 🛍️ Get Available Membership Plans

### **Endpoint:** `GET /api/mobile/memberships/subscriptions`

**Purpose:** Retrieve all available membership plans for subscription signup.

### **Response Structure:**
```javascript
{
  "success": true,
  "plans": [
    {
      "_id": "plan123",
      "name": "Premium Wellness",
      "description": "Complete wellness package",
      "tier": "premium",
      "price": 99.99,
      "billingFrequency": "monthly",
      "currency": "usd",
      "deliveryFrequency": "monthly",
      "freeDelivery": true,
      "prioritySupport": true,
      "maxProductsPerMonth": 10,
      "features": ["Free delivery", "Priority support"],
      "productAllocations": [
        {
          "categoryId": "cat123",
          "categoryName": "Organic Juices",
          "quantity": 5
        }
      ],
      "customBenefits": [
        {
          "title": "Monthly Wellness Webinar",
          "description": "Exclusive access to expert sessions",
          "type": "webinar",
          "value": "Free"
        }
      ],
      "valueMetrics": {
        "totalProductValue": 125,
        "monthlySavings": 100,
        "deliverySavings": 15
      },
      "stripePriceId": "price_stripe123",
      "isPopular": true
    }
  ],
  "summary": {
    "totalPlans": 4,
    "tiers": ["basic", "premium", "vip"],
    "priceRange": {
      "min": 49.99,
      "max": 199.99
    }
  }
}
```

### **Implementation Example:**
```javascript
const getAvailablePlans = async () => {
  try {
    const response = await fetch('/api/mobile/memberships/subscriptions', {
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
    });
    
    const data = await response.json();
    if (data.success) {
      return data.plans;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Failed to fetch plans:', error);
    throw error;
  }
};
```

---

## 3. 💳 Subscription Management

### **Endpoint:** `POST /api/mobile/memberships/subscriptions`

**Purpose:** Create new subscriptions and manage existing ones (cancel, pause, resume, update payment).

### **Create New Subscription:**

**Request:**
```javascript
{
  "membershipId": "plan123"
}
```

**Response:**
```javascript
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_...",
  "checkoutSessionId": "cs_stripe123",
  "message": "Subscription checkout session created"
}
```

**Implementation:**
```javascript
const createSubscription = async (membershipId) => {
  try {
    const response = await fetch('/api/mobile/memberships/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ membershipId }),
    });
    
    const result = await response.json();
    if (result.success) {
      // Open checkout URL in WebView or external browser
      Linking.openURL(result.checkoutUrl);
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to create subscription');
  }
};
```

### **Cancel Subscription:**

**Request:**
```javascript
{
  "action": "cancel",
  "subscriptionId": "sub_stripe123",
  "reason": "No longer needed",
  "cancelAtPeriodEnd": true
}
```

**Response:**
```javascript
{
  "success": true,
  "message": "Subscription will be cancelled at the end of the current period",
  "subscription": {
    "id": "sub_stripe123",
    "status": "active",
    "cancel_at_period_end": true,
    "current_period_end": 1675209600
  }
}
```

### **Pause/Resume Subscription:**

**Pause Request:**
```javascript
{
  "action": "pause",
  "subscriptionId": "sub_stripe123",
  "reason": "Temporary break"
}
```

**Resume Request:**
```javascript
{
  "action": "resume",
  "subscriptionId": "sub_stripe123"
}
```

### **Update Payment Method:**

**Request:**
```javascript
{
  "action": "update_payment",
  "subscriptionId": "sub_stripe123"
}
```

**Response:**
```javascript
{
  "success": true,
  "message": "Payment update portal created",
  "portalUrl": "https://billing.stripe.com/session/..."
}
```

### **Complete Implementation Example:**
```javascript
const manageSubscription = async (action, subscriptionId, options = {}) => {
  try {
    const requestBody = {
      action,
      subscriptionId,
      ...options
    };
    
    const response = await fetch('/api/mobile/memberships/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    const result = await response.json();
    if (result.success) {
      Alert.alert('Success', result.message);
      
      // Handle specific actions
      if (action === 'update_payment' && result.portalUrl) {
        Linking.openURL(result.portalUrl);
      }
      
      return result;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    Alert.alert('Error', `Failed to ${action} subscription`);
    throw error;
  }
};

// Usage examples
await manageSubscription('cancel', 'sub_123', { 
  reason: 'No longer needed', 
  cancelAtPeriodEnd: true 
});

await manageSubscription('pause', 'sub_123', { 
  reason: 'Temporary break' 
});

await manageSubscription('resume', 'sub_123');

await manageSubscription('update_payment', 'sub_123');
```

---

## 4. 📊 Usage Analytics

### **Endpoint:** `GET /api/mobile/memberships/usage`

**Purpose:** Get detailed usage analytics and trends for memberships.

### **Query Parameters:**
```javascript
{
  period?: "current" | "all", // default: "current"
  categoryId?: string,
  startDate?: string,
  endDate?: string
}
```

### **Response Structure:**
```javascript
{
  "success": true,
  "usage": [
    {
      "membershipId": "membership123",
      "membershipName": "Premium Wellness",
      "membershipTier": "premium",
      "status": "active",
      
      "currentPeriod": {
        "start": "2024-01-01T00:00:00.000Z",
        "end": "2024-01-31T23:59:59.999Z",
        "resetDate": "2024-02-01T00:00:00.000Z",
        "daysRemaining": 16
      },
      
      "categoryUsage": [
        {
          "categoryId": "cat123",
          "categoryName": "Organic Juices",
          "allocated": 5,
          "used": 3,
          "available": 2,
          "usagePercentage": 60,
          "lastUsed": "2024-01-15T10:30:00.000Z",
          "status": "medium" // low, medium, high, exhausted
        }
      ],
      
      "overallStats": {
        "totalCategories": 3,
        "categoriesWithUsage": 2,
        "totalAllocated": 15,
        "totalUsed": 8,
        "totalRemaining": 7,
        "averageUsagePercentage": 53
      },
      
      "trends": {
        "highUsageCategories": ["Herbal Teas"],
        "unutilizedCategories": ["Supplements"],
        "mostUsedCategory": "Organic Juices"
      }
    }
  ],
  "summary": {
    "totalMemberships": 1,
    "activeMemberships": 1,
    "totalCategoriesTracked": 3,
    "overallUsagePercentage": 53
  }
}
```

### **Implementation Example:**
```javascript
const getUsageAnalytics = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`/api/mobile/memberships/usage?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
    });
    
    const data = await response.json();
    if (data.success) {
      return data.usage;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Failed to fetch usage analytics:', error);
    throw error;
  }
};

// Usage examples
const currentUsage = await getUsageAnalytics({ period: 'current' });
const categoryUsage = await getUsageAnalytics({ categoryId: 'cat123' });
```

---

## 5. 📈 Product Usage Tracking

### **Endpoint:** `POST /api/mobile/memberships/usage`

**Purpose:** Track product consumption against membership allocations when orders are completed.

### **Request Structure:**
```javascript
{
  "orderNumber": "NV-000123",
  "items": [
    {
      "productId": "prod123",
      "productName": "Organic Green Juice",
      "categoryId": "cat123",
      "categoryName": "Organic Juices",
      "quantity": 2
    }
  ]
}
```

### **Response Structure:**
```javascript
{
  "success": true,
  "message": "Product usage tracked successfully",
  "orderNumber": "NV-000123",
  "usageUpdates": [
    {
      "categoryId": "cat123",
      "categoryName": "Organic Juices",
      "productName": "Organic Green Juice",
      "quantityUsed": 2,
      "previousUsed": 1,
      "newUsed": 3,
      "remainingAllocation": 2
    }
  ],
  "membershipStats": {
    "totalCategories": 3,
    "categoriesWithUsage": 2,
    "totalAllocated": 15,
    "totalUsed": 8,
    "totalRemaining": 7,
    "usagePercentage": 53
  },
  "currentPeriod": {
    "start": "2024-01-01T00:00:00.000Z",
    "end": "2024-01-31T23:59:59.999Z",
    "resetDate": "2024-02-01T00:00:00.000Z"
  }
}
```

### **Implementation Example:**
```javascript
const trackProductUsage = async (orderNumber, orderItems) => {
  try {
    const items = orderItems.map(item => ({
      productId: item.productId,
      productName: item.name,
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      quantity: item.quantity,
    }));
    
    const response = await fetch('/api/mobile/memberships/usage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderNumber,
        items,
      }),
    });
    
    const result = await response.json();
    if (result.success) {
      // Show usage update notification
      showUsageUpdateNotification(result.usageUpdates);
      return result;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Failed to track usage:', error);
    // Don't throw error here as it's not critical to order completion
  }
};

// Usage update notification
const showUsageUpdateNotification = (updates) => {
  const totalUsed = updates.reduce((sum, update) => sum + update.quantityUsed, 0);
  const message = `Used ${totalUsed} items from your membership allocation`;
  
  // Show toast or push notification
  ToastAndroid.show(message, ToastAndroid.SHORT);
};
```

---

## 🎨 Mobile UI Implementation Guide

### **📱 Membership Dashboard Screen:**

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';

const MembershipDashboard = () => {
  const [memberships, setMemberships] = useState([]);
  const [usageAnalytics, setUsageAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const loadData = async () => {
    try {
      const [membershipData, usageData] = await Promise.all([
        getMemberships({ status: 'active' }),
        getUsageAnalytics({ period: 'current' })
      ]);
      
      setMemberships(membershipData);
      setUsageAnalytics(usageData[0]); // Current active membership
    } catch (error) {
      Alert.alert('Error', 'Failed to load membership data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {memberships.map(membership => (
        <MembershipCard key={membership._id} membership={membership} />
      ))}
      
      {usageAnalytics && (
        <UsageAnalyticsCard usage={usageAnalytics} />
      )}
    </ScrollView>
  );
};
```

### **📊 Usage Progress Components:**

```javascript
const UsageProgressBar = ({ usage }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'low': return '#10b981';      // Green
      case 'medium': return '#f59e0b';   // Orange  
      case 'high': return '#ef4444';     // Red
      case 'exhausted': return '#6b7280'; // Gray
      default: return '#10b981';
    }
  };
  
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.categoryName}>{usage.categoryName}</Text>
        <Text style={styles.usageText}>
          {usage.used}/{usage.allocated}
        </Text>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar,
            { 
              width: `${usage.usagePercentage}%`,
              backgroundColor: getStatusColor(usage.status)
            }
          ]}
        />
      </View>
      
      <Text style={styles.remainingText}>
        {usage.available} remaining
      </Text>
    </View>
  );
};

const UsageAnalyticsCard = ({ usage }) => (
  <View style={styles.analyticsCard}>
    <Text style={styles.cardTitle}>Usage Analytics</Text>
    
    <View style={styles.statsRow}>
      <StatItem 
        label="Overall Usage" 
        value={`${usage.overallStats.averageUsagePercentage}%`}
      />
      <StatItem 
        label="Categories Used" 
        value={`${usage.overallStats.categoriesWithUsage}/${usage.overallStats.totalCategories}`}
      />
    </View>
    
    <View style={styles.categoryUsageList}>
      {usage.categoryUsage.map((category, index) => (
        <UsageProgressBar key={index} usage={category} />
      ))}
    </View>
    
    {usage.trends.highUsageCategories.length > 0 && (
      <View style={styles.trendsSection}>
        <Text style={styles.trendsTitle}>High Usage Alert</Text>
        <Text style={styles.trendsText}>
          {usage.trends.highUsageCategories.join(', ')} running low
        </Text>
      </View>
    )}
  </View>
);
```

### **💳 Subscription Management UI:**

```javascript
const SubscriptionManagementScreen = ({ membership }) => {
  const [loading, setLoading] = useState(false);
  
  const handleCancelSubscription = () => {
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your subscription? It will remain active until the end of your current billing period.",
      [
        { text: "Keep Subscription", style: "cancel" },
        { 
          text: "Cancel", 
          style: "destructive",
          onPress: () => cancelSubscription()
        }
      ]
    );
  };
  
  const cancelSubscription = async () => {
    setLoading(true);
    try {
      await manageSubscription('cancel', membership.subscriptionId, {
        reason: 'User requested cancellation',
        cancelAtPeriodEnd: true
      });
      
      // Navigate back or refresh data
      navigation.goBack();
    } catch (error) {
      // Error is already handled in manageSubscription
    } finally {
      setLoading(false);
    }
  };
  
  const handlePauseSubscription = async () => {
    setLoading(true);
    try {
      await manageSubscription('pause', membership.subscriptionId, {
        reason: 'Temporary pause requested by user'
      });
      
      // Refresh membership data
      onRefresh();
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdatePayment = async () => {
    try {
      await manageSubscription('update_payment', membership.subscriptionId);
      // Opens Stripe billing portal automatically
    } catch (error) {
      // Error handling
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <MembershipSummaryCard membership={membership} />
      
      <View style={styles.actionsSection}>
        <ActionButton
          title="Update Payment Method"
          onPress={handleUpdatePayment}
          icon="credit-card"
          loading={loading}
        />
        
        <ActionButton
          title="Pause Subscription"
          onPress={handlePauseSubscription}
          icon="pause"
          loading={loading}
        />
        
        <ActionButton
          title="Cancel Subscription"
          onPress={handleCancelSubscription}
          icon="x-circle"
          variant="destructive"
          loading={loading}
        />
      </View>
    </ScrollView>
  );
};
```

### **📈 Automatic Usage Tracking Integration:**

```javascript
// Integrate with your order completion flow
const completeOrder = async (orderData) => {
  try {
    // Complete the order first
    const order = await processOrder(orderData);
    
    // Then track usage automatically if user has active membership
    if (order.success && userHasMembership) {
      trackProductUsage(order.orderNumber, order.items);
    }
    
    return order;
  } catch (error) {
    console.error('Order completion error:', error);
    throw error;
  }
};

// Show usage notifications
const showUsageNotification = (usageUpdates) => {
  const totalUsed = usageUpdates.reduce((sum, update) => sum + update.quantityUsed, 0);
  
  // Create local notification
  const notification = {
    title: 'Membership Usage Updated',
    body: `${totalUsed} items deducted from your membership allocation`,
    data: { usageUpdates }
  };
  
  // Show notification
  LocalNotification.show(notification);
  
  // Update badge count or UI indicators
  updateMembershipBadge();
};
```

## 🎯 Key Implementation Tips

### **📊 State Management:**
- Store membership data in global state (Redux/Context)
- Cache usage analytics locally with refresh capability
- Sync membership status across app screens

### **🔄 Real-time Updates:**
- Refresh membership data after subscription changes
- Auto-track usage when orders are completed
- Show real-time usage updates in UI

### **📱 Mobile UX Best Practices:**
- Use visual progress indicators for usage tracking
- Implement pull-to-refresh for data updates
- Show loading states during API calls
- Cache data for offline viewing
- Use push notifications for important updates

### **🎨 Visual Design:**
- Use membership tier colors for branding
- Implement usage progress bars with color coding
- Show status badges for membership states
- Create interactive charts for analytics

### **⚠️ Error Handling:**
- Gracefully handle network errors
- Show user-friendly error messages
- Implement retry mechanisms for failed requests
- Don't block UI for non-critical operations (like usage tracking)

---

## 📋 Testing Checklist

- [ ] Load user memberships successfully
- [ ] Display usage analytics with correct calculations
- [ ] Create new subscription and handle checkout flow
- [ ] Cancel subscription with proper confirmation
- [ ] Pause and resume subscription functionality
- [ ] Update payment method via Stripe portal
- [ ] Track product usage after order completion
- [ ] Handle edge cases (no membership, expired tokens, etc.)
- [ ] Test offline scenarios and data caching
- [ ] Verify push notifications for usage updates

This comprehensive guide should provide everything needed to implement the membership and subscription functionality in your mobile application. The APIs are designed to be mobile-first with optimized data structures and error handling.