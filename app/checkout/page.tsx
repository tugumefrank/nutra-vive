// "use client";

// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { useRouter } from "next/navigation";
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements } from "@stripe/react-stripe-js";

// import { ArrowLeft, Lock } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { toast } from "sonner";

// // Import our components
// import CheckoutProgress from "./components/CheckoutProgress";
// import ContactStep from "./components/ContactStep";
// import DeliveryMethodStep from "./components/DeliveryMethodStep";
// import AddressStep from "./components/AddressStep";
// import ReviewStep from "./components/ReviewStep";
// import PaymentStep from "./components/PaymentStep";
// import OrderSummary from "./components/OrderSummary"; // Updated component
// import SuccessPage from "./components/SuccessPage";

// // Import actions and types
// import { getCart } from "@/lib/actions/cartServerActions";
// import {
//   createCheckoutSession,
//   confirmPayment,
// } from "@/lib/actions/orderServerActions";

// // Import validation utilities
// import { validateStep, getStepErrors } from "./utils/validation";
// import { checkoutSteps } from "./utils/constants";
// import type { FormData, StepErrors } from "./types";

// // Enhanced Cart interface with promotions
// interface CartWithPromotion {
//   _id: string;
//   items: Array<{
//     _id: string;
//     product: {
//       _id: string;
//       name: string;
//       slug: string;
//       price: number;
//       images: string[];
//       category?: {
//         name: string;
//         slug: string;
//       };
//     };
//     quantity: number;
//     price: number;
//     originalPrice?: number;
//   }>;
//   subtotal: number;
//   promotionDiscount: number;
//   promotionCode?: string;
//   promotionName?: string;
//   finalTotal: number;
//   hasPromotionApplied: boolean;
// }

// // Initialize Stripe
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

// export default function CheckoutPage() {
//   // State management
//   const [cart, setCart] = useState<CartWithPromotion | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [orderComplete, setOrderComplete] = useState(false);
//   const [clientSecret, setClientSecret] = useState<string | null>(null);
//   const [orderId, setOrderId] = useState<string | null>(null);
//   const [paymentError, setPaymentError] = useState<string | null>(null);
//   const [creatingOrder, setCreatingOrder] = useState(false);
//   const [stepErrors, setStepErrors] = useState<StepErrors>({});

//   // Form state
//   const [formData, setFormData] = useState<FormData>({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     address: "",
//     apartment: "",
//     city: "",
//     state: "",
//     zipCode: "",
//     country: "US",
//     deliveryMethod: "standard",
//     notes: "",
//     marketingOptIn: false,
//   });

//   const router = useRouter();

//   // Calculate totals using cart finalTotal (after promotions)
//   const cartSubtotal = cart?.subtotal || 0;
//   const promotionDiscount = cart?.promotionDiscount || 0;
//   const afterPromotionTotal = cart?.finalTotal || 0; // This is subtotal - promotionDiscount

//   // Calculate shipping based on after-promotion total
//   const shipping = calculateShipping(
//     afterPromotionTotal,
//     formData.deliveryMethod
//   );

//   // Calculate tax on (after-promotion total + shipping)
//   const tax = calculateTax(afterPromotionTotal + shipping);

//   // Final order total
//   const total = afterPromotionTotal + shipping + tax;

//   // Helper functions for calculations
//   function calculateShipping(amount: number, method: string): number {
//     if (method === "pickup") return 0;
//     if (amount >= 25) return 0; // Free shipping over $25 after promotions
//     return method === "express" ? 9.99 : 5.99;
//   }

//   function calculateTax(amount: number): number {
//     return Math.round(amount * 0.08 * 100) / 100; // 8% tax
//   }

//   // Load cart data
//   useEffect(() => {
//     loadCart();
//   }, []);

//   // Validate form and create order when on payment step
//   useEffect(() => {
//     if (currentStep === 5 && !clientSecret && !creatingOrder && !paymentError) {
//       const allStepsValid = [1, 2, 3, 4].every((step) =>
//         validateStep(step, formData)
//       );
//       if (allStepsValid && total > 0) {
//         createOrder();
//       }
//     }
//   }, [currentStep, formData, clientSecret, creatingOrder, paymentError, total]);

