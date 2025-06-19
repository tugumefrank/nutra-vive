// "use client";
// import React, { useState, useEffect } from "react";
// import {
//   Search,
//   Heart,
//   Star,
//   ShoppingBag,
//   Eye,
//   Plus,
//   Minus,
//   Loader2,
// } from "lucide-react";
// import { useCartStore, useFavoritesStore } from "../../store";
// import Image from "next/image";
// import { getCategories, getProducts } from "@/lib/actions/productserverActions";

// interface Product {
//   _id: string;
//   name: string;
//   slug: string;
//   price: number;
//   compareAtPrice?: number;
//   category: {
//     _id: string;
//     name: string;
//   } | null;
//   images: string[];
//   description?: string;
//   shortDescription?: string;
//   averageRating: number;
//   reviewCount: number;
//   features: string[];
//   isActive: boolean;
//   isFeatured: boolean;
// }

// interface Category {
//   _id: string;
//   name: string;
//   slug: string;
// }

// const ShopPage = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [sortBy, setSortBy] = useState("name");
//   const [products, setProducts] = useState<Product[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [hasMore, setHasMore] = useState(false);

//   // Store hooks
//   const {
//     addItem,
//     updateQuantity,
//     removeItem,
//     items: cartItems,
//   } = useCartStore();
//   const { toggleItem, isInFavorites } = useFavoritesStore();
//   const openCart = useCartStore((state) => state.openCart);

//   // Fetch categories on component mount
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const categoriesData = await getCategories();
//         setCategories(categoriesData);
//       } catch (err) {
//         console.error("Error fetching categories:", err);
//       }
//     };

//     fetchCategories();
//   }, []);

//   // Fetch products with filters
//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       try {
//         const filters = {
//           category: selectedCategory !== "All" ? selectedCategory : undefined,
//           search: searchTerm || undefined,
//           isActive: true, // Only show active products
//           sortBy: sortBy as "name" | "price" | "createdAt" | "updatedAt",
//           sortOrder: sortBy === "price" ? "asc" : ("desc" as "asc" | "desc"),
//           page: currentPage,
//           limit: 12,
//         };

//         const result = await getProducts(filters);

//         // Map API products to local Product type - FIXED: Added compareAtPrice mapping
//         const mappedProducts = result.products.map((p: any) => ({
//           _id: p._id,
//           name: p.name,
//           slug: p.slug,
//           price: typeof p.price === "number" ? p.price : parseFloat(p.price),
//           compareAtPrice: p.compareAtPrice
//             ? typeof p.compareAtPrice === "number"
//               ? p.compareAtPrice
//               : parseFloat(p.compareAtPrice)
//             : undefined, // FIXED: Added this line
//           category:
//             p.category && typeof p.category === "object"
//               ? { _id: p.category._id, name: p.category.name }
//               : p.category
//                 ? { _id: p.category, name: "" }
//                 : null,
//           images: p.images || [],
//           description: p.description,
//           shortDescription: p.shortDescription,
//           averageRating: p.averageRating ?? 0,
//           reviewCount: p.reviewCount ?? 0,
//           features: p.features || [],
//           isActive: p.isActive ?? true,
//           isFeatured: p.isFeatured ?? false,
//         }));

//         if (currentPage === 1) {
//           setProducts(mappedProducts);
//         } else {
//           setProducts((prev) => [...prev, ...mappedProducts]);
//         }

//         setTotalPages(result.totalPages);
//         setHasMore(result.currentPage < result.totalPages);
//         setError(null);
//       } catch (err) {
//         console.error("Error fetching products:", err);
//         setError("Failed to load products. Please try again.");
//         setProducts([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [searchTerm, selectedCategory, sortBy, currentPage]);

//   // Reset to first page when filters change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm, selectedCategory, sortBy]);

