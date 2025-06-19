// "use client";

// import React, { useState } from "react";
// import { Search, Heart, Star, Plus, Minus, ShoppingCart } from "lucide-react";

// const ShopPage = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [sortBy, setSortBy] = useState("name");
//   const [cart, setCart] = useState<Record<number, number>>({});
//   const [favorites, setFavorites] = useState(new Set());

//   const products = [
//     {
//       id: 1,
//       name: "Nutra-Reset Herbal Tea",
//       price: 8.87,
//       category: "Herbal Teas",
//       image: "🍵",
//       description:
//         "Naturally Reset and revitalize your body, One Cup at a Time.",
//       rating: 4.8,
//       reviews: 124,
//       benefits: ["Detoxify Naturally", "Support Digestion", "Boost Vitality"],
//       ingredients:
//         "Green tea, Licorice roots, dandelion roots, nettle, grapefruit, lemon",
//     },
//     {
//       id: 2,
//       name: "Strawberry Hibiscus Tea",
//       price: 8.89,
//       category: "Herbal Teas",
//       image: "🍓",
//       description: "A Naturally Sweet Herbal Fusion",
//       rating: 4.9,
//       reviews: 89,
//       benefits: ["Antioxidant Boost", "Heart Health", "Natural Hydration"],
//       ingredients: "Hibiscus petals, real strawberries, natural herbs",
//     },
//     {
//       id: 3,
//       name: "Green Matcha Tea Latte",
//       price: 10.5,
//       category: "Energy Teas",
//       image: "🍃",
//       description: "Focused Fuel for the Body & Mind",
//       rating: 4.7,
//       reviews: 156,
//       benefits: ["Mental Clarity", "Metabolism Boost", "Sustained Energy"],
//       ingredients: "Ceremonial-grade matcha powder, natural ingredients",
//     },
//     {
//       id: 4,
//       name: "Berry Day Juice",
//       price: 8.87,
//       category: "Fresh Juices",
//       image: "🫐",
//       description: "Raw, freshly juiced blend of strawberries and blackberries",
//       rating: 4.8,
//       reviews: 203,
//       benefits: ["Antioxidant Powerhouse", "Immune Support", "Heart Health"],
//       ingredients: "Fresh strawberries, blackberries, no additives",
//     },
//     {
//       id: 5,
//       name: "Watermelon Lemonade",
//       price: 10.0,
//       category: "Fresh Juices",
//       image: "🍉",
//       description: "Refreshing fusion of watermelon, lemon, and honey",
//       rating: 4.9,
//       reviews: 178,
//       benefits: ["Hydration Hero", "Weight Management", "Anti-Inflammatory"],
//       ingredients: "Fresh watermelon, lemon, raw honey",
//     },
//     {
//       id: 6,
//       name: "Lemon Ginger Iced Tea",
//       price: 8.89,
//       category: "Iced Teas",
//       image: "🍋",
//       description: "Zest, Spice, and Everything Nice",
//       rating: 4.6,
//       reviews: 145,
//       benefits: ["Digestive Support", "Immune Boost", "Anti-Inflammatory"],
//       ingredients: "Real lemon fruit, fresh ginger root, herbal tea base",
//     },
//     {
//       id: 7,
//       name: "Country Peachy Iced Tea",
//       price: 8.89,
//       category: "Iced Teas",
//       image: "🍑",
//       description: "A Sweet Southern Sip of Wellness",
//       rating: 4.7,
//       reviews: 112,
//       benefits: ["Vitamin C Rich", "Antioxidant Support", "Natural Hydration"],
//       ingredients: "Real peach fruit, hibiscus, natural herbs",
//     },
//     {
//       id: 8,
//       name: "Watermelon Juice",
//       price: 9.75,
//       category: "Fresh Juices",
//       image: "🍉",
//       description: "Raw & Freshly Pressed - Pure watermelon goodness",
//       rating: 4.8,
//       reviews: 167,
//       benefits: ["95% Water Content", "Raw & Unprocessed", "Heart Healthy"],
//       ingredients: "100% fresh watermelon, no additives",
//     },
//     {
//       id: 9,
//       name: "Raspberry Hibiscus Tea",
//       price: 8.89,
//       category: "Herbal Teas",
//       image: "🫐",
//       description: "Floral Bliss Meets Berry Refreshment",
//       rating: 4.6,
//       reviews: 134,
//       benefits: ["Antioxidant Boost", "Heart Health", "Caffeine-Free"],
//       ingredients: "Hibiscus petals, real raspberries, natural herbs",
//     },
//     {
//       id: 10,
//       name: "Green Iced Tea",
//       price: 8.89,
//       category: "Energy Teas",
//       image: "🍃",
//       description: "Clean Energy in Every Sip",
//       rating: 4.5,
//       reviews: 189,
//       benefits: ["Natural Energy", "Metabolism Support", "Antioxidant Rich"],
//       ingredients: "Premium green tea leaves, natural ingredients",
//     },
//     {
//       id: 11,
//       name: "Green Iced Tea with Elderberry",
//       price: 8.87,
//       category: "Energy Teas",
//       image: "🍇",
//       description: "Refresh. Restore. Rebalance.",
//       rating: 4.7,
//       reviews: 156,
//       benefits: ["Immunity Boost", "Clean Energy", "Antioxidant Rich"],
//       ingredients: "Green tea leaves, elderberry, natural herbs",
//     },
//     {
//       id: 12,
//       name: "Herbal Pomegranate Blueberry Iced Tea",
//       price: 8.87,
//       category: "Herbal Teas",
//       image: "🫐",
//       description: "Bold. Bright. Bursting with Benefits.",
//       rating: 4.8,
//       reviews: 142,
//       benefits: ["Brain Support", "Heart Health", "Immune Boost"],
//       ingredients: "Real pomegranate, blueberries, herbal tea base",
//     },
//   ];