//   // Reset payment-related state when cart changes (e.g., when promotion is applied/removed)
//   useEffect(() => {
//     if (currentStep === 5 && (clientSecret || orderId)) {
//       // Cart changed while on payment step, need to recreate order
//       setClientSecret(null);
//       setOrderId(null);
//       setPaymentError(null);
//       setCreatingOrder(false);
//     }
//   }, [cart?.finalTotal, cart?.promotionDiscount]); // Watch for cart total changes

//   const loadCart = async () => {
//     try {
//       setLoading(true);
//       const result = await getCart();

//       if (result.success && result.cart) {
//         setCart(result.cart);

//         if (!result.cart.items || result.cart.items.length === 0) {
//           router.push("/cart");
//           return;
//         }
//       } else {
//         router.push("/cart");
//         return;
//       }
//     } catch (error) {
//       console.error("Error loading cart:", error);
//       toast.error("Failed to load cart");
//       router.push("/cart");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle cart updates from promotion applications/removals
//   const handleCartUpdate = (updatedCart: CartWithPromotion) => {
//     setCart(updatedCart);

//     // Show updated totals message
//     const oldTotal = total;
//     const newAfterPromotionTotal = updatedCart.finalTotal;
//     const newShipping = calculateShipping(
//       newAfterPromotionTotal,
//       formData.deliveryMethod
//     );
//     const newTax = calculateTax(newAfterPromotionTotal + newShipping);
//     const newTotal = newAfterPromotionTotal + newShipping + newTax;

//     if (newTotal !== oldTotal) {
//       toast.info(`Order total updated: $${newTotal.toFixed(2)}`, {
//         description: updatedCart.hasPromotionApplied
//           ? `Saved $${updatedCart.promotionDiscount.toFixed(2)} with promotion`
//           : "Promotion removed",
//       });
//     }
//   };

//   const handleInputChange = (
//     field: keyof FormData,
//     value: string | boolean
//   ) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));

//     // Clear errors for this field
//     setStepErrors((prev) => {
//       const newErrors = { ...prev };
//       Object.keys(newErrors).forEach((step) => {
//         if (newErrors[parseInt(step)]?.[field]) {
//           delete newErrors[parseInt(step)][field];
//           if (Object.keys(newErrors[parseInt(step)]).length === 0) {
//             delete newErrors[parseInt(step)];
//           }
//         }
//       });
//       return newErrors;
//     });

//     // Reset payment state when form changes
//     if (clientSecret) {
//       setClientSecret(null);
//       setOrderId(null);
//       setPaymentError(null);
//     }
//   };

//   const validateCurrentStep = (): boolean => {
//     const errors = getStepErrors(currentStep, formData);

//     if (Object.keys(errors).length > 0) {
//       setStepErrors((prev) => ({ ...prev, [currentStep]: errors }));
//       return false;
//     } else {
//       setStepErrors((prev) => {
//         const newErrors = { ...prev };
//         delete newErrors[currentStep];
//         return newErrors;
//       });
//       return true;
//     }
//   };

//   const goToStep = (stepNumber: number) => {
//     // Only allow navigation to previous steps or next step if current is valid
//     if (
//       stepNumber < currentStep ||
//       (stepNumber === currentStep + 1 && validateCurrentStep())
//     ) {
//       setCurrentStep(stepNumber);
//     } else if (stepNumber > currentStep) {
//       // Validate all steps up to the target step
//       let canNavigate = true;
//       for (let i = currentStep; i < stepNumber; i++) {
//         const errors = getStepErrors(i, formData);
//         if (Object.keys(errors).length > 0) {
//           setStepErrors((prev) => ({ ...prev, [i]: errors }));
//           canNavigate = false;
//           break;
//         }
//       }
//       if (canNavigate) {
//         setCurrentStep(stepNumber);
//       } else {
//         toast.error("Please complete all required fields in previous steps");
//       }
//     }
//   };

//   const nextStep = () => {
//     if (validateCurrentStep() && currentStep < checkoutSteps.length) {
//       setCurrentStep(currentStep + 1);
//     }
//   };

//   const prevStep = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   const createOrder = async () => {
//     try {
//       setCreatingOrder(true);
//       setPaymentError(null);

