"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import {
  ArrowLeft,
  Lock,
  Crown,
  Gift,
  TrendingUp,
  Sparkles,
  Info,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { toast } from "sonner";

// Import our components
import CheckoutProgress from "./components/CheckoutProgress";
import ContactStep from "./components/ContactStep";
import DeliveryMethodStep from "./components/DeliveryMethodStep";
import AddressStep from "./components/AddressStep";
import ReviewStep from "./components/ReviewStep";
import PaymentStep from "./components/PaymentStep";
import SuccessPage from "./components/SuccessPage";
import ValidationSummary from "./components/ValidationSummary";

// Import unified cart actions and types
import { getCart, refreshCartPrices } from "@/lib/actions/unifiedCartServerActions";
import {
  createCheckoutSession,
  confirmPayment,
} from "@/lib/actions/orderServerActions";
import { useUnifiedCartStore } from "@/store/unifiedCartStore";

// Import validation utilities
import { validateStep, getStepErrors } from "./utils/validation";
import { checkoutSteps } from "./utils/constants";
import type { FormData, StepErrors } from "./types";
import { UnifiedCart } from "@/types/unifiedCart";
import EnhancedOrderSummary from "./components/OrderSummary";
import {
  getUserProfile,
  saveCheckoutPreferences,
} from "@/lib/actions/userProfileServerActions";

