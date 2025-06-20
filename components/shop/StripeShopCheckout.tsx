"use client";

import React, { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Shield } from "lucide-react";
import { toast } from "sonner";

interface StripeCheckoutProps {
  amount: number;
  onPaymentSuccess: () => void;
  onPaymentError?: (error: string) => void;
  disabled?: boolean;
}

const StripeShopCheckout: React.FC<StripeCheckoutProps> = ({
  amount,
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || disabled) {
      return;
    }

    setIsProcessing(true);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        console.error("Payment failed:", error);
        const errorMessage =
          error.message || "Payment failed. Please try again.";

        toast.error(`Payment Failed: ${errorMessage}`);

        if (onPaymentError) {
          onPaymentError(errorMessage);
        }
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log("Payment succeeded:", paymentIntent);

        toast.success("Payment successful! Your order is being processed.");

        onPaymentSuccess();
      }
    } catch (err) {
      console.error("Unexpected error during payment:", err);
      const errorMessage = "An unexpected error occurred. Please try again.";

      toast.error(errorMessage);

      if (onPaymentError) {
        onPaymentError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Payment Element Container */}
      <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            Payment Details
          </span>
        </div>

        <PaymentElement
          options={{
            layout: "tabs",
            paymentMethodOrder: ["card", "apple_pay", "google_pay"],
          }}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || !elements || isProcessing || disabled}
        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 text-lg font-semibold rounded-xl"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </Button>

      {/* Security Notice */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <Shield className="w-3 h-3" />
        <span>Your payment information is secure and encrypted</span>
      </div>
    </form>
  );
};

export default StripeShopCheckout;
