# USPS Shipping Calculation Test

## ✅ Configured Specifications

### Business Origin
- **Address**: 50 PARK PL, NEWARK, NJ 07102-4308  
- **ZIP**: 07102

### Product Specifications  
- **Weight**: 1.0 lb per bottle
- **Dimensions**: 8cm x 8cm x 8cm (3.15" x 3.15" x 3.15")
- **Packaging**: +0.5 lb base packaging weight

## Example Calculations

### Single Bottle Order
```javascript
Items: 1 bottle
Total Weight: 1.0 lb + 0.5 lb packaging = 1.5 lbs
Package Dimensions: 3.15" x 3.15" x 3.15" (meets USPS minimums)

// USPS API Request to: https://apis-tem.usps.com/prices/v3/base-rates/search
{
  "originZIPCode": "07102",
  "destinationZIPCode": "CUSTOMER_ZIP", 
  "weight": 1.5,
  "length": 6,    // USPS minimum (larger than bottle)
  "width": 4,     // USPS minimum (larger than bottle)  
  "height": 4,    // USPS minimum (larger than bottle)
  "mailClass": "USPS_GROUND_ADVANTAGE",
  "processingCategory": "MACHINABLE",
  "priceType": "COMMERCIAL"
}
```

### Multiple Bottle Order (3 bottles)
```javascript
Items: 3 bottles
Total Weight: 3.0 lbs + 0.5 lb packaging = 3.5 lbs
Package Dimensions: 3.15" x 3.15" x 9.45" (stacked vertically)

// USPS API Request
{
  "originZIPCode": "07102",
  "destinationZIPCode": "CUSTOMER_ZIP",
  "weight": 3.5, 
  "length": 6,    // USPS minimum
  "width": 4,     // USPS minimum
  "height": 9.45, // 3 bottles stacked (3.15" x 3)
  "mailClass": "USPS_GROUND_ADVANTAGE",
  "processingCategory": "MACHINABLE",
  "priceType": "COMMERCIAL"
}
```

## Expected Shipping Costs

**From Newark, NJ (07102) using USPS Ground Advantage:**

- **Local NJ/NY**: ~$4-6
- **Regional (PA, CT, DE)**: ~$5-8  
- **National Average**: ~$7-12
- **Coast to Coast**: ~$9-15

*Actual costs depend on exact destination ZIP and current USPS rates*

## Integration Status

✅ **Cart Store**: Updated with 1 lb weight, 8x8x8cm dimensions  
✅ **Shipping Actions**: Converts cm to inches, uses Newark origin  
✅ **Address Validation**: Triggers USPS shipping calculation  
✅ **Order Totals**: Uses real USPS costs throughout checkout  

## Next Steps for Testing

1. **Test Address Validation** with real ZIP codes
2. **Verify Shipping Costs** match USPS website calculator
3. **Test Multiple Quantities** (2-5 bottles)
4. **Test Different Destinations** (local vs. cross-country)