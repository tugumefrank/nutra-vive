"use client";
import React, { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CreditCard, Shield, AlertCircle } from "lucide-react";
import StripeCheckout from "../../common/StripeCheckout";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface PaymentStepProps {
  totalAmount: number;
  clientSecret?: string;
  consultationId?: string;
  onPaymentSuccess: () => void;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  totalAmount,
  clientSecret,
  consultationId,
  onPaymentSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(!clientSecret);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (clientSecret) {
      setIsLoading(false);
    }
  }, [clientSecret]);

  console.log("PaymentStep props:", {
    totalAmount,
    clientSecret: clientSecret ? "Present" : "Missing",
    consultationId,
    isLoading,
  });

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-500 rounded-lg">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Secure Payment
            </h3>
            <p className="text-sm text-gray-600">
              Complete your consultation booking
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Amount:</span>
            <span className="text-emerald-600">
              ${(totalAmount || 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div>
          {clientSecret && !isLoading ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: clientSecret,
                appearance: { theme: "stripe" },
              }}
            >
              <StripeCheckout
                amount={totalAmount}
                onPaymentSuccess={onPaymentSuccess}
              />
            </Elements>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
                <p className="text-gray-600">Preparing secure payment...</p>
                {isLoading && clientSecret && (
                  <p className="text-xs text-gray-500 mt-1">
                    Loading payment form...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
          <Shield className="w-4 h-4" />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </div>

      {paymentError && (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <span className="text-red-800">{paymentError}</span>
        </div>
      )}
    </div>
  );
};
