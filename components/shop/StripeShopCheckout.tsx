// "use client";
// import React, { useState, useEffect, useCallback } from "react";
// import {
//   useStripe,
//   useElements,
//   PaymentElement,
// } from "@stripe/react-stripe-js";
// import { Button } from "@/components/ui/button";
// import { Loader2, CreditCard, Shield, AlertCircle } from "lucide-react";
// import { toast } from "sonner";

// interface StripeCheckoutProps {
//   amount: number;
//   onPaymentSuccess: () => void;
//   onPaymentError?: (error: string) => void;
//   disabled?: boolean;
// }

// const StripeShopCheckout: React.FC<StripeCheckoutProps> = ({
//   amount,
//   onPaymentSuccess,
//   onPaymentError,
//   disabled = false,
// }) => {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [paymentElementReady, setPaymentElementReady] = useState(false);
//   const [loadingError, setLoadingError] = useState<string | null>(null);

//   // Debug logging
//   useEffect(() => {
//     console.log("StripeShopCheckout - Stripe loaded:", !!stripe);
//     console.log("StripeShopCheckout - Elements loaded:", !!elements);
//   }, [stripe, elements]);

//   // Handle Stripe and Elements loading
//   useEffect(() => {
//     let timeoutId: NodeJS.Timeout;

//     if (stripe && elements) {
//       console.log("Both Stripe and Elements are available");

//       // Add a small delay to ensure PaymentElement has time to mount
//       timeoutId = setTimeout(() => {
//         setIsLoading(false);
//       }, 500);
//     } else if (stripe && !elements) {
//       console.log("Stripe loaded but Elements not ready yet");

//       // Set a timeout for Elements loading
//       timeoutId = setTimeout(() => {
//         if (!elements) {
//           console.error("Elements failed to load within timeout");
//           setLoadingError(
//             "Payment form failed to load. Please refresh the page."
//           );
//           setIsLoading(false);
//         }
//       }, 10000); // 10 second timeout
//     }

//     return () => {
//       if (timeoutId) {
//         clearTimeout(timeoutId);
//       }
//     };
//   }, [stripe, elements]);

//   // Handle PaymentElement ready state
//   const handlePaymentElementReady = useCallback(() => {
//     console.log("PaymentElement is ready");
//     setPaymentElementReady(true);
//   }, []);

//   // Handle PaymentElement loading complete
//   const handlePaymentElementLoaderStart = useCallback(() => {
//     console.log("PaymentElement loader started");
//   }, []);

//   const handlePaymentElementChange = useCallback((event: any) => {
//     console.log("PaymentElement changed:", event);
//     if (event.complete) {
//       setPaymentElementReady(true);
//     }
//   }, []);

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();

//     if (!stripe || !elements || disabled || isLoading) {
//       console.log("Submit blocked - missing requirements:", {
//         stripe: !!stripe,
//         elements: !!elements,
//         disabled,
//         isLoading,
//       });
//       return;
//     }

//     setIsProcessing(true);

//     try {
//       console.log("Starting payment process...");

//       // Submit the payment elements
//       const { error: submitError } = await elements.submit();
//       if (submitError) {
//         console.error("Submit error:", submitError);
//         throw submitError;
//       }

//       console.log("Elements submitted successfully, confirming payment...");

//       // Confirm payment with Stripe
//       const { error, paymentIntent } = await stripe.confirmPayment({
//         elements,
//         redirect: "if_required",
//       });

//       if (error) {
//         console.error("Payment failed:", error);
//         const errorMessage =
//           error.message || "Payment failed. Please try again.";

//         toast.error(`Payment Failed: ${errorMessage}`);

//         if (onPaymentError) {
//           onPaymentError(errorMessage);
//         }
//       } else if (paymentIntent && paymentIntent.status === "succeeded") {
//         console.log("Payment succeeded:", paymentIntent);

//         toast.success("Payment successful! Your order is being processed.");

//         onPaymentSuccess();
//       }
//     } catch (err: any) {
//       console.error("Unexpected error during payment:", err);
//       const errorMessage =
//         err.message || "An unexpected error occurred. Please try again.";

//       toast.error(errorMessage);

//       if (onPaymentError) {
//         onPaymentError(errorMessage);
//       }
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // Show error state if loading failed
//   if (loadingError) {
//     return (
//       <div className="space-y-4">
//         <div className="p-4 border border-red-200 rounded-xl bg-red-50">
//           <div className="flex items-center gap-2 text-red-700">
//             <AlertCircle className="w-5 h-5" />
//             <div>
//               <p className="font-medium">Payment form failed to load</p>
//               <p className="text-sm">{loadingError}</p>
//             </div>
//           </div>
//           <Button
//             onClick={() => window.location.reload()}
//             variant="outline"
//             className="mt-3 w-full"
//           >
//             Refresh Page
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   // Show loading state while Stripe loads
//   if (isLoading || !stripe || !elements) {
//     return (
//       <div className="space-y-4">
//         <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
//           <div className="flex items-center justify-center p-6">
//             <Loader2 className="w-6 h-6 animate-spin text-green-600 mr-2" />
//             <span className="text-gray-600">Loading payment form...</span>
//           </div>
//         </div>

