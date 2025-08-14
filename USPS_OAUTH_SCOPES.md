# USPS OAuth Scopes - Correct Implementation

## ✅ Fixed OAuth Scope Configuration

Based on USPS documentation, each API endpoint requires specific OAuth scopes:

### **Address Validation API**
- **Endpoint**: `/addresses/v3/address`
- **Required Scope**: `"addresses"`
- **File**: `app/checkout/utils/usps-api.ts`
- **Usage**: Address validation and standardization

```javascript
// Address validation OAuth request
{
  grant_type: "client_credentials",
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  scope: "addresses"  // Only addresses scope
}
```

### **Pricing API**  
- **Endpoint**: `/prices/v3/base-rates/search`
- **Required Scope**: `"prices"`
- **File**: `lib/actions/shipping-actions.ts`
- **Usage**: Shipping cost calculation

```javascript
// Pricing API OAuth request
{
  grant_type: "client_credentials", 
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  scope: "prices"  // Only prices scope
}
```

## Previous Error Analysis

**❌ What was wrong:**
- Trying to use `"addresses prices"` (multiple scopes)
- USPS APIs require specific single scopes
- Token caching was using wrong scope for pricing API

**✅ What's fixed:**
- Address validation: `scope: "addresses"`
- Pricing API: `scope: "prices"`  
- Each API gets its own properly scoped OAuth token

## Expected Flow

1. **User enters ZIP** → Address validation API called
2. **Address validated** → Gets token with `"addresses"` scope
3. **Shipping calculated** → Pricing API gets NEW token with `"prices"` scope
4. **Real shipping cost** → Displayed and added to cart

## Test Commands

```bash
# Test the fixed implementation
node test-usps-shipping.js
```

Should now show:
```
✅ OAuth successful, token received (prices scope)
✅ Shipping calculation successful!
💰 Shipping cost: 6.25
```