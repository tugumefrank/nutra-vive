// Create this as /app/test-stripe/page.tsx
"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { createPaymentIntent } from "@/lib/actions/paymentServerActions";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

function TestPaymentForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [status, setStatus] = useState("initializing");

  useEffect(() => {
    console.log("=== STRIPE DEBUG ===");
    console.log("Stripe object:", stripe);
    console.log("Elements object:", elements);
    console.log("Client Secret:", clientSecret);
    console.log("Publishable Key:", process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

    if (stripe && elements) {
      setStatus("ready");
    } else if (stripe && !elements) {
      setStatus("stripe-ready-waiting-elements");
    } else {
      setStatus("waiting-stripe");
    }
  }, [stripe, elements, clientSecret]);

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Stripe Test</h2>

      <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
        <div>
          <strong>Status:</strong> {status}
        </div>
        <div>
          <strong>Stripe:</strong> {stripe ? "✓ Loaded" : "✗ Loading"}
        </div>
        <div>
          <strong>Elements:</strong> {elements ? "✓ Loaded" : "✗ Loading"}
        </div>
        <div>
          <strong>Client Secret:</strong>{" "}
          {clientSecret ? "✓ Present" : "✗ Missing"}
        </div>
      </div>

      {stripe && elements ? (
        <div>
          <div className="mb-4 text-green-600">✓ Stripe is ready!</div>
          <PaymentElement
            onReady={() => {
              console.log("PaymentElement ready!");
              setStatus("payment-element-ready");
            }}
            onLoaderStart={() => {
              console.log("PaymentElement loader started");
            }}
            onChange={(event) => {
              console.log("PaymentElement changed:", event);
            }}
          />
        </div>
      ) : (
        <div className="text-red-600">⚠ Waiting for Stripe to load...</div>
      )}
    </div>
  );
}

export default function StripeTestPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initPayment();
  }, []);

  const initPayment = async () => {
    try {
      console.log("Creating test payment intent...");
      const result = await createPaymentIntent(10.0); // $10 test

      console.log("Payment intent result:", result);

      if (result.success && result.clientSecret) {
        setClientSecret(result.clientSecret);
      } else {
        setError(result.error || "Failed to create payment intent");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>No client secret</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: { theme: "stripe" },
        }}
      >
        <TestPaymentForm clientSecret={clientSecret} />
      </Elements>
    </div>
  );
}
