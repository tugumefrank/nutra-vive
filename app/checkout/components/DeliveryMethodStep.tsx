// app/checkout/components/DeliveryMethodStep.tsx

import { Truck, Store, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { StepProps } from "../types";

interface DeliveryMethodStepProps extends StepProps {
  afterDiscountsTotal: number; // Use discounted total for shipping calculation
}

// Helper function to calculate shipping
function calculateShipping(amount: number, method: string): number {
  // Always return 0 - shipping is now free for all orders
  return 0;
}

export default function DeliveryMethodStep({
  formData,
  onInputChange,
  errors,
  subtotal,
  afterDiscountsTotal,
}: DeliveryMethodStepProps) {
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Card
      className={`glass ${hasErrors ? "border-red-200 bg-red-50/30" : "border-white/20"}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Truck className="w-5 h-5 mr-2 text-orange-600" />
          Delivery Method
        </CardTitle>
        <p className="text-sm text-gray-600">
          Choose how you'd like to receive your order.
        </p>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={formData.deliveryMethod}
          onValueChange={(value) => onInputChange("deliveryMethod", value)}
          className="space-y-3"
        >
          {/* Standard Delivery */}
          <Label
            htmlFor="standard"
            className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-orange-50 transition-colors group ${
              formData.deliveryMethod === "standard"
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="standard" id="standard" />
              <div className="flex items-center">
                <Truck className="w-5 h-5 mr-3 text-blue-600 group-hover:text-blue-700" />
                <div>
                  <div className="font-medium text-base">Standard Delivery</div>
                  <div className="text-sm text-gray-500">5-7 business days</div>
                </div>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={
                calculateShipping(afterDiscountsTotal, "standard") === 0
                  ? "bg-green-100 text-green-700 font-medium"
                  : "bg-gray-100 text-gray-700 font-medium"
              }
            >
              {calculateShipping(afterDiscountsTotal, "standard") === 0
                ? "FREE"
                : `$${calculateShipping(afterDiscountsTotal, "standard").toFixed(2)}`}
            </Badge>
          </Label>

          {/* Express Delivery - COMMENTED OUT FOR FUTURE IMPLEMENTATION */}
          {/* 
          <Label
            htmlFor="express"
            className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-orange-50 transition-colors group ${
              formData.deliveryMethod === "express"
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="express" id="express" />
              <div className="flex items-center">
                <Zap className="w-5 h-5 mr-3 text-amber-600 group-hover:text-amber-700" />
                <div>
                  <div className="font-medium text-base">Express Delivery</div>
                  <div className="text-sm text-gray-500">2-3 business days</div>
                </div>
              </div>
            </div>
            <Badge
              variant="outline"
              className={
                calculateShipping(afterDiscountsTotal, "express") === 0
                  ? "bg-green-100 text-green-700 border-green-200 font-medium"
                  : "font-medium"
              }
            >
              {calculateShipping(afterDiscountsTotal, "express") === 0
                ? "FREE"
                : `$${calculateShipping(afterDiscountsTotal, "express").toFixed(2)}`}
            </Badge>
          </Label>
          */}

          {/* Store Pickup */}
          <Label
            htmlFor="pickup"
            className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-orange-50 transition-colors group ${
              formData.deliveryMethod === "pickup"
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="pickup" id="pickup" />
              <div className="flex items-center">
                <Store className="w-5 h-5 mr-3 text-green-600 group-hover:text-green-700" />
                <div>
                  <div className="font-medium text-base">Store Pickup</div>
                  <div className="text-sm text-gray-500">
                    Available same day
                  </div>
                </div>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-700 font-medium"
            >
              FREE
            </Badge>
          </Label>
        </RadioGroup>

        {errors.deliveryMethod && (
          <p className="text-red-500 text-sm mt-3">{errors.deliveryMethod}</p>
        )}

        {/* All shipping is now free - no conditional notices needed */}

        {/* Store pickup details */}
        {formData.deliveryMethod === "pickup" && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Pickup Location</h4>
            <div className="text-sm text-green-800">
              <p className="font-medium">Nutra-Vive Store pick up</p>
              <p>50 Park Place</p>
              <p>, Newark, NJ USA</p>
              <p className="mt-2">
                <strong>Hours:</strong> Mon-Fri 9:00 AM - 5:00 PM
              </p>
              <p className="mt-2">
                <strong>Hours:</strong> sat 9:00 AM - 12:30 PM
              </p>
              <p className="mt-2 text-xs">
                We'll send you a notification via email when your order is ready
                for pickup.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
