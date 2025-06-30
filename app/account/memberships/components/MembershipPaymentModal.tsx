// components/memberships/MembershipPaymentModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Star,
  Gift,
  Zap,
  X,
  CreditCard,
  Shield,
  Check,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { createMembershipSubscription } from "@/lib/actions/membershipSubscriptionServerActions";
import SubscriptionCheckout from "@/components/checkout/SubscriptionCheckout";

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

interface Membership {
  _id: string;
  name: string;
  description?: string;
  tier: string;
  price: number;
  billingFrequency: string;
  productAllocations: Array<{
    categoryId: string;
    categoryName: string;
    quantity: number;
  }>;
  customBenefits: Array<{
    title: string;
    description: string;
    type: string;
  }>;
  features: string[];
  freeDelivery: boolean;
  prioritySupport: boolean;
  color?: string;
}

interface MembershipPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  membership: Membership | null;
  onSuccess: () => void;
}

const tierConfig = {
  basic: { icon: Gift, gradient: "from-emerald-500 to-emerald-600" },
  premium: { icon: Star, gradient: "from-blue-500 to-blue-600" },
  vip: { icon: Crown, gradient: "from-purple-500 to-purple-600" },
  elite: { icon: Zap, gradient: "from-amber-500 to-amber-600" },
};

export function MembershipPaymentModal({
  isOpen,
  onClose,
  membership,
  onSuccess,
}: MembershipPaymentModalProps) {
  const [step, setStep] = useState<"overview" | "payment">("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep("overview");
      setClientSecret(null);
      setSubscriptionId(null);
      setError(null);
    }
  }, [isOpen]);

  if (!membership) return null;

  const config = tierConfig[membership.tier as keyof typeof tierConfig];
  const IconComponent = config.icon;
  const totalProducts = membership.productAllocations.reduce(
    (sum, alloc) => sum + alloc.quantity,
    0
  );

  const handleSubscribe = async () => {
    if (!membership) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log("Creating subscription for membership:", membership._id);

      const result = await createMembershipSubscription(membership._id);

      if (result.success && result.clientSecret && result.subscriptionId) {
        setClientSecret(result.clientSecret);
        setSubscriptionId(result.subscriptionId);
        setStep("payment");
        toast.success("Payment form ready!");
      } else {
        throw new Error(result.error || "Failed to create subscription");
      }
    } catch (error) {
      console.error("Subscription creation error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create subscription";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success("🎉 Membership activated successfully!");
    onSuccess();
    onClose();
    // Optional: redirect to membership dashboard
    setTimeout(() => {
      window.location.href = "/account/memberships";
    }, 1500);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    toast.error(errorMessage);
  };

  const formatBillingText = () => {
    const frequency =
      membership.billingFrequency === "yearly"
        ? "year"
        : membership.billingFrequency === "quarterly"
          ? "3 months"
          : "month";
    return frequency;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div
                className={`p-3 rounded-xl bg-gradient-to-r ${config.gradient} text-white`}
              >
                <IconComponent className="w-6 h-6" />
              </div>
              Subscribe to {membership.name}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {step === "overview" && (
          <div className="space-y-6">
            {/* Membership Overview */}
            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Badge variant="outline" className="capitalize mb-2">
                      {membership.tier} Tier
                    </Badge>
                    <h3 className="text-xl font-bold">{membership.name}</h3>
                    {membership.description && (
                      <p className="text-muted-foreground text-sm">
                        {membership.description}
                      </p>
                    )}
                  </div>

                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${membership.price}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      per {formatBillingText()}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">What's Included:</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Gift className="w-4 h-4 text-emerald-500" />
                      <span>
                        {totalProducts} free products per {formatBillingText()}
                      </span>
                    </div>

                    {membership.freeDelivery && (
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>Free delivery</span>
                      </div>
                    )}

                    {membership.prioritySupport && (
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>Priority customer support</span>
                      </div>
                    )}

                    {membership.features.slice(0, 3).map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Allocations */}
            <div className="space-y-3">
              <h4 className="font-semibold">Your Monthly Allocations:</h4>
              <div className="grid gap-3">
                {membership.productAllocations.map((allocation, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border"
                  >
                    <span className="font-medium">
                      {allocation.categoryName}
                    </span>
                    <Badge variant="secondary">
                      {allocation.quantity}{" "}
                      {allocation.quantity === 1 ? "item" : "items"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Benefits */}
            {membership.customBenefits.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">Exclusive Benefits:</h4>
                <div className="space-y-2">
                  {membership.customBenefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white dark:bg-gray-800 rounded-lg border"
                    >
                      <div className="font-medium">{benefit.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {benefit.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terms Notice */}
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium mb-1">Subscription Terms:</p>
                  <ul className="space-y-1 text-xs">
                    <li>
                      • Your membership will auto-renew every{" "}
                      {formatBillingText()}
                    </li>
                    <li>• You can cancel anytime from your account settings</li>
                    <li>
                      • Unused allocations don't roll over to the next period
                    </li>
                    <li>• All benefits are active immediately upon payment</li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-red-800 dark:text-red-200 text-sm">
                    {error}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                className={`flex-1 bg-gradient-to-r ${config.gradient} hover:shadow-lg transition-all duration-300 text-white border-0`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Continue to Payment
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "payment" && clientSecret && subscriptionId && (
          <div className="space-y-6">
            {/* Payment Header */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-semibold">Secure Payment</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Complete your {membership.name} membership subscription
              </p>
            </div>

            {/* Stripe Elements */}
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#10b981",
                  },
                },
              }}
            >
              <SubscriptionCheckout
                membershipPrice={membership.price}
                membershipName={membership.name}
                billingFrequency={membership.billingFrequency}
                subscriptionId={subscriptionId}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </Elements>

            {/* Back Button */}
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setStep("overview")}
                className="text-sm"
              >
                ← Back to overview
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
