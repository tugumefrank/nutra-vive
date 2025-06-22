"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Minus,
  Plus,
  X,
  ShoppingBag,
  Tag,
  ArrowRight,
  ArrowLeft,
  Heart,
  Shield,
  Trash2,
  Loader2,
  Gift,
} from "lucide-react";

interface CartItem {
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
}

interface CartData {
  _id: string;
  items: CartItem[];
}

// Helper function to get appropriate placeholder image based on product name
const getPlaceholderImage = (productName: string) => {
  const name = productName.toLowerCase();

  if (
    name.includes("tea") ||
    name.includes("matcha") ||
    name.includes("green")
  ) {
    return "https://images.unsplash.com/photo-1556881286-2d5b9b5c28c2?w=300&h=300&fit=crop&auto=format";
  } else if (
    name.includes("juice") ||
    name.includes("berry") ||
    name.includes("fruit")
  ) {
    return "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=300&h=300&fit=crop&auto=format";
  } else if (name.includes("watermelon")) {
    return "https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=300&h=300&fit=crop&auto=format";
  } else if (name.includes("lemon") || name.includes("citrus")) {
    return "https://images.unsplash.com/photo-1590004953392-5aba2e72269a?w=300&h=300&fit=crop&auto=format";
  } else if (
    name.includes("hibiscus") ||
    name.includes("strawberry") ||
    name.includes("raspberry")
  ) {
    return "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=300&fit=crop&auto=format";
  } else if (name.includes("ginger")) {
    return "https://images.unsplash.com/photo-1597318201637-94d5ac0cb85b?w=300&h=300&fit=crop&auto=format";
  } else if (name.includes("pomegranate") || name.includes("blueberry")) {
    return "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&auto=format";
  } else if (name.includes("peach")) {
    return "https://images.unsplash.com/photo-1629828035225-c5d2e8268467?w=300&h=300&fit=crop&auto=format";
  }

  // Default organic juice/tea placeholder
  return "https://images.unsplash.com/photo-1556881286-2d5b9b5c28c2?w=300&h=300&fit=crop&auto=format";
};

// Mock functions with proper image URLs
const getCart = async () => ({
  success: true,
  cart: {
    _id: "cart123",
    items: [
      {
        _id: "item1",
        product: {
          _id: "prod1",
          name: "Green Matcha Tea Latte",
          slug: "green-matcha-tea-latte",
          price: 10.5,
          images: [
            "https://images.unsplash.com/photo-1556881286-2d5b9b5c28c2?w=300&h=300&fit=crop&auto=format",
          ],
          category: { name: "Teas", slug: "teas" },
        },
        quantity: 2,
        price: 10.5,
      },
      {
        _id: "item2",
        product: {
          _id: "prod2",
          name: "Berry Day Juice",
          slug: "berry-day-juice",
          price: 8.87,
          images: [
            "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=300&h=300&fit=crop&auto=format",
          ],
          category: { name: "Juices", slug: "juices" },
        },
        quantity: 1,
        price: 8.87,
      },
      {
        _id: "item3",
        product: {
          _id: "prod3",
          name: "Watermelon Lemonade",
          slug: "watermelon-lemonade",
          price: 10.0,
          images: [
            "https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=300&h=300&fit=crop&auto=format",
          ],
          category: { name: "Juices", slug: "juices" },
        },
        quantity: 1,
        price: 10.0,
      },
    ],
  },
});

// Image component with proper fallback handling
const ProductImage = ({
  src,
  alt,
  productName,
}: {
  src: string;
  alt: string;
  productName: string;
}) => {
  const [imgSrc, setImgSrc] = useState(src || getPlaceholderImage(productName));
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(getPlaceholderImage(productName));
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className="w-full h-full object-cover transition-opacity duration-300 rounded-lg"
      onError={handleError}
      loading="lazy"
    />
  );
};

