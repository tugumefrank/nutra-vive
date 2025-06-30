"use client";

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Timer, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromotionPricingProps {
  productId: string;
  originalPrice: number;
  compareAtPrice?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showPromotionCode?: boolean;
}

interface PromotionPricing {
  hasDiscount: boolean;
  finalPrice: number;
  discountAmount: number;
  discountPercentage: number;
  originalPrice: number;
  appliedPromotion?: {
    id: string;
    name: string;
    code?: string;
    discountType: 'percentage' | 'fixed_amount' | 'buy_x_get_y';
    discountValue: number;
    endsAt?: string;
  };
}

export default function PromotionPricing({
  productId,
  originalPrice,
  compareAtPrice,
  className = "",
  size = 'md',
  showPromotionCode = true
}: PromotionPricingProps) {
  const [pricing, setPricing] = useState<PromotionPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Fetch promotion pricing for the product
  useEffect(() => {
    async function fetchPromotionPricing() {
      try {
        // Import server action dynamically
        const { getProductPricingWithPromotions } = await import('@/lib/actions/promotionServerActions');
        const data = await getProductPricingWithPromotions(productId);
        
        if (data.success) {
          setPricing(data.pricing);
        } else {
          // Fallback to regular pricing
          setPricing({
            hasDiscount: false,
            finalPrice: originalPrice,
            discountAmount: 0,
            discountPercentage: 0,
            originalPrice
          });
        }
      } catch (error) {
        console.error('Error fetching promotion pricing:', error);
        // Fallback to regular pricing
        setPricing({
          hasDiscount: false,
          finalPrice: originalPrice,
          discountAmount: 0,
          discountPercentage: 0,
          originalPrice
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPromotionPricing();
  }, [productId, originalPrice]);

  // Update countdown timer for time-limited promotions
  useEffect(() => {
    if (!pricing?.appliedPromotion?.endsAt) return;

    const updateTimer = () => {
      const endTime = new Date(pricing.appliedPromotion!.endsAt!);
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${minutes}m left`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [pricing?.appliedPromotion?.endsAt]);

  if (loading) {
    return (
      <div className={cn("animate-pulse space-y-2", className)}>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
    );
  }

  if (!pricing) {
    return (
      <div className={cn("space-y-1", className)}>
        <span className={cn(
          "font-bold text-gray-900",
          size === 'sm' && "text-lg",
          size === 'md' && "text-2xl",
          size === 'lg' && "text-3xl"
        )}>
          ${originalPrice.toFixed(2)}
        </span>
        {compareAtPrice && compareAtPrice > originalPrice && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 line-through">
              ${compareAtPrice.toFixed(2)}
            </span>
            <Badge variant="destructive" className="text-xs">
              {Math.round(((compareAtPrice - originalPrice) / compareAtPrice) * 100)}% OFF
            </Badge>
          </div>
        )}
      </div>
    );
  }

  const hasActivePromotion = pricing.hasDiscount && pricing.appliedPromotion && timeLeft !== 'Expired';
  const regularDiscount = compareAtPrice && compareAtPrice > originalPrice;

  return (
    <div className={cn("space-y-1", className)}>
      {/* Single Row Price Display */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Final Price */}
        <span className={cn(
          "font-bold",
          hasActivePromotion ? "text-green-600" : "text-gray-900",
          size === 'sm' && "text-lg",
          size === 'md' && "text-2xl",
          size === 'lg' && "text-3xl"
        )}>
          ${pricing.finalPrice.toFixed(2)}
        </span>

        {/* Strikethrough Price */}
        {hasActivePromotion && (
          <span className="text-gray-500 line-through text-sm">
            ${pricing.originalPrice.toFixed(2)}
          </span>
        )}
        
        {regularDiscount && !hasActivePromotion && (
          <span className="text-gray-500 line-through text-sm">
            ${compareAtPrice.toFixed(2)}
          </span>
        )}

        {/* Discount Badge */}
        {hasActivePromotion && (
          <Badge variant="destructive" className="text-xs">
            {pricing.appliedPromotion?.discountType === 'percentage' 
              ? `${pricing.appliedPromotion.discountValue}% OFF`
              : `$${pricing.discountAmount.toFixed(2)} OFF`
            }
          </Badge>
        )}
        
        {regularDiscount && !hasActivePromotion && (
          <Badge variant="destructive" className="text-xs">
            {Math.round(((compareAtPrice! - originalPrice) / compareAtPrice!) * 100)}% OFF
          </Badge>
        )}
      </div>

      {/* Compact Savings Display - Only if significant savings */}
      {hasActivePromotion && pricing.discountAmount > 0 && (
        <p className="text-xs text-green-600 font-medium">
          You save ${pricing.discountAmount.toFixed(2)}!
        </p>
      )}
      
      {regularDiscount && !hasActivePromotion && (
        <p className="text-xs text-green-600 font-medium">
          You save ${(compareAtPrice! - originalPrice).toFixed(2)}!
        </p>
      )}
    </div>
  );
}