"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  X,
  ShoppingBag,
  Truck,
  Store,
  CreditCard,
  Wallet,
  Tag,
  ArrowRight,
  ArrowLeft,
  Heart,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

// Mock cart data
const mockCartItems = [
  {
    id: "1",
    productId: "juice-1",
    product: {
      name: "Berry Day Antioxidant Juice",
      images: ["/api/placeholder/300/300"],
      slug: "berry-day-juice",
    },
    price: 8.87,
    quantity: 2,
    totalPrice: 17.74,
  },
  {
    id: "2",
    productId: "tea-1",
    product: {
      name: "Green Matcha Tea Latte",
      images: ["/api/placeholder/300/300"],
      slug: "green-matcha-latte",
    },
    price: 10.5,
    quantity: 1,
    totalPrice: 10.5,
  },
];

const subtotal: number = 28.24;
const shipping: number = 0; // Free shipping over $25
const tax: number = 2.26;
const total: number = 30.5;

export default function CartPage() {
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [couponCode, setCouponCode] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("home");
  const [paymentMethod, setPaymentMethod] = useState("full");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCartItems((items) => items.filter((item) => item.id !== itemId));
    } else {
      setCartItems((items) =>
        items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity: newQuantity,
                totalPrice: item.price * newQuantity,
              }
            : item
        )
      );
    }
  };

  const removeItem = (itemId: string) => {
    setCartItems((items) => items.filter((item) => item.id !== itemId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-green-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link href="/shop">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Shopping Cart
            </h1>
            <div className="text-sm text-muted-foreground">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2 text-green-600" />
                  Cart Items
                </h2>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700"
                >
                  {cartItems.length} items
                </Badge>
              </div>

              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl border border-white/40 hover:bg-white/80 transition-all"
                  >
                    {/* Product Image */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {item.product.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-green-600 font-medium">
                          ${item.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500">each</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Heart className="w-3 h-3 mr-1" />
                          Organic
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Natural
                        </Badge>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 hover:bg-red-50 hover:text-red-600"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 hover:bg-green-50 hover:text-green-600"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Price & Remove */}
                    <div className="text-right">
                      <div className="font-bold text-lg text-gray-900">
                        ${item.totalPrice.toFixed(2)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-auto p-1 mt-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Recommended Products */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-amber-500" />
                  You might also like
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex-shrink-0 w-32">
                      <div className="relative w-full h-24 rounded-lg overflow-hidden mb-2">
                        <Image
                          src="/api/placeholder/150/150"
                          alt="Recommended product"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-xs font-medium truncate">
                        Green Tea Blend
                      </p>
                      <p className="text-xs text-green-600">$8.89</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Cart Total Section */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-3xl p-6 bg-white border border-white/20 sticky top-24"
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                Order Summary
              </h2>

              {/* Delivery Method */}
              <div className="mb-6">
                <h3 className="font-medium mb-3 text-gray-700">
                  Choose Delivery Method
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Card
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      deliveryMethod === "home"
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setDeliveryMethod("home")}
                  >
                    <CardContent className="p-4 text-center">
                      <Truck className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                      <div className="font-medium text-sm">Home Delivery</div>
                      <div className="text-xs text-gray-500">2-3 days</div>
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      deliveryMethod === "pickup"
                        ? "ring-2 ring-green-500 bg-green-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setDeliveryMethod("pickup")}
                  >
                    <CardContent className="p-4 text-center">
                      <Store className="w-6 h-6 mx-auto mb-2 text-green-600" />
                      <div className="font-medium text-sm">Store Pickup</div>
                      <div className="text-xs text-gray-500">Same day</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h3 className="font-medium mb-3 text-gray-700">
                  Choose Payment Type
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Card
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      paymentMethod === "full"
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setPaymentMethod("full")}
                  >
                    <CardContent className="p-4 text-center">
                      <CreditCard className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                      <div className="font-medium text-sm">Full Payment</div>
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      paymentMethod === "partial"
                        ? "ring-2 ring-purple-500 bg-purple-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setPaymentMethod("partial")}
                  >
                    <CardContent className="p-4 text-center">
                      <Wallet className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                      <div className="font-medium text-sm">Split Payment</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-3 mb-6">
                <h3 className="font-medium text-gray-700">Payment Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Charge:</span>
                    <span className="font-medium text-green-600">
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">${total.toFixed(2)}</span>
                  </div>
                </div>

                {shipping === 0 && (
                  <div className="text-center text-sm text-green-600 bg-green-50 p-3 rounded-xl border border-green-200">
                    🎉 You qualify for free shipping!
                  </div>
                )}
              </div>

              {/* Coupon Code */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Enter Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="pl-10 bg-white/60 border-white/40"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="bg-white/60 hover:bg-white/80"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="mb-6">
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
                    className="text-sm text-gray-600 leading-relaxed"
                  >
                    I have read and agree to the{" "}
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
              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-6 text-lg font-semibold rounded-2xl"
                  disabled={!agreeToTerms}
                  asChild
                >
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full py-6 rounded-2xl bg-white/60 hover:bg-white/80"
                  asChild
                >
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>

              {/* Security Badge */}
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center text-xs text-gray-500">
                  <Shield className="w-4 h-4 mr-1" />
                  Secure checkout powered by Stripe
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
