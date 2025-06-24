"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Gift,
  Shield,
  Lock,
  Percent,
  Tag,
  Info,
  X,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Import the same actions used in cart page
import {
  applyPromotionToCart,
  removePromotionFromCart,
  validatePromotionCode,
} from "@/lib/actions/cartServerActions";

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

interface OrderSummaryProps {
  cart: CartWithPromotion | null;
  cartSubtotal: number; // Original cart subtotal
  promotionDiscount: number; // Amount saved from promotions
  afterPromotionTotal: number; // Subtotal after promotions
  shipping: number;
  tax: number;
  total: number; // Final order total
  onCartUpdate?: (updatedCart: CartWithPromotion) => void; // Callback to update parent cart state
}

export default function OrderSummary({
  cart,
  cartSubtotal,
  promotionDiscount,
  afterPromotionTotal,
  shipping,
  tax,
  total,
  onCartUpdate,
}: OrderSummaryProps) {
  // Promotion code state
  const [promotionCode, setPromotionCode] = useState("");
  const [applyingPromotion, setApplyingPromotion] = useState(false);

  // Apply promotion logic borrowed from cart page
  const applyPromotion = async () => {
    if (!promotionCode.trim()) {
      toast.error("Please enter a promotion code");
      return;
    }

    try {
      setApplyingPromotion(true);

      // First validate the promotion
      const validation = await validatePromotionCode(promotionCode.trim());

      if (!validation.isValid) {
        toast.error(validation.error || "Invalid promotion code");
        return;
      }

      // Apply the promotion
      const result = await applyPromotionToCart(promotionCode.trim());

      if (result.success && result.cart) {
        // Update parent component with new cart state
        if (onCartUpdate) {
          onCartUpdate(result.cart);
        }

        toast.success(
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Gift className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div>
              <div className="font-semibold text-green-900">
                Promotion Applied!
              </div>
              <div className="text-sm text-green-700">
                You saved ${validation.discountAmount?.toFixed(2)} with{" "}
                {promotionCode.toUpperCase()}
              </div>
            </div>
          </div>
        );
      } else {
        toast.error(result.error || "Failed to apply promotion");
      }
    } catch (error) {
      console.error("Error applying promotion:", error);
      toast.error("Failed to apply promotion");
    } finally {
      setApplyingPromotion(false);
    }
  };

  // Remove promotion logic borrowed from cart page
  const removePromotion = async () => {
    try {
      const result = await removePromotionFromCart();

      if (result.success && result.cart) {
        // Update parent component with new cart state
        if (onCartUpdate) {
          onCartUpdate(result.cart);
        }
        setPromotionCode("");
        toast.success("Promotion removed");
      } else {
        toast.error("Failed to remove promotion");
      }
    } catch (error) {
      console.error("Error removing promotion:", error);
      toast.error("Failed to remove promotion");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl md:rounded-3xl p-4 md:p-6 bg-white border border-white/20 sticky top-24"
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Gift className="w-5 h-5 mr-2 text-orange-600" />
        Order Summary
        {cart?.hasPromotionApplied && (
          <Badge
            variant="secondary"
            className="ml-2 bg-green-100 text-green-700 text-xs"
          >
            <Tag className="w-3 h-3 mr-1" />
            Promo Applied
          </Badge>
        )}
      </h3>

      {/* Order Items */}
      <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
        {cart?.items.map((item) => (
          <div key={item._id} className="flex items-center gap-3">
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={item.product.images[0] || "/api/placeholder/300/300"}
                alt={item.product.name}
                fill
                className="object-cover"
              />
              <Badge
                variant="secondary"
                className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 rounded-full p-0 flex items-center justify-center text-xs bg-orange-100 text-orange-700"
              >
                {item.quantity}
              </Badge>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-xs md:text-sm truncate">
                {item.product.name}
              </h4>
              <div className="flex items-center gap-2">
                <p className="text-xs text-green-600 font-medium">
                  ${item.price.toFixed(2)} each
                </p>
                {item.originalPrice && item.originalPrice > item.price && (
                  <p className="text-xs text-gray-400 line-through">
                    ${item.originalPrice.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            <div className="text-sm font-medium">
              ${(item.quantity * item.price).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <Separator className="mb-4" />

      {/* Promotion Code Section */}
      <div className="mb-4 md:mb-6">
        <h4 className="font-medium mb-3 text-gray-700 text-sm md:text-base flex items-center">
          <Tag className="w-4 h-4 mr-2" />
          Promotion Code
        </h4>

        {cart?.hasPromotionApplied && cart.promotionCode ? (
          // Applied Promotion Display
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 md:p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                  <Gift className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-green-800">
                    {cart.promotionName || cart.promotionCode}
                  </div>
                  <div className="text-xs text-green-600">
                    Code: {cart.promotionCode}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removePromotion}
                className="text-red-500 hover:text-red-700 hover:bg-red-100 h-auto p-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <div className="text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded-lg inline-block">
              💰 You saved ${promotionDiscount.toFixed(2)}
            </div>
          </motion.div>
        ) : (
          // Promotion Code Input
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Enter promotion code"
                  value={promotionCode}
                  onChange={(e) =>
                    setPromotionCode(e.target.value.toUpperCase())
                  }
                  className="pl-10 bg-white/60 border-white/40 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      applyPromotion();
                    }
                  }}
                />
              </div>
              <Button
                variant="outline"
                onClick={applyPromotion}
                disabled={!promotionCode.trim() || applyingPromotion}
                className="bg-white/60 hover:bg-white/80 text-sm px-3 border-orange-200 hover:border-orange-300"
              >
                {applyingPromotion ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Apply"
                )}
              </Button>
            </div>
            <div className="text-xs text-gray-500 flex items-center">
              <Info className="w-3 h-3 mr-1" />
              Enter a valid promotion code to save on your order
            </div>
          </div>
        )}
      </div>

      <Separator className="mb-4" />

      {/* Pricing Breakdown */}
      <div className="space-y-2 mb-4 md:mb-6">
        <div className="flex justify-between text-sm">
          <span>Items Subtotal</span>
          <span>${cartSubtotal.toFixed(2)}</span>
        </div>

        {/* Show promotion discount as separate line item */}
        {promotionDiscount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex justify-between text-sm bg-green-50 -mx-2 px-2 py-1 rounded"
          >
            <span className="text-green-700 flex items-center font-medium">
              <Percent className="w-3 h-3 mr-1" />
              Promotion Savings:
            </span>
            <span className="font-bold text-green-600">
              -${promotionDiscount.toFixed(2)}
            </span>
          </motion.div>
        )}

        {/* Show subtotal after promotions */}
        {promotionDiscount > 0 && (
          <div className="flex justify-between text-sm font-medium border-t border-gray-100 pt-2">
            <span>Subtotal After Discount</span>
            <span className="text-green-600">
              ${afterPromotionTotal.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span className="text-green-600">
            {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax (8%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-orange-600">${total.toFixed(2)}</span>
        </div>

        {/* Total Savings Summary */}
        {promotionDiscount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm bg-green-100 text-green-800 px-3 py-2 rounded-lg font-medium"
          >
            🎉 You saved ${promotionDiscount.toFixed(2)} with this order!
          </motion.div>
        )}
      </div>

      {/* Tax Calculation Note */}
      <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-xs text-blue-700 flex items-center">
          <Info className="w-3 h-3 mr-1 flex-shrink-0" />
          Tax calculated on subtotal after discounts plus shipping
        </div>
      </div>

      {/* Security Badges */}
      <div className="text-center space-y-2 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-center text-xs text-gray-500">
          <Shield className="w-4 h-4 mr-1 text-green-600" />
          256-bit SSL encrypted
        </div>
        <div className="flex items-center justify-center text-xs text-gray-500">
          <Lock className="w-4 h-4 mr-1 text-green-600" />
          PCI DSS compliant payments
        </div>
        <div className="flex items-center justify-center text-xs text-gray-500">
          <span className="font-medium">Powered by</span>
          <span className="ml-1 font-semibold text-indigo-600">Stripe</span>
        </div>
      </div>
    </motion.div>
  );
}