//       const checkoutData = {
//         shippingAddress: {
//           firstName: formData.firstName,
//           lastName: formData.lastName,
//           address1: formData.address,
//           address2: formData.apartment,
//           city: formData.city,
//           province: formData.state,
//           country: formData.country,
//           zip: formData.zipCode,
//           phone: formData.phone,
//         },
//         billingAddress: undefined,
//         email: formData.email,
//         phone: formData.phone,
//         deliveryMethod: formData.deliveryMethod as
//           | "standard"
//           | "express"
//           | "pickup",
//         notes: formData.notes,
//         marketingOptIn: formData.marketingOptIn,
//       };

//       const result = await createCheckoutSession(checkoutData);

//       if (result.success && result.clientSecret && result.orderId) {
//         setOrderId(result.orderId);
//         setClientSecret(result.clientSecret);
//         toast.success("Order created! Complete payment to confirm.");
//       } else {
//         setPaymentError(result.error || "Failed to create order");
//         toast.error(result.error || "Failed to create order");
//       }
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : "Failed to create order";
//       setPaymentError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setCreatingOrder(false);
//     }
//   };

//   const handlePaymentSuccess = async (paymentIntentId: string) => {
//     try {
//       const result = await confirmPayment(paymentIntentId);

//       if (result.success && result.order) {
//         setOrderComplete(true);
//         toast.success(
//           "Order placed successfully! You will receive a confirmation email shortly."
//         );
//       } else {
//         toast.error(
//           result.error ||
//             "Payment processed but there was an issue confirming your order. Please contact support."
//         );
//       }
//     } catch (error) {
//       toast.error(
//         "Payment processed but there was an issue confirming your order. Please contact support."
//       );
//     }
//   };

//   const handlePaymentError = (error: string) => {
//     setPaymentError(error);
//     toast.error("Payment failed: " + error);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
//         <div className="text-center space-y-4">
//           <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto" />
//           <p className="text-gray-600">Loading checkout...</p>
//         </div>
//       </div>
//     );
//   }

//   if (orderComplete && orderId) {
//     return <SuccessPage orderId={orderId} />;
//   }

//   const renderStepContent = () => {
//     const stepProps = {
//       formData,
//       onInputChange: handleInputChange,
//       errors: stepErrors[currentStep] || {},
//       subtotal: afterPromotionTotal, // Use after-promotion total for step calculations
//       shipping,
//     };

//     switch (currentStep) {
//       case 1:
//         return <ContactStep {...stepProps} />;
//       case 2:
//         return <DeliveryMethodStep {...stepProps} />;
//       case 3:
//         return <AddressStep {...stepProps} />;
//       case 4:
//         return (
//           <ReviewStep {...stepProps} cart={cart} total={total} tax={tax} />
//         );
//       case 5:
//         return (
//           <Elements
//             stripe={stripePromise}
//             options={{
//               clientSecret: clientSecret || undefined,
//               appearance: {
//                 theme: "stripe",
//                 variables: {
//                   colorPrimary: "#ea580c",
//                   colorBackground: "#ffffff",
//                   colorText: "#374151",
//                   colorDanger: "#ef4444",
//                   borderRadius: "8px",
//                 },
//               },
//             }}
//             key={clientSecret}
//           >
//             <PaymentStep
//               {...stepProps}
//               total={total}
//               clientSecret={clientSecret}
//               orderId={orderId}
//               creatingOrder={creatingOrder}
//               paymentError={paymentError}
//               onPaymentSuccess={handlePaymentSuccess}
//               onPaymentError={handlePaymentError}
//               onRetryOrder={createOrder}
//             />
//           </Elements>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
//       {/* Header */}
//       <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-orange-100">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <Button variant="ghost" asChild>
//               <Link href="/cart">
//                 <ArrowLeft className="w-4 h-4 mr-2" />
//                 <span className="hidden sm:inline">Back to Cart</span>
//                 <span className="sm:hidden">Cart</span>
//               </Link>
//             </Button>
//             <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
//               <span className="hidden sm:inline">Secure Checkout</span>
//               <span className="sm:hidden">Checkout</span>
//             </h1>
//             <div className="flex items-center text-sm text-gray-600">
//               <Lock className="w-4 h-4 mr-1" />
//               Secure
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Progress Indicator */}
//       <CheckoutProgress
//         currentStep={currentStep}
//         onStepClick={goToStep}
//         stepErrors={stepErrors}
//         formData={formData}
//       />

