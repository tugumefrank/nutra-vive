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
  if (method === "pickup") return 0; // Always free for pickup
  if (amount >= 25) return 0; // Free shipping over $25 after all discounts
  return method === "express" ? 9.99 : 5.99;
}

export default function DeliveryMethodStep({
  formData,
  onInputChange,
  errors,
  subtotal,
  afterDiscountsTotal,
}: DeliveryMethodStepProps) {
  return (
    <Card className="glass border-white/20">
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

          {/* Express Delivery */}
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

        {/* Free shipping notice */}
        {afterDiscountsTotal < 25 && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700">
              💡 <strong>Free shipping</strong> on orders over $25! Add{" "}
              <strong>${(25 - afterDiscountsTotal).toFixed(2)} more</strong> to qualify for free shipping.
            </p>
          </div>
        )}

        {/* Free shipping achieved notice */}
        {afterDiscountsTotal >= 25 && formData.deliveryMethod !== "pickup" && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              🎉 <strong>Congratulations!</strong> You qualify for free shipping!
            </p>
          </div>
        )}

        {/* Store pickup details */}
        {formData.deliveryMethod === "pickup" && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Pickup Location</h4>
            <div className="text-sm text-green-800">
              <p className="font-medium">Nutra-Vive Store</p>
              <p>123 Wellness Street</p>
              <p>Health City, CA 90210</p>
              <p className="mt-2">
                <strong>Hours:</strong> Mon-Sat 9:00 AM - 7:00 PM
              </p>
              <p className="mt-2 text-xs">
                We'll send you a notification when your order is ready for
                pickup.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