// Initialize Stripe
console.log("🔧 Stripe Setup:", {
  hasPublicKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
  publicKeyStart: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY?.slice(0, 10)
});

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function CheckoutPage() {
  // State management
  const [cart, setCart] = useState<UnifiedCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [stepErrors, setStepErrors] = useState<StepErrors>({});
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

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

  // Get cart clearing function from unified cart store
  const { clearCartOptimistic } = useUnifiedCartStore();

  // Calculate totals using unified cart (after membership + promotions)
  const cartSubtotal = cart?.subtotal || 0;
  const membershipDiscount = cart?.membershipDiscount || 0;
  const promotionDiscount = cart?.promotionDiscount || 0;
  const afterDiscountsTotal = cart?.afterDiscountsTotal || 0; // This is subtotal - membershipDiscount - promotionDiscount

  // Helper functions for calculations
  function calculateShipping(
    amount: number,
    method: string,
    isFreeOrder: boolean = false
  ): number {
    if (isFreeOrder) return 0; // No shipping for free membership orders
    if (method === "pickup") return 0; // Always free for pickup
    if (amount >= 25) return 0; // Free shipping over $25 after all discounts
    return method === "express" ? 9.99 : 5.99;
  }

  function calculateTax(amount: number, isFreeOrder: boolean = false): number {
    return 0; // Tax calculation disabled
  }

  // Check if this is a free membership order (afterDiscountsTotal is exactly $0)
  const isFreeOrder = afterDiscountsTotal <= 0;

  // Calculate shipping and tax based on whether it's a free order
  const shipping = calculateShipping(
    afterDiscountsTotal,
    formData.deliveryMethod,
    isFreeOrder
  );

  const tax = calculateTax(afterDiscountsTotal + shipping, isFreeOrder);

  // Final order total
  const total = afterDiscountsTotal + shipping + tax;

  // Load cart data and user profile
  useEffect(() => {
    loadCart();
    loadUserProfile();
  }, []);

  // Additional useEffect to auto-navigate after profile loads
  useEffect(() => {
    console.log("🔄 Profile effect triggered:", {
      userProfile: !!userProfile,
      currentStep,
      profileLoading,
      loading,
    });

    // If we have a user profile and we're still on step 1, navigate to review
    if (userProfile && currentStep === 1 && !profileLoading && !loading) {
      console.log("🚀 Auto-navigating to Review step via useEffect");
      setCurrentStep(4);
      toast.success("Welcome back! Your information has been pre-filled.");
    }
  }, [userProfile, currentStep, profileLoading, loading]);

  // Load user profile and pre-fill form data
  const loadUserProfile = async () => {
    try {
      setProfileLoading(true);
      console.log("🚀 Starting getUserProfile...");

      const result = await getUserProfile();

      console.log("🔍 getUserProfile result:", result);
      console.log("🔍 Result details:", {
        success: result.success,
        hasProfile: !!result.profile,
        hasUser: !!result.user,
        error: result.error,
      });

      if (result.success && result.profile && result.user) {
        console.log("✅ Profile and user found");
        console.log("📋 User data:", result.user);
        console.log("📋 Profile data:", result.profile);
        setUserProfile(result.profile);

        // Pre-fill form with user data and default address
        // First try defaultShippingAddress, then look for a default saved address
        let defaultAddress = result.profile.defaultShippingAddress;

        // If no default shipping address, try to find a default saved address
        if (!defaultAddress || !defaultAddress.address1) {
          const defaultSavedAddress = result.profile.savedAddresses?.find(
            (addr) => addr.isDefault
          );
          if (defaultSavedAddress) {
            defaultAddress = defaultSavedAddress;
            console.log(
              "📦 Using default saved address:",
              defaultSavedAddress.label
            );
          }
        }

        // If still no address, use the first saved address if available
        if (!defaultAddress || !defaultAddress.address1) {
          const firstSavedAddress = result.profile.savedAddresses?.[0];
          if (firstSavedAddress && firstSavedAddress.address1) {
            defaultAddress = firstSavedAddress;
            console.log(
              "📦 Using first saved address:",
              firstSavedAddress.label
            );
          }
        }

        console.log("📦 Selected address for form:", defaultAddress);

        const newFormData = {
          firstName: result.user.firstName || "",
          lastName: result.user.lastName || "",
          email: result.user.email || "",
          phone: result.user.phone || defaultAddress?.phone || "",
          deliveryMethod: result.profile.preferredDeliveryMethod || "standard",
          marketingOptIn: result.profile.marketingOptIn || false,
          // Pre-fill address if available
          address: defaultAddress?.address1 || "",
          apartment: defaultAddress?.address2 || "",
          city: defaultAddress?.city || "",
          state: defaultAddress?.state || "",
          zipCode: defaultAddress?.zipCode || "",
          country: defaultAddress?.country || "US",
          notes: "",
        };

        setFormData(newFormData);

        // Check if user has a profile with basic information
        // If they have a profile and have placed orders before (totalOrders > 0),
        // or have a saved address, they should go straight to review
        const hasUsableProfile =
          result.user.firstName &&
          result.user.lastName &&
          result.user.email &&
          // Has placed orders before
          (result.profile.totalOrders > 0 ||
            // Has a default shipping address with minimal required fields
            (defaultAddress &&
              defaultAddress.address1 &&
              defaultAddress.city) ||
            // Has any saved addresses
            (result.profile.savedAddresses &&
              result.profile.savedAddresses.length > 0));

        console.log("🔍 Profile analysis:", {
          hasUser: !!result.user,
          hasProfile: !!result.profile,
          totalOrders: result.profile.totalOrders,
          hasDefaultAddress: !!defaultAddress,
          defaultAddressValid: !!(
            defaultAddress &&
            defaultAddress.address1 &&
            defaultAddress.city
          ),
          savedAddressesCount: result.profile.savedAddresses?.length || 0,
          shouldAutoNavigate: hasUsableProfile,
        });

        // Auto-navigate to Review step if user has a usable profile
        if (hasUsableProfile) {
          console.log("✅ Usable profile detected, navigating to Review step");
          setCurrentStep(4); // Go directly to Review step (step 4)

          // Clear any previous step errors since we're auto-filling
          setStepErrors({});

          // Show a helpful toast
          toast.success("Welcome back! Your information has been pre-filled.");
        } else {
          console.log(
            "⚠️ New user or incomplete profile, staying on Contact step"
          );

          // TEMPORARY: Force navigation for testing if user has basic info
          if (
            result.user.firstName &&
            result.user.lastName &&
            result.user.email
          ) {
            console.log("🚀 FORCING navigation to Review step for testing");
            setCurrentStep(4);
            setStepErrors({});
            toast.success(
              "Welcome back! Your information has been pre-filled."
            );
          } else {
            toast.info("Please complete your profile information.");
          }
        }
      } else {
        console.log("❌ No profile or user found:", {
          success: result.success,
          hasProfile: !!result.profile,
          hasUser: !!result.user,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("❌ Error loading user profile:", error);
      console.error("❌ Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
      });
    } finally {
      setProfileLoading(false);
      console.log("✅ Profile loading completed, setProfileLoading(false)");
    }
  };

  // Validate form and create order when on payment step
  useEffect(() => {
    console.log("🔍 Payment step effect:", {
      currentStep,
      hasClientSecret: !!clientSecret,
      creatingOrder,
      paymentError,
      total,
      shouldCreateOrder: currentStep === 5 && !clientSecret && !creatingOrder && !paymentError
    });

    if (currentStep === 5 && !clientSecret && !creatingOrder && !paymentError) {
      const stepValidations = [1, 2, 3, 4].map(step => ({
        step,
        isValid: validateStep(step, formData),
        errors: getStepErrors(step, formData)
      }));
      
      const allStepsValid = stepValidations.every(v => v.isValid);
      const invalidSteps = stepValidations.filter(v => !v.isValid);
      
      console.log("🔍 Detailed validation:", { 
        stepValidations, 
        allStepsValid, 
        invalidSteps,
        total 
      });
      
      if (!allStepsValid) {
        // Set validation errors for display
        const allErrors = invalidSteps.reduce((acc, stepValidation) => ({
          ...acc,
          [stepValidation.step]: stepValidation.errors
        }), {});
        setStepErrors(allErrors);
        
        // Navigate to the first step with validation errors
        const firstInvalidStep = invalidSteps[0].step;
        setCurrentStep(firstInvalidStep);
        
        // Create detailed error message
        const stepNames = {
          1: "Contact Information",
          2: "Delivery Method", 
          3: "Shipping Address",
          4: "Order Review"
        };
        
        const errorDetails = invalidSteps.map(stepValidation => {
          const stepName = stepNames[stepValidation.step as keyof typeof stepNames] || `Step ${stepValidation.step}`;
          const fieldNames = Object.keys(stepValidation.errors);
          return `${stepName}: ${fieldNames.join(', ')}`;
        }).join('; ');
        
        console.log("❌ Validation failed for steps:", invalidSteps.map(s => s.step));
        setPaymentError(`Please complete the required fields. ${errorDetails}`);
        
        // Show helpful toast message
        toast.error(`Please complete all required fields in ${stepNames[firstInvalidStep as keyof typeof stepNames] || `Step ${firstInvalidStep}`}`, {
          description: "We've navigated you to the step that needs attention.",
          duration: 5000
        });
        
        // Smooth scroll to show the form
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
      } else if (allStepsValid && total > 0) {
        console.log("🚀 Triggering createOrder...");
        createOrder();
      } else if (total <= 0) {
        console.log("🆓 Free order detected, should handle differently");
      }
    }
  }, [currentStep, formData, clientSecret, creatingOrder, paymentError, total]);

  // Reset payment-related state when cart changes
  useEffect(() => {
    if (currentStep === 5 && (clientSecret || orderId)) {
      setClientSecret(null);
      setOrderId(null);
      setPaymentError(null);
      setCreatingOrder(false);
    }
  }, [cart?.finalTotal, cart?.membershipDiscount, cart?.promotionDiscount]);

  const loadCart = async () => {
    try {
      setLoading(true);
      
      // First, refresh cart prices to ensure they reflect any recent auto-discounts
      await refreshCartPrices();
      
      // Then get the updated cart
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
  const handleCartUpdate = (updatedCart: UnifiedCart) => {
    setCart(updatedCart);

    // Show updated totals message
    const oldTotal = total;
    const newAfterDiscountsTotal = updatedCart.afterDiscountsTotal || 0;
    const newShipping = calculateShipping(
      newAfterDiscountsTotal,
      formData.deliveryMethod
    );
    const newTax = calculateTax(newAfterDiscountsTotal + newShipping);
    const newTotal = newAfterDiscountsTotal + newShipping + newTax;

    if (Math.abs(newTotal - oldTotal) > 0.01) {
      const totalSavings =
        (updatedCart.membershipDiscount || 0) +
        (updatedCart.promotionDiscount || 0);
      toast.info(`Order total updated: $${newTotal.toFixed(2)}`, {
        description:
          totalSavings > 0
            ? `Total savings: $${totalSavings.toFixed(2)}`
            : "Discounts removed",
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
    if (
      stepNumber < currentStep ||
      (stepNumber === currentStep + 1 && validateCurrentStep())
    ) {
      setCurrentStep(stepNumber);
      // Smooth scroll to top when navigating to any step
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (stepNumber > currentStep) {
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
        // Smooth scroll to top when navigating to any step
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error("Please complete all required fields in previous steps");
      }
    }
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < checkoutSteps.length) {
      setCurrentStep(currentStep + 1);
      // Smooth scroll to top when moving to next step
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Smooth scroll to top when moving to previous step
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const createOrder = async () => {
    try {
      setCreatingOrder(true);
      setPaymentError(null);

      console.log("🚀 Starting order creation process...");

      // Add timeout to prevent hanging forever
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Order creation timed out after 30 seconds")), 30000);
      });

      // Save user preferences first
      console.log("💾 Saving user preferences...");
      await Promise.race([saveUserPreferences(), timeoutPromise]);

      const baseCheckoutData = {
        email: formData.email,
        phone: formData.phone,
        deliveryMethod: formData.deliveryMethod as
          | "standard"
          | "pickup",
        notes: formData.notes,
        marketingOptIn: formData.marketingOptIn,
      };

      const checkoutData =
        formData.deliveryMethod === "pickup"
          ? {
              ...baseCheckoutData,
              shippingAddress: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                address1: "Store Pickup",
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

      // Check if order is free (total is exactly $0.00 for membership)
      if (total <= 0) {
        console.log("🆓 Creating free order with total:", total);

        // For free orders, skip Stripe and directly create the order
        console.log("📝 Calling createCheckoutSession for free order...");
        const result = await Promise.race([
          createCheckoutSession({
            ...checkoutData,
            skipPayment: true, // Add this flag to indicate free order
          }),
          timeoutPromise
        ]) as any;

        console.log("📝 Free order creation result:", result);

        if (result.success && result.orderId) {
          setOrderId(result.orderId);
          console.log("✅ Free order created with ID:", result.orderId);

          // For free orders, no need to confirm payment - order is already complete
          setOrderComplete(true);

          // Clear the cart immediately after successful free order completion
          await clearCartOptimistic();

          toast.success("Free order placed successfully!");
        } else {
          setPaymentError(result.error || "Failed to create free order");
          toast.error(result.error || "Failed to create free order");
        }
      } else {
        // Regular paid orders - use Stripe
        console.log("💳 Creating paid order with total:", total);
        const result = await Promise.race([
          createCheckoutSession(checkoutData),
          timeoutPromise
        ]) as any;

        if (result.success && result.clientSecret && result.orderId) {
          setOrderId(result.orderId);
          setClientSecret(result.clientSecret);
          toast.success("Order created! Complete payment to confirm.");
        } else {
          setPaymentError(result.error || "Failed to create order");
          toast.error(result.error || "Failed to create order");
        }
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

  // Save user preferences and address
  const saveUserPreferences = async () => {
    try {
      const addressData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address1: formData.address,
        address2: formData.apartment,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        phone: formData.phone,
      };

      await saveCheckoutPreferences({
        address: addressData,
        deliveryMethod: formData.deliveryMethod as
          | "standard"
          | "pickup",
        marketingOptIn: formData.marketingOptIn,
        setAsDefault: true, // Always save as default for first-time users
        addressLabel: "Home",
      });
    } catch (error) {
      console.error("Error saving user preferences:", error);
      // Don't fail the order if preference saving fails
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // For paid orders, confirm payment
      const result = await confirmPayment(paymentIntentId) as any;

      if (result.success && result.order) {
        setOrderComplete(true);

        // Clear the cart immediately after successful order completion
        await clearCartOptimistic();

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
      subtotal: afterDiscountsTotal,
      shipping,
    };

    // Check if user is a returning user (has profile)
    const isReturningUser = !!userProfile;

    switch (currentStep) {
      case 1:
        return <ContactStep {...stepProps} isReturningUser={isReturningUser} />;
      case 2:
        return (
          <DeliveryMethodStep
            {...stepProps}
            afterDiscountsTotal={afterDiscountsTotal}
          />
        );
      case 3:
        return <AddressStep {...stepProps} />;
      case 4:
        return (
          <ReviewStep
            {...stepProps}
            cart={cart}
            total={total}
            tax={tax}
            onEditStep={goToStep}
          />
        );
      case 5:
        // For free orders, show a special free order confirmation
        if (total <= 0) {
          return (
            <div className="text-center py-8 space-y-6">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">
                Congratulations! Your Order is FREE!
              </h3>
              <p className="text-gray-600 mb-6">
                Your membership benefits have made this order completely free!
              </p>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6 max-w-md mx-auto">
                <div className="text-2xl font-bold text-green-600 mb-4">
                  Total: $0.00
                </div>
                <p className="text-green-700 text-sm mb-4">
                  No payment required - your order will be processed
                  immediately.
                </p>
                <Button
                  onClick={createOrder}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 w-full"
                  disabled={creatingOrder}
                >
                  {creatingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Placing Free Order...
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4 mr-2" />
                      Place Free Order
                    </>
                  )}
                </Button>
              </div>

              {paymentError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-w-md mx-auto">
                  <div className="flex items-center text-red-700">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">{paymentError}</span>
                  </div>
                  <Button
                    onClick={createOrder}
                    variant="outline"
                    size="sm"
                    className="mt-3 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          );
        }

        console.log("🔧 Stripe Elements Debug:", {
          clientSecret: clientSecret,
          hasClientSecret: !!clientSecret,
          stripePublicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY?.slice(0, 10) + "...",
          orderId: orderId,
          total: total
        });

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
              isFreeOrder={false}
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
            <div className="flex items-center gap-2">
              <div className="flex items-center text-sm text-gray-600">
                <Lock className="w-4 h-4 mr-1" />
                Secure
              </div>
              {cart?.hasMembershipApplied && (
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-700 text-xs"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  Member
                </Badge>
              )}
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
            {/* Validation Summary - only show when there are errors */}
            <ValidationSummary
              stepErrors={stepErrors}
              currentStep={currentStep}
              onNavigateToStep={goToStep}
              formData={formData}
            />
            
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

          {/* Enhanced Order Summary Sidebar with Unified Cart Support */}
          <div className="lg:col-span-1">
            <EnhancedOrderSummary
              cart={cart}
              cartSubtotal={cartSubtotal}
              membershipDiscount={membershipDiscount}
              promotionDiscount={promotionDiscount}
              afterDiscountsTotal={afterDiscountsTotal}
              shipping={shipping}
              tax={tax}
              total={total}
              afterPromotionTotal={afterDiscountsTotal}
              onCartUpdate={handleCartUpdate}
            />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Spacer */}
      <div className="h-20 md:hidden" />
    </div>
  );
}

// // Enhanced Order Summary Component with Membership Support
// function MembershipOrderSummary({
//   cart,
//   cartSubtotal,
//   membershipDiscount,
//   promotionDiscount,
//   afterDiscountsTotal,
//   shipping,
//   tax,
//   total,
// }: {
//   cart: MembershipCartWithPromotion | null;
//   cartSubtotal: number;
//   membershipDiscount: number;
//   promotionDiscount: number;
//   afterDiscountsTotal: number;
//   shipping: number;
//   tax: number;
//   total: number;
// }) {
//   if (!cart) return null;

//   const totalSavings = membershipDiscount + promotionDiscount;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="glass rounded-2xl md:rounded-3xl p-4 md:p-6 bg-white border border-white/20 sticky top-24 space-y-4 md:space-y-6"
//     >
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <h3 className="text-lg md:text-xl font-semibold text-gray-900">
//           Order Summary
//         </h3>
//         <Badge variant="secondary" className="bg-blue-100 text-blue-700">
//           {cart.items.length} items
//         </Badge>
//       </div>

//       {/* Membership Benefits Display */}
//       {cart.hasMembershipApplied && cart.membershipInfo && (
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 md:p-4"
//         >
//           <div className="flex items-center mb-2">
//             <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-2">
//               <Crown className="w-4 h-4 text-amber-600" />
//             </div>
//             <div>
//               <div className="font-medium text-amber-800 capitalize">
//                 {cart.membershipInfo.tier} Member Benefits
//               </div>
//               <div className="text-xs text-amber-600">
//                 Active membership savings applied
//               </div>
//             </div>
//           </div>
//           <div className="text-sm font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg inline-block">
//             👑 ${membershipDiscount.toFixed(2)} saved with membership
//           </div>
//         </motion.div>
//       )}

//       {/* Promotion Benefits Display */}
//       {cart.hasPromotionApplied && cart.promotionCode && (
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 md:p-4"
//         >
//           <div className="flex items-center mb-2">
//             <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
//               <Gift className="w-4 h-4 text-green-600" />
//             </div>
//             <div>
//               <div className="font-medium text-green-800">
//                 {cart.promotionName || cart.promotionCode}
//               </div>
//               <div className="text-xs text-green-600">
//                 Promotion code applied
//               </div>
//             </div>
//           </div>
//           <div className="text-sm font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg inline-block">
//             🎁 ${promotionDiscount.toFixed(2)} promotion discount
//           </div>
//         </motion.div>
//       )}

//       {/* Cart Items Summary */}
//       <div className="space-y-2">
//         <h4 className="font-medium text-gray-700 text-sm md:text-base">
//           Items in Order
//         </h4>
//         <div className="max-h-40 overflow-y-auto space-y-2">
//           {cart.items.map((item) => (
//             <div
//               key={item._id}
//               className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
//             >
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-medium text-gray-900 truncate">
//                   {item.product.name}
//                 </p>
//                 <div className="flex items-center gap-2 mt-1">
//                   <span className="text-xs text-gray-500">
//                     Qty: {item.quantity}
//                   </span>
//                   {item.isFreeFromMembership && (
//                     <Badge
//                       variant="secondary"
//                       className="text-xs bg-amber-100 text-amber-700"
//                     >
//                       <Crown className="w-2 h-2 mr-1" />
//                       FREE
//                     </Badge>
//                   )}
//                 </div>
//               </div>
//               <div className="text-right">
//                 {item.isFreeFromMembership ? (
//                   <div className="text-sm font-medium text-amber-600">FREE</div>
//                 ) : (
//                   <div className="text-sm font-medium text-gray-900">
//                     ${(item.quantity * item.membershipPrice).toFixed(2)}
//                   </div>
//                 )}
//                 {item.membershipSavings > 0 && (
//                   <div className="text-xs text-amber-600">
//                     Saved ${item.membershipSavings.toFixed(2)}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <Separator />

//       {/* Price Breakdown */}
//       <div className="space-y-2">
//         <div className="flex justify-between text-sm">
//           <span className="text-gray-600">Subtotal:</span>
//           <span className="font-medium">${cartSubtotal.toFixed(2)}</span>
//         </div>

//         {membershipDiscount > 0 && (
//           <div className="flex justify-between text-sm bg-amber-50 -mx-2 px-2 py-1 rounded">
//             <span className="text-amber-700 flex items-center font-medium">
//               <Crown className="w-3 h-3 mr-1" />
//               Membership Discount:
//             </span>
//             <span className="font-bold text-amber-600">
//               -${membershipDiscount.toFixed(2)}
//             </span>
//           </div>
//         )}

//         {promotionDiscount > 0 && (
//           <div className="flex justify-between text-sm bg-green-50 -mx-2 px-2 py-1 rounded">
//             <span className="text-green-700 flex items-center font-medium">
//               <Gift className="w-3 h-3 mr-1" />
//               Promotion Discount:
//             </span>
//             <span className="font-bold text-green-600">
//               -${promotionDiscount.toFixed(2)}
//             </span>
//           </div>
//         )}

//         <div className="flex justify-between text-sm">
//           <span className="text-gray-600">After Discounts:</span>
//           <span className="font-medium">${afterDiscountsTotal.toFixed(2)}</span>
//         </div>

//         <div className="flex justify-between text-sm">
//           <span className="text-gray-600">Shipping:</span>
//           <span className="font-medium">
//             {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
//           </span>
//         </div>

//         <div className="flex justify-between text-sm">
//           <span className="text-gray-600">Tax:</span>
//           <span className="font-medium">${tax.toFixed(2)}</span>
//         </div>

//         <Separator />

//         <div className="flex justify-between text-lg font-bold">
//           <span>Total:</span>
//           <span className="text-green-600">${total.toFixed(2)}</span>
//         </div>
//       </div>

//       {/* Total Savings Display */}
//       {totalSavings > 0 && (
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="text-center bg-gradient-to-r from-green-100 to-blue-100 p-3 rounded-xl border border-green-200"
//         >
//           <div className="flex items-center justify-center gap-2 text-green-700 font-bold">
//             <TrendingUp className="w-4 h-4" />
//             <span>Total Saved: ${totalSavings.toFixed(2)}</span>
//           </div>
//           <div className="text-xs text-green-600 mt-1">
//             {cart.hasMembershipApplied && cart.hasPromotionApplied
//               ? "Membership + Promotion Benefits"
//               : cart.hasMembershipApplied
//                 ? "Membership Benefits"
//                 : "Promotion Benefits"}
//           </div>
//         </motion.div>
//       )}

//       {/* Security Notice */}
//       <div className="text-center text-xs text-gray-500 bg-blue-50 p-2 rounded-lg border border-blue-200">
//         <Info className="w-3 h-3 inline mr-1" />
//         256-bit SSL encrypted checkout
//       </div>
//     </motion.div>
//   );
// }
