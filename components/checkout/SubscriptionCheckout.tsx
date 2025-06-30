// components/checkout/SubscriptionCheckout.tsx
"use client";

import React, { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { confirmMembershipSubscription } from "@/lib/actions/membershipSubscriptionServerActions";
import { Loader2 } from "lucide-react";

interface SubscriptionCheckoutProps {
  membershipPrice: number;
  membershipName: string;
  billingFrequency: string;
  subscriptionId: string;
  onPaymentSuccess: () => void;
  onPaymentError?: (error: string) => void;
}

const SubscriptionCheckout: React.FC<SubscriptionCheckoutProps> = ({
  membershipPrice,
  membershipName,
  billingFrequency,
  subscriptionId,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(undefined);

    if (!stripe || !elements) {
      setErrorMessage("Stripe has not been initialized.");
      setLoading(false);
      return;
    }

    try {
      // Submit the payment form
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      // Confirm the subscription payment
      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}/account/memberships?subscription_success=true`,
        },
      });

      if (result.error) {
        throw result.error;
      } else {
        console.log("Subscription payment result:", result);

        if (
          result.paymentIntent &&
          result.paymentIntent.status === "succeeded"
        ) {
          // Confirm the subscription and activate membership
          const confirmResult =
            await confirmMembershipSubscription(subscriptionId);

          if (confirmResult.success) {
            console.log("Subscription confirmed and membership activated");
            onPaymentSuccess();
          } else {
            throw new Error(
              confirmResult.error || "Failed to activate membership"
            );
          }
        } else {
          throw new Error("Payment was not successful. Please try again.");
        }
      }
    } catch (error: any) {
      console.error("Subscription payment error:", error);
      const errorMsg = error.message || "An error occurred during payment.";
      setErrorMessage(errorMsg);
      onPaymentError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formatBillingText = () => {
    const frequency =
      billingFrequency === "yearly"
        ? "year"
        : billingFrequency === "quarterly"
          ? "3 months"
          : "month";
    return `$${membershipPrice.toFixed(2)} per ${frequency}`;
  };

  return (
    <div className="space-y-6">
      {/* Subscription Summary */}
      <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {membershipName}
          </span>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {formatBillingText()}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your membership will auto-renew every{" "}
          {billingFrequency === "yearly"
            ? "year"
            : billingFrequency === "quarterly"
              ? "3 months"
              : "month"}
          . You can cancel anytime.
        </p>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <PaymentElement
            options={{
              layout: "tabs",
              paymentMethodOrder: ["card", "apple_pay", "google_pay"],
            }}
          />
        </div>

        {errorMessage && (
          <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <span className="text-red-800 dark:text-red-400 text-sm">
              {errorMessage}
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            `Subscribe for ${formatBillingText()}`
          )}
        </button>
      </form>

      {/* Security Notice */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          🔒 Your payment information is secure and encrypted
        </p>
      </div>
    </div>
  );
};

export default SubscriptionCheckout;
