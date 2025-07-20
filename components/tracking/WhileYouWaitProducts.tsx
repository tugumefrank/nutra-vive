"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { EnhancedProductCard } from "@/components/shop/ProductCard";
import { getRandomProductsByCategory } from "@/lib/actions/relatedProductsServerActions";
import type { IProduct } from "@/types/product";
import type { ProductWithMembership } from "@/lib/actions/membershipProductServerActions";
import { Loader2 } from "lucide-react";

interface WhileYouWaitProductsProps {
  categoryName?: string;
  limit?: number;
  className?: string;
}

export default function WhileYouWaitProducts({
  categoryName = "juice",
  limit = 3,
  className = "",
}: WhileYouWaitProductsProps) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRandomProducts() {
      try {
        setLoading(true);
        setError(null);

        const result = await getRandomProductsByCategory(categoryName, limit);

        if (result.success) {
          setProducts(result.products);
        } else {
          setError(result.error || "Failed to fetch products");
        }
      } catch (err) {
        console.error("Error fetching random products:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    }

    fetchRandomProducts();
  }, [categoryName, limit]);

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-8 ${className}`}>
        <div className="flex items-center space-x-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading wellness products...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <p className="text-gray-500 text-sm">No products found</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {products.map((product, index) => (
        <motion.div
          key={product._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: index * 0.1,
            duration: 0.5,
            ease: "easeOut"
          }}
        >
          <EnhancedProductCard
            product={product as unknown as ProductWithMembership}
            variant="compact"
            showCategory={true}
            showFeatures={true}
            maxFeatures={1}
            showMembershipBenefits={false}
            className="h-full"
          />
        </motion.div>
      ))}
    </div>
  );
}