//       <div className="container mx-auto px-4 pb-8">
//         <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
//           {/* Main Content */}
//           <div className="lg:col-span-2">
//             <motion.div
//               key={currentStep}
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: -20 }}
//               transition={{ duration: 0.3 }}
//             >
//               {renderStepContent()}

//               {/* Navigation Buttons */}
//               <div className="flex justify-between mt-6">
//                 <Button
//                   variant="outline"
//                   onClick={prevStep}
//                   disabled={currentStep === 1}
//                   className="flex items-center border-orange-200 text-orange-600 hover:bg-orange-50"
//                 >
//                   <ArrowLeft className="w-4 h-4 mr-2" />
//                   Previous
//                 </Button>

//                 {currentStep < checkoutSteps.length && (
//                   <Button
//                     onClick={nextStep}
//                     disabled={
//                       Object.keys(stepErrors[currentStep] || {}).length > 0
//                     }
//                     className="flex items-center bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
//                   >
//                     Next
//                     <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
//                   </Button>
//                 )}
//               </div>
//             </motion.div>
//           </div>

//           {/* Order Summary Sidebar */}
//           <div className="lg:col-span-1">
//             <OrderSummary
//               cart={cart}
//               cartSubtotal={cartSubtotal}
//               promotionDiscount={promotionDiscount}
//               afterPromotionTotal={afterPromotionTotal}
//               shipping={shipping}
//               tax={tax}
//               total={total}
//               onCartUpdate={handleCartUpdate} // Pass the cart update handler
//             />
//           </div>
//         </div>
//       </div>

//       {/* Mobile Bottom Navigation Spacer */}
//       <div className="h-20 md:hidden" />
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

// Import our components
import CheckoutProgress from "./components/CheckoutProgress";
import ContactStep from "./components/ContactStep";
import DeliveryMethodStep from "./components/DeliveryMethodStep";
import AddressStep from "./components/AddressStep";
import ReviewStep from "./components/ReviewStep";
import PaymentStep from "./components/PaymentStep";
import OrderSummary from "./components/OrderSummary"; // Updated component
import SuccessPage from "./components/SuccessPage";

// Import actions and types
import { getCart } from "@/lib/actions/cartServerActions";
import {
  createCheckoutSession,
  confirmPayment,
} from "@/lib/actions/orderServerActions";

// Import validation utilities
import { validateStep, getStepErrors } from "./utils/validation";
import { checkoutSteps } from "./utils/constants";
import type { FormData, StepErrors } from "./types";

