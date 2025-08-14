// Simple test script to verify USPS shipping API
// Run with: node test-usps-shipping.js

async function testUSPSShipping() {
  console.log('🧪 Testing USPS Shipping API...');
  
  // Check environment variables
  const CLIENT_ID = process.env.USPS_CLIENT_ID;
  const CLIENT_SECRET = process.env.USPS_CLIENT_SECRET;
  
  console.log('🔧 Environment Check:', {
    hasClientId: !!CLIENT_ID,
    hasClientSecret: !!CLIENT_SECRET,
    clientIdLength: CLIENT_ID?.length,
    nodeEnv: process.env.NODE_ENV
  });
  
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Missing USPS credentials');
    console.log('Add these to your .env.local file:');
    console.log('USPS_CLIENT_ID=your_client_id');
    console.log('USPS_CLIENT_SECRET=your_client_secret');
    return;
  }
  
  try {
    // Step 1: Get OAuth token
    console.log('🚀 Step 1: Getting USPS OAuth token...');
    
    const USPS_BASE_URL = "https://apis-tem.usps.com"; // Test environment
    const oauthUrl = `${USPS_BASE_URL}/oauth2/v3/token`;
    
    const tokenResponse = await fetch(oauthUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent": "NutraVive-Test/1.0",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: "prices", // CRITICAL: Only 'prices' scope for pricing API
      }).toString(),
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ OAuth failed:', tokenResponse.status, errorText);
      return;
    }
    
    const tokenData = await tokenResponse.json();
    console.log('✅ OAuth successful, token received');
    
    // Step 2: Test shipping calculation
    console.log('🚀 Step 2: Testing shipping calculation...');
    
    const shippingRequest = {
      originZIPCode: "07102", // Newark, NJ
      destinationZIPCode: "10001", // New York, NY
      weight: 1.5, // 1 lb bottle + 0.5 lb packaging
      length: 6, // USPS minimum
      width: 4,  // USPS minimum
      height: 4, // USPS minimum
      mailClass: "USPS_GROUND_ADVANTAGE",
      processingCategory: "MACHINABLE",
      rateIndicator: "DR",
      destinationEntryFacilityType: "NONE",
      priceType: "COMMERCIAL",
      mailingDate: new Date().toISOString().split('T')[0],
      hasNonstandardCharacteristics: false,
    };
    
    console.log('📦 Shipping request:', shippingRequest);
    
    const shippingResponse = await fetch(`${USPS_BASE_URL}/prices/v3/base-rates/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "NutraVive-Test/1.0",
      },
      body: JSON.stringify(shippingRequest),
    });
    
    const shippingText = await shippingResponse.text();
    console.log('📦 Shipping response status:', shippingResponse.status);
    console.log('📦 Shipping response:', shippingText.substring(0, 500));
    
    if (shippingResponse.ok) {
      const shippingData = JSON.parse(shippingText);
      console.log('✅ Shipping calculation successful!');
      console.log('💰 Shipping cost:', shippingData.totalBasePrice);
    } else {
      console.error('❌ Shipping calculation failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  // Load environment variables if in development
  if (process.env.NODE_ENV !== 'production') {
    try {
      require('dotenv').config({ path: '.env.local' });
    } catch (e) {
      console.log('Note: Install dotenv to load .env.local automatically');
    }
  }
  
  testUSPSShipping();
}

module.exports = { testUSPSShipping };