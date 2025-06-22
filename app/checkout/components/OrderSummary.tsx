// app/checkout/components/OrderSummary.tsx

import { motion } from "framer-motion";
import Image from "next/image";
import { Gift, Shield, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { CartData } from "../types";

interface OrderSummaryProps {
  cart: CartData | null;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export default function OrderSummary({
  cart,
  subtotal,
  shipping,
  tax,
  total,
}: OrderSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl md:rounded-3xl p-4 md:p-6 bg-white border border-white/20 sticky top-24"
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Gift className="w-5 h-5 mr-2 text-orange-600" />
        Order Summary
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
              <p className="text-xs text-gray-500">
                ${item.price.toFixed(2)} each
              </p>
            </div>
            <div className="text-sm font-medium">
              ${(item.quantity * item.price).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <Separator className="mb-4" />

      {/* Pricing Breakdown */}
      <div className="space-y-2 mb-4 md:mb-6">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span className="text-green-600">
            {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-orange-600">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Free Shipping Progress */}
      {subtotal < 25 && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-orange-700">Free shipping at $25</span>
            <span className="font-medium text-orange-700">
              ${(25 - subtotal).toFixed(2)} to go
            </span>
          </div>
          <div className="w-full bg-orange-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((subtotal / 25) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

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