//         {/* Debug info in development */}
//         {process.env.NODE_ENV === "development" && (
//           <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
//             <div>Stripe: {stripe ? "✓" : "✗"}</div>
//             <div>Elements: {elements ? "✓" : "✗"}</div>
//             <div>Loading: {isLoading ? "✓" : "✗"}</div>
//           </div>
//         )}
//       </div>
//     );
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       {/* Payment Element Container */}
//       <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
//         <div className="flex items-center gap-2 mb-3">
//           <CreditCard className="w-4 h-4 text-gray-600" />
//           <span className="text-sm font-medium text-gray-700">
//             Payment Details
//           </span>
//         </div>

//         <div className="relative">
//           <PaymentElement
//             options={{
//               layout: "tabs",
//               paymentMethodOrder: ["card", "google_pay", "apple_pay"],
//             }}
//             onReady={handlePaymentElementReady}
//             onLoaderStart={handlePaymentElementLoaderStart}
//             onChange={handlePaymentElementChange}
//           />

//           {/* Show loading overlay if PaymentElement isn't ready */}
//           {!paymentElementReady && (
//             <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded">
//               <div className="flex items-center gap-2 text-gray-600">
//                 <Loader2 className="w-4 h-4 animate-spin" />
//                 <span className="text-sm">Preparing payment form...</span>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Submit Button */}
//       <Button
//         type="submit"
//         disabled={!stripe || !elements || isProcessing || disabled || isLoading}
//         className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         {isProcessing ? (
//           <>
//             <Loader2 className="w-5 h-5 mr-2 animate-spin" />
//             Processing Payment...
//           </>
//         ) : (
//           <>
//             <CreditCard className="w-5 h-5 mr-2" />
//             Pay ${amount.toFixed(2)}
//           </>
//         )}
//       </Button>

//       {/* Security Notice */}
//       <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
//         <Shield className="w-3 h-3" />
//         <span>Your payment information is secure and encrypted</span>
//       </div>

//       {/* Debug info in development */}
//       {process.env.NODE_ENV === "development" && (
//         <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded space-y-1">
//           <div>Stripe Ready: {stripe ? "✓" : "✗"}</div>
//           <div>Elements Ready: {elements ? "✓" : "✗"}</div>
//           <div>Payment Element Ready: {paymentElementReady ? "✓" : "✗"}</div>
//           <div>Processing: {isProcessing ? "✓" : "✗"}</div>
//           <div>Disabled: {disabled ? "✓" : "✗"}</div>
//         </div>
//       )}
//     </form>
//   );
// };

// export default StripeShopCheckout;
"use client";

import { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Shield } from "lucide-react";
import { toast } from "sonner";

interface StripeShopCheckoutProps {
  amount: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  disabled?: boolean;
}

export default function StripeShopCheckout({
  amount,
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
}: StripeShopCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe has not loaded yet. Please wait and try again.");
      return;
    }

    if (disabled) {
      toast.error("Please complete all required fields first.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: "if_required", // Only redirect if required by the payment method
      });

      if (error) {
        console.error("Payment confirmation error:", error);
        const errorMsg = error.message || "Payment failed. Please try again.";
        setErrorMessage(errorMsg);
        onPaymentError(errorMsg);
        toast.error(errorMsg);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log("Payment succeeded:", paymentIntent.id);
        toast.success("Payment successful!");
        onPaymentSuccess(paymentIntent.id);
      } else if (paymentIntent && paymentIntent.status === "processing") {
        toast.success(
          "Payment is being processed. You will be notified when it's complete."
        );
        onPaymentSuccess(paymentIntent.id);
      } else if (paymentIntent && paymentIntent.status === "requires_action") {
        // Handle 3D Secure or other authentication
        toast.info("Additional authentication required...");
      } else {
        const errorMsg = "Payment was not completed. Please try again.";
        setErrorMessage(errorMsg);
        onPaymentError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Unexpected error during payment:", err);
      const errorMsg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.";
      setErrorMessage(errorMsg);
      onPaymentError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!stripe || !elements) {
    return (
      <div className="p-6 border border-gray-200 rounded-xl bg-gray-50">
        <div className="flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
          <span className="text-gray-600">Loading payment form...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Payment Element */}
      <div className="p-4 border border-gray-200 rounded-xl bg-white">
        <div className="mb-3 flex items-center text-sm font-medium text-gray-700">
          <CreditCard className="w-4 h-4 mr-2 text-blue-600" />
          Payment Information
        </div>
        <PaymentElement
          options={{
            layout: "tabs",
            fields: {
              billingDetails: "auto",
            },
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || !elements || isProcessing || disabled}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Processing Payment...
          </>
        ) : (
          <>
            <Shield className="w-5 h-5 mr-2" />
            Complete Order - ${amount.toFixed(2)}
          </>
        )}
      </Button>

      {/* Payment Security Note */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Your payment information is secure and encrypted.
          <br />
          You will not be charged until you click "Complete Order."
        </p>
      </div>
    </form>
  );
}
