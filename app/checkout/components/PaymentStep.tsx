// app/checkout/components/PaymentStep.tsx

import { CreditCard, AlertCircle, Loader2, Gift, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StripeShopCheckout from "@/components/shop/StripeShopCheckout";
import type { StepProps } from "../types";

interface PaymentStepProps extends StepProps {
  total: number;
  clientSecret: string | null;
  orderId: string | null;
  creatingOrder: boolean;
  paymentError: string | null;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  onRetryOrder: () => void;
  isFreeOrder?: boolean;
}

export default function PaymentStep({
  total,
  clientSecret,
  orderId,
  creatingOrder,
  paymentError,
  onPaymentSuccess,
  onPaymentError,
  onRetryOrder,
  isFreeOrder = false,
}: PaymentStepProps) {
  return (
    <Card className="glass border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          {isFreeOrder ? (
            <>
              <Gift className="w-5 h-5 mr-2 text-green-600" />
              Complete Your Free Order
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2 text-orange-600" />
              Complete Your Payment
            </>
          )}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {isFreeOrder 
            ? "Your order total is $0.00 - no payment required!"
            : "Your payment information is encrypted and secure."
          }
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Free Order Success Display */}
        {isFreeOrder && !creatingOrder && !paymentError && (
          <div className="space-y-4">
            <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                🎉 Congratulations! Your order is FREE!
              </h3>
              <p className="text-green-700 mb-4">
                Thanks to your membership benefits and promotions, there's no payment required.
              </p>
              <div className="text-2xl font-bold text-green-600 mb-4">
                Total: $0.00
              </div>
              <Button
                onClick={() => onPaymentSuccess("free_order")}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8"
                disabled={creatingOrder}
              >
                {creatingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Place Free Order
                  </>
                )}
              </Button>
            </div>
            
            {/* Order Benefits Summary */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="text-center text-amber-800">
                <p className="font-medium text-sm">✨ Your Benefits Applied</p>
                <p className="text-xs mt-1">
                  Membership discounts and promotions have covered your entire order!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Error */}
        {paymentError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Unable to process your order</p>
                <p className="text-sm mt-1">{paymentError}</p>
                <Button
                  onClick={onRetryOrder}
                  variant="outline"
                  size="sm"
                  className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
                  disabled={creatingOrder}
                >
                  {creatingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    "Try Again"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Order Creation Loading */}
        {creatingOrder && (
          <div className="p-6 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="flex items-center justify-center text-orange-700">
              <Loader2 className="w-6 h-6 animate-spin mr-3" />
              <div className="text-center">
                <p className="font-medium">
                  {isFreeOrder ? "Processing your free order..." : "Preparing your order..."}
                </p>
                <p className="text-sm mt-1">This will only take a moment</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Success - Order Created (Only for paid orders) */}
        {!isFreeOrder && clientSecret && orderId && !creatingOrder && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="text-green-700">
                <p className="font-medium">✅ Order created successfully!</p>
                {/* <p className="text-sm mt-1">
                  Order ID: <span className="font-mono">{orderId}</span>
                </p> */}
                <p className="text-sm mt-1">
                  Complete your payment below to confirm your order.
                </p>
              </div>
            </div>

            {/* Order Total Display */}
            {/* <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-orange-900">Total Amount</p>
                  <p className="text-sm text-orange-700">
                    All taxes and fees included
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">
                    ${total.toFixed(2)}
                  </p>
                  <p className="text-xs text-orange-600">USD</p>
                </div>
              </div>
            </div> */}

            {/* Stripe Payment Component */}
            <div className="border border-gray-200 rounded-xl p-4 bg-white">
              <StripeShopCheckout
                amount={total}
                onPaymentSuccess={onPaymentSuccess}
                onPaymentError={onPaymentError}
                disabled={false}
              />
            </div>

            {/* Security Notice */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <p className="text-xs text-gray-600">
                🔒 Your payment is secured by 256-bit SSL encryption and
                processed by Stripe
              </p>
            </div>
          </div>
        )}

        {/* No Payment Ready State (Only for paid orders) */}
        {!isFreeOrder && !clientSecret && !creatingOrder && !paymentError && (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl text-center">
            <div className="text-gray-500">
              <CreditCard className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Preparing payment...</p>
              <p className="text-sm mt-1">
                Please wait while we set up your secure payment.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
