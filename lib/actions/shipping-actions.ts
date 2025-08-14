"use server";

interface CartItem {
  productId: string;
  quantity: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;  
    height: number;
  };
}

interface ShippingCalculationRequest {
  items: CartItem[];
  destinationZIP: string;
  originZIP?: string;
  mailClass?: string;
  priceType?: string;
  accountType?: string;
  accountNumber?: string;
}

interface ShippingRate {
  mailClass: string;
  price: number;
  deliveryDays: string;
  serviceName: string;
}

interface ShippingCalculationResult {
  success: boolean;
  data?: {
    totalShippingCost: number;
    selectedRate: ShippingRate;
    availableRates: ShippingRate[];
    packageDetails: {
      totalWeight: number;
      dimensions: {
        length: number;
        width: number;
        height: number;
      };
    };
  };
  error?: string;
}

// Calculate combined package dimensions from cart items
// ✅ CONFIGURED: Using 1 lb bottles, 8x8x8cm dimensions, Newark NJ origin
function calculatePackageDimensions(items: CartItem[]): {
  totalWeight: number;
  dimensions: { length: number; width: number; height: number };
} {
  const packagingWeight = 0.5; // Base packaging weight in pounds
  
  let totalWeight = packagingWeight;
  let maxLength = 0;
  let maxWidth = 0; 
  let totalHeight = 0;

  items.forEach(item => {
    totalWeight += (item.weight * item.quantity);
    
    // Convert cm to inches (USPS requires inches)
    const lengthInches = item.dimensions.length / 2.54;
    const widthInches = item.dimensions.width / 2.54;
    const heightInches = item.dimensions.height / 2.54;
    
    // Find maximum dimensions (items side by side)
    maxLength = Math.max(maxLength, lengthInches);
    maxWidth = Math.max(maxWidth, widthInches);
    
    // Stack items vertically if multiple quantities
    totalHeight += (heightInches * item.quantity);
  });

  // Ensure minimum package dimensions for USPS (in inches)
  const length = Math.max(maxLength, 6); // Minimum 6 inches
  const width = Math.max(maxWidth, 4);   // Minimum 4 inches  
  const height = Math.max(totalHeight, 2); // Minimum 2 inches

  return {
    totalWeight: Math.round(totalWeight * 100) / 100, // Round to 2 decimals
    dimensions: { length, width, height }
  };
}

// Separate token cache for pricing API to avoid conflict with address validation
let pricingAccessToken: string | null = null;
let pricingTokenExpiry: number | null = null;

