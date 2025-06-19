"use client";

import React from "react";
import { Heart, Star, ShoppingBag, Eye, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { useCartStore, useFavoritesStore } from "../../store";

export interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  category: {
    _id: string;
    name: string;
  } | null;
  images: string[];
  description?: string;
  shortDescription?: string;
  averageRating: number;
  reviewCount: number;
  features: string[];
  isActive: boolean;
  isFeatured: boolean;
}

interface ProductCardProps {
  product: Product;
  className?: string;
  showCategory?: boolean;
  showFeatures?: boolean;
  maxFeatures?: number;
}

export function ProductCard({
  product,
  className = "",
  showCategory = true,
  showFeatures = true,
  maxFeatures = 2,
}: ProductCardProps) {
  // Store hooks
  const {
    addItem,
    updateQuantity,
    removeItem,
    items: cartItems,
    openCart,
  } = useCartStore();
  const { toggleItem, isInFavorites } = useFavoritesStore();

  // Check if product is in cart
  const isInCart = (productId: string) => {
    return (
      cartItems &&
      cartItems.length > 0 &&
      cartItems.some((item: any) => item.productId === productId)
    );
  };

  // Get quantity of product in cart
  const getCartQuantity = (productId: string) => {
    if (!cartItems || cartItems.length === 0) return 0;
    const item = cartItems.find((item: any) => item.productId === productId);
    return item ? item.quantity : 0;
  };

  const isFavorite = isInFavorites(product._id);
  const inCart = isInCart(product._id);
  const quantity = getCartQuantity(product._id);

  // Convert product to cart format
  const cartProduct = {
    id: product._id,
    name: product.name,
    slug: product.slug,
    price: product.price.toString(),
    images: product.images,
    categoryId: product.category?._id || null,
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(cartProduct as any, 1);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product._id);
  };

  const handleUpdateQuantity = (e: React.MouseEvent, change: number) => {
    e.preventDefault();
    e.stopPropagation();

    const currentQty = quantity;
    const newQty = currentQty + change;

    if (newQty <= 0) {
      removeItem(product._id);
    } else {
      updateQuantity(product._id, newQty);
    }
  };

  const handleViewCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openCart();
  };

  return (
    <div className={`group ${className}`}>
      <div className="bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border border-orange-200 hover:border-green-300 transition-all duration-500 hover:transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-100/50 h-full">
        {/* Product Image */}
        <div className="relative h-60 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
              <div className="text-4xl text-gray-400">📦</div>
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors z-10 ${
              isFavorite
                ? "bg-red-500 text-white shadow-lg"
                : "bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500 shadow-md"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>

          {/* Category Badge */}
          {showCategory && product.category && (
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 bg-white/90 text-green-600 text-xs font-semibold rounded-full">
                {product.category.name}
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

          {/* Discount Badge - Show if there's a compareAtPrice */}
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <div className="absolute top-3 right-14">
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                {Math.round(
                  ((product.compareAtPrice - product.price) /
                    product.compareAtPrice) *
                    100
                )}
                % OFF
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            {showCategory && product.category && (
              <span className="text-xs font-medium text-green-600 uppercase tracking-wide">
                {product.category.name}
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

          <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">
            {product.name}
          </h3>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {product.shortDescription ||
              product.description ||
              "Premium organic wellness product"}
          </p>

          {/* Features */}
          {showFeatures && product.features && product.features.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
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

          {/* Price and Cart Actions */}
          <div className="space-y-3">
            {inCart ? (
              <>
                {/* Price and Quantity Controls Row */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    {/* Show compare price with strikethrough if it exists */}
                    {product.compareAtPrice &&
                      product.compareAtPrice > product.price && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-500 line-through">
                            ${product.compareAtPrice.toFixed(2)}
                          </span>
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                            {Math.round(
                              ((product.compareAtPrice - product.price) /
                                product.compareAtPrice) *
                                100
                            )}
                            % OFF
                          </span>
                        </div>
                      )}
                    <span className="text-2xl font-bold text-green-600">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 bg-green-50 rounded-xl p-1">
                    <button
                      onClick={(e) => handleUpdateQuantity(e, -1)}
                      className="p-1 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      title="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-2 text-green-600 font-semibold min-w-[2rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={(e) => handleUpdateQuantity(e, 1)}
                      className="p-1 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      title="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Full Width View Cart Button */}
                <button
                  onClick={handleViewCart}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-semibold"
                >
                  <Eye className="w-4 h-4" />
                  View Cart
                </button>
              </>
            ) : (
              <>
                {/* Price Row */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    {/* Show compare price with strikethrough if it exists */}
                    {product.compareAtPrice &&
                      product.compareAtPrice > product.price && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-500 line-through">
                            ${product.compareAtPrice.toFixed(2)}
                          </span>
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                            {Math.round(
                              ((product.compareAtPrice - product.price) /
                                product.compareAtPrice) *
                                100
                            )}
                            % OFF
                          </span>
                        </div>
                      )}
                    <span className="text-2xl font-bold text-green-600">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Full Width Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-semibold"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
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
      `}</style>
    </div>
  );
}
