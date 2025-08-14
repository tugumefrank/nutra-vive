// lib/usps-api.ts - Enhanced implementation for better address handling

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

// Use the Cloud USPS API URLs
const USPS_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.usps.com"
    : "https://apis-tem.usps.com";
const CLIENT_ID = process.env.USPS_CLIENT_ID; // Consumer Key from Cloud Portal
const CLIENT_SECRET = process.env.USPS_CLIENT_SECRET; // Consumer Secret from Cloud Portal

async function getAccessToken(): Promise<string> {
  // Force refresh token to ensure we have the new scope
  // Remove this line after first successful test
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log('🔄 Using cached USPS token with both scopes');
    return accessToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      "USPS credentials not configured. Please check USPS_CLIENT_ID and USPS_CLIENT_SECRET environment variables."
    );
  }

  console.log("🔧 USPS Cloud API Debug Info:", {
    hasClientId: !!CLIENT_ID,
    hasClientSecret: !!CLIENT_SECRET,
    clientIdLength: CLIENT_ID?.length,
    clientSecretLength: CLIENT_SECRET?.length,
    clientIdStart: CLIENT_ID?.substring(0, 8) + "...",
    baseUrl: USPS_BASE_URL,
  });

  try {
    const oauthUrl = `${USPS_BASE_URL}/oauth2/v3/token`;

    const requestBody = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: "addresses", // Only 'addresses' scope for address validation API
    });

    console.log("🚀 Making OAuth request to:", oauthUrl);

    const response = await fetch(oauthUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent": "NutraVive-Checkout/1.0",
      },
      body: requestBody.toString(),
    });

    console.log("📥 OAuth Response:", {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get("content-type"),
    });

    const responseText = await response.text();
    console.log("📥 Raw response:", responseText);

    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = JSON.parse(responseText);
      } catch {
        errorDetails = responseText;
      }

      console.error("❌ OAuth failed:", {
        status: response.status,
        statusText: response.statusText,
        errorDetails,
      });

      if (response.status === 401) {
        const errorMsg =
          typeof errorDetails === "object" && errorDetails.error_description
            ? errorDetails.error_description
            : "Invalid credentials";

        throw new Error(
          `Authentication failed: ${errorMsg}. Please verify your USPS Cloud Developer Portal credentials.`
        );
      }

      throw new Error(
        `OAuth failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorDetails)}`
      );
    }

    const data = JSON.parse(responseText);
    console.log("✅ OAuth success:", {
      hasAccessToken: !!data.access_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
      scope: data.scope,
    });

    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

    return accessToken;
  } catch (error) {
    console.error("❌ Error getting access token:", error);
    throw error;
  }
}

// Helper function to compare addresses and detect differences
function compareAddresses(original: any, standardized: any): string[] {
  const corrections: string[] = [];

  if (!original || !standardized) return corrections;

  // Compare street address
  if (
    original.streetAddress?.toLowerCase() !==
    standardized.streetAddress?.toLowerCase()
  ) {
    corrections.push(
      `Street address corrected from "${original.streetAddress}" to "${standardized.streetAddress}"`
    );
  }

  // Compare city
  if (original.city?.toLowerCase() !== standardized.city?.toLowerCase()) {
    corrections.push(
      `City corrected from "${original.city}" to "${standardized.city}"`
    );
  }

  // Compare ZIP code
  if (original.ZIPCode !== standardized.ZIPCode) {
    corrections.push(
      `ZIP code corrected from "${original.ZIPCode}" to "${standardized.ZIPCode}"`
    );
  }

  // Check if ZIPPlus4 was added
  if (!original.ZIPPlus4 && standardized.ZIPPlus4) {
    corrections.push(`ZIP+4 extension added: ${standardized.ZIPPlus4}`);
  }

  // Check for secondary address changes
  if (original.secondaryAddress !== standardized.secondaryAddress) {
    if (!original.secondaryAddress && standardized.secondaryAddress) {
      corrections.push(
        `Secondary address added: ${standardized.secondaryAddress}`
      );
    } else if (original.secondaryAddress && !standardized.secondaryAddress) {
      corrections.push(`Secondary address removed`);
    } else {
      corrections.push(
        `Secondary address corrected from "${original.secondaryAddress}" to "${standardized.secondaryAddress}"`
      );
    }
  }

  return corrections;
}

