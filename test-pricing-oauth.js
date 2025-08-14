#!/usr/bin/env node

// Test USPS Pricing API OAuth separately
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
const USPS_BASE_URL = process.env.NODE_ENV === "production" 
  ? "https://api.usps.com" 
  : "https://apis-tem.usps.com";

console.log('🔧 Testing USPS Pricing OAuth...');
console.log('Environment:', {
  hasClientId: !!CLIENT_ID,
  hasClientSecret: !!CLIENT_SECRET,
  clientIdLength: CLIENT_ID?.length,
  baseUrl: USPS_BASE_URL,
  nodeEnv: process.env.NODE_ENV
});

async function testPricingOAuth() {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error("USPS credentials not configured. Check USPS_CLIENT_ID and USPS_CLIENT_SECRET environment variables.");
    }

    const oauthUrl = `${USPS_BASE_URL}/oauth2/v3/token`;
    const requestBody = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: "addresses prices", // Try both scopes - addresses works
    });

    console.log('🚀 Making OAuth request to:', oauthUrl);
    console.log('🚀 Request body:', requestBody.toString());

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
      statusText: response.statusText,
      contentType: response.headers.get("content-type"),
      response: responseText
    });

    if (!response.ok) {
      console.error('❌ USPS OAuth failed:', response.status, responseText);
      return null;
    }

    const data = JSON.parse(responseText);
    console.log('✅ USPS OAuth successful:', {
      hasAccessToken: !!data.access_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
      scope: data.scope
    });
    
    return data.access_token;
  } catch (error) {
    console.error('❌ OAuth test failed:', error);
    return null;
  }
}

async function testPricingAPI(token) {
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

    console.log('🚚 Testing pricing API with request:', requestBody);

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
      response: responseText.substring(0, 500)
    });

    if (response.ok) {
      const result = JSON.parse(responseText);
      console.log('✅ Pricing API successful! Price:', result.totalBasePrice);
      return true;
    } else {
      console.error('❌ Pricing API failed:', response.status, responseText);
      return false;
    }
  } catch (error) {
    console.error('❌ Pricing API test failed:', error);
    return false;
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('USPS PRICING API OAUTH TEST');
  console.log('='.repeat(50));
  
  const token = await testPricingOAuth();
  
  if (token) {
    console.log('\n' + '='.repeat(50));
    console.log('TESTING PRICING API WITH TOKEN');
    console.log('='.repeat(50));
    
    await testPricingAPI(token);
  }
}

main().catch(console.error);