// Enhanced Cart interface with promotions
interface CartWithPromotion {
  _id: string;
  items: Array<{
    _id: string;
    product: {
      _id: string;
      name: string;
      slug: string;
      price: number;
      images: string[];
      category?: {
        name: string;
        slug: string;
      };
    };
    quantity: number;
    price: number;
    originalPrice?: number;
  }>;
  subtotal: number;
  promotionDiscount: number;
  promotionCode?: string;
  promotionName?: string;
  finalTotal: number;
  hasPromotionApplied: boolean;
}

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function CheckoutPage() {
  // State management
  const [cart, setCart] = useState<CartWithPromotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [stepErrors, setStepErrors] = useState<StepErrors>({});

  // Form state
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    deliveryMethod: "standard",
    notes: "",
    marketingOptIn: false,
  });

  const router = useRouter();

  // Calculate totals using cart finalTotal (after promotions)
  const cartSubtotal = cart?.subtotal || 0;
  const promotionDiscount = cart?.promotionDiscount || 0;
  const afterPromotionTotal = cart?.finalTotal || 0; // This is subtotal - promotionDiscount

  // Calculate shipping based on after-promotion total
  const shipping = calculateShipping(
    afterPromotionTotal,
    formData.deliveryMethod
  );

  // Calculate tax on (after-promotion total + shipping)
  const tax = calculateTax(afterPromotionTotal + shipping);

  // Final order total
  const total = afterPromotionTotal + shipping + tax;

  // Helper functions for calculations
  function calculateShipping(amount: number, method: string): number {
    if (method === "pickup") return 0; // Always free for pickup
    if (amount >= 25) return 0; // Free shipping over $25 after promotions
    return method === "express" ? 9.99 : 5.99;
  }

  function calculateTax(amount: number): number {
    return Math.round(amount * 0.08 * 100) / 100; // 8% tax
  }

  // Load cart data
  useEffect(() => {
    loadCart();
  }, []);

  // Validate form and create order when on payment step
  useEffect(() => {
    if (currentStep === 5 && !clientSecret && !creatingOrder && !paymentError) {
      const allStepsValid = [1, 2, 3, 4].every((step) =>
        validateStep(step, formData)
      );
      if (allStepsValid && total > 0) {
        createOrder();
      }
    }
  }, [currentStep, formData, clientSecret, creatingOrder, paymentError, total]);

  // Reset payment-related state when cart changes (e.g., when promotion is applied/removed)
  useEffect(() => {
    if (currentStep === 5 && (clientSecret || orderId)) {
      // Cart changed while on payment step, need to recreate order
      setClientSecret(null);
      setOrderId(null);
      setPaymentError(null);
      setCreatingOrder(false);
    }
  }, [cart?.finalTotal, cart?.promotionDiscount]); // Watch for cart total changes

  const loadCart = async () => {
    try {
      setLoading(true);
      const result = await getCart();

      if (result.success && result.cart) {
        setCart(result.cart);

        if (!result.cart.items || result.cart.items.length === 0) {
          router.push("/cart");
          return;
        }
      } else {
        router.push("/cart");
        return;
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      toast.error("Failed to load cart");
      router.push("/cart");
    } finally {
      setLoading(false);
    }
  };

  // Handle cart updates from promotion applications/removals
  const handleCartUpdate = (updatedCart: CartWithPromotion) => {
    setCart(updatedCart);

    // Show updated totals message
    const oldTotal = total;
    const newAfterPromotionTotal = updatedCart.finalTotal;
    const newShipping = calculateShipping(
      newAfterPromotionTotal,
      formData.deliveryMethod
    );
    const newTax = calculateTax(newAfterPromotionTotal + newShipping);
    const newTotal = newAfterPromotionTotal + newShipping + newTax;

    if (newTotal !== oldTotal) {
      toast.info(`Order total updated: $${newTotal.toFixed(2)}`, {
        description: updatedCart.hasPromotionApplied
          ? `Saved $${updatedCart.promotionDiscount.toFixed(2)} with promotion`
          : "Promotion removed",
      });
    }
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear errors for this field
    setStepErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((step) => {
        if (newErrors[parseInt(step)]?.[field]) {
          delete newErrors[parseInt(step)][field];
          if (Object.keys(newErrors[parseInt(step)]).length === 0) {
            delete newErrors[parseInt(step)];
          }
        }
      });
      return newErrors;
    });

    // Reset payment state when form changes
    if (clientSecret) {
      setClientSecret(null);
      setOrderId(null);
      setPaymentError(null);
    }
  };

  const validateCurrentStep = (): boolean => {
    const errors = getStepErrors(currentStep, formData);

    if (Object.keys(errors).length > 0) {
      setStepErrors((prev) => ({ ...prev, [currentStep]: errors }));
      return false;
    } else {
      setStepErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[currentStep];
        return newErrors;
      });
      return true;
    }
  };

  const goToStep = (stepNumber: number) => {
    // Only allow navigation to previous steps or next step if current is valid
    if (
      stepNumber < currentStep ||
      (stepNumber === currentStep + 1 && validateCurrentStep())
    ) {
      setCurrentStep(stepNumber);
    } else if (stepNumber > currentStep) {
      // Validate all steps up to the target step
      let canNavigate = true;
      for (let i = currentStep; i < stepNumber; i++) {
        const errors = getStepErrors(i, formData);
        if (Object.keys(errors).length > 0) {
          setStepErrors((prev) => ({ ...prev, [i]: errors }));
          canNavigate = false;
          break;
        }
      }
      if (canNavigate) {
        setCurrentStep(stepNumber);
      } else {
        toast.error("Please complete all required fields in previous steps");
      }
    }
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < checkoutSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const createOrder = async () => {
    try {
      setCreatingOrder(true);
      setPaymentError(null);

      // Conditionally include shipping address based on delivery method
      const baseCheckoutData = {
        email: formData.email,
        phone: formData.phone,
        deliveryMethod: formData.deliveryMethod as
          | "standard"
          | "express"
          | "pickup",
        notes: formData.notes,
        marketingOptIn: formData.marketingOptIn,
      };

      // Only include shipping address for non-pickup orders
      const checkoutData =
        formData.deliveryMethod === "pickup"
          ? {
              ...baseCheckoutData,
              // For pickup orders, use minimal address with just name and contact info
              shippingAddress: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                address1: "Store Pickup", // Placeholder for pickup
                address2: "",
                city: "Store Location",
                province: "N/A",
                country: formData.country,
                zip: "00000",
                phone: formData.phone,
              },
              billingAddress: undefined,
            }
          : {
              ...baseCheckoutData,
              shippingAddress: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                address1: formData.address,
                address2: formData.apartment,
                city: formData.city,
                province: formData.state,
                country: formData.country,
                zip: formData.zipCode,
                phone: formData.phone,
              },
              billingAddress: undefined,
            };

      const result = await createCheckoutSession(checkoutData);

      if (result.success && result.clientSecret && result.orderId) {
        setOrderId(result.orderId);
        setClientSecret(result.clientSecret);
        toast.success("Order created! Complete payment to confirm.");
      } else {
        setPaymentError(result.error || "Failed to create order");
        toast.error(result.error || "Failed to create order");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create order";
      setPaymentError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setCreatingOrder(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      const result = await confirmPayment(paymentIntentId);

      if (result.success && result.order) {
        setOrderComplete(true);
        toast.success(
          "Order placed successfully! You will receive a confirmation email shortly."
        );
      } else {
        toast.error(
          result.error ||
            "Payment processed but there was an issue confirming your order. Please contact support."
        );
      }
    } catch (error) {
      toast.error(
        "Payment processed but there was an issue confirming your order. Please contact support."
      );
    }
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    toast.error("Payment failed: " + error);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (orderComplete && orderId) {
    return <SuccessPage orderId={orderId} />;
  }

  const renderStepContent = () => {
    const stepProps = {
      formData,
      onInputChange: handleInputChange,
      errors: stepErrors[currentStep] || {},
      subtotal: afterPromotionTotal, // Use after-promotion total for step calculations
      shipping,
    };

    switch (currentStep) {
      case 1:
        return <ContactStep {...stepProps} />;
      case 2:
        return <DeliveryMethodStep {...stepProps} />;
      case 3:
        return <AddressStep {...stepProps} />;
      case 4:
        return (
          <ReviewStep {...stepProps} cart={cart} total={total} tax={tax} />
        );
      case 5:
        return (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: clientSecret || undefined,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#ea580c",
                  colorBackground: "#ffffff",
                  colorText: "#374151",
                  colorDanger: "#ef4444",
                  borderRadius: "8px",
                },
              },
            }}
            key={clientSecret}
          >
            <PaymentStep
              {...stepProps}
              total={total}
              clientSecret={clientSecret}
              orderId={orderId}
              creatingOrder={creatingOrder}
              paymentError={paymentError}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onRetryOrder={createOrder}
            />
          </Elements>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-orange-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link href="/cart">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Cart</span>
                <span className="sm:hidden">Cart</span>
              </Link>
            </Button>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              <span className="hidden sm:inline">Secure Checkout</span>
              <span className="sm:hidden">Checkout</span>
            </h1>
            <div className="flex items-center text-sm text-gray-600">
              <Lock className="w-4 h-4 mr-1" />
              Secure
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <CheckoutProgress
        currentStep={currentStep}
        onStepClick={goToStep}
        stepErrors={stepErrors}
        formData={formData}
      />

      <div className="container mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < checkoutSteps.length && (
                  <Button
                    onClick={nextStep}
                    disabled={
                      Object.keys(stepErrors[currentStep] || {}).length > 0
                    }
                    className="flex items-center bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                  >
                    Next
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </Button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummary
              cart={cart}
              cartSubtotal={cartSubtotal}
              promotionDiscount={promotionDiscount}
              afterPromotionTotal={afterPromotionTotal}
              shipping={shipping}
              tax={tax}
              total={total}
              onCartUpdate={handleCartUpdate} // Pass the cart update handler
            />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Spacer */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