//   const categories = [
//     "All",
//     "Herbal Teas",
//     "Iced Teas",
//     "Energy Teas",
//     "Fresh Juices",
//   ];

//   const filteredProducts = products
//     .filter(
//       (product) =>
//         (selectedCategory === "All" || product.category === selectedCategory) &&
//         product.name.toLowerCase().includes(searchTerm.toLowerCase())
//     )
//     .sort((a, b) => {
//       if (sortBy === "price") return a.price - b.price;
//       if (sortBy === "rating") return b.rating - a.rating;
//       return a.name.localeCompare(b.name);
//     });

//   const toggleFavorite = (productId: unknown) => {
//     const newFavorites = new Set(favorites);
//     if (newFavorites.has(productId)) {
//       newFavorites.delete(productId);
//     } else {
//       newFavorites.add(productId);
//     }
//     setFavorites(newFavorites);
//   };

//   const updateCart = (productId: number, change: number) => {
//     setCart((prev) => {
//       const newCart = { ...prev };
//       const currentQty = newCart[productId] || 0;
//       const newQty = Math.max(0, currentQty + change);

//       if (newQty === 0) {
//         delete newCart[productId];
//       } else {
//         newCart[productId] = newQty;
//       }
//       return newCart;
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
//       {/* Page Header */}
//       <div className="bg-white/70 backdrop-blur-md border-b border-orange-200/50">
//         <div className="max-w-7xl mx-auto px-4 py-16">
//           <div className="text-center">
//             <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
//               Premium Wellness
//               <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
//                 Collection
//               </span>
//             </h1>
//             <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
//               {categories.map((category) => (
//                 <option key={category} value={category}>
//                   {category}
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
//               <option value="rating">Sort by Rating</option>
//             </select>
//           </div>
//         </div>

//         {/* Products Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
//           {filteredProducts.map((product, index) => (
//             <div
//               key={product.id}
//               className="group bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border border-orange-200/50 hover:border-green-300 transition-all duration-500 hover:transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-100/50"
//               style={{
//                 animationDelay: `${index * 100}ms`,
//                 animation: "slideInUp 0.6s ease-out forwards",
//               }}
//             >
//               {/* Product Image */}
//               <div className="relative h-48 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center overflow-hidden">
//                 <div className="text-6xl group-hover:scale-110 transition-transform duration-500">
//                   {product.image}
//                 </div>

//                 {/* Favorite Button */}
//                 <button
//                   onClick={() => toggleFavorite(product.id)}
//                   className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 ${
//                     favorites.has(product.id)
//                       ? "bg-red-100 text-red-500"
//                       : "bg-white/80 text-gray-400 hover:text-red-500"
//                   }`}
//                 >
//                   <Heart
//                     size={16}
//                     fill={favorites.has(product.id) ? "currentColor" : "none"}
//                   />
//                 </button>

//                 {/* Category Badge */}
//                 <div className="absolute top-4 left-4">
//                   <span className="px-3 py-1 bg-white/90 text-green-600 text-xs font-semibold rounded-full">
//                     {product.category}
//                   </span>
//                 </div>

//                 {/* 3D Effect Overlay */}
//                 <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
//               </div>

//               {/* Product Info */}
//               <div className="p-6">
//                 <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
//                   {product.name}
//                 </h3>

//                 <p className="text-gray-600 text-sm mb-3 line-clamp-2">
//                   {product.description}
//                 </p>