// Get access token for USPS Pricing API
async function getUSPSAccessToken(): Promise<string> {
  // Check if we have a valid cached token for pricing
  if (pricingAccessToken && pricingTokenExpiry && Date.now() < pricingTokenExpiry) {
    console.log('🔄 Using cached USPS pricing token');
    return pricingAccessToken;
  }

  console.log('🆕 Getting fresh USPS pricing token (no cache or expired)');
  
  // Clear any existing token to force fresh request
  pricingAccessToken = null;
  pricingTokenExpiry = null;
  const CLIENT_ID = process.env.USPS_CLIENT_ID;
  const CLIENT_SECRET = process.env.USPS_CLIENT_SECRET;
  const USPS_BASE_URL = process.env.NODE_ENV === "production" 
    ? "https://api.usps.com" 
    : "https://apis-tem.usps.com";

  console.log('🔧 USPS Pricing OAuth Debug:', {
    hasClientId: !!CLIENT_ID,
    hasClientSecret: !!CLIENT_SECRET,
    baseUrl: USPS_BASE_URL,
  });

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("USPS credentials not configured. Check USPS_CLIENT_ID and USPS_CLIENT_SECRET environment variables.");
  }

  const oauthUrl = `${USPS_BASE_URL}/oauth2/v3/token`;
  const requestBody = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: "prices", // Documentation confirms: Required scopes: prices
  });

  console.log('🚀 Requesting USPS OAuth token with scope: "prices"');

  const response = await fetch(oauthUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      "User-Agent": "NutraVive-Shipping/1.0",
    },
    body: requestBody.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ USPS OAuth failed:', response.status, errorText);
    throw new Error(`USPS OAuth failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('✅ USPS OAuth successful - pricing token received:', {
    hasAccessToken: !!data.access_token,
    tokenType: data.token_type,
    expiresIn: data.expires_in,
    scope: data.scope || 'no scope returned'
  });
  
  // Cache the pricing token separately
  pricingAccessToken = data.access_token;
  pricingTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  
  return pricingAccessToken;
}

// Calculate shipping rates using USPS API
async function calculateUSPSShipping(
  packageDetails: any,
  destinationZIP: string,
  originZIP: string,
  options: any = {}
): Promise<ShippingCalculationResult> {
  try {
    const token = await getUSPSAccessToken();
    const USPS_BASE_URL = process.env.NODE_ENV === "production" 
      ? "https://api.usps.com" 
      : "https://apis-tem.usps.com";

    const requestBody = {
      originZIPCode: originZIP,
      destinationZIPCode: destinationZIP,
      weight: packageDetails.totalWeight,
      length: Math.ceil(packageDetails.dimensions.length), // Round up to nearest inch
      width: Math.ceil(packageDetails.dimensions.width),
      height: Math.ceil(packageDetails.dimensions.height),
      mailClass: options.mailClass || "USPS_GROUND_ADVANTAGE",
      processingCategory: "MACHINABLE",
      rateIndicator: "DR", // Dimensional Rectangular
      destinationEntryFacilityType: "NONE",
      priceType: options.priceType || "COMMERCIAL",
      mailingDate: new Date().toISOString().split('T')[0], // Today's date
      hasNonstandardCharacteristics: false,
      accountType: options.accountType || "EPS", // EPS account type as specified
      ...(options.accountNumber && { accountNumber: options.accountNumber }),
    };

    console.log('🚚 USPS Shipping Request:', requestBody);

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
    console.log('📦 USPS Shipping Response:', {
      status: response.status,
      response: responseText.substring(0, 500)
    });

    if (!response.ok) {
      throw new Error(`USPS Pricing API failed: ${response.status} - ${responseText}`);
    }

    const result = JSON.parse(responseText);
    
    // Format the response
    const selectedRate: ShippingRate = {
      mailClass: requestBody.mailClass,
      price: result.totalBasePrice || 0,
      deliveryDays: getDeliveryDays(requestBody.mailClass),
      serviceName: getServiceName(requestBody.mailClass),
    };

    return {
      success: true,
      data: {
        totalShippingCost: result.totalBasePrice || 0,
        selectedRate,
        availableRates: [selectedRate], // For now, just return the selected rate
        packageDetails,
      },
    };

  } catch (error) {
    console.error('❌ USPS Shipping calculation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Shipping calculation failed",
    };
  }
}

// Helper functions
function getDeliveryDays(mailClass: string): string {
  switch (mailClass) {
    case "PRIORITY_MAIL_EXPRESS": return "1-2";
    case "PRIORITY_MAIL": return "1-3"; 
    case "USPS_GROUND_ADVANTAGE": return "2-5";
    case "PARCEL_SELECT": return "2-8";
    case "MEDIA_MAIL": return "2-8";
    default: return "2-5";
  }
}

function getServiceName(mailClass: string): string {
  switch (mailClass) {
    case "PRIORITY_MAIL_EXPRESS": return "Priority Mail Express";
    case "PRIORITY_MAIL": return "Priority Mail";
    case "USPS_GROUND_ADVANTAGE": return "USPS Ground Advantage";
    case "PARCEL_SELECT": return "Parcel Select";
    case "MEDIA_MAIL": return "Media Mail";
    default: return "Standard Shipping";
  }
}

// Main server action for calculating shipping
export async function calculateShippingCost(
  request: ShippingCalculationRequest
): Promise<ShippingCalculationResult> {
  try {
    // Validate required fields
    if (!request.items || request.items.length === 0) {
      return {
        success: false,
        error: "No items provided for shipping calculation",
      };
    }

    if (!request.destinationZIP) {
      return {
        success: false,
        error: "Destination ZIP code is required",
      };
    }

    // Get origin ZIP from environment or use default Newark, NJ business address
    // 50 PARK PL, NEWARK, NJ 07102-4308
    const originZIP = request.originZIP || 
                     process.env.USPS_BUSINESS_ORIGIN_ZIP || 
                     "07102"; // Default to Newark, NJ (50 Park Place)

    // Calculate package dimensions and total weight
    const packageDetails = calculatePackageDimensions(request.items);

    console.log('📦 Package calculation:', {
      itemCount: request.items.length,
      packageDetails,
      originZIP,
      destinationZIP: request.destinationZIP,
    });

    // Calculate shipping using USPS API
    const shippingResult = await calculateUSPSShipping(
      packageDetails,
      request.destinationZIP,
      originZIP,
      {
        mailClass: request.mailClass,
        priceType: request.priceType,
        accountType: request.accountType,
        accountNumber: request.accountNumber,
      }
    );

    return shippingResult;
    
  } catch (error) {
    console.error('❌ Shipping calculation server action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Shipping calculation failed",
    };
  }
}

// Helper function to get multiple shipping options
export async function getShippingOptions(
  request: ShippingCalculationRequest
): Promise<ShippingCalculationResult> {
  // For now, just return the standard calculation
  // Later, this can be enhanced to fetch multiple mail class options
  return await calculateShippingCost(request);
}