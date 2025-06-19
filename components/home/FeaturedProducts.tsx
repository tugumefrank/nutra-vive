"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Star, ShoppingBag, Heart, Zap, Leaf } from "lucide-react";
import { useCartStore, useFavoritesStore } from "../../store";

// Mock featured products data
const featuredProducts = [
  {
    id: "1",
    name: "Green Detox Elixir",
    slug: "green-detox-elixir",
    price: 12.99,
    compareAtPrice: 15.99,
    images: [
      "https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=500&fit=crop",
    ],
    rating: 4.8,
    reviewCount: 124,
    badge: "Best Seller",
    description:
      "Premium cold-pressed blend of kale, spinach, cucumber, and green apple",
    features: ["Detoxifying", "Energy Boost", "Immune Support"],
    category: "Cold Pressed Juices",
  },
  {
    id: "2",
    name: "Strawberry Hibiscus Tea",
    slug: "strawberry-hibiscus-tea",
    price: 8.89,
    images: [
      "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=500&fit=crop",
    ],
    rating: 4.9,
    reviewCount: 89,
    badge: "New",
    description:
      "Refreshing herbal blend with real strawberries and hibiscus flowers",
    features: ["Antioxidant Rich", "Caffeine Free", "Heart Healthy"],
    category: "Herbal Teas",
  },
  {
    id: "3",
    name: "Matcha Zen Latte",
    slug: "matcha-zen-latte",
    price: 10.5,
    images: [
      "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=500&fit=crop",
    ],
    rating: 4.7,
    reviewCount: 156,
    badge: "Premium",
    description: "Ceremonial grade matcha with coconut milk for focused energy",
    features: ["Focus Enhancing", "Ceremonial Grade", "Sustained Energy"],
    category: "Specialty Drinks",
  },
  {
    id: "4",
    name: "Berry Antioxidant Blend",
    slug: "berry-antioxidant-blend",
    price: 9.75,
    images: [
      "https://images.unsplash.com/photo-1553530979-98cc0de94293?w=400&h=500&fit=crop",
    ],
    rating: 4.9,
    reviewCount: 203,
    badge: "Popular",
    description: "Superfruit blend of blueberries, strawberries, and acai",
    features: ["Antioxidant Power", "Skin Health", "Brain Boost"],
    category: "Cold Pressed Juices",
  },
];

function ProductCard({ product, index }: { product: any; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCartStore();
  const { toggleItem, isInFavorites } = useFavoritesStore();
  const isFavorite = isInFavorites(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group"
    >
      <Link href={`/shop/${product.slug}`}>
        <Card className="overflow-hidden h-full glass border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-glow">
          <CardContent className="p-0">
            {/* Product Image */}
            <div className="relative overflow-hidden">
              <motion.div
                animate={{ scale: isHovered ? 1.1 : 1 }}
                transition={{ duration: 0.4 }}
                className="aspect-[4/5] relative"
              >
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </motion.div>

              {/* Badge */}
              {product.badge && (
                <Badge className="absolute top-3 left-3 bg-gradient-to-r from-brand-500 to-wellness-500 text-white border-none">
                  {product.badge}
                </Badge>
              )}

              {/* Favorite Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleFavorite}
                className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-colors ${
                  isFavorite
                    ? "bg-red-500 text-white"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`}
                />
              </motion.button>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  y: isHovered ? 0 : 20,
                }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-3 left-3 right-3"
              >
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-white/90 hover:bg-white text-black backdrop-blur-sm"
                  size="sm"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </motion.div>
            </div>

            {/* Product Info */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-brand-600 uppercase tracking-wide">
                  {product.category}
                </span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({product.reviewCount})
                  </span>
                </div>
              </div>

              <h3 className="font-bold text-lg mb-2 group-hover:text-brand-600 transition-colors">
                {product.name}
              </h3>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {product.description}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-1 mb-4">
                {product.features.slice(0, 2).map((feature: string) => (
                  <Badge
                    key={feature}
                    variant="secondary"
                    className="text-xs bg-brand-50 text-brand-700 hover:bg-brand-100"
                  >
                    {feature}
                  </Badge>
                ))}
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-brand-600">
                    ${product.price}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.compareAtPrice}
                    </span>
                  )}
                </div>
                {product.compareAtPrice && (
                  <Badge variant="destructive" className="text-xs">
                    Save ${(product.compareAtPrice - product.price).toFixed(2)}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export function FeaturedProducts() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      className="py-24 bg-gradient-to-b from-muted/30 to-background"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-100 to-wellness-100 px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-semibold text-brand-700">
              Featured Collection
            </span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-heading font-bold mb-6">
            Premium{" "}
            <span className="bg-gradient-to-r from-brand-500 to-wellness-500 bg-clip-text text-transparent">
              Wellness
            </span>{" "}
            Selection
          </h2>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Discover our most loved organic beverages, carefully crafted to
            nourish your body and delight your senses with every sip.
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Button size="lg" variant="outline" className="group" asChild>
            <Link href="/shop">
              Explore All Products
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
