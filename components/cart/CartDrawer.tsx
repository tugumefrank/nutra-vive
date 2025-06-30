// "use client";

// import { motion } from "framer-motion";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   X,
//   Plus,
//   Minus,
//   ShoppingBag,
//   ArrowRight,
//   Loader2,
//   LogIn,
// } from "lucide-react";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
// } from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { useUnifiedCart } from "@/hooks/useUnifiedCart"; // Updated import

// // Helper function to format currency
// const formatCurrency = (amount: number) => {
//   return new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: "USD",
//   }).format(amount);
// };

// export function CartDrawer() {
//   // Use unified cart system for consistent state
//   const {
//     cart,
//     stats,
//     loading,
//     initializing,
//     isOpen,
//     closeCart,
//     updateQuantity,
//     removeFromCart,
//     isAuthenticated,
//   } = useUnifiedCart();

//   const handleQuantityChange = async (
//     productId: string,
//     newQuantity: number
//   ) => {
//     try {
//       // This will update ALL components simultaneously via the unified store
//       await updateQuantity(productId, newQuantity);
//     } catch (error) {
//       console.error("Failed to update quantity:", error);
//     }
//   };

//   const handleRemoveItem = async (productId: string) => {
//     try {
//       // This will update ALL components simultaneously via the unified store
//       await removeFromCart(productId);
//     } catch (error) {
//       console.error("Failed to remove item:", error);
//     }
//   };

//   // Calculate totals from unified cart
//   const subtotal =
//     cart?.items?.reduce(
//       (sum: number, item: any) => sum + item.quantity * item.price,
//       0
//     ) || 0;
//   const shipping = subtotal > 50 ? 0 : 0; // Free shipping over $50
//   const tax = 0; //subtotal * 0.08;
//   const total = subtotal + shipping + tax;

//   return (
//     <Sheet open={isOpen} onOpenChange={closeCart}>
//       <SheetContent className="w-full sm:max-w-lg bg-background/95 backdrop-blur-lg border-l border-white/10 p-6">
//         <SheetHeader className="pb-6">
//           <div className="flex items-center justify-between">
//             <SheetTitle className="flex items-center space-x-2">
//               <ShoppingBag className="w-5 h-5" />
//               <span>Shopping Cart</span>
//               {isAuthenticated && stats.itemCount > 0 && (
//                 <Badge variant="secondary">{stats.itemCount}</Badge>
//               )}
//             </SheetTitle>
//             <Button variant="ghost" size="icon" onClick={closeCart}>
//               <X className="w-5 h-5" />
//             </Button>
//           </div>
//         </SheetHeader>

//         {!isAuthenticated ? (
//           // Not authenticated - show sign in prompt
//           <div className="flex flex-col items-center justify-center h-full text-center p-6">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6"
//             >
//               <LogIn className="w-12 h-12 text-blue-600" />
//             </motion.div>
//             <h3 className="text-lg font-semibold mb-2">
//               Sign in to view your cart
//             </h3>
//             <p className="text-muted-foreground mb-6 px-4">
//               Create an account or sign in to save items to your cart and
//               checkout
//             </p>
//             <div className="space-y-3 w-full max-w-xs">
//               <Button asChild className="w-full" onClick={closeCart}>
//                 <Link href="/sign-in">
//                   <LogIn className="mr-2 w-4 h-4" />
//                   Sign In
//                 </Link>
//               </Button>
//               <Button
//                 variant="outline"
//                 asChild
//                 className="w-full"
//                 onClick={closeCart}
//               >
//                 <Link href="/sign-up">Create Account</Link>
//               </Button>
//             </div>
//           </div>
//         ) : initializing || loading ? (
//           // Loading state
//           <div className="flex flex-col items-center justify-center h-full text-center p-6">
//             <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
//             <p className="text-muted-foreground">Loading your cart...</p>
//           </div>
//         ) : !cart?.items || cart.items.length === 0 ? (
//           // Empty cart
//           <div className="flex flex-col items-center justify-center h-full text-center p-6">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6"
//             >
//               <ShoppingBag className="w-12 h-12 text-muted-foreground" />
//             </motion.div>
//             <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
//             <p className="text-muted-foreground mb-6 px-4">
//               Discover our premium wellness beverages and start your health
//               journey
//             </p>
//             <Button asChild onClick={closeCart} className="w-full max-w-xs">
//               <Link href="/shop">
//                 Start Shopping
//                 <ArrowRight className="ml-2 w-4 h-4" />
//               </Link>
//             </Button>
//           </div>
//         ) : (
//           // Cart with items - using unified state
//           <div className="flex flex-col h-full">
//             {/* Cart Items */}
//             <div className="flex-1 overflow-y-auto space-y-4 pr-2">
//               {cart.items.map((item: any) => (
//                 <motion.div
//                   key={item._id}
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 20 }}
//                   className="flex items-center space-x-4 p-4 glass rounded-2xl border border-white/10 bg-white/50"
//                 >
//                   <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
//                     <Image
//                       src={
//                         item.product.images?.[0] || "/placeholder-product.jpg"
//                       }
//                       alt={item.product.name}
//                       fill
//                       className="object-cover"
//                     />
//                   </div>

