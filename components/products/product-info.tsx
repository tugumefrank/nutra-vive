// components/products/product-info.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Award,
  Leaf,
  Shield,
  Truck,
  Clock,
  Package,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ProductInfoProps {
  product: {
    _id: string;
    name: string;
    description?: string;
    shortDescription?: string;
    price: number;
    compareAtPrice?: number;
    sku?: string;
    averageRating: number;
    reviewCount: number;
    tags: string[];
    features: string[];
    ingredients: string[];
    category?: {
      name: string;
      slug: string;
    };
    inventory: number;
    weight?: number;
    nutritionFacts?: {
      servingSize?: string;
      calories?: number;
      totalFat?: string;
      sodium?: string;
      totalCarbs?: string;
      sugars?: string;
      protein?: string;
      vitaminC?: string;
    };
  };
}

const productBenefits = [
  {
    icon: Leaf,
    title: "100% Natural",
    description: "Made with pure, organic ingredients",
  },
  {
    icon: Shield,
    title: "Quality Tested",
    description: "Lab tested for purity and potency",
  },
  {
    icon: Award,
    title: "Premium Grade",
    description: "Highest quality standards",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over $50",
  },
];

export default function ProductInfo({ product }: ProductInfoProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);

  const discountPercentage = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) *
          100
      )
    : 0;

  const stockStatus =
    product.inventory > 10
      ? "in-stock"
      : product.inventory > 0
        ? "low-stock"
        : "out-of-stock";

  return (
    <div className="space-y-8">
      {/* Product Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Category and Tags */}
        <div className="flex flex-wrap gap-2">
          {product.category && (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
            >
              {product.category.name}
            </Badge>
          )}
          {product.tags.slice(0, 3).map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="border-green-200 text-green-700 dark:border-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              {tag}
            </Badge>
          ))}
          {product.tags.length > 3 && (
            <Badge
              variant="outline"
              className="border-gray-200 text-gray-600 dark:border-gray-600 dark:text-gray-400"
            >
              +{product.tags.length - 3} more
            </Badge>
          )}
        </div>

        {/* Product Title */}
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 leading-tight"
          >
            {product.name}
          </motion.h1>

          {product.shortDescription && (
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed"
            >
              {product.shortDescription}
            </motion.p>
          )}
        </div>

        {/* Rating and Reviews */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center space-x-4"
        >
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.4 + i * 0.1,
                  type: "spring",
                  stiffness: 300,
                }}
              >
                <Star
                  className={cn(
                    "h-5 w-5 transition-colors",
                    i < Math.floor(product.averageRating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  )}
                />
              </motion.div>
            ))}
          </div>
          <span className="text-lg font-medium text-gray-900 dark:text-white">
            {product.averageRating.toFixed(1)}
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            ({product.reviewCount} reviews)
          </span>
        </motion.div>
      </motion.div>

      {/* Pricing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-2"
      >
        <div className="flex items-center space-x-4">
          <motion.span
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
            className="text-4xl font-bold text-gray-900 dark:text-white"
          >
            ${product.price.toFixed(2)}
          </motion.span>

          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <>
              <span className="text-xl text-gray-500 line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
              <Badge className="bg-red-500 hover:bg-red-600 text-white">
                Save {discountPercentage}%
              </Badge>
            </>
          )}
        </div>

        {discountPercentage > 0 && (
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">
            You save ${(product.compareAtPrice! - product.price).toFixed(2)}!
          </p>
        )}
      </motion.div>

      {/* Stock Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card
          className={cn(
            "p-4 border-2",
            stockStatus === "in-stock" &&
              "border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20",
            stockStatus === "low-stock" &&
              "border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20",
            stockStatus === "out-of-stock" &&
              "border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20"
          )}
        >
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "w-3 h-3 rounded-full",
                stockStatus === "in-stock" && "bg-green-500",
                stockStatus === "low-stock" && "bg-yellow-500",
                stockStatus === "out-of-stock" && "bg-red-500"
              )}
            />
            <div>
              <p
                className={cn(
                  "font-medium",
                  stockStatus === "in-stock" &&
                    "text-green-800 dark:text-green-200",
                  stockStatus === "low-stock" &&
                    "text-yellow-800 dark:text-yellow-200",
                  stockStatus === "out-of-stock" &&
                    "text-red-800 dark:text-red-200"
                )}
              >
                {stockStatus === "in-stock" && "In Stock"}
                {stockStatus === "low-stock" &&
                  `Only ${product.inventory} left!`}
                {stockStatus === "out-of-stock" && "Out of Stock"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stockStatus === "in-stock" && "Ready to ship immediately"}
                {stockStatus === "low-stock" && "Limited availability"}
                {stockStatus === "out-of-stock" && "Notify when available"}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Product Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-2 gap-4"
      >
        {productBenefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <benefit.icon className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {benefit.title}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {benefit.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Product Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Product Details
        </h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {product.sku && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">SKU:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {product.sku}
              </span>
            </div>
          )}

          {product.weight && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Weight:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {product.weight} oz
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Category:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {product.category?.name || "Uncategorized"}
            </span>
          </div>

          {product.nutritionFacts?.servingSize && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Serving Size:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {product.nutritionFacts.servingSize}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Description */}
      {product.description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="space-y-4"
        >
          <Button
            variant="ghost"
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="flex items-center space-x-2 p-0 h-auto text-lg font-semibold text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400"
          >
            <span>Description</span>
            {showFullDescription ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          <AnimatePresence>
            {showFullDescription && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="prose prose-gray dark:prose-invert max-w-none"
              >
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {product.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Key Features */}
      {product.features && product.features.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Key Features
          </h3>
          <div className="space-y-3">
            {product.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 + index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Ingredients */}
      {product.ingredients && product.ingredients.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="space-y-4"
        >
          <Button
            variant="ghost"
            onClick={() => setShowIngredients(!showIngredients)}
            className="flex items-center space-x-2 p-0 h-auto text-lg font-semibold text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400"
          >
            <span>Ingredients ({product.ingredients.length})</span>
            {showIngredients ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          <AnimatePresence>
            {showIngredients && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-2"
              >
                {product.ingredients.map((ingredient, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {ingredient}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Shipping Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-blue-800 dark:text-blue-200">
                Shipping Information
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Free shipping on orders over $50</li>
                <li>• Standard delivery: 3-5 business days</li>
                <li>• Express delivery: 1-2 business days</li>
                <li>• Ships within 24 hours on business days</li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
