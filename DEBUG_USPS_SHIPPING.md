# USPS Shipping Debug Guide

## Issue Analysis

You're getting "cannot calculate the price" errors. This could be caused by several issues:

### 1. **Environment Variables Missing**
Check if these are set in your `.env.local`:
```bash
USPS_CLIENT_ID=your_client_id
USPS_CLIENT_SECRET=your_client_secret
```

### 2. **USPS API Scope Issues** 
The shipping calculation needs both `addresses` and `prices` scopes.

### 3. **API Request Format Issues**
USPS is picky about request format.

## Debug Steps

### Step 1: Check Browser Console
When you trigger address validation, check browser console for:
```
🔧 USPS OAuth Debug: { hasClientId: true, hasClientSecret: true, ... }
🚚 Calculating shipping for ZIP: 12345
📦 Shipping calculation request: { itemCount: 1, destinationZIP: "12345", totalBottles: 1 }
📦 USPS API result: { success: false, error: "..." }
```

### Step 2: Check Network Tab
Look for:
- `oauth2/v3/token` request (should return 200)
- `prices/v3/base-rates/search` request (should return 200)

### Step 3: Common Error Messages

**"USPS credentials not configured"**
→ Missing environment variables

**"USPS OAuth failed: 401"** 
→ Invalid credentials

**"USPS Pricing API failed: 400"**
→ Invalid request format (weight, dimensions, ZIP codes)

**"USPS Pricing API failed: 403"**
→ Missing pricing scope in OAuth token

## Quick Test

Try this test ZIP code: `10001` (New York)
- Should calculate shipping from Newark, NJ (07102) to New York (10001)
- Expected cost: ~$5-8 for 1 bottle

## Expected Console Output (Success)
```
🔧 USPS OAuth Debug: { hasClientId: true, hasClientSecret: true, clientIdLength: 36, baseUrl: "https://apis-tem.usps.com", nodeEnv: "development" }
🚀 Making OAuth request to: https://apis-tem.usps.com/oauth2/v3/token
✅ OAuth successful, token expires in: 3600 seconds
🚚 Calculating shipping for ZIP: 10001
📦 Shipping calculation request: { itemCount: 1, destinationZIP: "10001", totalBottles: 1 }
🚚 USPS Shipping Request: { originZIPCode: "07102", destinationZIPCode: "10001", weight: 1.5, length: 6, width: 4, height: 4, mailClass: "USPS_GROUND_ADVANTAGE", ... }
📦 USPS Shipping Response: { status: 200, response: '{"totalBasePrice":6.25,...}' }
✅ Shipping calculated and cart updated: 6.25
```

## Current Implementation Status

✅ **Fixed Hook Usage**: AddressStep now uses store directly instead of hooks  
✅ **Added OAuth Scopes**: Both "addresses" and "prices" scopes included  
✅ **Enhanced Logging**: Better error messages and debug info  
✅ **Dimension Conversion**: 8cm bottles converted to inches correctly  
✅ **Weight Calculation**: 1 lb per bottle + 0.5 lb packaging  

## Next Debug Steps

1. **Check Console Logs** - Look for the debug messages above
2. **Verify Environment Variables** - Ensure USPS credentials are set
3. **Test with Different ZIP** - Try multiple destination ZIP codes
4. **Check Network Requests** - Ensure API calls are actually being made