"use client";

import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import {
  Heart,
  Star,
  ShoppingBag,
  Eye,
  Plus,
  Minus,
  LogIn,
  Crown,
  Info,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { useUnifiedCartStore } from "@/store/unifiedCartStore";
import { useStandaloneFavorites } from "@/hooks/useFavourite";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProductWithMembership } from "@/lib/actions/membershipProductServerActions";
import PromotionPricing from "@/components/products/promotion-pricing";

interface EnhancedProductCardProps {
  product: ProductWithMembership;
  className?: string;
  showCategory?: boolean;
  showFeatures?: boolean;
  maxFeatures?: number;
  variant?: "default" | "compact" | "list";
  showMembershipBenefits?: boolean;
}

export function EnhancedProductCard({
  product,
  className = "",
  showCategory = true,
  showFeatures = true,
  maxFeatures = 2,
  variant = "default",
  showMembershipBenefits = true,
}: EnhancedProductCardProps) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [imageLoading, setImageLoading] = useState(true);
  const [heartAnimation, setHeartAnimation] = useState("");
  const heartRef = useRef<HTMLButtonElement>(null);

  // Use the unified cart store
  const {
    cart,
    isOpen: isCartOpen,
    openCart,
    isInCart,
    getItemQuantity,
    addToCartOptimistic,
    updateQuantityOptimistic,
    isAddingToCart,
    isUpdatingItem,
  } = useUnifiedCartStore();

  // Favorites functionality
  const { isFavorite, toggleProductFavorite } = useStandaloneFavorites();

  // Direct cart state access for immediate updates - add cart as dependency
  const cartData = useMemo(() => {
    if (!isSignedIn || !product)
      return {
        inCart: false,
        quantity: 0,
      };

    const inCart = isInCart(product._id);
    const quantity = getItemQuantity(product._id);

    return {
      inCart,
      quantity,
    };
  }, [
    isSignedIn,
    product._id,
    isInCart,
    getItemQuantity,
    cart, // Add cart as dependency to force immediate re-render
  ]);

  // Memoize membership calculations
  const membershipData = useMemo(() => {
    const membershipInfo = product.membershipInfo;
    const isEligibleForFree = membershipInfo?.isEligibleForFree || false;
    const remainingAllocation = membershipInfo?.remainingAllocation || 0;

    // Debug log for ProductCard
    console.log(`🎯 ProductCard DEBUG - ${product.name}:`, {
      membershipInfo,
      isEligibleForFree,
      remainingAllocation,
      effectivelyFree: isEligibleForFree && remainingAllocation > 0,
    });

    return {
      membershipInfo,
      isEligibleForFree,
      remainingAllocation,
      effectivelyFree: isEligibleForFree && remainingAllocation > 0,
    };
  }, [product.membershipInfo, product.name]);

  // Memoize favorite state
  const isProductFavorite = useMemo(() => {
    return isSignedIn ? isFavorite(product._id) : false;
  }, [isSignedIn, isFavorite, product._id]);


  // Memoized handlers to prevent unnecessary re-renders
  const handleSignInRedirect = useCallback(() => {
    if (membershipData.effectivelyFree) {
      toast.info("Sign in to claim your FREE membership product!");
    } else {
      toast.info("Please sign in to add items to cart");
    }
    router.push("/sign-in");
  }, [membershipData.effectivelyFree, router]);

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isSignedIn) {
        handleSignInRedirect();
        return;
      }

      // Check membership allocation before adding
      if (
        membershipData.effectivelyFree &&
        membershipData.remainingAllocation <= 0
      ) {
        toast.error("No membership allocation remaining for this product");
        return;
      }

      // Instant optimistic update - await to ensure immediate state change
      try {
        // Await to ensure the optimistic update completes immediately
        await addToCartOptimistic(product, 1);

        // Show immediate success message
        if (membershipData.effectivelyFree) {
          toast.success(
            <div className="flex items-center space-x-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Added FREE with your membership!</span>
            </div>
          );
        } else {
          toast.success("Added to cart!");
        }
      } catch (error) {
        console.error("Failed to add to cart:", error);
        // Only show error if the optimistic update fails
        toast.error("Failed to add item to cart");
      }
    },
    [
      isSignedIn,
      membershipData.effectivelyFree,
      membershipData.remainingAllocation,
      addToCartOptimistic,
      product,
      handleSignInRedirect,
    ]
  );

  const handleUpdateQuantity = useCallback(
    async (e: React.MouseEvent, change: number) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isSignedIn) {
        handleSignInRedirect();
        return;
      }

      const newQty = cartData.quantity + change;

      // Validate membership allocation for increases
      if (
        change > 0 &&
        membershipData.effectivelyFree &&
        membershipData.remainingAllocation < change
      ) {
        toast.error(
          `Only ${membershipData.remainingAllocation} items remaining in your membership allocation`
        );
        return;
      }

      // Don't allow negative quantities
      if (newQty < 0) {
        return;
      }

      // Instant optimistic update - no loading state needed
      try {
        // Fire and forget - optimistic update happens immediately
        updateQuantityOptimistic(product._id, newQty);

        // Only show success message for significant changes or membership items
        if (membershipData.effectivelyFree && change > 0) {
          toast.success(
            <div className="flex items-center space-x-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Updated FREE item!</span>
            </div>,
            { duration: 1500 } // Shorter duration
          );
        }
      } catch (error) {
        console.error("Failed to update quantity:", error);
        toast.error("Failed to update quantity");
      }
    },
    [
      isSignedIn,
      cartData.quantity,
      membershipData.effectivelyFree,
      membershipData.remainingAllocation,
      updateQuantityOptimistic,
      product._id,
      handleSignInRedirect,
    ]
  );

  // Debounced quantity state
  const [tempQuantity, setTempQuantity] = useState<string>(
    cartData.quantity.toString()
  );

  // Update temp quantity when cart quantity changes
  useEffect(() => {
    setTempQuantity(cartData.quantity.toString());
  }, [cartData.quantity]);

  const handleDirectQuantityChange = useCallback(
    async (newQty: number) => {
      if (!isSignedIn) {
        handleSignInRedirect();
        return;
      }

      // Validate membership allocation
      if (
        newQty > cartData.quantity &&
        membershipData.effectivelyFree &&
        membershipData.remainingAllocation < newQty - cartData.quantity
      ) {
        toast.error(
          `Only ${membershipData.remainingAllocation} items remaining in your membership allocation`
        );
        return;
      }

      // Don't allow negative quantities
      if (newQty < 0) {
        return;
      }

      try {
        updateQuantityOptimistic(product._id, newQty);
      } catch (error) {
        console.error("Failed to update quantity:", error);
        toast.error("Failed to update quantity");
      }
    },
    [
      isSignedIn,
      cartData.quantity,
      membershipData.effectivelyFree,
      membershipData.remainingAllocation,
      updateQuantityOptimistic,
      product._id,
      handleSignInRedirect,
    ]
  );

  // Debounced input handler
  const handleQuantityInput = useCallback(
    (value: string) => {
      setTempQuantity(value);

      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue !== cartData.quantity) {
        // Debounce the actual update
        const timeoutId = setTimeout(() => {
          handleDirectQuantityChange(numValue);
        }, 500);

        return () => clearTimeout(timeoutId);
      }
    },
    [cartData.quantity, handleDirectQuantityChange]
  );

  const handleViewCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isSignedIn) {
        handleSignInRedirect();
        return;
      }

      openCart();
    },
    [isSignedIn, openCart, handleSignInRedirect]
  );

  const handleToggleFavorite = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isSignedIn) {
        toast.info("Please sign in to manage favorites");
        router.push("/sign-in");
        return;
      }

      setHeartAnimation("heart-click");
      await toggleProductFavorite(product._id, product.name);
      setTimeout(() => setHeartAnimation(""), 400);
    },
    [isSignedIn, toggleProductFavorite, product._id, product.name, router]
  );

  const handleProductClick = useCallback(() => {
    router.push(`/products/${product.slug}`);
  }, [router, product.slug]);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  // Heart button component with animations
  const HeartButton = React.memo(
    ({
      size = "w-4 h-4",
      position = "absolute top-3 right-3",
    }: {
      size?: string;
      position?: string;
    }) => (
      <button
        ref={heartRef}
        onClick={handleToggleFavorite}
        className={cn(
          position,
          "p-2 rounded-full transition-all duration-300 z-10 shadow-md heart-button heart-transition",
          isProductFavorite
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500",
          heartAnimation
        )}
      >
        <Heart
          className={cn(
            size,
            "heart-transition",
            isProductFavorite && "fill-current",
            isProductFavorite && "heart-favorite"
          )}
        />
      </button>
    )
  );

  // Compact Membership Benefits Component
  const MembershipBenefits = React.memo(
    ({ className = "" }: { className?: string }) => {
      if (!showMembershipBenefits || !membershipData.membershipInfo)
        return null;

      return (
        <div className={cn("space-y-1.5", className)}>
          {/* Compact Membership Info */}
          <div className="bg-amber-50/80 border border-amber-200/60 rounded-lg p-2.5">
            {membershipData.effectivelyFree ? (
              <div className="space-y-1.5">
                {/* Header with savings */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-700">
                      FREE • Save $
                      {membershipData.membershipInfo.savings.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-xs text-amber-600 font-medium">
                    {membershipData.remainingAllocation} left
                  </span>
                </div>

                {/* Compact Progress Bar */}
                <div className="w-full bg-amber-200 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-orange-400 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, ((membershipData.membershipInfo.totalAllocation - membershipData.membershipInfo.remainingAllocation) / membershipData.membershipInfo.totalAllocation) * 100)}%`,
                    }}
                  />
                </div>

                {/* Usage info */}
                <div className="flex items-center justify-between text-xs text-amber-600">
                  <span>
                    {membershipData.membershipInfo.membershipTier} Member
                  </span>
                  <span>
                    {membershipData.membershipInfo.usedAllocation}/
                    {membershipData.membershipInfo.totalAllocation} used
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-medium text-amber-700">
                    {membershipData.membershipInfo.membershipTier} Member
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Info className="w-3 h-3 text-amber-500" />
                  <span className="text-xs text-amber-600">
                    No allocation left
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  );

  // Enhanced card with membership features
  return (
    <div
      className={cn("group cursor-pointer", className)}
      onClick={handleProductClick}
    >
      <div
        className={cn(
          "bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border transition-all duration-500 hover:transform hover:scale-[1.02] hover:shadow-2xl h-full",
          membershipData.effectivelyFree
            ? "border-amber-300 hover:border-amber-400 shadow-amber-100/50 hover:shadow-amber-200/50"
            : "border-orange-200 hover:border-green-300 hover:shadow-green-100/50"
        )}
      >
        {/* Product Image */}
        <div className="relative h-60 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-all duration-700 group-hover:scale-110",
                imageLoading ? "blur-sm" : "blur-0"
              )}
              onLoad={handleImageLoad}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
              <div className="text-4xl text-gray-400">📦</div>
            </div>
          )}

          {/* Favorite Button */}
          <HeartButton />

          {/* Membership FREE Badge - Top Priority */}
          {membershipData.effectivelyFree && (
            <div className="absolute top-3 left-3 z-20">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center shadow-lg animate-pulse">
                <Crown className="w-3 h-3 mr-1" />
                FREE
              </div>
            </div>
          )}

          {/* Category Badge */}
          {showCategory &&
            product.category &&
            !membershipData.effectivelyFree && (
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-white/90 text-green-600 text-xs font-semibold rounded-full">
                  {typeof product.category === "object" &&
                  product.category !== null
                    ? (product.category as { name: string }).name
                    : product.category}
                </span>
              </div>
            )}

          {/* Featured Badge */}
          {product.isFeatured && (
            <div className="absolute bottom-3 left-3">
              <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Featured
              </span>
            </div>
          )}

          {/* Static Discount Badge - Only show if compareAtPrice exists */}
          {product.compareAtPrice && 
           product.compareAtPrice > product.price && 
           !membershipData.effectivelyFree && (
            <div className="absolute top-3 right-14">
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
              </span>
            </div>
          )}

          {/* Membership Tier Badge */}
          {membershipData.membershipInfo && !membershipData.effectivelyFree && (
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-amber-100 text-amber-700 text-xs capitalize">
                <Crown className="w-3 h-3 mr-1" />
                {membershipData.membershipInfo.membershipTier}
              </Badge>
            </div>
          )}

          {/* Login Required Overlay for Guests */}
          {!isSignedIn && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg text-center">
                <p className="text-sm font-medium text-gray-800 flex items-center gap-2 mb-2">
                  <LogIn className="w-4 h-4" />
                  Sign in to add to cart
                </p>
                {membershipData.effectivelyFree && (
                  <p className="text-xs text-amber-600 font-medium">
                    🎉 This item is FREE with membership!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          {/* Header Info */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              {showCategory && product.category && (
                <span className="text-xs font-medium text-green-600 uppercase tracking-wide">
                  {typeof product.category === "object" &&
                  product.category !== null &&
                  product.category &&
                  "name" in product.category
                    ? (product.category as { name: string }).name
                    : typeof product.category === "string" ? product.category : ""}
                </span>
              )}
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {product.averageRating || 0}
                </span>
                <span className="text-xs text-gray-500">
                  ({product.reviewCount || 0})
                </span>
              </div>
            </div>

            <h3 className="font-bold text-lg group-hover:text-green-600 transition-colors">
              {product.name}
            </h3>

            <p className="text-sm text-gray-600 line-clamp-2">
              {product.shortDescription ||
                product.description ||
                "Premium organic wellness product"}
            </p>

            {/* Features */}
            {showFeatures &&
              product.features &&
              product.features.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {product.features
                    .slice(0, maxFeatures)
                    .map((feature: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg"
                      >
                        {feature}
                      </span>
                    ))}
                </div>
              )}
          </div>

          {/* Membership Benefits */}
          <MembershipBenefits />

          {/* Compact Price and Cart Actions */}
          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            {isSignedIn && cartData.inCart ? (
              <>
                {/* Horizontal Layout: Pricing + Quantity Controls */}
                <div className="flex items-center justify-between gap-3">
                  {/* Compact Pricing - Only for non-membership items */}
                  {!membershipData.effectivelyFree ? (
                    <div className="flex-1">
                      <PromotionPricing 
                        productId={product._id}
                        originalPrice={product.price}
                        compareAtPrice={product.compareAtPrice}
                        size="sm"
                        showPromotionCode={false}
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center">
                      <Crown className="w-4 h-4 text-amber-600 mr-2" />
                      <span className="text-lg font-bold text-amber-600">FREE</span>
                    </div>
                  )}

                  {/* Compact Quantity Controls */}
                  <div
                    className={cn(
                      "flex items-center gap-1 rounded-lg p-1 border",
                      membershipData.effectivelyFree
                        ? "bg-amber-50 border-amber-200"
                        : "bg-green-50 border-green-200"
                    )}
                  >
                    <button
                      onClick={(e) => handleUpdateQuantity(e, -1)}
                      className={cn(
                        "p-1 rounded transition-all hover:scale-110",
                        membershipData.effectivelyFree
                          ? "text-amber-600 hover:bg-amber-100"
                          : "text-green-600 hover:bg-green-100"
                      )}
                    >
                      <Minus size={14} />
                    </button>

                    <input
                      type="number"
                      min="1"
                      max={
                        membershipData.effectivelyFree
                          ? membershipData.remainingAllocation + cartData.quantity
                          : 999
                      }
                      value={tempQuantity}
                      onChange={(e) => handleQuantityInput(e.target.value)}
                      onBlur={() => {
                        if (tempQuantity !== cartData.quantity.toString()) {
                          const numValue = parseInt(tempQuantity, 10);
                          if (!isNaN(numValue) && numValue > 0) {
                            handleDirectQuantityChange(numValue);
                          } else {
                            setTempQuantity(cartData.quantity.toString());
                          }
                        }
                      }}
                      className={cn(
                        "w-10 text-center font-semibold text-sm bg-transparent border-0 focus:outline-none",
                        membershipData.effectivelyFree
                          ? "text-amber-600"
                          : "text-green-600"
                      )}
                      onFocus={(e) => e.target.select()}
                    />

                    <button
                      onClick={(e) => handleUpdateQuantity(e, 1)}
                      disabled={
                        membershipData.effectivelyFree &&
                        membershipData.remainingAllocation <= 0
                      }
                      className={cn(
                        "p-1 rounded transition-all hover:scale-110 disabled:opacity-50",
                        membershipData.effectivelyFree
                          ? "text-amber-600 hover:bg-amber-100"
                          : "text-green-600 hover:bg-green-100"
                      )}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* View Cart Button */}
                <button
                  onClick={handleViewCart}
                  className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Eye className="w-3 h-3" />
                  View Cart ({cartData.quantity})
                </button>
              </>
            ) : (
              <>
                {/* Pricing Row - Only for non-membership items */}
                {!membershipData.effectivelyFree && (
                  <PromotionPricing 
                    productId={product._id}
                    originalPrice={product.price}
                    compareAtPrice={product.compareAtPrice}
                    size="sm"
                    showPromotionCode={false}
                  />
                )}

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={
                    membershipData.effectivelyFree &&
                    membershipData.remainingAllocation === 0
                  }
                  className={cn(
                    "w-full py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                    isSignedIn
                      ? membershipData.effectivelyFree
                        ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700"
                        : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                  )}
                >
                  {isSignedIn ? (
                    membershipData.effectivelyFree ? (
                      membershipData.remainingAllocation > 0 ? (
                        <>
                          <Crown className="w-3 h-3" />
                          Claim FREE Item
                        </>
                      ) : (
                        <>
                          <Info className="w-3 h-3" />
                          No Allocation Left
                        </>
                      )
                    ) : (
                      <>
                        <ShoppingBag className="w-3 h-3" />
                        Add to Cart
                      </>
                    )
                  ) : (
                    <>
                      <LogIn className="w-3 h-3" />
                      Sign In to{" "}
                      {membershipData.effectivelyFree
                        ? "Claim FREE"
                        : "Purchase"}
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Heart animations */
        .heart-favorite {
          animation: heartPulse 0.6s ease-in-out;
        }

        .heart-click {
          animation: heartBounce 0.4s ease-in-out;
        }

        .heart-transition {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .heart-button:hover {
          transform: scale(1.1);
        }

        .heart-button:active {
          transform: scale(0.95);
        }

        @keyframes heartPulse {
          0% {
            transform: scale(1);
          }
          15% {
            transform: scale(1.2);
          }
          30% {
            transform: scale(1);
          }
          45% {
            transform: scale(1.1);
          }
          60% {
            transform: scale(1);
          }
        }

        @keyframes heartBounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0) scale(1);
          }
          40% {
            transform: translateY(-2px) scale(1.1);
          }
          60% {
            transform: translateY(-1px) scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
