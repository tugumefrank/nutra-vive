"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  X,
  ShoppingBag,
  CreditCard,
  Tag,
  ArrowRight,
  ArrowLeft,
  Heart,
  Shield,
  Trash2,
  Loader2,
  Info,
  Sparkles,
  Percent,
  Gift,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// Import unified cart system
import {
  useUnifiedCartStore,
  useCartStats,
  useCartItems,
  useCartLoadingState,
  useCartInitializing,
  useIsAddingToCart,
  useIsUpdatingItem,
  useIsRemovingItem,
  useCartPromotion,
} from "@/store/unifiedCartStore";

export default function CartPage() {
  const router = useRouter();
  
  // Cart state from unified store
  const cart = useUnifiedCartStore((state) => state.cart);
  const stats = useCartStats();
  const items = useCartItems();
  const loading = useCartLoadingState();
  const initializing = useCartInitializing();
  const isAddingToCart = useIsAddingToCart();
  const isUpdatingItem = useIsUpdatingItem();
  const isRemovingItem = useIsRemovingItem();
  
  // Cart actions
  const {
    initializeCart,
    updateQuantityOptimistic,
    removeFromCartOptimistic,
    clearCartOptimistic,
  } = useUnifiedCartStore();
  
  // Promotion state and actions
  const {
    promotionCodeInput,
    promotionValidationError,
    isApplyingPromotion,
    hasPromotionApplied,
    promotionCode,
    promotionName,
    promotionDiscount,
    setPromotionCodeInput,
    applyPromotionOptimistic,
    removePromotionOptimistic,
  } = useCartPromotion();

  // Initialize cart on component mount
  useEffect(() => {
    initializeCart();
  }, [initializeCart]);

  // Update quantity with optimistic updates
  const updateQuantity = async (productId: string, newQuantity: number) => {
    await updateQuantityOptimistic(productId, newQuantity);
  };

  // Remove item with optimistic updates
  const removeItem = async (productId: string) => {
    await removeFromCartOptimistic(productId);
  };

  // Clear entire cart
  const clearCartItems = async () => {
    await clearCartOptimistic();
  };

  // Apply promotion code
  const applyPromotion = async () => {
    if (!promotionCodeInput.trim()) {
      toast.error("Please enter a promotion code");
      return;
    }
    await applyPromotionOptimistic(promotionCodeInput.trim());
  };

  // Remove promotion
  const removePromotion = async () => {
    await removePromotionOptimistic();
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!cart || items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
              <div className="w-24 h-24 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-orange-500" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Your cart is empty
              </h1>
              <p className="text-gray-600 mb-8">
                Add some delicious organic juices and herbal teas to get started!
              </p>
              <Button asChild className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3">
                <Link href="/shop">
                  <ArrowLeft className="w-4 h-4 mr-2 rotate-180" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-orange-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link href="/shop">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Continue Shopping</span>
                <span className="sm:hidden">Shop</span>
              </Link>
            </Button>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              <span className="hidden sm:inline">Shopping Cart</span>
              <span className="sm:hidden">Cart</span>
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {stats.itemCount} items
              </Badge>
              {cart.hasMembershipApplied && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                  <Crown className="w-3 h-3 mr-1" />
                  Member
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Membership Benefits Summary */}
            {cart.hasMembershipApplied && cart.membershipInfo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 md:p-6"
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                    <Crown className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-amber-800 capitalize">
                      {cart.membershipInfo.tier} Member Benefits Active
                    </div>
                    <div className="text-sm text-amber-600">
                      Enjoying member pricing and free items
                    </div>
                  </div>
                </div>
                <div className="text-lg font-bold text-amber-700 bg-amber-100 px-3 py-2 rounded-lg inline-block">
                  👑 ${stats.membershipDiscount.toFixed(2)} saved with membership
                </div>
              </motion.div>
            )}

            {/* Cart Items List - Compact and Scrollable */}
            <div className="max-h-[600px] overflow-y-auto space-y-3 pr-2">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-xl shadow-sm border border-white/20 p-3"
                  >
                    <div className="flex items-center gap-3">
                      {/* Product Image - Smaller */}
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.images[0] || "/api/placeholder/150/150"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                        {item.freeFromMembership > 0 && (
                          <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            <Crown className="w-2 h-2" />
                          </div>
                        )}
                      </div>

                      {/* Product Details - More Compact */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">
                              <Link
                                href={`/products/${item.product.slug}`}
                                className="hover:text-orange-600 transition-colors"
                              >
                                {item.product.name}
                              </Link>
                            </h3>
                            
                            {/* Price and Category in one line */}
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-base font-bold text-gray-900">
                                ${item.finalPrice.toFixed(2)}
                              </span>
                              {item.originalPrice > item.finalPrice && (
                                <span className="text-xs text-gray-400 line-through">
                                  ${item.originalPrice.toFixed(2)}
                                </span>
                              )}
                              {item.product.category && (
                                <span className="text-xs text-gray-500">
                                  • {item.product.category.name}
                                </span>
                              )}
                            </div>

                            {/* Membership Benefits - Compact */}
                            {item.freeFromMembership > 0 && (
                              <div className="flex items-center gap-1 mb-1">
                                <Badge
                                  variant="secondary"
                                  className="bg-amber-100 text-amber-700 text-xs py-0 px-1"
                                >
                                  <Crown className="w-2 h-2 mr-1" />
                                  {item.freeFromMembership} FREE
                                </Badge>
                                {item.paidQuantity > 0 && (
                                  <Badge variant="outline" className="text-xs py-0 px-1">
                                    +{item.paidQuantity} paid
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.product._id)}
                            disabled={isRemovingItem[item.product._id]}
                            className="text-gray-400 hover:text-red-500 p-1 h-6 w-6"
                          >
                            {isRemovingItem[item.product._id] ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                          </Button>
                        </div>

                        {/* Quantity Controls and Total - Single Row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateQuantity(item.product._id, item.quantity - 1)
                              }
                              disabled={
                                item.quantity <= 1 || isUpdatingItem[item.product._id]
                              }
                              className="w-6 h-6 p-0"
                            >
                              <Minus className="w-2 h-2" />
                            </Button>
                            
                            <span className="font-medium text-gray-900 min-w-[1.5rem] text-center text-sm">
                              {isUpdatingItem[item.product._id] ? (
                                <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                              ) : (
                                item.quantity
                              )}
                            </span>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateQuantity(item.product._id, item.quantity + 1)
                              }
                              disabled={isUpdatingItem[item.product._id]}
                              className="w-6 h-6 p-0"
                            >
                              <Plus className="w-2 h-2" />
                            </Button>
                          </div>

                          {/* Item Total and Savings */}
                          <div className="text-right">
                            <div className="text-base font-bold text-gray-900">
                              ${(item.quantity * item.finalPrice).toFixed(2)}
                            </div>
                            {item.totalSavings > 0 && (
                              <div className="text-xs text-green-600">
                                Saved ${item.totalSavings.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Clear Cart Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={clearCartItems}
                className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Order Summary
                </h3>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {stats.itemCount} items
                </Badge>
              </div>

              {/* Promotion Code Section */}
              <div>
                <h4 className="font-medium mb-3 text-gray-700 flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Promotion Code
                </h4>

                {hasPromotionApplied && promotionCode ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                          <Gift className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-green-800">
                            {promotionName || promotionCode}
                          </div>
                          <div className="text-xs text-green-600">
                            Code: {promotionCode}
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
                      🎁 ${promotionDiscount.toFixed(2)} discount applied
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Enter promotion code"
                          value={promotionCodeInput}
                          onChange={(e) =>
                            setPromotionCodeInput(e.target.value.toUpperCase())
                          }
                          className="pl-10"
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
                        disabled={!promotionCodeInput.trim() || isApplyingPromotion}
                      >
                        {isApplyingPromotion ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    </div>
                    {promotionValidationError && (
                      <div className="text-xs text-red-500">
                        {promotionValidationError}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 flex items-center">
                      <Info className="w-3 h-3 mr-1" />
                      {cart.hasMembershipApplied 
                        ? "Stack with membership benefits for maximum savings"
                        : "Enter a valid promotion code to save on your order"}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${stats.subtotal.toFixed(2)}</span>
                </div>

                {stats.membershipDiscount > 0 && (
                  <div className="flex justify-between text-sm bg-amber-50 -mx-3 px-3 py-2 rounded">
                    <span className="text-amber-700 flex items-center font-medium">
                      <Crown className="w-3 h-3 mr-1" />
                      Membership Savings:
                    </span>
                    <span className="font-bold text-amber-600">
                      -${stats.membershipDiscount.toFixed(2)}
                    </span>
                  </div>
                )}

                {stats.promotionDiscount > 0 && (
                  <div className="flex justify-between text-sm bg-green-50 -mx-3 px-3 py-2 rounded">
                    <span className="text-green-700 flex items-center font-medium">
                      <Percent className="w-3 h-3 mr-1" />
                      Promotion Savings:
                    </span>
                    <span className="font-bold text-green-600">
                      -${stats.promotionDiscount.toFixed(2)}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">${stats.finalTotal.toFixed(2)}</span>
                </div>

                {stats.totalSavings > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center bg-gradient-to-r from-green-100 to-blue-100 p-3 rounded-xl border border-green-200"
                  >
                    <div className="flex items-center justify-center gap-2 text-green-700 font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>You saved ${stats.totalSavings.toFixed(2)}!</span>
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {cart.hasMembershipApplied && hasPromotionApplied
                        ? "Membership + Promotion Benefits"
                        : cart.hasMembershipApplied
                          ? "Membership Benefits"
                          : "Promotion Benefits"}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Checkout Button */}
              <Button
                asChild
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3"
              >
                <Link href="/checkout">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>

              {/* Security Notice */}
              <div className="text-center text-xs text-gray-500 bg-blue-50 p-2 rounded-lg border border-blue-200">
                <Shield className="w-3 h-3 inline mr-1" />
                Secure checkout with 256-bit SSL encryption
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}