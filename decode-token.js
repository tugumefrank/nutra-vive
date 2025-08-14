#!/usr/bin/env node

// Decode JWT token to see what's inside
const fs = require('fs');

// Manually load environment variables
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

function decodeJWT(token) {
  try {
    // JWT has 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    // Decode the payload (middle part)
    const payload = parts[1];
    // Add padding if needed
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decoded = Buffer.from(paddedPayload, 'base64').toString('utf8');
    
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

async function getTokenAndDecode() {
  try {
    const oauthUrl = `${USPS_BASE_URL}/oauth2/v3/token`;
    const requestBody = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: "addresses prices", // Request both
    });

    console.log('🚀 Getting token and decoding JWT payload...');

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
      return;
    }

    const data = JSON.parse(responseText);
    console.log('✅ OAuth successful');
    console.log('📄 Response data:', {
      scope: data.scope,
      application_name: data.application_name,
      api_products: data.api_products
    });

    // Decode the JWT
    const decodedPayload = decodeJWT(data.access_token);
    if (decodedPayload) {
      console.log('\n🔍 JWT Token Payload:');
      console.log('  Audience (aud):', decodedPayload.aud);
      console.log('  Scope:', decodedPayload.scope);
      console.log('  Azp (client_id):', decodedPayload.azp);
      console.log('  Entitlements:', decodedPayload.entitlements);
      console.log('  Roles:', decodedPayload.roles);
      console.log('  Contracts:', decodedPayload.contracts);
      console.log('  Payment accounts:', decodedPayload.payment_accounts);
      console.log('  Mail owners:', decodedPayload.mail_owners);
      console.log('  Company name:', decodedPayload.company_name);
      console.log('  Issuer:', decodedPayload.iss);
      console.log('  Expires:', new Date(decodedPayload.exp * 1000).toISOString());
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getTokenAndDecode();