# USPS Shipping Implementation Guide

## ✅ CONFIGURED: Business Information

### 1. Business Address (CONFIGURED)
```javascript
// ✅ SET UP: Nutra-Vive business shipping address
BUSINESS_NAME: "Nutra-Vive"
BUSINESS_ADDRESS: "50 PARK PL, NEWARK, NJ 07102-4308"
BUSINESS_ZIP_CODE: "07102"  // Used for USPS origin ZIP

// Environment Variable (optional - defaults to 07102):
USPS_BUSINESS_ORIGIN_ZIP="07102"

// OPTIONAL: USPS Business Account (for better rates)
USPS_ACCOUNT_TYPE: "EPS" | "PERMIT" | "METER"
USPS_ACCOUNT_NUMBER: "Your account number"
```

### 2. ✅ CONFIGURED: Product Specifications

**Bottle Specifications (CONFIGURED):**
```javascript
// ✅ SET UP: Juice bottle specifications  
{
  weight: 1.0,        // 1 lb per bottle (as specified)
  
  // Bottle dimensions (converted to inches for USPS)
  dimensions: {
    length: 8,        // 8cm = ~3.15 inches
    width: 8,         // 8cm = ~3.15 inches  
    height: 8,        // 8cm = ~3.15 inches
  },
  
  // Packaging
  packagingWeight: 0.5,  // Additional 0.5 lb for packaging
  
  // Classification
  shippingCategory: "MACHINABLE",
  hasLiquidContents: true,     // Juice products
  isFragile: false,            // Assuming non-glass containers
}
```

### 3. Cart Calculation Requirements

```javascript
// Cart totals needed for shipping:
{
  items: [
    {
      productId: "...",
      quantity: 2,
      weight: 2.5,      // Individual product weight
      dimensions: {...}, // Product shipping dimensions
    }
  ],
  
  // Calculated totals:
  totalWeight: 5.2,     // Sum of all items + packaging
  packageDimensions: {  // Combined package size
    length: 12,
    width: 8, 
    height: 6,
  },
  
  destinationZIP: "12345", // Customer's validated ZIP
}
```

## USPS API Integration Details

### API Endpoint
```
POST https://apis.usps.com/prices/v3/base-rates/search
Authorization: Bearer {your_oauth_token}
Content-Type: application/json
```

### Request Parameters
```javascript
{
  // ADDRESSES
  "originZIPCode": "YOUR_BUSINESS_ZIP",    // Your warehouse ZIP
  "destinationZIPCode": "CUSTOMER_ZIP",    // Customer's validated ZIP
  
  // PACKAGE DETAILS (calculated from cart)
  "weight": 5.2,          // Total weight in POUNDS
  "length": 12,           // Package length in INCHES
  "width": 8,             // Package width in INCHES
  "height": 6,            // Package height in INCHES
  
  // SERVICE OPTIONS
  "mailClass": "USPS_GROUND_ADVANTAGE",   // Recommended for e-commerce
  "processingCategory": "MACHINABLE",      // Standard packages
  "rateIndicator": "DR",                   // Dimensional Rectangular
  "destinationEntryFacilityType": "NONE", // Standard delivery
  "priceType": "COMMERCIAL",               // Better rates than RETAIL
  
  // OPTIONAL
  "mailingDate": "2025-01-31",            // YYYY-MM-DD format
  "accountType": "EPS",                    // If you have business account
  "accountNumber": "1234567890",           // Your account number
  "hasNonstandardCharacteristics": false  // Special handling required
}
```

### Response Format
```javascript
{
  "totalBasePrice": 8.99,    // Use this as shipping cost
  "rates": [
    {
      "mailClass": "USPS_GROUND_ADVANTAGE",
      "price": 8.99,
      "zone": "3",
      "deliveryDays": "2-5",
      // ... other details
    }
  ]
}
```

## Mail Class Options (Choose Based on Business Needs)

### Recommended Options
```javascript
"USPS_GROUND_ADVANTAGE"     // Best value: 2-5 business days
"PRIORITY_MAIL"             // Faster: 1-3 business days  
"PRIORITY_MAIL_EXPRESS"     // Premium: 1-2 business days
```

### Budget Options
```javascript
"PARCEL_SELECT"            // Cheapest: 2-8 business days
"MEDIA_MAIL"               // Books/educational only: 2-8 days
```

## Environment Variables Needed

```bash
# Add to your .env file:
USPS_BUSINESS_ORIGIN_ZIP=12345
USPS_DEFAULT_MAIL_CLASS=USPS_GROUND_ADVANTAGE
USPS_PRICE_TYPE=COMMERCIAL

# Optional (for better rates):
USPS_ACCOUNT_TYPE=EPS
USPS_ACCOUNT_NUMBER=1234567890
```

## Package Dimension Calculation Logic

### Single Item
```javascript
// Use product's shipping dimensions directly
dimensions = product.shipping
```

### Multiple Items
```javascript
// Combine dimensions intelligently:
totalWeight = sum(item.weight * quantity) + packagingWeight
length = max(item.shipping.length) // Longest item
width = max(item.shipping.width)   // Widest when packed
height = sum(item.shipping.height) // Stack items if possible
```

## Error Handling Requirements

```javascript
// Handle these scenarios:
- USPS API unavailable → Show estimated shipping
- Invalid ZIP code → Require address validation first  
- Oversized package → Show special handling message
- Rate not available → Offer alternative mail classes
```

## Testing Data

### Test Addresses
```javascript
// Use for development:
originZIPCode: "22407"      // USPS test origin
destinationZIPCode: "63118" // USPS test destination
weight: 5                   // Test weight in pounds
length: 12, width: 8, height: 6 // Test dimensions
```

## Integration Checklist

- [ ] Add shipping fields to product schema
- [ ] Update cart store to calculate shipping totals
- [ ] Create USPS pricing server action
- [ ] Remove shipping from cart drawer
- [ ] Add "Shipping calculated at checkout" message
- [ ] Update order summary to show shipping after validation
- [ ] Add business ZIP to environment variables
- [ ] Measure actual product packaging dimensions
- [ ] Test with real USPS account (if available)
- [ ] Handle multiple mail class options
- [ ] Add shipping cost to final order total