export default function CartPage() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [couponCode, setCouponCode] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

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
      } else {
        setCart({ _id: "", items: [] });
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (
    itemId: string,
    productId: string,
    newQuantity: number
  ) => {
    if (newQuantity <= 0) {
      removeItem(itemId, productId);
      return;
    }

    setUpdatingItems((prev) => new Set(prev).add(itemId));
    // Simulate API call
    setTimeout(() => {
      if (cart) {
        const updatedItems = cart.items.map((item) =>
          item._id === itemId ? { ...item, quantity: newQuantity } : item
        );
        setCart({ ...cart, items: updatedItems });
      }
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 500);
  };

  const removeItem = async (itemId: string, productId: string) => {
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    // Simulate API call
    setTimeout(() => {
      if (cart) {
        const updatedItems = cart.items.filter((item) => item._id !== itemId);
        setCart({ ...cart, items: updatedItems });
      }
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 500);
  };

  const clearCartItems = async () => {
    setCart({ _id: "", items: [] });
  };

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === "save10") {
      setAppliedCoupon("SAVE10");
    }
  };

  // Calculate totals
  const subtotal =
    cart?.items.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0;
  const couponDiscount = appliedCoupon ? 2.5 : 0;
  const shipping = subtotal >= 25 ? 0 : 5.99;
  const tax =
    Math.round((subtotal - couponDiscount + shipping) * 0.08 * 100) / 100;
  const total = subtotal - couponDiscount + shipping + tax;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-600" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-orange-100">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/shop"
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Shopping Cart
              </h1>
              <div className="text-sm text-gray-500">0 items</div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto space-y-6"
          >
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="w-12 h-12 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Your cart is empty
            </h2>
            <p className="text-gray-600">
              Discover our amazing collection of organic juices and herbal teas
              to get started!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3 rounded-2xl transition-all duration-300"
            >
              Explore Products
              <ArrowRight className="w-4 h-4" />
            </Link>
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
            <Link
              href="/shop"
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Continue Shopping</span>
              <span className="sm:hidden">Shop</span>
            </Link>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              <span className="hidden sm:inline">Shopping Cart</span>
              <span className="sm:hidden">Cart</span>
            </h1>
            <div className="text-sm text-gray-500">
              {cart.items.length} {cart.items.length === 1 ? "item" : "items"}
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
              className="bg-white/60 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2 text-orange-600" />
                  Cart Items
                </h2>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    {cart.items.length} items
                  </span>
                  {cart.items.length > 0 && (
                    <button
                      onClick={clearCartItems}
                      className="flex items-center gap-1 px-3 py-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden md:inline text-sm">Clear</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                <AnimatePresence>
                  {cart.items.map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white/60 rounded-xl md:rounded-2xl border border-white/40 hover:bg-white/80 transition-all"
                    >
                      {/* Product Image */}
                      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg md:rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-orange-100 to-amber-100">
                        <ProductImage
                          src={item.product.images[0] || ""}
                          alt={item.product.name}
                          productName={item.product.name}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-orange-600 font-medium text-sm md:text-base">
                            ${item.price.toFixed(2)}
                          </span>
                          <span className="text-xs md:text-sm text-gray-500">
                            each
                          </span>
                        </div>
                        {item.product.category && (
                          <div className="flex items-center gap-1 md:gap-2 mt-1 md:mt-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs border border-green-200">
                              <Heart className="w-3 h-3" />
                              Organic
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 md:gap-2 bg-white rounded-lg md:rounded-xl border border-gray-200 p-1">
                          <button
                            className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center hover:bg-red-50 hover:text-red-600 rounded transition-colors disabled:opacity-50"
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
                          </button>
                          <span className="w-6 md:w-8 text-center font-medium text-sm md:text-base">
                            {item.quantity}
                          </span>
                          <button
                            className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center hover:bg-orange-50 hover:text-orange-600 rounded transition-colors disabled:opacity-50"
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
                          </button>
                        </div>

                        {/* Price & Remove */}
                        <div className="text-right">
                          <div className="font-bold text-sm md:text-lg text-gray-900">
                            ${(item.quantity * item.price).toFixed(2)}
                          </div>
                          <button
                            onClick={() =>
                              removeItem(item._id, item.product._id)
                            }
                            disabled={updatingItems.has(item._id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 mt-1 rounded transition-colors disabled:opacity-50"
                          >
                            <X className="w-3 h-3 md:w-4 md:h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4 md:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/60 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/20 sticky top-24"
            >
              <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 flex items-center">
                <Gift className="w-5 h-5 mr-2 text-orange-600" />
                Order Summary
              </h2>

              {/* Order Total */}
              <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                <div className="space-y-1 md:space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Discount ({appliedCoupon}):
                      </span>
                      <span className="font-medium text-green-600">
                        -${couponDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium text-green-600">
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-gray-200 my-2"></div>
                  <div className="flex justify-between text-base md:text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-orange-600">${total.toFixed(2)}</span>
                  </div>
                </div>

                {shipping === 0 && subtotal >= 25 && (
                  <div className="text-center text-xs md:text-sm text-green-600 bg-green-50 p-2 md:p-3 rounded-xl border border-green-200">
                    🎉 You qualify for free shipping!
                  </div>
                )}

                {/* Free shipping progress */}
                {subtotal < 25 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-orange-700">
                        Free shipping at $25
                      </span>
                      <span className="font-medium text-orange-700">
                        ${(25 - subtotal).toFixed(2)} to go
                      </span>
                    </div>
                    <div className="w-full bg-orange-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((subtotal / 25) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Coupon Code */}
              <div className="mb-4 md:mb-6">
                <h3 className="font-medium mb-3 text-gray-700 text-sm md:text-base">
                  Promo Code
                </h3>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter code (try SAVE10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/60 border border-white/40 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    className="px-4 py-2 bg-white/60 hover:bg-white/80 text-sm border border-orange-200 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg border border-green-200">
                    ✅ Coupon "{appliedCoupon}" applied successfully!
                  </div>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="mb-4 md:mb-6">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 mt-0.5"
                  />
                  <label
                    htmlFor="terms"
                    className="text-xs md:text-sm text-gray-600 leading-relaxed"
                  >
                    I agree to the{" "}
                    <Link
                      href="/privacy"
                      className="text-orange-600 hover:underline"
                    >
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/terms"
                      className="text-orange-600 hover:underline"
                    >
                      Terms of Service
                    </Link>
                  </label>
                </div>
              </div>

              {/* Checkout Buttons */}
              <div className="space-y-2 md:space-y-3">
                <Link
                  href="/checkout"
                  className={`w-full flex items-center justify-center gap-2 py-3 md:py-6 text-sm md:text-lg font-semibold rounded-xl md:rounded-2xl transition-all duration-300 ${
                    agreeToTerms
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  onClick={(e) => !agreeToTerms && e.preventDefault()}
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </Link>

                <Link
                  href="/shop"
                  className="w-full flex items-center justify-center py-3 md:py-6 rounded-xl md:rounded-2xl bg-white/60 hover:bg-white/80 text-sm md:text-base border border-orange-200 text-orange-600 hover:bg-orange-50 transition-colors"
                >
                  Continue Shopping
                </Link>
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
