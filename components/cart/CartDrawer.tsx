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
// import { useUser } from "@clerk/nextjs";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
// } from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { useCartStore } from "@/store"; // Only for isOpen/closeCart state
// import { useOptimisticCart } from "@/hooks/useCart";

// // Helper function to format currency
// const formatCurrency = (amount: number) => {
//   return new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: "USD",
//   }).format(amount);
// };

// export function CartDrawer() {
//   const { user } = useUser();
//   const { isOpen, closeCart } = useCartStore(); // Only use for drawer state
//   const { cart, stats, loading, updateQuantity, removeFromCart } =
//     useOptimisticCart();

//   const handleQuantityChange = async (
//     productId: string,
//     newQuantity: number
//   ) => {
//     // Optimistic update - UI changes immediately
//     await updateQuantity(productId, newQuantity);
//   };

//   const handleRemoveItem = async (productId: string) => {
//     // Optimistic update - UI changes immediately
//     await removeFromCart(productId);
//   };

//   // Calculate totals from optimistic cart
//   const subtotal =
//     cart?.items?.reduce(
//       (sum: number, item: any) => sum + item.quantity * item.price,
//       0
//     ) || 0;
//   const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
//   const tax = subtotal * 0.08; // 8% tax
//   const total = subtotal + shipping + tax;

//   return (
//     <Sheet open={isOpen} onOpenChange={closeCart}>
//       <SheetContent className="w-full sm:max-w-lg bg-background/95 backdrop-blur-lg border-l border-white/10 p-6">
//         <SheetHeader className="pb-6">
//           <div className="flex items-center justify-between">
//             <SheetTitle className="flex items-center space-x-2">
//               <ShoppingBag className="w-5 h-5" />
//               <span>Shopping Cart</span>
//               {user && stats.itemCount > 0 && (
//                 <Badge variant="secondary">{stats.itemCount}</Badge>
//               )}
//             </SheetTitle>
//             <Button variant="ghost" size="icon" onClick={closeCart}>
//               <X className="w-5 h-5" />
//             </Button>
//           </div>
//         </SheetHeader>

//         {!user ? (
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
//         ) : loading ? (
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
//           // Cart with items
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
//                     {/* No loading states - instant UI feedback */}
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

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUnifiedCart } from "@/hooks/useUnifiedCart"; // Updated import

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export function CartDrawer() {
  // Use unified cart system for consistent state
  const {
    cart,
    stats,
    loading,
    initializing,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    isAuthenticated,
  } = useUnifiedCart();

  const handleQuantityChange = async (
    productId: string,
    newQuantity: number
  ) => {
    try {
      // This will update ALL components simultaneously via the unified store
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      // This will update ALL components simultaneously via the unified store
      await removeFromCart(productId);
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  // Calculate totals from unified cart
  const subtotal =
    cart?.items?.reduce(
      (sum: number, item: any) => sum + item.quantity * item.price,
      0
    ) || 0;
  const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-lg bg-background/95 backdrop-blur-lg border-l border-white/10 p-6">
        <SheetHeader className="pb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5" />
              <span>Shopping Cart</span>
              {isAuthenticated && stats.itemCount > 0 && (
                <Badge variant="secondary">{stats.itemCount}</Badge>
              )}
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={closeCart}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </SheetHeader>

        {!isAuthenticated ? (
          // Not authenticated - show sign in prompt
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6"
            >
              <LogIn className="w-12 h-12 text-blue-600" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">
              Sign in to view your cart
            </h3>
            <p className="text-muted-foreground mb-6 px-4">
              Create an account or sign in to save items to your cart and
              checkout
            </p>
            <div className="space-y-3 w-full max-w-xs">
              <Button asChild className="w-full" onClick={closeCart}>
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
        ) : initializing || loading ? (
          // Loading state
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading your cart...</p>
          </div>
        ) : !cart?.items || cart.items.length === 0 ? (
          // Empty cart
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6"
            >
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6 px-4">
              Discover our premium wellness beverages and start your health
              journey
            </p>
            <Button asChild onClick={closeCart} className="w-full max-w-xs">
              <Link href="/shop">
                Start Shopping
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        ) : (
          // Cart with items - using unified state
          <div className="flex flex-col h-full">
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {cart.items.map((item: any) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center space-x-4 p-4 glass rounded-2xl border border-white/10 bg-white/50"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={
                        item.product.images?.[0] || "/placeholder-product.jpg"
                      }
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate text-sm">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.price)} each
                    </p>
                    {item.product.category && (
                      <p className="text-xs text-green-600 font-medium">
                        {item.product.category.name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Quantity controls - instant updates across ALL components */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-8 h-8"
                      onClick={() =>
                        handleQuantityChange(
                          item.product._id,
                          item.quantity - 1
                        )
                      }
                    >
                      <Minus className="w-3 h-3" />
                    </Button>

                    <span className="w-8 text-center font-medium text-sm">
                      {item.quantity}
                    </span>

                    <Button
                      variant="outline"
                      size="icon"
                      className="w-8 h-8"
                      onClick={() =>
                        handleQuantityChange(
                          item.product._id,
                          item.quantity + 1
                        )
                      }
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-sm">
                      {formatCurrency(item.quantity * item.price)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.product._id)}
                      className="text-red-500 hover:text-red-700 h-auto p-0 text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            <Separator className="my-6" />

            {/* Cart Summary */}
            <div className="space-y-4 px-2">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? "Free" : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {shipping === 0 && (
                <div className="text-center text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                  🎉 Congratulations! You qualify for free shipping
                </div>
              )}

              {subtotal > 0 && subtotal < 50 && (
                <div className="text-center text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                  Add {formatCurrency(50 - subtotal)} more for free shipping!
                </div>
              )}

              <div className="space-y-3 pt-2">
                <Button
                  className="w-full"
                  size="lg"
                  asChild
                  onClick={closeCart}
                >
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                  onClick={closeCart}
                >
                  <Link href="/cart">View Full Cart</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
