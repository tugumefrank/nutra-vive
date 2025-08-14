"use server";

import {
  AddressValidationResult,
  ComprehensiveValidationResult,
  USPSAddressData,
  USPSAddressResponse,
  USPSApiResult,
  USPSCityStateResponse,
} from "@/app/checkout/types";
import {
  getCityStateByZip,
  getZipCodeByAddress,
  validateUSPSAddress,
} from "@/app/checkout/utils/usps-api";

export async function validateAddress(
  formData: FormData
): Promise<AddressValidationResult> {
  try {
    const addressData: USPSAddressData = {
      firm: formData.get("firm")?.toString() || "",
      streetAddress: formData.get("streetAddress")?.toString() || "",
      secondaryAddress: formData.get("secondaryAddress")?.toString() || "",
      city: formData.get("city")?.toString() || "",
      state: formData.get("state")?.toString() || "",
      ZIPCode: formData.get("ZIPCode")?.toString() || "",
      ZIPPlus4: formData.get("ZIPPlus4")?.toString() || "",
      urbanization: formData.get("urbanization")?.toString() || "",
    };

    // Validate required fields
    if (!addressData.streetAddress || !addressData.state) {
      return {
        success: false,
        error: "Street address and state are required",
      };
    }

    if (!addressData.city && !addressData.ZIPCode) {
      return {
        success: false,
        error: "Either city or ZIP code must be provided",
      };
    }

    const result = await validateUSPSAddress(addressData);
    return result;
  } catch (error) {
    console.error("Server action error:", error);
    return {
      success: false,
      error: "Failed to validate address",
    };
  }
}

export async function lookupCityState(
  zipCode: string
): Promise<USPSApiResult<USPSCityStateResponse>> {
  try {
    if (!zipCode || zipCode.length !== 5) {
      return {
        success: false,
        error: "Valid 5-digit ZIP code is required",
      };
    }

    const result = await getCityStateByZip(zipCode);
    return result;
  } catch (error) {
    console.error("City/State lookup error:", error);
    return {
      success: false,
      error: "Failed to lookup city and state",
    };
  }
}

export async function lookupZipCode(
  formData: FormData
): Promise<USPSApiResult<USPSAddressResponse>> {
  try {
    const addressData: USPSAddressData = {
      firm: formData.get("firm")?.toString() || "",
      streetAddress: formData.get("streetAddress")?.toString() || "",
      secondaryAddress: formData.get("secondaryAddress")?.toString() || "",
      city: formData.get("city")?.toString() || "",
      state: formData.get("state")?.toString() || "",
      ZIPCode: formData.get("ZIPCode")?.toString() || "",
      ZIPPlus4: formData.get("ZIPPlus4")?.toString() || "",
    };

    // Validate required fields
    if (!addressData.streetAddress || !addressData.city || !addressData.state) {
      return {
        success: false,
        error: "Street address, city, and state are required",
      };
    }

    const result = await getZipCodeByAddress(addressData);
    return result;
  } catch (error) {
    console.error("ZIP code lookup error:", error);
    return {
      success: false,
      error: "Failed to lookup ZIP code",
    };
  }
}

export async function validateAndCorrectAddress(
  formData: FormData
): Promise<USPSApiResult<ComprehensiveValidationResult>> {
  try {
    const addressData: USPSAddressData = {
      firm: formData.get("firm")?.toString() || "",
      streetAddress: formData.get("streetAddress")?.toString() || "",
      secondaryAddress: formData.get("secondaryAddress")?.toString() || "",
      city: formData.get("city")?.toString() || "",
      state: formData.get("state")?.toString() || "",
      ZIPCode: formData.get("ZIPCode")?.toString() || "",
      ZIPPlus4: formData.get("ZIPPlus4")?.toString() || "",
      urbanization: formData.get("urbanization")?.toString() || "",
    };

    const results: ComprehensiveValidationResult = {
      original: addressData,
      isValid: false,
      standardized: null,
      corrections: [],
      warnings: [],
      suggestions: [],
    };

    // First, try to validate the complete address
    const validation = await validateUSPSAddress(addressData);

    if (validation.success && validation.data) {
      results.isValid = validation.data.isValid || false;
      results.standardized = validation.data.standardized;
      results.corrections = validation.data.corrections || [];
      results.warnings = validation.data.warnings || [];

      if (!validation.data.isValid && validation.data.suggestions) {
        results.suggestions = validation.data.suggestions;
      }

      return {
        success: true,
        data: results,
      };
    }

    // If validation fails, try to get ZIP code if city/state provided
    if (addressData.city && addressData.state && !addressData.ZIPCode) {
      const zipLookup = await getZipCodeByAddress(addressData);
      if (zipLookup.success && zipLookup.data) {
        // Retry validation with the found ZIP code
        const retryValidation = await validateUSPSAddress({
          ...addressData,
          ZIPCode: zipLookup.data.address.ZIPCode,
          ZIPPlus4: zipLookup.data.address.ZIPPlus4,
        });

        if (retryValidation.success && retryValidation.data) {
          results.isValid = retryValidation.data.isValid || false;
          results.standardized = retryValidation.data.standardized;
          results.corrections = retryValidation.data.corrections || [];
          results.warnings = retryValidation.data.warnings || [];
        }
      }
    }

    // If we have ZIP but missing city/state, try to get them
    if (addressData.ZIPCode && (!addressData.city || !addressData.state)) {
      const cityStateLookup = await getCityStateByZip(addressData.ZIPCode);
      if (cityStateLookup.success && cityStateLookup.data) {
        // Retry validation with the found city/state
        const retryValidation = await validateUSPSAddress({
          ...addressData,
          city: addressData.city || cityStateLookup.data.city,
          state: addressData.state || cityStateLookup.data.state,
        });

        if (retryValidation.success && retryValidation.data) {
          results.isValid = retryValidation.data.isValid || false;
          results.standardized = retryValidation.data.standardized;
          results.corrections = retryValidation.data.corrections || [];
          results.warnings = retryValidation.data.warnings || [];
        }
      }
    }

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("Comprehensive validation error:", error);
    return {
      success: false,
      error: "Failed to validate and correct address",
    };
  }
}