//                   <div className="flex-1 min-w-0">
//                     <h4 className="font-medium truncate text-sm">
//                       {item.product.name}
//                     </h4>
//                     <p className="text-xs text-muted-foreground">
//                       {formatCurrency(item.price)} each
//                     </p>
//                     {item.product.category && (
//                       <p className="text-xs text-green-600 font-medium">
//                         {item.product.category.name}
//                       </p>
//                     )}
//                   </div>

//                   <div className="flex items-center space-x-2">
//                     {/* Quantity controls - instant updates across ALL components */}
//                     <Button
//                       variant="outline"
//                       size="icon"
//                       className="w-8 h-8"
//                       onClick={() =>
//                         handleQuantityChange(
//                           item.product._id,
//                           item.quantity - 1
//                         )
//                       }
//                     >
//                       <Minus className="w-3 h-3" />
//                     </Button>

//                     <span className="w-8 text-center font-medium text-sm">
//                       {item.quantity}
//                     </span>

//                     <Button
//                       variant="outline"
//                       size="icon"
//                       className="w-8 h-8"
//                       onClick={() =>
//                         handleQuantityChange(
//                           item.product._id,
//                           item.quantity + 1
//                         )
//                       }
//                     >
//                       <Plus className="w-3 h-3" />
//                     </Button>
//                   </div>

//                   <div className="text-right flex-shrink-0">
//                     <div className="font-bold text-sm">
//                       {formatCurrency(item.quantity * item.price)}
//                     </div>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => handleRemoveItem(item.product._id)}
//                       className="text-red-500 hover:text-red-700 h-auto p-0 text-xs"
//                     >
//                       Remove
//                     </Button>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>

//             <Separator className="my-6" />

//             {/* Cart Summary */}
//             <div className="space-y-4 px-2">
//               <div className="space-y-2">
//                 <div className="flex justify-between text-sm">
//                   <span>Subtotal</span>
//                   <span>{formatCurrency(subtotal)}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span>Shipping</span>
//                   <span>
//                     {shipping === 0 ? "Free" : formatCurrency(shipping)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span>Tax</span>
//                   <span>{formatCurrency(tax)}</span>
//                 </div>
//                 <Separator />
//                 <div className="flex justify-between font-bold text-lg">
//                   <span>Total</span>
//                   <span>{formatCurrency(total)}</span>
//                 </div>
//               </div>

//               {shipping === 0 && (
//                 <div className="text-center text-sm text-green-600 bg-green-50 p-3 rounded-lg">
//                   🎉 Congratulations! You qualify for free shipping
//                 </div>
//               )}

//               {subtotal > 0 && subtotal < 50 && (
//                 <div className="text-center text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
//                   Add {formatCurrency(50 - subtotal)} more for free shipping!
//                 </div>
//               )}

//               <div className="space-y-3 pt-2">
//                 <Button
//                   className="w-full"
//                   size="lg"
//                   asChild
//                   onClick={closeCart}
//                 >
//                   <Link href="/checkout">
//                     Proceed to Checkout
//                     <ArrowRight className="ml-2 w-4 h-4" />
//                   </Link>
//                 </Button>

