"use client";
import React, { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";

import { getCategories, getProducts } from "@/lib/actions/productServerActions";
import { Product, ProductCard } from "./ProductCard";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

const ShopPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const filters = {
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          search: searchTerm || undefined,
          isActive: true, // Only show active products
          sortBy: sortBy as "name" | "price" | "createdAt" | "updatedAt",
          sortOrder: sortBy === "price" ? "asc" : ("desc" as "asc" | "desc"),
          page: currentPage,
          limit: 12,
        };

        const result = await getProducts(filters);

        // Map API products to local Product type
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

        if (currentPage === 1) {
          setProducts(mappedProducts);
        } else {
          setProducts((prev) => [...prev, ...mappedProducts]);
        }

        setTotalPages(result.totalPages);
        setHasMore(result.currentPage < result.totalPages);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, selectedCategory, sortBy, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  // Load more products
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Page Header */}
      <div className="relative bg-gradient-to-br from-orange-50/90 via-amber-50/90 to-orange-100/90 backdrop-blur-md border-b border-orange-200/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 mt-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-6xl font-bold text-gray-800 mb-3 mt-8">
              Nutra-Vive Wellness
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Collection
              </span>
            </h1>
            <p className="text-md text-gray-600 max-w-2xl mx-auto">
              Discover our handcrafted selection of organic juices and herbal
              teas, designed to nourish your body and uplift your spirit.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 mb-8 border border-orange-200/50">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="createdAt">Sort by Newest</option>
              <option value="updatedAt">Sort by Recently Updated</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && currentPage === 1 && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!loading || currentPage > 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                showCategory={true}
                showFeatures={true}
                maxFeatures={2}
              />
            ))}
          </div>
        ) : null}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && products.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                `Load More Products (${totalPages - currentPage} pages remaining)`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
