// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import {
//   Minus,
//   Plus,
//   X,
//   ShoppingBag,
//   Truck,
//   Store,
//   CreditCard,
//   Wallet,
//   Tag,
//   ArrowRight,
//   ArrowLeft,
//   Heart,
//   Shield,
//   Zap,
//   Trash2,
//   Package,
//   Loader2,
//   AlertCircle,
//   CheckCircle,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Card, CardContent } from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox";
// import { toast } from "sonner";
// import {
//   getCart,
//   updateCartItem,
//   removeFromCart,
//   clearCart,
// } from "@/lib/actions/cartServerActions";

// interface CartItem {
//   _id: string;
//   product: {
//     _id: string;
//     name: string;
//     slug: string;
//     price: number;
//     images: string[];
//     category?: {
//       name: string;
//       slug: string;
//     };
//   };
//   quantity: number;
//   price: number;
// }

// interface CartData {
//   _id: string;
//   items: CartItem[];
// }

// export default function CartPage() {
//   const [cart, setCart] = useState<CartData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
//   const [couponCode, setCouponCode] = useState("");
//   const [deliveryMethod, setDeliveryMethod] = useState("standard");
//   const [agreeToTerms, setAgreeToTerms] = useState(false);
//   const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

//   const router = useRouter();

//   // Load cart data
//   useEffect(() => {
//     loadCart();
//   }, []);

//   const loadCart = async () => {
//     try {
//       setLoading(true);
//       const result = await getCart();