//   // Check if product is in cart
//   const isInCart = (productId: string) => {
//     return (
//       cartItems &&
//       cartItems.length > 0 &&
//       cartItems.some((item: any) => item.productId === productId)
//     );
//   };

//   // Get quantity of product in cart
//   const getCartQuantity = (productId: string) => {
//     if (!cartItems || cartItems.length === 0) return 0;
//     const item = cartItems.find((item: any) => item.productId === productId);
//     return item ? item.quantity : 0;
//   };

//   // Load more products
//   const handleLoadMore = () => {
//     if (hasMore && !loading) {
//       setCurrentPage((prev) => prev + 1);
//     }
//   };

//   // Product Card Component
//   function ProductCard({ product }: { product: Product }) {
//     const isFavorite = isInFavorites(product._id);
//     const inCart = isInCart(product._id);
//     const quantity = getCartQuantity(product._id);

//     // Convert product to cart format
//     const cartProduct = {
//       id: product._id,
//       name: product.name,
//       slug: product.slug,
//       price: product.price.toString(),
//       images: product.images,
//       categoryId: product.category?._id || null,
//     };

//     const handleAddToCart = (e: React.MouseEvent) => {
//       e.preventDefault();
//       e.stopPropagation();
//       addItem(cartProduct as any, 1);
//     };

//     const handleToggleFavorite = (e: React.MouseEvent) => {
//       e.preventDefault();
//       e.stopPropagation();
//       toggleItem(product._id);
//     };

//     const handleUpdateQuantity = (e: React.MouseEvent, change: number) => {
//       e.preventDefault();
//       e.stopPropagation();

//       const currentQty = quantity;
//       const newQty = currentQty + change;

//       if (newQty <= 0) {
//         removeItem(product._id);
//       } else {
//         updateQuantity(product._id, newQty);
//       }
//     };

//     const handleViewCart = (e: React.MouseEvent) => {
//       e.preventDefault();
//       e.stopPropagation();
//       openCart();
//     };

//     return (
//       <div className="group">
//         <div className="bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border border-orange-200 hover:border-green-300 transition-all duration-500 hover:transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-100/50 h-full">
//           {/* Product Image */}
//           <div className="relative h-60 overflow-hidden">
//             {product.images && product.images.length > 0 ? (
//               <Image
//                 src={product.images[0]}
//                 alt={product.name}
//                 fill
//                 className="object-cover transition-transform duration-700 group-hover:scale-110"
//               />
//             ) : (
//               <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
//                 <div className="text-4xl text-gray-400">📦</div>
//               </div>
//             )}

//             {/* Favorite Button */}
//             <button
//               onClick={handleToggleFavorite}
//               className={`absolute top-3 right-3 p-2 rounded-full transition-colors z-10 ${
//                 isFavorite
//                   ? "bg-red-500 text-white shadow-lg"
//                   : "bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500 shadow-md"
//               }`}
//             >
//               <Heart
//                 className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`}
//               />
//             </button>

//             {/* Category Badge */}
//             {product.category && (
//               <div className="absolute top-3 left-3">
//                 <span className="px-3 py-1 bg-white/90 text-green-600 text-xs font-semibold rounded-full">
//                   {product.category.name}
//                 </span>
//               </div>
//             )}

//             {/* Featured Badge */}
//             {product.isFeatured && (
//               <div className="absolute bottom-3 left-3">
//                 <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
//                   <Star className="w-3 h-3 fill-current" />
//                   Featured
//                 </span>
//               </div>
//             )}

//             {/* Discount Badge - Show if there's a compareAtPrice */}
//             {product.compareAtPrice &&
//               product.compareAtPrice > product.price && (
//                 <div className="absolute top-3 right-14">
//                   <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
//                     {Math.round(
//                       ((product.compareAtPrice - product.price) /
//                         product.compareAtPrice) *
//                         100
//                     )}
//                     % OFF
//                   </span>
//                 </div>
//               )}
//           </div>