//                 {/* Rating */}
//                 <div className="flex items-center gap-2 mb-3">
//                   <div className="flex items-center">
//                     {[...Array(5)].map((_, i) => (
//                       <Star
//                         key={i}
//                         size={14}
//                         className={
//                           i < Math.floor(product.rating)
//                             ? "text-yellow-400 fill-current"
//                             : "text-gray-300"
//                         }
//                       />
//                     ))}
//                   </div>
//                   <span className="text-sm text-gray-600">
//                     {product.rating} ({product.reviews})
//                   </span>
//                 </div>

//                 {/* Benefits */}
//                 <div className="mb-4">
//                   <div className="flex flex-wrap gap-1">
//                     {product.benefits.slice(0, 2).map((benefit, idx) => (
//                       <span
//                         key={idx}
//                         className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg"
//                       >
//                         {benefit}
//                       </span>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Price and Actions */}
//                 <div className="flex items-center justify-between">
//                   <div className="text-2xl font-bold text-green-600">
//                     ${product.price}
//                   </div>

//                   <div className="flex items-center gap-2">
//                     {cart[product.id] > 0 ? (
//                       <div className="flex items-center gap-2 bg-green-50 rounded-xl p-1">
//                         <button
//                           onClick={() => updateCart(product.id, -1)}
//                           className="p-1 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
//                         >
//                           <Minus size={16} />
//                         </button>
//                         <span className="px-2 text-green-600 font-semibold">
//                           {cart[product.id]}
//                         </span>
//                         <button
//                           onClick={() => updateCart(product.id, 1)}
//                           className="p-1 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
//                         >
//                           <Plus size={16} />
//                         </button>
//                       </div>
//                     ) : (
//                       <button
//                         onClick={() => updateCart(product.id, 1)}
//                         className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
//                       >
//                         Add to Cart
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Empty State */}
//         {filteredProducts.length === 0 && (
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
//         <div className="text-center mt-12">
//           <button className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold">
//             Load More Products
//           </button>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes slideInUp {
//           from {
//             opacity: 0;
//             transform: translateY(30px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

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
import React, { useState } from "react";
import {
  Search,
  Heart,
  Star,
  ShoppingBag,
  Eye,
  Plus,
  Minus,
} from "lucide-react";
import { useCartStore, useFavoritesStore } from "../../store";
import Image from "next/image";

const ShopPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");

  // Store hooks - Match header pattern exactly
  const {
    addItem,
    updateQuantity,
    removeItem,
    items: cartItems,
  } = useCartStore();
  const { toggleItem, isInFavorites } = useFavoritesStore();
  const openCart = useCartStore((state) => state.openCart); // Same as header

  // Debug cart items
  console.log("Cart Items:", cartItems);

  const products = [
    {
      id: "1",
      name: "Nutra-Reset Herbal Tea",
      slug: "nutra-reset-herbal-tea",
      price: "8.87", // String to match your store's parseFloat(product.price)
      category: "Herbal Teas",
      images: [
        "https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=500&fit=crop",
      ],
      // image: "🍵",
      image:
        "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&h=400&fit=crop",
      description:
        "Naturally Reset and revitalize your body, One Cup at a Time.",
      rating: 4.8,
      reviewCount: 124,
      benefits: ["Detoxify Naturally", "Support Digestion", "Boost Vitality"],
      features: ["Detoxify Naturally", "Support Digestion", "Boost Vitality"],
    },
    {
      id: "2",
      name: "Strawberry Hibiscus Tea",
      slug: "strawberry-hibiscus-tea",
      price: "8.89", // String format
      category: "Herbal Teas",
      images: [
        "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=500&fit=crop",
      ],
      // image: "🍓",
      image:
        "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600&h=400&fit=crop",
      description: "A Naturally Sweet Herbal Fusion",
      rating: 4.9,
      reviewCount: 89,
      benefits: ["Antioxidant Boost", "Heart Health", "Natural Hydration"],
      features: ["Antioxidant Boost", "Heart Health", "Natural Hydration"],
    },
    {
      id: "3",
      name: "Green Matcha Tea Latte",
      slug: "green-matcha-tea-latte",
      price: "10.50", // String format
      category: "Energy Teas",
      images: [
        "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=500&fit=crop",
      ],
      // image: "🍃",
      image:
        "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=500&fit=crop",
      description: "Focused Fuel for the Body & Mind",
      rating: 4.7,
      reviewCount: 156,
      benefits: ["Mental Clarity", "Metabolism Boost", "Sustained Energy"],
      features: ["Mental Clarity", "Metabolism Boost", "Sustained Energy"],
    },
    // {
    //   id: "4",
    //   name: "Berry Day Juice",
    //   slug: "berry-day-juice",
    //   price: "8.87", // String format
    //   category: "Fresh Juices",
    //   images: [
    //     "https://images.unsplash.com/photo-1553530979-98cc0de94293?w=400&h=500&fit=crop",
    //   ],
    //   image: "🫐",
    //   description: "Raw, freshly juiced blend of strawberries and blackberries",
    //   rating: 4.8,
    //   reviewCount: 203,
    //   benefits: ["Antioxidant Powerhouse", "Immune Support", "Heart Health"],
    //   features: ["Antioxidant Powerhouse", "Immune Support", "Heart Health"],
    // },
    // {
    //   id: "5",
    //   name: "Watermelon Lemonade",
    //   slug: "watermelon-lemonade",
    //   price: "10.00", // String format
    //   category: "Fresh Juices",
    //   images: [
    //     "https://images.unsplash.com/photo-1568096889942-6eedea30afa8?w=400&h=500&fit=crop",
    //   ],
    //   image: "🍉",
    //   description: "Refreshing fusion of watermelon, lemon, and honey",
    //   rating: 4.9,
    //   reviewCount: 178,
    //   benefits: ["Hydration Hero", "Weight Management", "Anti-Inflammatory"],
    //   features: ["Hydration Hero", "Weight Management", "Anti-Inflammatory"],
    // },
  ];

  const categories = [
    "All",
    "Herbal Teas",
    "Iced Teas",
    "Energy Teas",
    "Fresh Juices",
  ];

  const filteredProducts = products
    .filter(
      (product) =>
        (selectedCategory === "All" || product.category === selectedCategory) &&
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "price") return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === "rating") return b.rating - a.rating;
      return a.name.localeCompare(b.name);
    });

  // Check if product is in cart - Fixed to match your store
  const isInCart = (productId: string) => {
    console.log(
      "Checking cart for product:",
      productId,
      "Cart items:",
      cartItems
    );
    return (
      cartItems &&
      cartItems.length > 0 &&
      cartItems.some((item: any) => item.productId === productId)
    );
  };

  // Get quantity of product in cart - Fixed to match your store
  const getCartQuantity = (productId: string) => {
    if (!cartItems || cartItems.length === 0) return 0;
    const item = cartItems.find((item: any) => item.productId === productId);
    console.log("Found item:", item);
    return item ? item.quantity : 0;
  };

  // Product Card Component - Fixed cart functionality
  function ProductCard({ product, index }: { product: any; index: number }) {
    const isFavorite = isInFavorites(product.id);

    // Move cart checks inside component for proper re-rendering
    const inCart = isInCart(product.id);
    const quantity = getCartQuantity(product.id);

    console.log(`Product ${product.name}:`, { inCart, quantity });

    const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("Adding to cart:", product);
      // Your store expects (product, quantity)
      addItem(product, 1);
    };

    const handleToggleFavorite = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleItem(product.id);
    };

    const handleUpdateQuantity = (e: React.MouseEvent, change: number) => {
      e.preventDefault();
      e.stopPropagation();

      const currentQty = quantity;
      const newQty = currentQty + change;

      console.log("Updating quantity:", currentQty, "→", newQty);

      if (newQty <= 0) {
        // Remove from cart using productId
        removeItem(product.id);
      } else {
        // Update quantity using productId and new quantity
        updateQuantity(product.id, newQty);
      }
    };

    const handleViewCart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      openCart(); // Open the cart drawer
    };

    return (
      <div className="group">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border border-orange-200  hover:border-green-300 transition-all duration-500 hover:transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-100/50 h-full">
          {/* Product Image */}
          <div className="relative h-60  flex items-center justify-center overflow-hidden">
            <div className="text-6xl transition-transform duration-500">
              {/* {product.image} */}
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover  transition-transform duration-700 "
              />
            </div>

            {/* Favorite Button - Better visibility */}
            <button
              onClick={handleToggleFavorite}
              className={`absolute top-3 right-3 p-2 rounded-full transition-colors z-10 ${
                isFavorite
                  ? "bg-red-500 text-white shadow-lg"
                  : "bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500 shadow-md"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`}
              />
            </button>

            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 bg-white/90 text-green-600 text-xs font-semibold rounded-full">
                {product.category}
              </span>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-green-600 uppercase tracking-wide">
                {product.category}
              </span>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-xs text-gray-500">
                  ({product.reviewCount})
                </span>
              </div>
            </div>

            <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">
              {product.name}
            </h3>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {product.description}
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-1 mb-4">
              {product.features.slice(0, 2).map((feature: string) => (
                <span
                  key={feature}
                  className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg"
                >
                  {feature}
                </span>
              ))}
            </div>

            {/* Price and Cart Actions - Redesigned layout */}
            <div className="space-y-3">
              {inCart ? (
                <>
                  {/* Price and Quantity Controls Row */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">
                      ${product.price}
                    </span>

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
                    <span className="text-2xl font-bold text-green-600">
                      ${product.price}
                    </span>
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
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
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
              <option value="rating">Sort by Rating</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
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
};

export default ShopPage;
