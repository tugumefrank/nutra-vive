#!/usr/bin/env node

// Test with just "prices" scope
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...valueParts] = line.split('=');
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const CLIENT_ID = envVars.USPS_CLIENT_ID;
const CLIENT_SECRET = envVars.USPS_CLIENT_SECRET;
const USPS_BASE_URL = "https://apis-tem.usps.com";

async function testPricesScope() {
  try {
    const oauthUrl = `${USPS_BASE_URL}/oauth2/v3/token`;
    const requestBody = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: "prices", // Only prices scope as per documentation
    });

    console.log('🚀 Testing with ONLY "prices" scope...');

    const response = await fetch(oauthUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent": "NutraVive-Shipping/1.0",
      },
      body: requestBody.toString(),
    });

    const responseText = await response.text();
    console.log('📥 OAuth Response:', {
      status: response.status,
      response: responseText.substring(0, 200) + "..."
    });

    if (!response.ok) {
      console.error('❌ OAuth failed with prices scope only');
      console.log('Full response:', responseText);
      return;
    }

    const data = JSON.parse(responseText);
    console.log('✅ OAuth successful with prices scope:', {
      scope: data.scope,
      api_products: data.api_products
    });

    // If we get here, try the pricing API
    if (data.access_token) {
      await testPricingAPI(data.access_token);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function testPricingAPI(token) {
  try {
    const requestBody = {
      originZIPCode: "07102",
      destinationZIPCode: "10001", 
      weight: 2.5,
      length: 8,
      width: 6,
      height: 4,
      mailClass: "USPS_GROUND_ADVANTAGE",
      processingCategory: "MACHINABLE",
      rateIndicator: "DR",
      destinationEntryFacilityType: "NONE",
      priceType: "COMMERCIAL",
      mailingDate: new Date().toISOString().split('T')[0],
      hasNonstandardCharacteristics: false,
      accountType: "EPS", // Add EPS account type
    };

    console.log('\n🚚 Testing pricing API with EPS account type...');

    const response = await fetch(`${USPS_BASE_URL}/prices/v3/base-rates/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "NutraVive-Shipping/1.0",
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('📦 Pricing API Response:', {
      status: response.status,
      response: responseText.substring(0, 300)
    });

    if (response.ok) {
      const result = JSON.parse(responseText);
      console.log('🎉 SUCCESS! Price:', result.totalBasePrice);
    } else {
      console.error('❌ Pricing API still failed');
    }
  } catch (error) {
    console.error('❌ Pricing API error:', error);
  }
}

testPricesScope();