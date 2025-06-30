import React, { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";

import { createPaymentIntent } from "@/lib/utils/paymentUtils";

interface StripeCheckoutProps {
  amount: number;
  onPaymentSuccess: () => void;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  amount,
  onPaymentSuccess,
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
      // Create payment intent with submissionId
      const clientSecret = await createPaymentIntent(amount);

      // Submit the payment
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      const result = await stripe.confirmPayment({
        elements,
        clientSecret,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}/consultation/success`,
        },
      });

      if (result.error) {
        throw result.error;
      } else {
        console.log("Payment result:", result);
        if (
          result.paymentIntent &&
          result.paymentIntent.status === "succeeded"
        ) {
          console.log("Payment succeeded");
          onPaymentSuccess();
        } else {
          throw new Error("Payment was not successful. Please try again.");
        }
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setErrorMessage(error.message || "An error occurred during payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-2 rounded-md">
      <PaymentElement />
      {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="text-white w-full p-5 bg-black mt-2 rounded-md font-bold disabled:opacity-50 disabled:animate-pulse"
      >
        {loading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
};

export default StripeCheckout;
