#!/usr/bin/env node

// Test if pricing API can work with addresses scope token
const fs = require('fs');

// Manually load environment variables from .env file
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

async function getAddressToken() {
  try {
    const oauthUrl = `${USPS_BASE_URL}/oauth2/v3/token`;
    const requestBody = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: "addresses", // Use the scope that works
    });

    console.log('🚀 Getting token with "addresses" scope that we know works...');

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
    
    if (!response.ok) {
      console.error('❌ OAuth failed:', response.status, responseText);
      return null;
    }

    const data = JSON.parse(responseText);
    console.log('✅ OAuth successful with addresses scope:', {
      hasAccessToken: !!data.access_token,
      scope: data.scope
    });
    
    return data.access_token;
  } catch (error) {
    console.error('❌ OAuth failed:', error);
    return null;
  }
}

async function testPricingWithAddressToken(token) {
  try {
    const requestBody = {
      originZIPCode: "07102", // Newark, NJ
      destinationZIPCode: "10001", // NYC
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
    };

    console.log('🚚 Testing pricing API with "addresses" scope token...');

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
      console.log('🎉 SUCCESS! Pricing API works with addresses token! Price:', result.totalBasePrice);
      return true;
    } else {
      console.error('❌ Still failed with addresses token');
      return false;
    }
  } catch (error) {
    console.error('❌ Pricing API test failed:', error);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('TESTING PRICING API WITH "ADDRESSES" SCOPE TOKEN');
  console.log('='.repeat(60));
  
  const token = await getAddressToken();
  
  if (token) {
    await testPricingWithAddressToken(token);
  }
}

main().catch(console.error);