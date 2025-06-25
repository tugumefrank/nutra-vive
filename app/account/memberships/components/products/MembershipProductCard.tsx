// components/products/MembershipProductCard.tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, ShoppingCart, Heart, Crown, Sparkles, Plus } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

import { addToMembershipCart } from "@/lib/actions/membershipCartServerActions";
import { useMembership } from "../../hooks/useMembership";

interface MembershipProductCardProps {
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
    };
    averageRating: number;
    reviewCount: number;
  };
  showMembershipPrice?: boolean;
}

export function MembershipProductCard({
  product,
  showMembershipPrice = true,
}: MembershipProductCardProps) {
  const [loading, setLoading] = useState(false);
  const { membership, checkFreeProductEligibility } = useMembership();

  const canGetFree =
    membership && product.category
      ? checkFreeProductEligibility(product.category._id, 1)
      : false;

  const membershipPrice = canGetFree ? 0 : product.price;
  const savings = product.price - membershipPrice;

  const handleAddToCart = async () => {
    try {
      setLoading(true);

      const result = await addToMembershipCart(product._id, 1);

      if (result.success) {
        if (result.membershipInfo?.isFree) {
          toast.success(`${product.name} added to cart for FREE! 🎉`);
        } else {
          toast.success(`${product.name} added to cart`);
        }
      } else {
        toast.error(result.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card border-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden group">
      {/* Membership Badge */}
      {canGetFree && showMembershipPrice && (
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1">
            <Gift className="w-3 h-3" />
            FREE
          </Badge>
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={product.images[0] || "/api/placeholder/300/300"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </Link>

        {/* Wishlist Button */}
        <Button
          size="sm"
          variant="secondary"
          className="absolute top-2 right-2 w-8 h-8 p-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Product Info */}
        <div>
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-sm hover:text-emerald-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {product.category && (
            <p className="text-xs text-muted-foreground mt-1">
              {product.category.name}
            </p>
          )}
        </div>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.averageRating)
                      ? "text-amber-400"
                      : "text-gray-300"
                  }`}
                >
                  ★
                </div>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Pricing */}
        <div className="space-y-1">
          {canGetFree && showMembershipPrice ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-emerald-600">FREE</span>
                <Crown className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="line-through text-muted-foreground">
                  ${product.price.toFixed(2)}
                </span>
                <Badge
                  variant="outline"
                  className="text-emerald-600 border-emerald-600"
                >
                  Save ${savings.toFixed(2)}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice &&
                product.compareAtPrice > product.price && (
                  <span className="text-sm line-through text-muted-foreground">
                    ${product.compareAtPrice.toFixed(2)}
                  </span>
                )}
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          className={`w-full gap-2 ${
            canGetFree && showMembershipPrice
              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
              : ""
          }`}
          onClick={handleAddToCart}
          disabled={loading}
        >
          {loading ? (
            "Adding..."
          ) : (
            <>
              {canGetFree && showMembershipPrice ? (
                <>
                  <Gift className="w-4 h-4" />
                  Claim Free
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add to Cart
                </>
              )}
            </>
          )}
        </Button>

        {/* Membership Benefit Indicator */}
        {membership && showMembershipPrice && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="w-3 h-3" />
              <span>Member benefit</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
