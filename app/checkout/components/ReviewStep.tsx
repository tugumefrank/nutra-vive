// app/checkout/components/ReviewStep.tsx

import { Gift, User, Truck, MapPin, Edit } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { StepProps, CartData } from "../types";

interface ReviewStepProps extends StepProps {
  cart: CartData | null;
  total: number;
  tax: number;
}

export default function ReviewStep({
  formData,
  cart,
  subtotal,
  shipping,
  tax,
  total,
}: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Gift className="w-5 h-5 mr-2 text-orange-600" />
            Review Your Order
          </CardTitle>
          <p className="text-sm text-gray-600">
            Please review all details before proceeding to payment.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contact Information */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-blue-900 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Contact Information
              </h4>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 h-auto p-1"
              >
                <Edit className="w-3 h-3" />
              </Button>
            </div>
            <div className="text-sm text-blue-800 space-y-1">
              <p className="font-medium">
                {formData.firstName} {formData.lastName}
              </p>
              <p>{formData.email}</p>
              {formData.phone && <p>{formData.phone}</p>}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-green-900 flex items-center">
                <Truck className="w-4 h-4 mr-2" />
                Delivery Information
              </h4>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-600 hover:text-green-700 hover:bg-green-100 h-auto p-1"
              >
                <Edit className="w-3 h-3" />
              </Button>
            </div>
            <div className="text-sm text-green-800 space-y-1">
              <p className="font-medium capitalize">
                {formData.deliveryMethod.replace("-", " ")} Delivery
                {shipping === 0 && (
                  <Badge className="ml-2 bg-green-200 text-green-800 text-xs">
                    FREE
                  </Badge>
                )}
              </p>

              {formData.deliveryMethod !== "pickup" && (
                <div className="mt-2 p-3 bg-white/50 rounded-lg">
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{formData.address}</p>
                      {formData.apartment && <p>{formData.apartment}</p>}
                      <p>
                        {formData.city}, {formData.state} {formData.zipCode}
                      </p>
                      {formData.notes && (
                        <p className="text-xs text-green-600 mt-1 italic">
                          Note: {formData.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
              <Gift className="w-4 h-4 mr-2" />
              Order Items ({cart?.items.length || 0} item
              {(cart?.items.length || 0) !== 1 ? "s" : ""})
            </h4>
            <div className="space-y-3">
              {cart?.items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 p-3 bg-white/60 rounded-lg"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.product.images[0] || "/api/placeholder/300/300"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-purple-900 text-sm">
                      {item.product.name}
                    </h5>
                    <p className="text-xs text-purple-600">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-purple-600">
                      Qty: {item.quantity}
                    </p>
                    <p className="font-semibold text-purple-900">
                      ${(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">
                  {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-orange-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Terms and Marketing */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm">
            <h4 className="font-medium text-orange-900 mb-2">
              Order Agreement
            </h4>
            <div className="text-orange-800 space-y-2">
              <p>
                By proceeding with payment, you agree to our{" "}
                <a href="/terms" className="underline hover:text-orange-900">
                  Terms & Conditions
                </a>{" "}
                and{" "}
                <a href="/privacy" className="underline hover:text-orange-900">
                  Privacy Policy
                </a>
                .
              </p>
              {formData.marketingOptIn && (
                <p className="text-xs">
                  ✅ You've opted in to receive marketing communications from
                  Nutra-Vive.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