//           {/* Product Info */}
//           <div className="p-6">
//             <div className="flex items-center justify-between mb-2">
//               {product.category && (
//                 <span className="text-xs font-medium text-green-600 uppercase tracking-wide">
//                   {product.category.name}
//                 </span>
//               )}
//               <div className="flex items-center space-x-1">
//                 <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
//                 <span className="text-sm font-medium">
//                   {product.averageRating || 0}
//                 </span>
//                 <span className="text-xs text-gray-500">
//                   ({product.reviewCount || 0})
//                 </span>
//               </div>
//             </div>

//             <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">
//               {product.name}
//             </h3>

//             <p className="text-sm text-gray-600 mb-4 line-clamp-2">
//               {product.shortDescription ||
//                 product.description ||
//                 "Premium organic wellness product"}
//             </p>

//             {/* Features */}
//             {product.features && product.features.length > 0 && (
//               <div className="flex flex-wrap gap-1 mb-4">
//                 {product.features
//                   .slice(0, 2)
//                   .map((feature: string, idx: number) => (
//                     <span
//                       key={idx}
//                       className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg"
//                     >
//                       {feature}
//                     </span>
//                   ))}
//               </div>
//             )}

//             {/* Price and Cart Actions */}
//             <div className="space-y-3">
//               {inCart ? (
//                 <>
//                   {/* Price and Quantity Controls Row */}
//                   <div className="flex items-center justify-between">
//                     <div className="flex flex-col">
//                       {/* Show compare price with strikethrough if it exists */}
//                       {product.compareAtPrice &&
//                         product.compareAtPrice > product.price && (
//                           <div className="flex items-center gap-2 mb-1">
//                             <span className="text-sm text-gray-500 line-through">
//                               ${product.compareAtPrice.toFixed(2)}
//                             </span>
//                             <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
//                               {Math.round(
//                                 ((product.compareAtPrice - product.price) /
//                                   product.compareAtPrice) *
//                                   100
//                               )}
//                               % OFF
//                             </span>
//                           </div>
//                         )}
//                       <span className="text-2xl font-bold text-green-600">
//                         ${product.price.toFixed(2)}
//                       </span>
//                     </div>

//                     {/* Quantity Controls */}
//                     <div className="flex items-center gap-2 bg-green-50 rounded-xl p-1">
//                       <button
//                         onClick={(e) => handleUpdateQuantity(e, -1)}
//                         className="p-1 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
//                         title="Decrease quantity"
//                       >
//                         <Minus size={16} />
//                       </button>
//                       <span className="px-2 text-green-600 font-semibold min-w-[2rem] text-center">
//                         {quantity}
//                       </span>
//                       <button
//                         onClick={(e) => handleUpdateQuantity(e, 1)}
//                         className="p-1 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
//                         title="Increase quantity"
//                       >
//                         <Plus size={16} />
//                       </button>
//                     </div>
//                   </div>