// Enhanced function to handle different validation scenarios
function processValidationResponse(
  responseData: any,
  originalAddress: any
): any {
  const result = {
    isValid: false,
    standardized: null,
    corrections: [],
    warnings: [],
    suggestions: [],
  };

  console.log(
    "🔍 Processing validation response:",
    JSON.stringify(responseData, null, 2)
  );

  // Check if we have USPS address data - this means validation was successful
  if (responseData.address) {
    const dpvConfirmation = responseData.additionalInfo?.DPVConfirmation;
    
    // DPV Confirmation codes:
    // Y = Yes, address is valid
    // D = Default address (valid but may need more info like apt number)
    // N = No, address not found
    result.standardized = { address: responseData.address };
    result.corrections = compareAddresses(
      originalAddress,
      responseData.address
    );

    // Consider both "Y" and "D" as valid addresses
    if (dpvConfirmation === "Y" || dpvConfirmation === "D") {
      result.isValid = true;
      
      if (dpvConfirmation === "D") {
        result.warnings.push("Default address - consider adding apartment/suite number if applicable");
      }
    } else if (dpvConfirmation === "N") {
      result.isValid = false;
      result.warnings.push("Address not found in USPS database");
    } else {
      // If we have address data but no clear DPV confirmation, still consider it valid
      result.isValid = true;
      result.warnings.push("Address validated with corrections");
    }

    // Add additional warnings
    if (responseData.additionalInfo?.vacant === "Y") {
      result.warnings.push("Address appears to be vacant");
    }

    if (responseData.additionalInfo?.business === "Y") {
      result.warnings.push("Address is identified as a business");
    }

    // Handle USPS correction codes
    if (responseData.corrections && Array.isArray(responseData.corrections)) {
      responseData.corrections.forEach((correction: any) => {
        if (correction.text) {
          result.warnings.push(correction.text);
        }
      });
    }

    console.log(`✅ Address validated with DPV: ${dpvConfirmation}, isValid: ${result.isValid}`);
    return result;
  }


  // Handle case where USPS returns suggestions or alternatives
  if (responseData.matches && Array.isArray(responseData.matches)) {
    result.suggestions = responseData.matches
      .filter((match) => match && match.address) // Filter out invalid matches
      .map((match) => ({
        address: match.address,
        confidence: match.confidence || "unknown",
      }));
    console.log("📋 Found address suggestions:", result.suggestions.length);
  }

  // Handle case where there's an error or no match
  if (responseData.error) {
    result.warnings.push(
      responseData.error.message || "Address validation error"
    );
  }

  // If we still don't have a valid result, the address couldn't be verified
  if (!result.isValid && result.suggestions.length === 0) {
    result.warnings.push("Address could not be verified by USPS");
    console.log("❌ Address validation failed - no matches found");
  }

  return result;
}

