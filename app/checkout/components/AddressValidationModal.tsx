import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  CheckCircle, 
  Edit3, 
  MapPin,
  ArrowRight 
} from "lucide-react";

interface AddressData {
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
}

interface StandardizedAddress {
  streetAddress: string;
  secondaryAddress?: string;
  city: string;
  state: string;
  ZIPCode: string;
  ZIPPlus4?: string;
}

interface AddressValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isValidating: boolean;
  originalAddress: AddressData;
  standardizedAddress?: StandardizedAddress;
  corrections?: string[];
  onUseStandardized: () => void;
  onEditAddress: () => void;
  validationError?: string;
  isValidated?: boolean;
  shippingCost?: number;
  onContinue?: () => void;
}

export default function AddressValidationModal({
  isOpen,
  onClose,
  isValidating,
  originalAddress,
  standardizedAddress,
  corrections = [],
  onUseStandardized,
  onEditAddress,
  validationError,
  isValidated = false,
  shippingCost,
  onContinue,
}: AddressValidationModalProps) {
  
  // Loading state
  if (isValidating) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              Validating Address
            </DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              Checking your address with USPS
            </h3>
            <p className="text-gray-600 text-sm">
              Please wait while we verify and standardize your shipping address...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Error state
  if (validationError) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <MapPin className="w-5 h-5" />
              Address Validation Failed
            </DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-gray-700 mb-4">{validationError}</p>
            <p className="text-sm text-gray-600 mb-6">
              You can continue with your original address or edit it to try again.
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={onEditAddress}
                className="flex-1"
                variant="outline"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit My Address
              </Button>
              <Button 
                onClick={onClose}
                className="flex-1"
              >
                Continue Anyway
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Success state - address validated and shipping calculated
  if (isValidated && shippingCost !== undefined) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Address Verified & Shipping Calculated
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                Ready to Continue!
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Your address has been verified by USPS and shipping cost calculated.
              </p>
              
              {/* Shipping Cost Display */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    USPS Shipping Cost:
                  </span>
                  <span className="text-lg font-bold text-blue-900">
                    ${shippingCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <Button 
              onClick={onContinue}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              Continue to Payment
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Address comparison state
  if (standardizedAddress) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Address Verified by USPS
            </DialogTitle>
            <p className="text-sm text-gray-600">
              We found a standardized version of your address. Please choose which one to use:
            </p>
          </DialogHeader>
          
          <div className="py-4">
            {/* Address Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Original Address */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                  <span className="font-medium text-gray-900 text-sm">
                    Your Address
                  </span>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="font-medium">{originalAddress.address}</p>
                  {originalAddress.apartment && (
                    <p>{originalAddress.apartment}</p>
                  )}
                  <p>
                    {originalAddress.city}, {originalAddress.state} {originalAddress.zipCode}
                  </p>
                </div>
              </div>

              {/* USPS Standardized */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <CheckCircle className="w-3 h-3 text-green-600 mr-2" />
                  <span className="font-medium text-green-900 text-sm">
                    USPS Standardized
                  </span>
                  <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-700">
                    Verified
                  </Badge>
                </div>
                <div className="text-sm text-green-800 space-y-1">
                  <p className="font-medium">{standardizedAddress.streetAddress}</p>
                  {standardizedAddress.secondaryAddress && (
                    <p>{standardizedAddress.secondaryAddress}</p>
                  )}
                  <p>
                    {standardizedAddress.city}, {standardizedAddress.state} {standardizedAddress.ZIPCode}
                    {standardizedAddress.ZIPPlus4 && `-${standardizedAddress.ZIPPlus4}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Corrections Made */}
            {corrections.length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Changes Made by USPS:
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  {corrections.map((correction, index) => (
                    <li key={index} className="flex items-start">
                      <ArrowRight className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                      {correction}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={onUseStandardized}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Use USPS Standardized Address
              </Button>
              <Button
                onClick={onEditAddress}
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-50"
                size="lg"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit My Address
              </Button>
            </div>

            {/* Info Note */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                <strong>Recommended:</strong> Using the USPS standardized address ensures accurate delivery 
                and helps us calculate precise shipping costs.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}