//                   {/* Full Width View Cart Button */}
//                   <button
//                     onClick={handleViewCart}
//                     className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-semibold"
//                   >
//                     <Eye className="w-4 h-4" />
//                     View Cart
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   {/* Price Row */}
//                   <div className="flex items-center justify-between">
//                     <div className="flex flex-col">
//                       {/* Show compare price with strikethrough if it exists */}
//                       {product.compareAtPrice &&
//                         product.compareAtPrice > product.price && (
//                           <div className="flex items-center gap-2 mb-1">
//                             <span className="text-sm text-gray-500 line-through">
//                               ${product.compareAtPrice.toFixed(2)}
//                             </span>
//                             <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
//                               {Math.round(
//                                 ((product.compareAtPrice - product.price) /
//                                   product.compareAtPrice) *
//                                   100
//                               )}
//                               % OFF
//                             </span>
//                           </div>
//                         )}
//                       <span className="text-2xl font-bold text-green-600">
//                         ${product.price.toFixed(2)}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Full Width Add to Cart Button */}
//                   <button
//                     onClick={handleAddToCart}
//                     className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-semibold"
//                   >
//                     <ShoppingBag className="w-4 h-4" />
//                     Add to Cart
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="text-6xl mb-4">⚠️</div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">
//             Oops! Something went wrong
//           </h2>
//           <p className="text-gray-600 mb-4">{error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
//       {/* Page Header */}
//       <div className="relative bg-gradient-to-br from-orange-50/90 via-amber-50/90 to-orange-100/90 backdrop-blur-md border-b border-orange-200/50 overflow-hidden">
//         <div className="max-w-7xl mx-auto px-4 py-16 mt-4">
//           <div className="text-center">
//             <h1 className="text-3xl md:text-6xl font-bold text-gray-800 mb-3 mt-8">
//               Nutra-Vive Wellness
//               <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
//                 Collection
//               </span>
//             </h1>
//             <p className="text-md text-gray-600 max-w-2xl mx-auto">
//               Discover our handcrafted selection of organic juices and herbal
//               teas, designed to nourish your body and uplift your spirit.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         {/* Search and Filters */}
//         <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 mb-8 border border-orange-200/50">
//           <div className="flex flex-col lg:flex-row gap-4">
//             {/* Search */}
//             <div className="relative flex-1">
//               <Search
//                 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
//                 size={20}
//               />
//               <input
//                 type="text"
//                 placeholder="Search products..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
//               />
//             </div>

//             {/* Category Filter */}
//             <select
//               value={selectedCategory}
//               onChange={(e) => setSelectedCategory(e.target.value)}
//               className="px-4 py-3 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
//             >
//               <option value="All">All Categories</option>
//               {categories.map((category) => (
//                 <option key={category._id} value={category._id}>
//                   {category.name}
//                 </option>
//               ))}
//             </select>

//             {/* Sort */}
//             <select
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//               className="px-4 py-3 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
//             >
//               <option value="name">Sort by Name</option>
//               <option value="price">Sort by Price</option>
//               <option value="createdAt">Sort by Newest</option>
//               <option value="updatedAt">Sort by Recently Updated</option>
//             </select>
//           </div>
//         </div>

//         {/* Loading State */}
//         {loading && currentPage === 1 && (
//           <div className="flex items-center justify-center py-16">
//             <div className="flex flex-col items-center gap-4">
//               <Loader2 className="w-8 h-8 animate-spin text-green-600" />
//               <p className="text-gray-600">Loading products...</p>
//             </div>
//           </div>
//         )}

//         {/* Products Grid */}
//         {!loading || currentPage > 1 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
//             {products.map((product) => (
//               <ProductCard key={product._id} product={product} />
//             ))}
//           </div>
//         ) : null}

//         {/* Empty State */}
//         {!loading && products.length === 0 && (
//           <div className="text-center py-16">
//             <div className="text-6xl mb-4">🔍</div>
//             <h3 className="text-2xl font-bold text-gray-800 mb-2">
//               No products found
//             </h3>
//             <p className="text-gray-600">
//               Try adjusting your search or filter criteria
//             </p>
//           </div>
//         )}

//         {/* Load More Button */}
//         {hasMore && products.length > 0 && (
//           <div className="text-center mt-12">
//             <button
//               onClick={handleLoadMore}
//               disabled={loading}
//               className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                   Loading...
//                 </>
//               ) : (
//                 `Load More Products (${totalPages - currentPage} pages remaining)`
//               )}
//             </button>
//           </div>
//         )}
//       </div>

//       <style jsx>{`
//         .line-clamp-2 {
//           display: -webkit-box;
//           -webkit-line-clamp: 2;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ShopPage;
"use client";
import React, { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { useCartStore, useFavoritesStore } from "../../store";
import { getCategories, getProducts } from "@/lib/actions/productserverActions";
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