export async function validateUSPSAddress(addressData: any): Promise<any> {
  try {
    const token = await getAccessToken();

    const params = new URLSearchParams({
      streetAddress: addressData.streetAddress,
      state: addressData.state,
    });

    if (addressData.firm) params.append("firm", addressData.firm);
    if (addressData.secondaryAddress)
      params.append("secondaryAddress", addressData.secondaryAddress);
    if (addressData.city) params.append("city", addressData.city);
    if (addressData.urbanization)
      params.append("urbanization", addressData.urbanization);
    if (addressData.ZIPCode) params.append("ZIPCode", addressData.ZIPCode);
    if (addressData.ZIPPlus4) params.append("ZIPPlus4", addressData.ZIPPlus4);

    // Use the current Cloud API endpoint
    const endpoint = `${USPS_BASE_URL}/addresses/v3/address?${params}`;

    console.log("🔍 Validating address at:", endpoint);
    console.log("📤 Original address data:", addressData);

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "NutraVive-Checkout/1.0",
      },
    });

    const responseText = await response.text();
    console.log("📥 Address validation response:", {
      status: response.status,
      response: responseText.substring(0, 1000), // Log first 1000 chars
    });

    if (response.ok) {
      const responseData = JSON.parse(responseText);
      const processedResult = processValidationResponse(
        responseData,
        addressData
      );

      return {
        success: true,
        data: processedResult,
        isValid: processedResult.isValid,
        standardizedAddress: processedResult.standardized,
      };
    } else {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }

      console.error("❌ Address validation failed:", {
        status: response.status,
        error: errorData,
      });

      return {
        success: false,
        error:
          errorData.error?.message ||
          errorData.message ||
          `API Error: ${response.status}`,
        statusCode: response.status,
      };
    }
  } catch (error) {
    console.error("❌ Address validation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getCityStateByZip(zipCode: string): Promise<any> {
  try {
    const token = await getAccessToken();

    const endpoint = `${USPS_BASE_URL}/addresses/v3/city-state?ZIPCode=${zipCode}`;

    console.log("🔍 Looking up city-state:", endpoint);

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "NutraVive-Checkout/1.0",
      },
    });

    const responseText = await response.text();
    console.log("📥 City-state response:", {
      status: response.status,
      response: responseText,
    });

    if (response.ok) {
      const result = JSON.parse(responseText);
      return {
        success: true,
        data: result,
      };
    } else {
      const errorData = JSON.parse(responseText);
      return {
        success: false,
        error: errorData.error?.message || `API Error: ${response.status}`,
        statusCode: response.status,
      };
    }
  } catch (error) {
    console.error("❌ City/State lookup error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getZipCodeByAddress(addressData: any): Promise<any> {
  try {
    const token = await getAccessToken();

    const params = new URLSearchParams({
      streetAddress: addressData.streetAddress,
      city: addressData.city || "",
      state: addressData.state,
    });

    if (addressData.firm) params.append("firm", addressData.firm);
    if (addressData.secondaryAddress)
      params.append("secondaryAddress", addressData.secondaryAddress);

    const endpoint = `${USPS_BASE_URL}/addresses/v3/zipcode?${params}`;

    console.log("🔍 Looking up zipcode:", endpoint);

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "NutraVive-Checkout/1.0",
      },
    });

    const responseText = await response.text();
    console.log("📥 Zipcode response:", {
      status: response.status,
      response: responseText,
    });

    if (response.ok) {
      const result = JSON.parse(responseText);
      return {
        success: true,
        data: result,
      };
    } else {
      const errorData = JSON.parse(responseText);
      return {
        success: false,
        error: errorData.error?.message || `API Error: ${response.status}`,
        statusCode: response.status,
      };
    }
  } catch (error) {
    console.error("❌ ZIP code lookup error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Enhanced test function with better logging
export async function testUSPSConnection(): Promise<void> {
  console.log("🧪 Testing USPS Cloud API connection...");

  try {
    console.log("Step 1: Testing OAuth token...");
    const token = await getAccessToken();
    console.log("✅ Successfully obtained access token");

    console.log("Step 2: Testing address validation...");
    const testResult = await validateUSPSAddress({
      streetAddress: "1600 Pennsylvania Avenue NW",
      city: "Washington",
      state: "DC",
      ZIPCode: "20500",
    });

    console.log(
      "🧪 Test validation result:",
      JSON.stringify(testResult, null, 2)
    );

    if (testResult.success) {
      console.log("✅ Full USPS API integration test passed!");

      // Test the specific case from your example
      console.log("Step 3: Testing your specific address...");
      const specificTest = await validateUSPSAddress({
        streetAddress: "50 Park Place",
        city: "Newark",
        state: "NJ",
        ZIPCode: "10001",
      });

      console.log(
        "🧪 Specific test result:",
        JSON.stringify(specificTest, null, 2)
      );
    } else {
      console.log("❌ Address validation test failed:", testResult.error);
    }
  } catch (error) {
    console.error("❌ USPS connection test failed:", error);

    if (error.message.includes("Authentication failed")) {
      console.log("\n🔧 Troubleshooting steps:");
      console.log("1. Visit https://developer.usps.com/");
      console.log("2. Log in to your USPS Business Account");
      console.log("3. Create a new App in the Cloud Developer Portal");
      console.log("4. Copy the Consumer Key as USPS_CLIENT_ID");
      console.log("5. Copy the Consumer Secret as USPS_CLIENT_SECRET");
      console.log("6. Ensure your app has 'addresses' scope enabled");
    }
  }
}

// Helper function to format address for display
export function formatAddressString(address: any): string {
  if (!address) return "";

  const parts = [
    address.streetAddress,
    address.secondaryAddress,
    `${address.city}, ${address.state} ${address.ZIPCode}${address.ZIPPlus4 ? `-${address.ZIPPlus4}` : ""}`,
  ].filter(Boolean);

  return parts.join(", ");
}

// let accessToken: string | null = null;
// let tokenExpiry: number | null = null;

// const USPS_BASE_URL =
//   process.env.NODE_ENV === "production"
//     ? "https://api.usps.com"
//     : "https://apis-tem.usps.com";

// const CLIENT_ID = process.env.USPS_CLIENT_ID;
// const CLIENT_SECRET = process.env.USPS_CLIENT_SECRET;

// async function getAccessToken(): Promise<string> {
//   if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
//     return accessToken;
//   }

//   if (!CLIENT_ID || !CLIENT_SECRET) {
//     throw new Error("Missing USPS credentials.");
//   }

//   const oauthUrl = `${USPS_BASE_URL}/oauth2/v3/token`;
//   const requestBody = new URLSearchParams({
//     grant_type: "client_credentials",
//     client_id: CLIENT_ID,
//     client_secret: CLIENT_SECRET,
//     scope: "addresses",
//   });

//   const response = await fetch(oauthUrl, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//       Accept: "application/json",
//       "User-Agent": "NutraVive-Checkout/1.0",
//     },
//     body: requestBody.toString(),
//   });

//   const text = await response.text();
//   if (!response.ok) {
//     let errorJson;
//     try {
//       errorJson = JSON.parse(text);
//     } catch {
//       errorJson = { error: text };
//     }

//     throw new Error(
//       `OAuth failed: ${response.status} ${response.statusText} - ${
//         errorJson?.error_description || JSON.stringify(errorJson)
//       }`
//     );
//   }

//   const data = JSON.parse(text);
//   accessToken = data.access_token;
//   tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
//   return accessToken;
// }

// export async function validateUSPSAddress(addressData: any): Promise<any> {
//   try {
//     const token = await getAccessToken();

//     const params = new URLSearchParams({
//       streetAddress: addressData.streetAddress,
//       state: addressData.state,
//     });

//     if (addressData.firm) params.append("firm", addressData.firm);
//     if (addressData.secondaryAddress)
//       params.append("secondaryAddress", addressData.secondaryAddress);
//     if (addressData.city) params.append("city", addressData.city);
//     if (addressData.urbanization)
//       params.append("urbanization", addressData.urbanization);
//     if (addressData.ZIPCode) params.append("ZIPCode", addressData.ZIPCode);
//     if (addressData.ZIPPlus4) params.append("ZIPPlus4", addressData.ZIPPlus4);

//     const endpoint = `${USPS_BASE_URL}/addresses/v3/address?${params}`;

//     const response = await fetch(endpoint, {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//         Accept: "application/json",
//         "User-Agent": "NutraVive-Checkout/1.0",
//       },
//     });

//     const responseText = await response.text();

//     if (!response.ok) {
//       const errorData = JSON.parse(responseText);
//       return {
//         success: false,
//         error: errorData.error?.message || `API Error: ${response.status}`,
//         statusCode: response.status,
//       };
//     }

//     const result = JSON.parse(responseText);

//     return {
//       success: true,
//       data: result,
//       isValid: result.additionalInfo?.DPVConfirmation === "Y",
//       standardizedAddress: result.address || null,
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error occurred",
//     };
//   }
// }

// export async function getCityStateByZip(zipCode: string): Promise<any> {
//   try {
//     const token = await getAccessToken();

//     const endpoint = `${USPS_BASE_URL}/addresses/v3/city-state?ZIPCode=${zipCode}`;

//     const response = await fetch(endpoint, {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//         Accept: "application/json",
//         "User-Agent": "NutraVive-Checkout/1.0",
//       },
//     });

//     const text = await response.text();

//     if (!response.ok) {
//       const error = JSON.parse(text);
//       return {
//         success: false,
//         error: error.error?.message || `API Error: ${response.status}`,
//         statusCode: response.status,
//       };
//     }

//     return {
//       success: true,
//       data: JSON.parse(text),
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error occurred",
//     };
//   }
// }

// export async function getZipCodeByAddress(addressData: any): Promise<any> {
//   try {
//     const token = await getAccessToken();

//     const params = new URLSearchParams({
//       streetAddress: addressData.streetAddress,
//       city: addressData.city || "",
//       state: addressData.state,
//     });

//     if (addressData.firm) params.append("firm", addressData.firm);
//     if (addressData.secondaryAddress)
//       params.append("secondaryAddress", addressData.secondaryAddress);

//     const endpoint = `${USPS_BASE_URL}/addresses/v3/zipcode?${params}`;

//     const response = await fetch(endpoint, {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//         Accept: "application/json",
//         "User-Agent": "NutraVive-Checkout/1.0",
//       },
//     });

//     const text = await response.text();

//     if (!response.ok) {
//       const error = JSON.parse(text);
//       return {
//         success: false,
//         error: error.error?.message || `API Error: ${response.status}`,
//         statusCode: response.status,
//       };
//     }

//     return {
//       success: true,
//       data: JSON.parse(text),
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error occurred",
//     };
//   }
// }

// export async function testUSPSConnection(): Promise<void> {
//   console.log("🧪 Testing USPS Cloud API connection...");

//   try {
//     console.log("Step 1: Testing OAuth token...");
//     const token = await getAccessToken();
//     console.log("✅ Successfully obtained access token");

//     console.log("Step 2: Testing address validation...");
//     const testResult = await validateUSPSAddress({
//       streetAddress: "1600 Pennsylvania Avenue NW",
//       city: "Washington",
//       state: "DC",
//       ZIPCode: "20500",
//     });

//     console.log("🧪 Test validation result:", testResult);

//     if (testResult.success) {
//       console.log("✅ Full USPS API integration test passed!");
//     } else {
//       console.log("❌ Address validation test failed:", testResult.error);
//     }
//   } catch (error) {
//     console.error("❌ USPS connection test failed:", error);
//   }
// }

// import {
//   AddressValidationResult,
//   USPSAddressData,
//   USPSAddressResponse,
//   USPSApiResult,
//   USPSCityStateResponse,
//   USPSTokenResponse,
// } from "../types";

// let accessToken: string | null = null;
// let tokenExpiry: number | null = null;

// const USPS_BASE_URL = "https://api.usps.com";
// const CLIENT_ID = process.env.USPS_CLIENT_ID;
// const CLIENT_SECRET = process.env.USPS_CLIENT_SECRET;

// async function getAccessToken(): Promise<string> {
//   if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
//     return accessToken;
//   }

//   if (!CLIENT_ID || !CLIENT_SECRET) {
//     throw new Error("USPS credentials not configured");
//   }

//   try {
//     const response = await fetch(`${USPS_BASE_URL}/oauth2/v3/token`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         grant_type: "client_credentials",
//         client_id: CLIENT_ID,
//         client_secret: CLIENT_SECRET,
//         scope: "addresses",
//       }),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(
//         `OAuth failed: ${response.status} ${response.statusText} - ${errorText}`
//       );
//     }

//     const data: USPSTokenResponse = await response.json();
//     accessToken = data.access_token;
//     tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

//     return accessToken;
//   } catch (error) {
//     console.error("Error getting access token:", error);
//     throw error;
//   }
// }

// export async function validateUSPSAddress(
//   addressData: USPSAddressData
// ): Promise<AddressValidationResult> {
//   try {
//     const token = await getAccessToken();

//     const params = new URLSearchParams({
//       streetAddress: addressData.streetAddress,
//       state: addressData.state,
//     });

//     if (addressData.firm) params.append("firm", addressData.firm);
//     if (addressData.secondaryAddress)
//       params.append("secondaryAddress", addressData.secondaryAddress);
//     if (addressData.city) params.append("city", addressData.city);
//     if (addressData.urbanization)
//       params.append("urbanization", addressData.urbanization);
//     if (addressData.ZIPCode) params.append("ZIPCode", addressData.ZIPCode);
//     if (addressData.ZIPPlus4) params.append("ZIPPlus4", addressData.ZIPPlus4);

//     const response = await fetch(
//       `${USPS_BASE_URL}/addresses/v3/address?${params}`,
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//       }
//     );

//     const result: USPSAddressResponse = await response.json();

//     if (!response.ok) {
//       return {
//         success: false,
//         error:
//           (result as any).error?.message || `API Error: ${response.status}`,
//         statusCode: response.status,
//       };
//     }

//     return {
//       success: true,
//       data: result,
//       isValid: result.additionalInfo?.DPVConfirmation === "Y",
//       standardizedAddress: result.address,
//     };
//   } catch (error) {
//     console.error("Address validation error:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error occurred",
//     };
//   }
// }

// export async function getCityStateByZip(
//   zipCode: string
// ): Promise<USPSApiResult<USPSCityStateResponse>> {
//   try {
//     const token = await getAccessToken();

//     const response = await fetch(
//       `${USPS_BASE_URL}/addresses/v3/city-state?ZIPCode=${zipCode}`,
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//       }
//     );

//     const result: USPSCityStateResponse = await response.json();

//     if (!response.ok) {
//       return {
//         success: false,
//         error:
//           (result as any).error?.message || `API Error: ${response.status}`,
//         statusCode: response.status,
//       };
//     }

//     return {
//       success: true,
//       data: result,
//     };
//   } catch (error) {
//     console.error("City/State lookup error:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error occurred",
//     };
//   }
// }

// export async function getZipCodeByAddress(
//   addressData: USPSAddressData
// ): Promise<USPSApiResult<USPSAddressResponse>> {
//   try {
//     const token = await getAccessToken();

//     const params = new URLSearchParams({
//       streetAddress: addressData.streetAddress,
//       city: addressData.city || "",
//       state: addressData.state,
//     });

//     if (addressData.firm) params.append("firm", addressData.firm);
//     if (addressData.secondaryAddress)
//       params.append("secondaryAddress", addressData.secondaryAddress);
//     if (addressData.ZIPCode) params.append("ZIPCode", addressData.ZIPCode);
//     if (addressData.ZIPPlus4) params.append("ZIPPlus4", addressData.ZIPPlus4);

//     const response = await fetch(
//       `${USPS_BASE_URL}/addresses/v3/zipcode?${params}`,
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//       }
//     );

//     const result: USPSAddressResponse = await response.json();

//     if (!response.ok) {
//       return {
//         success: false,
//         error:
//           (result as any).error?.message || `API Error: ${response.status}`,
//         statusCode: response.status,
//       };
//     }

//     return {
//       success: true,
//       data: result,
//     };
//   } catch (error) {
//     console.error("ZIP code lookup error:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error occurred",
//     };
//   }
// }
