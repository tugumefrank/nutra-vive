// components/products/add-to-cart-button.tsx
"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, Minus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { addToCart } from "@/lib/actions/cartServerActions";
import { toast } from "sonner";

interface AddToCartButtonProps {
  productId: string;
  className?: string;
  variant?: "default" | "outline";
  size?: "sm" | "default" | "lg";
}

export default function AddToCartButton({
  productId,
  className,
  variant = "default",
  size = "default",
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async () => {
    startTransition(async () => {
      try {
        const result = await addToCart(productId, quantity);

        if (result.success) {
          setIsAdded(true);
          toast(
            `Added to cart! ${quantity} item${quantity > 1 ? "s" : ""} added to your cart.`
          );

          // Reset the "added" state after animation
          setTimeout(() => setIsAdded(false), 2000);
        } else {
          toast(result.error || "Failed to add item to cart");
        }
      } catch (error) {
        toast("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Quantity:
        </span>
        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
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
            className="h-10 w-10 rounded-none hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleAddToCart}
          disabled={isPending || isAdded}
          variant={variant}
          size={size}
          className={cn(
            "relative overflow-hidden transition-all duration-300",
            variant === "default" &&
              "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-500/25",
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
                <span>Adding...</span>
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
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
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
          <>
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
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