//       if (result.success && result.cart) {
//         setCart(result.cart);
//       } else {
//         setCart({ _id: "", items: [] });
//       }
//     } catch (error) {
//       console.error("Error loading cart:", error);
//       toast(
//         <div>
//           <div className="font-bold text-red-600">Error</div>
//           <div>Failed to load cart</div>
//         </div>,
//         { className: "bg-red-50 border-red-200 text-red-800" }
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateQuantity = async (
//     itemId: string,
//     productId: string,
//     newQuantity: number
//   ) => {
//     try {
//       setUpdatingItems((prev) => new Set(prev).add(itemId));

//       const result = await updateCartItem(productId, newQuantity);

//       if (result.success && result.cart) {
//         setCart(result.cart);

//         if (newQuantity === 0) {
//           toast(
//             <div>
//               <div className="font-bold">Item removed</div>
//               <div>Item has been removed from your cart</div>
//             </div>
//           );
//         }
//       } else {
//         toast(
//           <div>
//             <div className="font-bold text-red-600">Error</div>
//             <div>{result.error || "Failed to update item"}</div>
//           </div>,
//           { className: "bg-red-50 border-red-200 text-red-800" }
//         );
//       }
//     } catch (error) {
//       console.error("Error updating quantity:", error);
//       toast(
//         <div>
//           <div className="font-bold text-red-600">Error</div>
//           <div>Failed to update item quantity</div>
//         </div>,
//         { className: "bg-red-50 border-red-200 text-red-800" }
//       );
//     } finally {
//       setUpdatingItems((prev) => {
//         const newSet = new Set(prev);
//         newSet.delete(itemId);
//         return newSet;
//       });
//     }
//   };

//   const removeItem = async (itemId: string, productId: string) => {
//     try {
//       setUpdatingItems((prev) => new Set(prev).add(itemId));

//       const result = await removeFromCart(productId);

//       if (result.success && result.cart) {
//         setCart(result.cart);
//         toast(
//           <div>
//             <div className="font-bold">Item removed</div>
//             <div>Item has been removed from your cart</div>
//           </div>
//         );
//       } else {
//         toast(
//           <div>
//             <div className="font-bold text-red-600">Error</div>
//             <div>{result.error || "Failed to remove item"}</div>
//           </div>,
//           { className: "bg-red-50 border-red-200 text-red-800" }
//         );
//       }
//     } catch (error) {
//       console.error("Error removing item:", error);
//       toast(
//         <div>
//           <div className="font-bold text-red-600">Error</div>
//           <div>Failed to remove item</div>
//         </div>,
//         { className: "bg-red-50 border-red-200 text-red-800" }
//       );
//     } finally {
//       setUpdatingItems((prev) => {
//         const newSet = new Set(prev);
//         newSet.delete(itemId);
//         return newSet;
//       });
//     }
//   };

//   const clearCartItems = async () => {
//     try {
//       const result = await clearCart();

//       if (result.success) {
//         setCart({ _id: "", items: [] });
//         toast(
//           <div>
//             <div className="font-bold">Cart cleared</div>
//             <div>All items have been removed from your cart</div>
//           </div>
//         );
//       } else {
//         toast(
//           <div>
//             <div className="font-bold text-red-600">Error</div>
//             <div>{result.error || "Failed to clear cart"}</div>
//           </div>,
//           { className: "bg-red-50 border-red-200 text-red-800" }
//         );
//       }
//     } catch (error) {
//       console.error("Error clearing cart:", error);
//     }
//   };

//   const applyCoupon = () => {
//     if (couponCode.trim()) {
//       // Mock coupon application
//       if (couponCode.toLowerCase() === "save10") {
//         setAppliedCoupon("SAVE10");
//         toast(
//           <div>
//             <div className="font-bold">Coupon applied!</div>
//             <div>You saved $2.50 with SAVE10</div>
//           </div>
//         );
//       } else {
//         toast(
//           <div>
//             <div className="font-bold text-red-600">Invalid coupon</div>
//             <div>This coupon code is not valid</div>
//           </div>,
//           { className: "bg-red-50 border-red-200 text-red-800" }
//         );
//       }
//     }
//   };

//   // Calculate totals
//   const subtotal =
//     cart?.items.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0;
//   const couponDiscount = appliedCoupon ? 2.5 : 0;
//   const shipping =
//     deliveryMethod === "pickup"
//       ? 0
//       : subtotal >= 25
//         ? 0
//         : deliveryMethod === "express"
//           ? 9.99
//           : 5.99;
//   const tax =
//     Math.round((subtotal - couponDiscount + shipping) * 0.08 * 100) / 100;
//   const total = subtotal - couponDiscount + shipping + tax;

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
//         <div className="text-center space-y-4">
//           <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
//           <p className="text-gray-600">Loading your cart...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!cart || cart.items.length === 0) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
//         {/* Header */}
//         <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-green-100">
//           <div className="container mx-auto px-4 py-4">
//             <div className="flex items-center justify-between">
//               <Button variant="ghost" asChild>
//                 <Link href="/shop">
//                   <ArrowLeft className="w-4 h-4 mr-2" />
//                   Continue Shopping
//                 </Link>
//               </Button>
//               <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
//                 Shopping Cart
//               </h1>
//               <div className="text-sm text-muted-foreground">0 items</div>
//             </div>
//           </div>
//         </div>

//         {/* Empty Cart */}
//         <div className="container mx-auto px-4 py-16 text-center">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="max-w-md mx-auto space-y-6"
//           >
//             <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
//               <ShoppingBag className="w-12 h-12 text-gray-400" />
//             </div>
//             <h2 className="text-2xl font-bold text-gray-900">
//               Your cart is empty
//             </h2>
//             <p className="text-gray-600">
//               Discover our amazing collection of organic juices and herbal teas
//               to get started!
//             </p>
//             <Button
//               className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-2xl"
//               asChild
//             >
//               <Link href="/shop">
//                 Explore Products
//                 <ArrowRight className="ml-2 w-4 h-4" />
//               </Link>
//             </Button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
//       {/* Header */}
//       <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-green-100">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <Button variant="ghost" asChild>
//               <Link href="/shop">
//                 <ArrowLeft className="w-4 h-4 mr-2" />
//                 <span className="hidden sm:inline">Continue Shopping</span>
//                 <span className="sm:hidden">Shop</span>
//               </Link>
//             </Button>
//             <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
//               <span className="hidden sm:inline">Shopping Cart</span>
//               <span className="sm:hidden">Cart</span>
//             </h1>
//             <div className="text-sm text-muted-foreground">
//               {cart.items.length} {cart.items.length === 1 ? "item" : "items"}
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="container mx-auto px-4 py-4 md:py-8">
//         <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
//           {/* Cart Items Section */}
//           <div className="lg:col-span-2 space-y-4 md:space-y-6">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="glass rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/20"
//             >
//               <div className="flex items-center justify-between mb-4 md:mb-6">
//                 <h2 className="text-lg md:text-xl font-semibold flex items-center">
//                   <ShoppingBag className="w-5 h-5 mr-2 text-green-600" />
//                   Cart Items
//                 </h2>
//                 <div className="flex items-center gap-2">
//                   <Badge
//                     variant="secondary"
//                     className="bg-green-100 text-green-700"
//                   >
//                     {cart.items.length} items
//                   </Badge>
//                   {cart.items.length > 0 && (
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={clearCartItems}
//                       className="text-red-500 hover:text-red-700 hover:bg-red-50"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                       <span className="hidden md:inline ml-1">Clear</span>
//                     </Button>
//                   )}
//                 </div>
//               </div>

//               <div className="space-y-3 md:space-y-4">
//                 <AnimatePresence>
//                   {cart.items.map((item, index) => (
//                     <motion.div
//                       key={item._id}
//                       initial={{ opacity: 0, x: -20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       exit={{ opacity: 0, x: 20 }}
//                       transition={{ delay: index * 0.1 }}
//                       className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white/60 rounded-xl md:rounded-2xl border border-white/40 hover:bg-white/80 transition-all"
//                     >
//                       {/* Product Image */}
//                       <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg md:rounded-xl overflow-hidden flex-shrink-0">
//                         <Image
//                           src={
//                             item.product.images[0] || "/api/placeholder/300/300"
//                           }
//                           alt={item.product.name}
//                           fill
//                           className="object-cover"
//                         />
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
//                       </div>

//                       {/* Product Details */}
//                       <div className="flex-1 min-w-0">
//                         <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate">
//                           {item.product.name}
//                         </h3>
//                         <div className="flex items-center gap-2 mt-1">
//                           <span className="text-green-600 font-medium text-sm md:text-base">
//                             ${item.price.toFixed(2)}
//                           </span>
//                           <span className="text-xs md:text-sm text-gray-500">
//                             each
//                           </span>
//                         </div>
//                         {item.product.category && (
//                           <div className="flex items-center gap-1 md:gap-2 mt-1 md:mt-2">
//                             <Badge variant="outline" className="text-xs">
//                               <Heart className="w-3 h-3 mr-1" />
//                               Organic
//                             </Badge>
//                           </div>
//                         )}
//                       </div>

//                       {/* Quantity Controls */}
//                       <div className="flex flex-col items-end gap-2">
//                         <div className="flex items-center gap-1 md:gap-2 bg-white rounded-lg md:rounded-xl border border-gray-200 p-1">
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             className="w-6 h-6 md:w-8 md:h-8 hover:bg-red-50 hover:text-red-600"
//                             onClick={() =>
//                               updateQuantity(
//                                 item._id,
//                                 item.product._id,
//                                 item.quantity - 1
//                               )
//                             }
//                             disabled={updatingItems.has(item._id)}
//                           >
//                             {updatingItems.has(item._id) ? (
//                               <Loader2 className="w-3 h-3 animate-spin" />
//                             ) : (
//                               <Minus className="w-3 h-3" />
//                             )}
//                           </Button>
//                           <span className="w-6 md:w-8 text-center font-medium text-sm md:text-base">
//                             {item.quantity}
//                           </span>
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             className="w-6 h-6 md:w-8 md:h-8 hover:bg-green-50 hover:text-green-600"
//                             onClick={() =>
//                               updateQuantity(
//                                 item._id,
//                                 item.product._id,
//                                 item.quantity + 1
//                               )
//                             }
//                             disabled={updatingItems.has(item._id)}
//                           >
//                             {updatingItems.has(item._id) ? (
//                               <Loader2 className="w-3 h-3 animate-spin" />
//                             ) : (
//                               <Plus className="w-3 h-3" />
//                             )}
//                           </Button>
//                         </div>

//                         {/* Price & Remove */}
//                         <div className="text-right">
//                           <div className="font-bold text-sm md:text-lg text-gray-900">
//                             ${(item.quantity * item.price).toFixed(2)}
//                           </div>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() =>
//                               removeItem(item._id, item.product._id)
//                             }
//                             disabled={updatingItems.has(item._id)}
//                             className="text-red-500 hover:text-red-700 hover:bg-red-50 h-auto p-1 mt-1"
//                           >
//                             <X className="w-3 h-3 md:w-4 md:h-4" />
//                           </Button>
//                         </div>
//                       </div>
//                     </motion.div>
//                   ))}
//                 </AnimatePresence>
//               </div>
//             </motion.div>
//           </div>

//           {/* Cart Total Section */}
//           <div className="space-y-4 md:space-y-6">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//               className="glass rounded-2xl md:rounded-3xl p-4 md:p-6 bg-white border border-white/20 sticky top-24"
//             >
//               <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 flex items-center">
//                 <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
//                 Order Summary
//               </h2>

//               {/* Delivery Method */}
//               <div className="mb-4 md:mb-6">
//                 <h3 className="font-medium mb-3 text-gray-700 text-sm md:text-base">
//                   Delivery Method
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
//                   <Card
//                     className={`cursor-pointer transition-all hover:scale-105 ${
//                       deliveryMethod === "standard"
//                         ? "ring-2 ring-blue-500 bg-blue-50"
//                         : "hover:bg-gray-50"
//                     }`}
//                     onClick={() => setDeliveryMethod("standard")}
//                   >
//                     <CardContent className="p-3 md:p-4 text-center">
//                       <Truck className="w-4 h-4 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 text-blue-600" />
//                       <div className="font-medium text-xs md:text-sm">
//                         Standard
//                       </div>
//                       <div className="text-xs text-gray-500">5-7 days</div>
//                       <div className="text-xs font-medium text-green-600">
//                         {subtotal >= 25 ? "FREE" : "$5.99"}
//                       </div>
//                     </CardContent>
//                   </Card>
//                   <Card
//                     className={`cursor-pointer transition-all hover:scale-105 ${
//                       deliveryMethod === "express"
//                         ? "ring-2 ring-amber-500 bg-amber-50"
//                         : "hover:bg-gray-50"
//                     }`}
//                     onClick={() => setDeliveryMethod("express")}
//                   >
//                     <CardContent className="p-3 md:p-4 text-center">
//                       <Zap className="w-4 h-4 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 text-amber-600" />
//                       <div className="font-medium text-xs md:text-sm">
//                         Express
//                       </div>
//                       <div className="text-xs text-gray-500">2-3 days</div>
//                       <div className="text-xs font-medium">$9.99</div>
//                     </CardContent>
//                   </Card>
//                 </div>
//               </div>

//               {/* Payment Details */}
//               <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
//                 <h3 className="font-medium text-gray-700 text-sm md:text-base">
//                   Order Total
//                 </h3>
//                 <div className="space-y-1 md:space-y-2">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Subtotal:</span>
//                     <span className="font-medium">${subtotal.toFixed(2)}</span>
//                   </div>
//                   {appliedCoupon && (
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">
//                         Discount ({appliedCoupon}):
//                       </span>
//                       <span className="font-medium text-green-600">
//                         -${couponDiscount.toFixed(2)}
//                       </span>
//                     </div>
//                   )}
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Shipping:</span>
//                     <span className="font-medium text-green-600">
//                       {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Tax:</span>
//                     <span className="font-medium">${tax.toFixed(2)}</span>
//                   </div>
//                   <Separator />
//                   <div className="flex justify-between text-base md:text-lg font-bold">
//                     <span>Total:</span>
//                     <span className="text-green-600">${total.toFixed(2)}</span>
//                   </div>
//                 </div>

//                 {shipping === 0 && subtotal >= 25 && (
//                   <div className="text-center text-xs md:text-sm text-green-600 bg-green-50 p-2 md:p-3 rounded-xl border border-green-200">
//                     🎉 You qualify for free shipping!
//                   </div>
//                 )}
//               </div>

//               {/* Coupon Code */}
//               <div className="mb-4 md:mb-6">
//                 <div className="flex gap-2">
//                   <div className="relative flex-1">
//                     <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                     <Input
//                       placeholder="Coupon Code"
//                       value={couponCode}
//                       onChange={(e) => setCouponCode(e.target.value)}
//                       className="pl-10 bg-white/60 border-white/40 text-sm"
//                     />
//                   </div>
//                   <Button
//                     variant="outline"
//                     onClick={applyCoupon}
//                     className="bg-white/60 hover:bg-white/80 text-sm px-3"
//                   >
//                     Apply
//                   </Button>
//                 </div>
//               </div>

//               {/* Terms Agreement */}
//               <div className="mb-4 md:mb-6">
//                 <div className="flex items-start space-x-2">
//                   <Checkbox
//                     id="terms"
//                     checked={agreeToTerms}
//                     onCheckedChange={(checked) =>
//                       setAgreeToTerms(checked === true)
//                     }
//                   />
//                   <label
//                     htmlFor="terms"
//                     className="text-xs md:text-sm text-gray-600 leading-relaxed"
//                   >
//                     I agree to the{" "}
//                     <Link
//                       href="/privacy"
//                       className="text-blue-600 hover:underline"
//                     >
//                       Privacy Policy
//                     </Link>{" "}
//                     and{" "}
//                     <Link
//                       href="/terms"
//                       className="text-blue-600 hover:underline"
//                     >
//                       Terms of Service
//                     </Link>
//                   </label>
//                 </div>
//               </div>

//               {/* Checkout Buttons */}
//               <div className="space-y-2 md:space-y-3">
//                 <Button
//                   className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 md:py-6 text-sm md:text-lg font-semibold rounded-xl md:rounded-2xl"
//                   disabled={!agreeToTerms}
//                   asChild
//                 >
//                   <Link href="/checkout">
//                     Proceed to Checkout
//                     <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
//                   </Link>
//                 </Button>

//                 <Button
//                   variant="outline"
//                   className="w-full py-3 md:py-6 rounded-xl md:rounded-2xl bg-white/60 hover:bg-white/80 text-sm md:text-base"
//                   asChild
//                 >
//                   <Link href="/shop">Continue Shopping</Link>
//                 </Button>
//               </div>

//               {/* Security Badge */}
//               <div className="mt-4 md:mt-6 text-center">
//                 <div className="flex items-center justify-center text-xs text-gray-500">
//                   <Shield className="w-3 h-3 md:w-4 md:h-4 mr-1" />
//                   Secure checkout powered by Stripe
//                 </div>
//               </div>
//             </motion.div>
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyPromotionToCart,
  removePromotionFromCart,
  validatePromotionCode,
  type CartWithPromotion,
} from "@/lib/actions/cartServerActions";