//                 <Button
//                   variant="outline"
//                   className="w-full"
//                   asChild
//                   onClick={closeCart}
//                 >
//                   <Link href="/cart">View Full Cart</Link>
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}
//       </SheetContent>
//     </Sheet>
//   );
// }
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  CreditCard,
  Gift,
  Crown,
  Tag,
  Sparkles,
  ArrowRight,
  Loader2,
  LogIn,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  useUnifiedCartStore,
  useCartDrawer,
  useCartStats,
  useCartItems,
  useCartPromotion,
  useIsUpdatingItem,
  useIsRemovingItem,
} from "@/store/unifiedCartStore";
import { useUser } from "@clerk/nextjs";

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export function CartDrawer() {
  const { user } = useUser();
  const isAuthenticated = !!user;

  const { isOpen, closeCart } = useCartDrawer();
  const stats = useCartStats();
  const items = useCartItems();
  const isUpdatingItem = useIsUpdatingItem();
  const isRemovingItem = useIsRemovingItem();
  const initializing = useUnifiedCartStore((state) => state.initializing);

  const {
    promotionCodeInput,
    promotionValidationError,
    isApplyingPromotion,
    isRemovingPromotion,
    hasPromotionApplied,
    promotionCode,
    promotionName,
    promotionDiscount,
    setPromotionCodeInput,
    applyPromotionOptimistic,
    removePromotionOptimistic,
    canApplyPromotion,
  } = useCartPromotion();

  const {
    updateQuantityOptimistic,
    removeFromCartOptimistic,
    clearCartOptimistic,
    cart,
  } = useUnifiedCartStore();

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    updateQuantityOptimistic(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCartOptimistic(productId);
  };

  const handleApplyPromotion = () => {
    if (promotionCodeInput.trim()) {
      applyPromotionOptimistic(promotionCodeInput.trim());
    }
  };

  const handleRemovePromotion = () => {
    removePromotionOptimistic();
  };

  const handleClearCart = () => {
    clearCartOptimistic();
  };

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-lg bg-background/95 backdrop-blur-lg border-l border-white/10 flex flex-col h-full p-0">
        {/* Header */}
        <SheetHeader className="p-6 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              Shopping Cart
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={closeCart}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Item Count Badge */}
          {isAuthenticated && stats.totalItems > 0 && (
            <div className="flex justify-center">
              <Badge variant="secondary" className="text-sm">
                {stats.totalItems} {stats.totalItems === 1 ? "item" : "items"}
              </Badge>
            </div>
          )}

          {/* Membership Benefits Banner */}
          {isAuthenticated &&
            cart?.hasMembershipApplied &&
            cart.membershipInfo && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {cart.membershipInfo.tier.charAt(0).toUpperCase() +
                      cart.membershipInfo.tier.slice(1)}{" "}
                    Member
                  </span>
                </div>
                <p className="text-xs text-purple-100">
                  Saving ${stats.membershipDiscount.toFixed(2)} with your
                  membership!
                </p>
              </motion.div>
            )}
        </SheetHeader>

        {!isAuthenticated ? (
          // Not authenticated - show sign in prompt
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-lg"
            >
              <LogIn className="w-12 h-12 text-white" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">
              Sign in to view your cart
            </h3>
            <p className="text-muted-foreground mb-6 px-4">
              Create an account or sign in to save items to your cart and
              checkout
            </p>
            <div className="space-y-3 w-full max-w-xs">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-green-600 to-blue-600"
                onClick={closeCart}
              >
                <Link href="/sign-in">
                  <LogIn className="mr-2 w-4 h-4" />
                  Sign In
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="w-full"
                onClick={closeCart}
              >
                <Link href="/sign-up">Create Account</Link>
              </Button>
            </div>
          </div>
        ) : !items || items.length === 0 ? (
          // Empty Cart
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6"
            >
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6 px-4">
              Discover our premium wellness beverages and start your health
              journey
            </p>
            <Button
              asChild
              onClick={closeCart}
              className="w-full max-w-xs bg-gradient-to-r from-green-600 to-blue-600"
            >
              <Link href="/shop">
                Start Shopping
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        ) : (
          // Cart with items - Fixed layout
          <div className="flex-1 flex flex-col min-h-0">
            {/* Cart Items - Scrollable area */}
            <div className="flex-1 overflow-y-auto px-6">
              <div className="space-y-3 py-4">
                <AnimatePresence>
                  {items.map((item: any) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      layout
                      className="flex gap-3 p-3 rounded-lg glass border border-white/10 bg-white/50 backdrop-blur-sm"
                    >
                      {/* Product Image - Smaller */}
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.product.images?.[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ShoppingBag className="w-4 h-4 text-gray-400" />
                          </div>
                        )}

                        {/* Free Badge - Smaller */}
                        {item.freeFromMembership > 0 && (
                          <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            <Crown className="w-2 h-2" />
                          </div>
                        )}
                      </div>

                      {/* Product Details - More Compact */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-xs text-gray-900 truncate leading-tight">
                              {item.product.name}
                            </h4>
                            <div className="flex items-center justify-between mt-1">
                              <div className="flex items-center gap-1 text-xs">
                                <span className="font-bold">
                                  ${(item.finalPrice * item.quantity).toFixed(2)}
                                </span>
                                {item.totalSavings > 0 && (
                                  <span className="text-green-600">
                                    (Save ${item.totalSavings.toFixed(2)})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Remove Button - Smaller */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.product._id)}
                            disabled={isRemovingItem[item.product._id]}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-6 w-6 p-0 flex-shrink-0 ml-2"
                          >
                            {isRemovingItem[item.product._id] ? (
                              <Loader2 className="w-2 h-2 animate-spin" />
                            ) : (
                              <X className="w-2 h-2" />
                            )}
                          </Button>
                        </div>

                        {/* Membership/Promotion badges - Compact */}
                        <div className="flex items-center gap-1 mb-2">
                          {item.freeFromMembership > 0 && (
                            <Badge className="bg-amber-100 text-amber-700 text-xs px-1 py-0">
                              <Crown className="w-2 h-2 mr-1" />
                              {item.freeFromMembership} FREE
                            </Badge>
                          )}
                          {item.product.category && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              {item.product.category.name}
                            </Badge>
                          )}
                        </div>

                        {/* Quantity Controls - Smaller */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateQuantity(
                                item.product._id,
                                item.quantity - 1
                              )
                            }
                            disabled={
                              isUpdatingItem[item.product._id] ||
                              item.quantity <= 1
                            }
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="w-2 h-2" />
                          </Button>

                          <span className="w-6 text-center text-xs font-medium">
                            {isUpdatingItem[item.product._id] ? (
                              <Loader2 className="w-2 h-2 animate-spin mx-auto" />
                            ) : (
                              item.quantity
                            )}
                          </span>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateQuantity(
                                item.product._id,
                                item.quantity + 1
                              )
                            }
                            disabled={isUpdatingItem[item.product._id]}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="w-2 h-2" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Fixed Bottom Section - Promotion, Summary & Actions */}
            <div className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-t border-white/10">
              {/* Promotion Section - Compact */}
              <div className="px-4 py-3 border-b border-white/5">
                {hasPromotionApplied ? (
                  <div className="flex items-center justify-between p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="min-w-0">
                      <p className="font-medium text-green-900 text-xs">
                        {promotionCode}
                      </p>
                      <p className="text-xs text-green-700 truncate">
                        Saving ${promotionDiscount.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePromotion}
                      disabled={isRemovingPromotion}
                      className="text-green-700 hover:text-green-800 flex-shrink-0 h-6 w-6 p-0"
                    >
                      {isRemovingPromotion ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Promo code"
                        value={promotionCodeInput}
                        onChange={(e) => setPromotionCodeInput(e.target.value)}
                        disabled={isApplyingPromotion || !canApplyPromotion()}
                        className="text-sm h-8 rounded-lg flex-1"
                      />
                      <Button
                        onClick={handleApplyPromotion}
                        disabled={
                          isApplyingPromotion ||
                          !promotionCodeInput.trim() ||
                          !canApplyPromotion()
                        }
                        size="sm"
                        className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg h-8 px-3"
                      >
                        {isApplyingPromotion ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    </div>
                    {promotionValidationError && (
                      <p className="text-xs text-red-500">
                        {promotionValidationError}
                      </p>
                    )}
                    {!canApplyPromotion() && stats.paidItems === 0 && (
                      <p className="text-xs text-amber-600 text-center">
                        Promotions apply to paid items only
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Order Summary - Compact */}
              <div className="px-4 py-3">
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${stats.subtotal.toFixed(2)}</span>
                  </div>

                  {stats.membershipDiscount > 0 && (
                    <div className="flex justify-between text-xs text-purple-600">
                      <span className="flex items-center gap-1">
                        <Crown className="w-2 h-2" />
                        Membership
                      </span>
                      <span>-${stats.membershipDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {stats.promotionDiscount > 0 && (
                    <div className="flex justify-between text-xs text-green-600">
                      <span className="flex items-center gap-1">
                        <Tag className="w-2 h-2" />
                        Promotion
                      </span>
                      <span>-${stats.promotionDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-green-600">
                      ${stats.finalTotal.toFixed(2)}
                    </span>
                  </div>

                  {stats.totalSavings > 0 && (
                    <div className="text-center">
                      <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs">
                        Saved ${stats.totalSavings.toFixed(2)}!
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Action Buttons - Compact */}
                <div className="space-y-2">
                  <Button
                    asChild
                    size="sm"
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 h-9"
                    onClick={() => closeCart()}
                  >
                    <Link href="/checkout">
                      <CreditCard className="w-3 h-3 mr-2" />
                      Checkout
                      <ArrowRight className="w-3 h-3 ml-2" />
                    </Link>
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-lg h-8 text-xs"
                      asChild
                      onClick={() => closeCart()}
                    >
                      <Link href="/cart">View Cart</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCart}
                      className="text-red-600 border-red-200 hover:bg-red-50 rounded-lg h-8 px-2"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
