// app/checkout/components/AddressStep.tsx

import { MapPin, Store } from "lucide-react";
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
import { US_STATES } from "../utils/constants";
import type { StepProps } from "../types";

export default function AddressStep({
  formData,
  onInputChange,
  errors,
}: StepProps) {
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
                Nutra-Vive Store
              </p>
              <p className="text-sm text-green-800">123 Wellness Street</p>
              <p className="text-sm text-green-800">Health City, CA 90210</p>
              <p className="text-sm text-green-800 mt-2">
                <strong>Hours:</strong> Mon-Sat 9:00 AM - 7:00 PM
              </p>
              <p className="text-sm text-green-800 mt-2">
                <strong>Phone:</strong> (555) 123-4567
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Shipping Address */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <MapPin className="w-5 h-5 mr-2 text-orange-600" />
            Shipping Address
          </CardTitle>
          <p className="text-sm text-gray-600">
            Where should we deliver your order?
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city" className="text-sm font-medium">
                City *
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => onInputChange("city", e.target.value)}
                className={`bg-white/60 border-white/40 ${
                  errors.city ? "border-red-300 focus:border-red-500" : ""
                }`}
                placeholder="San Francisco"
                required
              />
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
                  <SelectValue placeholder="Select state" />
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

            <div>
              <Label htmlFor="zipCode" className="text-sm font-medium">
                ZIP Code *
              </Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => onInputChange("zipCode", e.target.value)}
                className={`bg-white/60 border-white/40 ${
                  errors.zipCode ? "border-red-300 focus:border-red-500" : ""
                }`}
                placeholder="12345"
                required
              />
              {errors.zipCode && (
                <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>
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
                announcements. You can unsubscribe anytime.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