// Enhanced Cart Item Interface
interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    category?: {
      _id: string;
      name: string;
      slug: string;
    };
    promotionEligible?: boolean;
    isDiscounted?: boolean;
  };
  quantity: number;
  price: number;
  originalPrice?: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartWithPromotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [promotionCode, setPromotionCode] = useState("");
  const [applyingPromotion, setApplyingPromotion] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const router = useRouter();

  // Load cart data
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const result = await getCart();

      if (result.success && result.cart) {
        setCart(result.cart);
        // Set promotion code in input if one is applied
        if (result.cart.promotionCode) {
          setPromotionCode(result.cart.promotionCode);
        }
      } else {
        // Initialize empty cart with proper structure
        setCart({
          _id: "",
          items: [],
          subtotal: 0,
          promotionDiscount: 0,
          finalTotal: 0,
          shippingAmount: 0,
          taxAmount: 0,
          totalAmount: 0,
          hasPromotionApplied: false,
        });
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (
    itemId: string,
    productId: string,
    newQuantity: number
  ) => {
    try {
      setUpdatingItems((prev) => new Set(prev).add(itemId));

      const result = await updateCartItem(productId, newQuantity);

      if (result.success && result.cart) {
        setCart(result.cart);

        if (newQuantity === 0) {
          toast.success("Item removed from cart");
        } else {
          toast.success("Cart updated");
        }
      } else {
        toast.error(result.error || "Failed to update item");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update item quantity");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const removeItem = async (itemId: string, productId: string) => {
    try {
      setUpdatingItems((prev) => new Set(prev).add(itemId));

      const result = await removeFromCart(productId);

      if (result.success && result.cart) {
        setCart(result.cart);
        toast.success("Item removed from cart");
      } else {
        toast.error(result.error || "Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const clearCartItems = async () => {
    try {
      const result = await clearCart();

      if (result.success) {
        setCart({
          _id: "",
          items: [],
          subtotal: 0,
          promotionDiscount: 0,
          finalTotal: 0,
          shippingAmount: 0,
          taxAmount: 0,
          totalAmount: 0,
          hasPromotionApplied: false,
        });
        setPromotionCode("");
        toast.success("Cart cleared");
      } else {
        toast.error(result.error || "Failed to clear cart");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
    }
  };

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
        setCart(result.cart);
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

  const removePromotion = async () => {
    try {
      const result = await removePromotionFromCart();

      if (result.success && result.cart) {
        setCart(result.cart);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-green-600" />
            <Sparkles className="w-4 h-4 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Loading your cart...</p>
          <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto">
            <div className="w-full h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-green-100">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" asChild className="hover:bg-green-50">
                <Link href="/shop">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Shopping Cart
              </h1>
              <div className="text-sm text-muted-foreground">0 items</div>
            </div>
          </div>
        </div>

        {/* Empty Cart */}
        <div className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto space-y-6"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Your cart is empty
            </h2>
            <p className="text-gray-600">
              Discover our amazing collection of organic juices and herbal teas
              to get started!
            </p>
            <Button
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              asChild
            >
              <Link href="/shop">
                Explore Products
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-green-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild className="hover:bg-green-50">
              <Link href="/shop">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Continue Shopping</span>
                <span className="sm:hidden">Shop</span>
              </Link>
            </Button>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              <span className="hidden sm:inline">Shopping Cart</span>
              <span className="sm:hidden">Cart</span>
            </h1>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                {cart.items.length} {cart.items.length === 1 ? "item" : "items"}
              </div>
              {cart.hasPromotionApplied && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700 text-xs"
                >
                  <Gift className="w-3 h-3 mr-1" />
                  Promo Applied
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2 text-green-600" />
                  Cart Items
                </h2>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700"
                  >
                    {cart.items.length} items
                  </Badge>
                  {cart.items.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCartItems}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden md:inline ml-1">Clear</span>
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                <AnimatePresence>
                  {cart.items.map((item: CartItem, index: number) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white/60 rounded-xl md:rounded-2xl border border-white/40 hover:bg-white/80 transition-all"
                    >
                      {/* Product Image */}
                      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg md:rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                          src={
                            item.product.images[0] || "/api/placeholder/300/300"
                          }
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        {item.product.isDiscounted && (
                          <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            Sale
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-green-600 font-medium text-sm md:text-base">
                            ${item.price.toFixed(2)}
                          </span>
                          {item.originalPrice &&
                            item.originalPrice > item.price && (
                              <span className="text-xs text-gray-400 line-through">
                                ${item.originalPrice.toFixed(2)}
                              </span>
                            )}
                          <span className="text-xs md:text-sm text-gray-500">
                            each
                          </span>
                        </div>
                        {item.product.category && (
                          <div className="flex items-center gap-1 md:gap-2 mt-1 md:mt-2">
                            <Badge variant="outline" className="text-xs">
                              <Heart className="w-3 h-3 mr-1" />
                              Organic
                            </Badge>
                            {item.product.promotionEligible && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                Promo Eligible
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 md:gap-2 bg-white rounded-lg md:rounded-xl border border-gray-200 p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 md:w-8 md:h-8 hover:bg-red-50 hover:text-red-600"
                            onClick={() =>
                              updateQuantity(
                                item._id,
                                item.product._id,
                                item.quantity - 1
                              )
                            }
                            disabled={updatingItems.has(item._id)}
                          >
                            {updatingItems.has(item._id) ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Minus className="w-3 h-3" />
                            )}
                          </Button>
                          <span className="w-6 md:w-8 text-center font-medium text-sm md:text-base">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 md:w-8 md:h-8 hover:bg-green-50 hover:text-green-600"
                            onClick={() =>
                              updateQuantity(
                                item._id,
                                item.product._id,
                                item.quantity + 1
                              )
                            }
                            disabled={updatingItems.has(item._id)}
                          >
                            {updatingItems.has(item._id) ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Plus className="w-3 h-3" />
                            )}
                          </Button>
                        </div>

                        {/* Price & Remove */}
                        <div className="text-right">
                          <div className="font-bold text-sm md:text-lg text-gray-900">
                            ${(item.quantity * item.price).toFixed(2)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeItem(item._id, item.product._id)
                            }
                            disabled={updatingItems.has(item._id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-auto p-1 mt-1"
                          >
                            <X className="w-3 h-3 md:w-4 md:h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Cart Summary Section */}
          <div className="space-y-4 md:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl md:rounded-3xl p-4 md:p-6 bg-white border border-white/20 sticky top-24"
            >
              <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                Cart Summary
              </h2>

              {/* Promotion Code Section */}
              <div className="mb-4 md:mb-6">
                <h3 className="font-medium mb-3 text-gray-700 text-sm md:text-base flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Promotion Code
                </h3>

                {cart.hasPromotionApplied && cart.promotionCode ? (
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
                      💰 You saved ${cart.promotionDiscount.toFixed(2)}
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
                          className="pl-10 bg-white/60 border-white/40 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                        className="bg-white/60 hover:bg-white/80 text-sm px-3 border-green-200 hover:border-green-300"
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

              {/* Order Summary */}
              <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                <h3 className="font-medium text-gray-700 text-sm md:text-base">
                  Order Summary
                </h3>
                <div className="space-y-1 md:space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      ${cart.subtotal.toFixed(2)}
                    </span>
                  </div>

                  {cart.promotionDiscount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex justify-between text-sm bg-green-50 -mx-2 px-2 py-1 rounded"
                    >
                      <span className="text-green-700 flex items-center font-medium">
                        <Percent className="w-3 h-3 mr-1" />
                        Promotion ({cart.promotionCode}):
                      </span>
                      <span className="font-bold text-green-600">
                        -${cart.promotionDiscount.toFixed(2)}
                      </span>
                    </motion.div>
                  )}

                  <Separator />
                  <div className="flex justify-between text-base md:text-lg font-bold">
                    <span>Subtotal:</span>
                    <span className="text-green-600">
                      ${cart.finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="text-center text-xs md:text-sm text-gray-500 bg-blue-50 p-2 md:p-3 rounded-xl border border-blue-200">
                  <Info className="w-4 h-4 inline mr-1" />
                  Shipping and taxes will be calculated at checkout
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="mb-4 md:mb-6">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) =>
                      setAgreeToTerms(checked === true)
                    }
                  />
                  <label
                    htmlFor="terms"
                    className="text-xs md:text-sm text-gray-600 leading-relaxed"
                  >
                    I agree to the{" "}
                    <Link
                      href="/privacy"
                      className="text-blue-600 hover:underline"
                    >
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/terms"
                      className="text-blue-600 hover:underline"
                    >
                      Terms of Service
                    </Link>
                  </label>
                </div>
              </div>

              {/* Checkout Buttons */}
              <div className="space-y-2 md:space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 md:py-6 text-sm md:text-lg font-semibold rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  disabled={!agreeToTerms}
                  asChild
                >
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full py-3 md:py-6 rounded-xl md:rounded-2xl bg-white/60 hover:bg-white/80 text-sm md:text-base border-green-200 hover:border-green-300"
                  asChild
                >
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>

              {/* Security Badge */}
              <div className="mt-4 md:mt-6 text-center">
                <div className="flex items-center justify-center text-xs text-gray-500">
                  <Shield className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  Secure checkout powered by Stripe
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Spacer */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
