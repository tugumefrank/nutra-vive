"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Loader2 } from "lucide-react";
// Adjust path as needed
import { getProducts } from "@/lib/actions/productserverActions";
import { Product, ProductCard } from "../shop/ProductCard";

export function FeaturedProducts() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch featured products on component mount
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const result = await getProducts({
          isFeatured: true,
          isActive: true,
          sortBy: "createdAt",
          sortOrder: "desc",
          limit: 4, // Only show 4 featured products
        });

        // Map API products to Product interface
        const mappedProducts = result.products.map((p: any) => ({
          _id: p._id,
          name: p.name,
          slug: p.slug,
          price: typeof p.price === "number" ? p.price : parseFloat(p.price),
          compareAtPrice: p.compareAtPrice
            ? typeof p.compareAtPrice === "number"
              ? p.compareAtPrice
              : parseFloat(p.compareAtPrice)
            : undefined,
          category:
            p.category && typeof p.category === "object"
              ? { _id: p.category._id, name: p.category.name }
              : p.category
                ? { _id: p.category, name: "" }
                : null,
          images: p.images || [],
          description: p.description,
          shortDescription: p.shortDescription,
          averageRating: p.averageRating ?? 0,
          reviewCount: p.reviewCount ?? 0,
          features: p.features || [],
          isActive: p.isActive ?? true,
          isFeatured: p.isFeatured ?? false,
        }));

        setFeaturedProducts(mappedProducts);
        setError(null);
      } catch (err) {
        console.error("Error fetching featured products:", err);
        setError("Failed to load featured products");
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <section
      ref={ref}
      className="py-16 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-full mb-6 border border-orange-200/50">
            <Zap className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700">
              Featured Collection
            </span>
          </div>

          <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-gray-800">
            Premium{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Wellness
            </span>{" "}
            Selection
          </h2>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Discover our most loved organic beverages, carefully crafted to
            nourish your body and delight your senses with every sip.
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <p className="text-gray-600">Loading featured products...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Unable to load featured products
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && featuredProducts.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
            >
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard
                    product={product}
                    showCategory={true}
                    showFeatures={true}
                    maxFeatures={2}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center"
            >
              <Button
                size="lg"
                className="group bg-white/70 backdrop-blur-sm text-gray-800 border border-orange-200/50 hover:bg-white/90 hover:border-green-300 transition-all duration-300 shadow-lg hover:shadow-xl"
                asChild
              >
                <Link href="/shop">
                  Explore All Products
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && featuredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🌟</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No featured products yet
            </h3>
            <p className="text-gray-600 mb-6">
              Check back soon for our featured wellness collection!
            </p>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              asChild
            >
              <Link href="/shop">Browse All Products</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
