// app/checkout/components/AddressStep.tsx

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Store,
  Check,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { US_STATES } from "../utils/constants";
import type { StepProps } from "../types";
import {
  validateAndCorrectAddress,
  lookupCityState,
} from "@/lib/actions/address-actions";
import { toast } from "sonner";
import AddressValidationModal from "./AddressValidationModal";

interface ValidationModalState {
  isOpen: boolean;
  isValidating: boolean;
  originalAddress: any;
  standardizedAddress: any;
  corrections: string[];
  validationError?: string;
  isValidated?: boolean;
  shippingCost?: number;
}

interface ExtendedStepProps extends StepProps {
  onAddressValidated?: (isValid: boolean, standardizedAddress?: any) => void;
  onShippingCalculated?: (shippingCost: number) => void;
  onNextStep?: () => void;
}

export default function AddressStep({
  formData,
  onInputChange,
  errors,
  onAddressValidated,
  onShippingCalculated,
  onNextStep,
}: ExtendedStepProps) {
  const [modalState, setModalState] = useState<ValidationModalState>({
    isOpen: false,
    isValidating: false,
    originalAddress: null,
    standardizedAddress: null,
    corrections: [],
    validationError: undefined,
    isValidated: false,
    shippingCost: undefined,
  });

  const [autoLookupLoading, setAutoLookupLoading] = useState(false);
  const [addressValidated, setAddressValidated] = useState(false);
  const [shippingCost, setShippingCost] = useState<number | null>(null);

  const hasErrors = Object.keys(errors).length > 0;

  // Auto-lookup city/state when ZIP code is entered (5 digits) - now immediate
  const handleZipChange = async (zipCode: string) => {
    onInputChange("zipCode", zipCode);
    
    if (zipCode.length === 5) {
      try {
        setAutoLookupLoading(true);
        const result = await lookupCityState(zipCode);

        if (result.success && result.data) {
          onInputChange("city", result.data.city);
          onInputChange("state", result.data.state);
          toast.success(`Found: ${result.data.city}, ${result.data.state}`);
          
          // Auto-trigger validation after city/state are filled
          setTimeout(() => {
            handleAddressValidation();
          }, 500);
        }
      } catch (error) {
        console.error("Auto-lookup failed:", error);
      } finally {
        setAutoLookupLoading(false);
      }
    }
  };

  // Reset validation when address fields change
  useEffect(() => {
    if (addressValidated) {
      setAddressValidated(false);
      setShippingCost(null);
    }
  }, [formData.address, formData.apartment, formData.city, formData.state, formData.zipCode]);

  // Validate address (can be triggered by ZIP change, ZIP blur, or next button)
  const handleAddressValidation = async () => {
    // Only validate if we have all required fields and haven't validated yet
    if (!formData.address || !formData.city || !formData.state || !formData.zipCode || addressValidated) {
      return;
    }

    if (formData.zipCode.length !== 5) {
      return;
    }
    
    console.log('🚀 Starting address validation...');

    // Prepare original address for modal
    const originalAddress = {
      address: formData.address,
      apartment: formData.apartment,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
    };

    // Open modal in loading state
    setModalState({
      isOpen: true,
      isValidating: true,
      originalAddress,
      standardizedAddress: null,
      corrections: [],
      validationError: undefined,
    });

    try {
      const addressData = new FormData();
      addressData.append("streetAddress", formData.address);
      addressData.append("secondaryAddress", formData.apartment);
      addressData.append("city", formData.city);
      addressData.append("state", formData.state);
      addressData.append("ZIPCode", formData.zipCode);

      const result = await validateAndCorrectAddress(addressData);

      if (result.success && result.data) {
        const { isValid, standardized, corrections } = result.data;
        
        console.log('🔍 AddressStep validation result:', { isValid, standardized, corrections });

        if (isValid && standardized?.address) {
          const standardizedAddr = standardized.address;
          
          // Check if addresses are different
          const isAddressDifferent =
            standardizedAddr.streetAddress.toLowerCase() !== formData.address.toLowerCase() ||
            standardizedAddr.city.toLowerCase().trim() !== formData.city.toLowerCase().trim() ||
            standardizedAddr.state !== formData.state ||
            standardizedAddr.ZIPCode !== formData.zipCode;

          if (isAddressDifferent) {
            // Show comparison modal
            console.log('✅ Address different - showing modal');
            setModalState({
              isOpen: true,
              isValidating: false,
              originalAddress,
              standardizedAddress: standardizedAddr,
              corrections: corrections || [],
            });
          } else {
            // Address is perfect, calculate shipping and show success modal
            console.log('✅ Address perfect - calculating shipping');
            setAddressValidated(true);
            onAddressValidated?.(true, standardizedAddr);
            toast.success("Address verified by USPS!");
            
            const cost = await calculateShipping(standardizedAddr);
            if (cost !== null) {
              setModalState({
                ...modalState,
                isValidating: false,
                isValidated: true,
                shippingCost: cost,
                standardizedAddress: null, // Hide comparison, show success
              });
            }
          }
        } else {
          // Validation failed
          console.log('❌ Validation failed:', { isValid, standardized });
          setModalState({
            isOpen: true,
            isValidating: false,
            originalAddress,
            standardizedAddress: null,
            corrections: [],
            validationError: "Address could not be verified by USPS. You can continue with your address or edit it.",
          });
        }
      } else {
        // API error
        setModalState({
          isOpen: true,
          isValidating: false,
          originalAddress,
          standardizedAddress: null,
          corrections: [],
          validationError: result.error || "Address validation failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("Address validation error:", error);
      setModalState({
        isOpen: true,
        isValidating: false,
        originalAddress,
        standardizedAddress: null,
        corrections: [],
        validationError: "Validation service is temporarily unavailable.",
      });
    }
  };
  
  // Handle ZIP blur - validate if all fields are complete
  const handleZipBlur = async () => {
    await handleAddressValidation();
  };

  // Handle using standardized address
  const handleUseStandardized = async () => {
    if (!modalState.standardizedAddress) return;

    const addr = modalState.standardizedAddress;
    onInputChange("address", addr.streetAddress);
    onInputChange("apartment", addr.secondaryAddress || formData.apartment);
    onInputChange("city", addr.city);
    onInputChange("state", addr.state);
    onInputChange("zipCode", addr.ZIPCode);

    setAddressValidated(true);
    onAddressValidated?.(true, addr);
    toast.success("Address updated with USPS standardized format!");
    
    // Calculate shipping and show success modal
    const cost = await calculateShipping(addr);
    if (cost !== null) {
      setModalState({
        ...modalState,
        isValidating: false,
        isValidated: true,
        shippingCost: cost,
        standardizedAddress: null, // Hide comparison, show success
      });
    }
  };

  // Handle editing address
  const handleEditAddress = () => {
    setModalState({ ...modalState, isOpen: false });
    // Focus back to address field for editing
    // User can make changes and validation will trigger again on ZIP blur
  };

  // Calculate shipping cost using USPS API and update cart
  const calculateShipping = async (address: any): Promise<number | null> => {
    try {
      // Import store and shipping calculation functions
      const { useUnifiedCartStore } = await import('@/store/unifiedCartStore');
      const { calculateShippingCost } = await import('@/lib/actions/shipping-actions');
      
      // Use USPS address ZIP code for shipping calculation
      const destinationZIP = address.ZIPCode || formData.zipCode;
      
      console.log('🚚 Calculating shipping for ZIP:', destinationZIP);
      
      // Get cart directly from store
      const cart = useUnifiedCartStore.getState().cart;
      if (!cart || !cart.items.length) {
        console.error('❌ No cart items for shipping calculation');
        return null;
      }

      // Set calculating state
      useUnifiedCartStore.getState().isCalculatingShipping = true;
      
      // Convert cart items to shipping format with correct bottle specifications
      const cartItems = cart.items.map(item => ({
        productId: item.product._id,
        quantity: item.quantity,
        weight: 1.0, // 1 lb per bottle
        dimensions: {
          length: 8,  // 8cm
          width: 8,   // 8cm  
          height: 8,  // 8cm
        }
      }));

      console.log('📦 Shipping calculation request:', {
        itemCount: cartItems.length,
        destinationZIP,
        totalBottles: cartItems.reduce((sum, item) => sum + item.quantity, 0)
      });

      const result = await calculateShippingCost({
        items: cartItems,
        destinationZIP,
      });

      console.log('📦 USPS API result:', result);

      if (result.success && result.data) {
        const shippingCost = result.data.totalShippingCost;
        
        // Update cart with shipping cost
        await useUnifiedCartStore.getState().updateShippingCost(shippingCost);
        
        setShippingCost(shippingCost);
        onShippingCalculated?.(shippingCost);
        console.log('✅ Shipping calculated and cart updated:', shippingCost);
        return shippingCost;
      } else {
        console.error('❌ USPS API failed:', result.error);
        throw new Error(result.error || 'Could not calculate shipping cost');
      }
    } catch (error) {
      console.error("❌ Shipping calculation error:", error);
      toast.error(`Could not calculate shipping cost: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Clear calculating state
      const store = await import('@/store/unifiedCartStore');
      store.useUnifiedCartStore.getState().isCalculatingShipping = false;
      
      return null;
    }
  };
  
  // Handle continue from success modal 
  const handleContinue = () => {
    setModalState({ ...modalState, isOpen: false });
    onNextStep?.(); // Navigate to next step
  };
  
  // Prevent next step unless address is validated
  const canProceedToNextStep = () => {
    return addressValidated && shippingCost !== null;
  };

  // If pickup is selected, show pickup confirmation
  if (formData.deliveryMethod === "pickup") {
    return (
      <Card className="glass border-white/20">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Store className="w-16 h-16 mx-auto text-green-600 mb-4" />
            <h3 className="text-2xl font-semibold mb-2 text-gray-900">
              Store Pickup Selected
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Your order will be prepared and ready for pickup at our store
              location. We'll notify you when it's ready!
            </p>
            <div className="p-6 bg-green-50 border border-green-200 rounded-xl max-w-sm mx-auto">
              <p className="font-semibold text-green-900 mb-1">
                Nutra-Vive Store Pickup
              </p>
              <p className="text-sm text-green-800">50 Park Place</p>
              <p className="text-sm text-green-800">Newark, NJ USA</p>
              <p className="text-sm text-green-800 mt-2">
                <strong>Hours:</strong> Mon-Fri 9:00 AM - 5:00 PM
              </p>
              <p className="text-sm text-green-800">
                <strong>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </strong>{" "}
                Sat 9:00 AM - 12:30 PM
              </p>
              <p className="text-sm text-green-800 mt-2">
                <strong>Phone:</strong> 1-800-NUTRA-01
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Address Validation Modal */}
      <AddressValidationModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        isValidating={modalState.isValidating}
        originalAddress={modalState.originalAddress}
        standardizedAddress={modalState.standardizedAddress}
        corrections={modalState.corrections}
        onUseStandardized={handleUseStandardized}
        onEditAddress={handleEditAddress}
        validationError={modalState.validationError}
        isValidated={modalState.isValidated}
        shippingCost={modalState.shippingCost}
        onContinue={handleContinue}
      />

      {/* Address Validation Status */}
      {addressValidated && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <Check className="w-4 h-4 text-green-600 mr-2" />
          <span className="text-sm text-green-800 font-medium">
            Address verified by USPS
          </span>
          {shippingCost && (
            <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700">
              Shipping: ${shippingCost.toFixed(2)}
            </Badge>
          )}
        </div>
      )}

      {/* Shipping Address */}
      <Card
        className={`glass ${hasErrors ? "border-red-200 bg-red-50/30" : "border-white/20"}`}
      >
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <MapPin className="w-5 h-5 mr-2 text-orange-600" />
            Shipping Address
          </CardTitle>
          <p className="text-sm text-gray-600">
            Where should we deliver your order? Address will be automatically verified when you enter your ZIP code.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address" className="text-sm font-medium">
              Street Address *
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => onInputChange("address", e.target.value)}
              className={`bg-white/60 border-white/40 ${
                errors.address ? "border-red-300 focus:border-red-500" : ""
              }`}
              placeholder="123 Main Street"
              required
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address}</p>
            )}
          </div>

          <div>
            <Label htmlFor="apartment" className="text-sm font-medium">
              Apartment, Suite, etc.{" "}
              <span className="text-gray-400">(Optional)</span>
            </Label>
            <Input
              id="apartment"
              value={formData.apartment}
              onChange={(e) => onInputChange("apartment", e.target.value)}
              className="bg-white/60 border-white/40"
              placeholder="Apt 4B, Suite 100, etc."
            />
          </div>

          {/* ZIP CODE COMES FIRST - for auto-fill */}
          <div>
            <Label htmlFor="zipCode" className="text-sm font-medium">
              ZIP Code *
            </Label>
            <div className="relative">
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleZipChange(e.target.value)}
                onBlur={handleZipBlur}
                className={`bg-white/60 border-white/40 ${
                  errors.zipCode ? "border-red-300 focus:border-red-500" : ""
                }`}
                placeholder="12345"
                maxLength={5}
                required
              />
              {autoLookupLoading && (
                <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-2.5 text-gray-400" />
              )}
            </div>
            {errors.zipCode && (
              <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              City and state will auto-fill, then address will be verified automatically.
            </p>
          </div>

          {/* CITY AND STATE COME AFTER ZIP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city" className="text-sm font-medium">
                City *
              </Label>
              <div className="relative">
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => onInputChange("city", e.target.value)}
                  className={`bg-white/60 border-white/40 ${
                    errors.city ? "border-red-300 focus:border-red-500" : ""
                  }`}
                  placeholder="Will auto-fill from ZIP"
                  required
                />
              </div>
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <Label htmlFor="state" className="text-sm font-medium">
                State *
              </Label>
              <Select
                value={formData.state}
                onValueChange={(value) => onInputChange("state", value)}
              >
                <SelectTrigger
                  className={`bg-white/60 border-white/40 ${
                    errors.state ? "border-red-300 focus:border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Will auto-fill from ZIP" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="text-red-500 text-xs mt-1">{errors.state}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Additional Options */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-lg">Additional Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="notes" className="text-sm font-medium">
              Delivery Instructions{" "}
              <span className="text-gray-400">(Optional)</span>
            </Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => onInputChange("notes", e.target.value)}
              className="bg-white/60 border-white/40"
              placeholder="Leave at front door, ring doorbell, etc."
            />
            <p className="text-xs text-gray-500 mt-1">
              Any special instructions for our delivery team.
            </p>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <Checkbox
              id="marketing"
              checked={formData.marketingOptIn}
              onCheckedChange={(checked) =>
                onInputChange("marketingOptIn", checked === true)
              }
              className="mt-0.5"
            />
            <div>
              <Label
                htmlFor="marketing"
                className="text-sm font-medium cursor-pointer"
              >
                Stay in the loop with Nutra-Vive
              </Label>
              <p className="text-xs text-gray-600 mt-1">
                Get exclusive offers, wellness tips, and new product
                announcements. You can unsubscribe anytime you want.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}