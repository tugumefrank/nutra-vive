// components/products/add-to-cart-button.tsx
"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Loader2,
  Eye,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUnifiedCart } from "@/hooks/useUnifiedCart";
import { toast } from "sonner";

interface AddToCartButtonProps {
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
    } | null;
  };
  className?: string;
  variant?: "default" | "outline";
  size?: "sm" | "default" | "lg";
  showQuantitySelector?: boolean;
  defaultQuantity?: number;
}

export default function AddToCartButton({
  product,
  className,
  variant = "default",
  size = "default",
  showQuantitySelector = true,
  defaultQuantity = 1,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(defaultQuantity);
  const [isAdded, setIsAdded] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Use unified cart system for consistency with ProductCard
  const {
    isInCart,
    getItemQuantity,
    addToCart,
    updateQuantity,
    openCart,
    isAuthenticated,
  } = useUnifiedCart();

  const inCart = isAuthenticated ? isInCart(product._id) : false;
  const currentQuantity = isAuthenticated ? getItemQuantity(product._id) : 0;

  const handleSignInRedirect = () => {
    toast.info("Please sign in to add items to cart");
    router.push("/sign-in");
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      handleSignInRedirect();
      return;
    }

    startTransition(async () => {
      try {
        setIsAdded(true);

        // Use unified cart system - this updates ALL components simultaneously
        await addToCart(product, quantity);

        // Open cart drawer for immediate feedback
        setTimeout(() => {
          openCart();
        }, 500); // Small delay to show the success animation first

        // Reset success state after animation
        setTimeout(() => setIsAdded(false), 2000);
      } catch (error) {
        setIsAdded(false);
        console.error("Failed to add to cart:", error);
        toast.error("Failed to add item to cart");
      }
    });
  };

  const handleUpdateQuantity = async (change: number) => {
    if (!isAuthenticated) {
      handleSignInRedirect();
      return;
    }

    const newQty = currentQuantity + change;

    try {
      // Use unified cart system for consistent state management
      await updateQuantity(product._id, newQty);
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Failed to update quantity");
    }
  };

  const handleViewCart = () => {
    if (!isAuthenticated) {
      handleSignInRedirect();
      return;
    }

    // Open cart drawer
    openCart();
  };

  // If user is authenticated and item is already in cart, show cart management UI
  if (isAuthenticated && inCart) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Current Cart Quantity Display */}
        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              In Cart
            </p>
            <p className="text-lg font-bold text-green-800 dark:text-green-200">
              {currentQuantity} item{currentQuantity > 1 ? "s" : ""}
            </p>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 border border-green-200 dark:border-green-700">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleUpdateQuantity(-1)}
              disabled={currentQuantity <= 1}
              className="h-8 w-8 rounded-md hover:bg-green-100 dark:hover:bg-green-800"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <motion.div
              key={currentQuantity}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-3 py-1 text-center min-w-[2rem] font-semibold text-green-700 dark:text-green-300"
            >
              {currentQuantity}
            </motion.div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleUpdateQuantity(1)}
              className="h-8 w-8 rounded-md hover:bg-green-100 dark:hover:bg-green-800"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* View Cart Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleViewCart}
            size={size}
            className={cn(
              "w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25",
              className
            )}
          >
            <Eye className="h-5 w-5 mr-2" />
            View Cart
          </Button>
        </motion.div>
      </div>
    );
  }

  // Default add to cart UI
  return (
    <div className={cn("space-y-4", className)}>
      {/* Quantity Selector */}
      {showQuantitySelector && (
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quantity:
          </span>
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || isPending}
              className="h-10 w-10 rounded-none hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <motion.div
              key={quantity}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-4 py-2 text-center min-w-[3rem] bg-gray-50 dark:bg-gray-800 border-x border-gray-300 dark:border-gray-600"
            >
              <span className="font-medium">{quantity}</span>
            </motion.div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
              disabled={isPending}
              className="h-10 w-10 rounded-none hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleAddToCart}
          disabled={isPending || isAdded}
          variant={variant}
          size={size}
          className={cn(
            "relative overflow-hidden transition-all duration-300 w-full",
            isAuthenticated
              ? variant === "default" &&
                  "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-500/25"
              : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25",
            isAdded && "bg-green-600 hover:bg-green-600",
            className
          )}
        >
          <AnimatePresence mode="wait">
            {isPending ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center space-x-2"
              >
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Adding to Cart...</span>
              </motion.div>
            ) : isAdded ? (
              <motion.div
                key="added"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center space-x-2"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                >
                  <Check className="h-5 w-5" />
                </motion.div>
                <span>Added to Cart!</span>
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center space-x-2"
              >
                {isAuthenticated ? (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    <span>Add to Cart</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    <span>Sign In to Purchase</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Particle Effect */}
          <AnimatePresence>
            {isAdded && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 20, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-green-400 rounded-full pointer-events-none"
              />
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Floating Particles on Success */}
      <AnimatePresence>
        {isAdded && (
          <div className="relative">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: (Math.random() - 0.5) * 100,
                  y: -Math.random() * 100,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
                className="absolute pointer-events-none w-2 h-2 bg-green-400 rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Helpful Text for Non-Authenticated Users */}
      {!isAuthenticated && (
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
          Sign in to Buy
        </p>
      )}
    </div>
  );
}
