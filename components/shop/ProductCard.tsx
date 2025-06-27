// "use client";

// import React, { useState, useRef } from "react";
// import {
//   Heart,
//   Star,
//   ShoppingBag,
//   Eye,
//   Plus,
//   Minus,
//   LogIn,
// } from "lucide-react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import { useUnifiedCart } from "@/hooks/useUnifiedCart"; // Updated import
// import { useStandaloneFavorites } from "@/hooks/useFavourite";
// import { cn } from "@/lib/utils";

// export interface Product {
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
//   createdAt?: string;
// }

// interface ProductCardProps {
//   product: Product;
//   className?: string;
//   showCategory?: boolean;
//   showFeatures?: boolean;
//   maxFeatures?: number;
//   variant?: "default" | "compact" | "list";
// }

// export function ProductCard({
//   product,
//   className = "",
//   showCategory = true,
//   showFeatures = true,
//   maxFeatures = 2,
//   variant = "default",
// }: ProductCardProps) {
//   const router = useRouter();
//   const [imageLoading, setImageLoading] = useState(true);
//   const [heartAnimation, setHeartAnimation] = useState("");
//   const heartRef = useRef<HTMLButtonElement>(null);

//   // Use unified cart system for consistent state across all components
//   const {
//     isInCart,
//     getItemQuantity,
//     addToCart,
//     updateQuantity,
//     openCart,
//     isAuthenticated,
//   } = useUnifiedCart();

//   // Favorites functionality
//   const { isFavorite, toggleProductFavorite } = useStandaloneFavorites();

//   const inCart = isAuthenticated ? isInCart(product._id) : false;
//   const quantity = isAuthenticated ? getItemQuantity(product._id) : 0;
//   const isProductFavorite = isAuthenticated ? isFavorite(product._id) : false;

//   const handleSignInRedirect = () => {
//     toast.info("Please sign in to add items to cart");
//     router.push("/sign-in");
//   };

//   const handleAddToCart = async (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!isAuthenticated) {
//       handleSignInRedirect();
//       return;
//     }

//     try {
//       // This will update ALL components simultaneously via the unified store
//       await addToCart(product, 1);
//     } catch (error) {
//       console.error("Failed to add to cart:", error);
//     }
//   };

//   const handleUpdateQuantity = async (e: React.MouseEvent, change: number) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!isAuthenticated) {
//       handleSignInRedirect();
//       return;
//     }

//     const newQty = quantity + change;

//     try {
//       // This will update ALL components simultaneously via the unified store
//       await updateQuantity(product._id, newQty);
//     } catch (error) {
//       console.error("Failed to update quantity:", error);
//     }
//   };

//   const handleViewCart = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!isAuthenticated) {
//       handleSignInRedirect();
//       return;
//     }

//     // Open cart drawer instead of navigating
//     openCart();
//   };

//   const handleToggleFavorite = async (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!isAuthenticated) {
//       toast.info("Please sign in to manage favorites");
//       router.push("/sign-in");
//       return;
//     }

//     // Trigger click animation
//     setHeartAnimation("heart-click");

//     // Optimistic update - UI updates immediately
//     await toggleProductFavorite(product._id, product.name);

//     // Clear animation after it completes
//     setTimeout(() => setHeartAnimation(""), 400);
//   };

//   const handleProductClick = () => {
//     router.push(`/products/${product.slug}`);
//   };

//   // Calculate discount percentage
//   const discountPercentage =
//     product.compareAtPrice && product.compareAtPrice > product.price
//       ? Math.round(
//           ((product.compareAtPrice - product.price) / product.compareAtPrice) *
//             100
//         )
//       : 0;

//   // Heart button component with animations
//   const HeartButton = ({
//     size = "w-4 h-4",
//     position = "absolute top-3 right-3",
//   }) => (
//     <button
//       ref={heartRef}
//       onClick={handleToggleFavorite}
//       className={cn(
//         position,
//         "p-2 rounded-full transition-all duration-300 z-10 shadow-md heart-button heart-transition",
//         isProductFavorite
//           ? "bg-red-500 text-white hover:bg-red-600"
//           : "bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500",
//         heartAnimation
//       )}
//       style={
//         {
//           // Add CSS custom properties for dynamic animations
//           "--heart-scale": isProductFavorite ? "1.1" : "1",
//         } as React.CSSProperties
//       }
//     >
//       <Heart
//         className={cn(
//           size,
//           "heart-transition",
//           isProductFavorite && "fill-current",
//           isProductFavorite && "heart-favorite"
//         )}
//       />
//     </button>
//   );

//   // Render based on variant
//   if (variant === "list") {
//     return (
//       <div
//         className={cn(
//           "group cursor-pointer bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden border border-orange-200 hover:border-green-300 transition-all duration-500 hover:shadow-lg",
//           className
//         )}
//         onClick={handleProductClick}
//       >
//         <div className="flex flex-col sm:flex-row">
//           {/* Product Image */}
//           <div className="relative w-full sm:w-48 h-48 sm:h-32 flex-shrink-0">
//             {product.images && product.images.length > 0 ? (
//               <Image
//                 src={product.images[0]}
//                 alt={product.name}
//                 fill
//                 className={cn(
//                   "object-cover transition-all duration-700 group-hover:scale-110",
//                   imageLoading ? "blur-sm" : "blur-0"
//                 )}
//                 onLoad={() => setImageLoading(false)}
//               />
//             ) : (
//               <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
//                 <div className="text-2xl text-gray-400">📦</div>
//               </div>
//             )}

//             {/* Favorite Button */}
//             <HeartButton
//               size="w-3 h-3"
//               position="absolute top-2 right-2 p-1.5"
//             />

//             {/* Discount Badge */}
//             {discountPercentage > 0 && (
//               <div className="absolute top-2 left-2">
//                 <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
//                   {discountPercentage}% OFF
//                 </span>
//               </div>
//             )}
//           </div>

//           {/* Product Info */}
//           <div className="flex-1 p-4">
//             <div className="flex justify-between items-start mb-2">
//               <div>
//                 {showCategory && product.category && (
//                   <span className="text-xs font-medium text-green-600 uppercase tracking-wide">
//                     {product.category.name}
//                   </span>
//                 )}
//                 <h3 className="font-bold text-lg group-hover:text-green-600 transition-colors">
//                   {product.name}
//                 </h3>
//               </div>
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

//             <p className="text-sm text-gray-600 mb-2 line-clamp-2">
//               {product.shortDescription ||
//                 product.description ||
//                 "Premium organic wellness product"}
//             </p>

//             <div className="flex justify-between items-end">
//               <div className="flex flex-col">
//                 {product.compareAtPrice &&
//                   product.compareAtPrice > product.price && (
//                     <span className="text-sm text-gray-500 line-through">
//                       ${product.compareAtPrice.toFixed(2)}
//                     </span>
//                   )}
//                 <span className="text-xl font-bold text-green-600">
//                   ${product.price.toFixed(2)}
//                 </span>
//               </div>

//               {/* Cart Actions - Unified system ensures all components update */}
//               <div onClick={(e) => e.stopPropagation()}>
//                 {isAuthenticated && inCart ? (
//                   <div className="flex items-center gap-2">
//                     <div className="flex items-center gap-1 bg-green-50 rounded-lg p-1">
//                       <button
//                         onClick={(e) => handleUpdateQuantity(e, -1)}
//                         className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
//                       >
//                         <Minus size={14} />
//                       </button>
//                       <span className="px-2 text-green-600 font-semibold text-sm min-w-[1.5rem] text-center">
//                         {quantity}
//                       </span>
//                       <button
//                         onClick={(e) => handleUpdateQuantity(e, 1)}
//                         className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
//                       >
//                         <Plus size={14} />
//                       </button>
//                     </div>
//                     <button
//                       onClick={handleViewCart}
//                       className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
//                     >
//                       View Cart
//                     </button>
//                   </div>
//                 ) : (
//                   <button
//                     onClick={handleAddToCart}
//                     className={cn(
//                       "px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium text-sm",
//                       isAuthenticated
//                         ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
//                         : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
//                     )}
//                   >
//                     {isAuthenticated ? (
//                       <>
//                         <ShoppingBag className="w-4 h-4" />
//                         Add to Cart
//                       </>
//                     ) : (
//                       <>
//                         <LogIn className="w-4 h-4" />
//                         Sign in to Buy
//                       </>
//                     )}
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Default card variant with unified cart system
//   return (
//     <div
//       className={cn("group cursor-pointer", className)}
//       onClick={handleProductClick}
//     >
//       <div className="bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border border-orange-200 hover:border-green-300 transition-all duration-500 hover:transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-100/50 h-full">
//         {/* Product Image */}
//         <div className="relative h-60 overflow-hidden">
//           {product.images && product.images.length > 0 ? (
//             <Image
//               src={product.images[0]}
//               alt={product.name}
//               fill
//               className={cn(
//                 "object-cover transition-all duration-700 group-hover:scale-110",
//                 imageLoading ? "blur-sm" : "blur-0"
//               )}
//               onLoad={() => setImageLoading(false)}
//             />
//           ) : (
//             <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
//               <div className="text-4xl text-gray-400">📦</div>
//             </div>
//           )}

//           {/* Favorite Button */}
//           <HeartButton />

//           {/* Category Badge */}
//           {showCategory && product.category && (
//             <div className="absolute top-3 left-3">
//               <span className="px-3 py-1 bg-white/90 text-green-600 text-xs font-semibold rounded-full">
//                 {product.category.name}
//               </span>
//             </div>
//           )}

//           {/* Featured Badge */}
//           {product.isFeatured && (
//             <div className="absolute bottom-3 left-3">
//               <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
//                 <Star className="w-3 h-3 fill-current" />
//                 Featured
//               </span>
//             </div>
//           )}

//           {/* Discount Badge */}
//           {discountPercentage > 0 && (
//             <div className="absolute top-3 right-14">
//               <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
//                 {discountPercentage}% OFF
//               </span>
//             </div>
//           )}

//           {/* Login Required Overlay for Guests */}
//           {!isAuthenticated && (
//             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
//               <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
//                 <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
//                   <LogIn className="w-4 h-4" />
//                   Sign in to add to cart
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Product Info */}
//         <div className="p-6">
//           <div className="flex items-center justify-between mb-2">
//             {showCategory && product.category && (
//               <span className="text-xs font-medium text-green-600 uppercase tracking-wide">
//                 {product.category.name}
//               </span>
//             )}
//             <div className="flex items-center space-x-1">
//               <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
//               <span className="text-sm font-medium">
//                 {product.averageRating || 0}
//               </span>
//               <span className="text-xs text-gray-500">
//                 ({product.reviewCount || 0})
//               </span>
//             </div>
//           </div>

//           <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">
//             {product.name}
//           </h3>

//           <p className="text-sm text-gray-600 mb-4 line-clamp-2">
//             {product.shortDescription ||
//               product.description ||
//               "Premium organic wellness product"}
//           </p>

//           {/* Features */}
//           {showFeatures && product.features && product.features.length > 0 && (
//             <div className="flex flex-wrap gap-1 mb-4">
//               {product.features
//                 .slice(0, maxFeatures)
//                 .map((feature: string, idx: number) => (
//                   <span
//                     key={idx}
//                     className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg"
//                   >
//                     {feature}
//                   </span>
//                 ))}
//             </div>
//           )}

//           {/* Price and Cart Actions - Unified system ensures all components update */}
//           <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
//             {isAuthenticated && inCart ? (
//               <>
//                 {/* Price and Quantity Controls Row */}
//                 <div className="flex items-center justify-between">
//                   <div className="flex flex-col">
//                     {/* Show compare price with strikethrough if it exists */}
//                     {product.compareAtPrice &&
//                       product.compareAtPrice > product.price && (
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="text-sm text-gray-500 line-through">
//                             ${product.compareAtPrice.toFixed(2)}
//                           </span>
//                           <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
//                             {discountPercentage}% OFF
//                           </span>
//                         </div>
//                       )}
//                     <span className="text-2xl font-bold text-green-600">
//                       ${product.price.toFixed(2)}
//                     </span>
//                   </div>

//                   {/* Quantity Controls */}
//                   <div className="flex items-center gap-2 bg-green-50 rounded-xl p-1">
//                     <button
//                       onClick={(e) => handleUpdateQuantity(e, -1)}
//                       className="p-1 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
//                       title="Decrease quantity"
//                     >
//                       <Minus size={16} />
//                     </button>
//                     <span className="px-2 text-green-600 font-semibold min-w-[2rem] text-center">
//                       {quantity}
//                     </span>
//                     <button
//                       onClick={(e) => handleUpdateQuantity(e, 1)}
//                       className="p-1 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
//                       title="Increase quantity"
//                     >
//                       <Plus size={16} />
//                     </button>
//                   </div>
//                 </div>

//                 {/* Full Width View Cart Button */}
//                 <button
//                   onClick={handleViewCart}
//                   className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-semibold"
//                 >
//                   <Eye className="w-4 h-4" />
//                   View Cart
//                 </button>
//               </>
//             ) : (
//               <>
//                 {/* Price Row */}
//                 <div className="flex items-center justify-between">
//                   <div className="flex flex-col">
//                     {/* Show compare price with strikethrough if it exists */}
//                     {product.compareAtPrice &&
//                       product.compareAtPrice > product.price && (
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="text-sm text-gray-500 line-through">
//                             ${product.compareAtPrice.toFixed(2)}
//                           </span>
//                           <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
//                             {discountPercentage}% OFF
//                           </span>
//                         </div>
//                       )}
//                     <span className="text-2xl font-bold text-green-600">
//                       ${product.price.toFixed(2)}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Add to Cart or Sign In Button */}
//                 <button
//                   onClick={handleAddToCart}
//                   className={cn(
//                     "w-full py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-semibold",
//                     isAuthenticated
//                       ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
//                       : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
//                   )}
//                 >
//                   {isAuthenticated ? (
//                     <>
//                       <ShoppingBag className="w-4 h-4" />
//                       Add to Cart
//                     </>
//                   ) : (
//                     <>
//                       <LogIn className="w-4 h-4" />
//                       Sign In to Purchase
//                     </>
//                   )}
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         .line-clamp-2 {
//           display: -webkit-box;
//           -webkit-line-clamp: 2;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }

//         /* Heart animations */
//         .heart-favorite {
//           animation: heartPulse 0.6s ease-in-out;
//         }

//         .heart-click {
//           animation: heartBounce 0.4s ease-in-out;
//         }

//         .heart-transition {
//           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//         }

//         .heart-button:hover {
//           transform: scale(1.1);
//         }

//         .heart-button:active {
//           transform: scale(0.95);
//         }

//         @keyframes heartPulse {
//           0% {
//             transform: scale(1);
//           }
//           15% {
//             transform: scale(1.2);
//           }
//           30% {
//             transform: scale(1);
//           }
//           45% {
//             transform: scale(1.1);
//           }
//           60% {
//             transform: scale(1);
//           }
//         }

//         @keyframes heartBounce {
//           0%,
//           20%,
//           50%,
//           80%,
//           100% {
//             transform: translateY(0) scale(1);
//           }
//           40% {
//             transform: translateY(-2px) scale(1.1);
//           }
//           60% {
//             transform: translateY(-1px) scale(1.05);
//           }
//         }
//       `}</style>
//     </div>
//   );
// }
// "use client";

// import React, { useState, useRef } from "react";
// import {
//   Heart,
//   Star,
//   ShoppingBag,
//   Eye,
//   Plus,
//   Minus,
//   LogIn,
//   Crown,
//   Gift,
//   Sparkles,
//   Zap,
//   TrendingUp,
//   Info,
// } from "lucide-react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import { useUnifiedCart } from "@/hooks/useUnifiedCart";
// import { useStandaloneFavorites } from "@/hooks/useFavourite";
// import { cn } from "@/lib/utils";
// import { Badge } from "@/components/ui/badge";
// import { ProductWithMembership } from "@/lib/actions/membershipProductServerActions";

// interface EnhancedProductCardProps {
//   product: ProductWithMembership;
//   className?: string;
//   showCategory?: boolean;
//   showFeatures?: boolean;
//   maxFeatures?: number;
//   variant?: "default" | "compact" | "list";
//   showMembershipBenefits?: boolean;
// }

// export function EnhancedProductCard({
//   product,
//   className = "",
//   showCategory = true,
//   showFeatures = true,
//   maxFeatures = 2,
//   variant = "default",
//   showMembershipBenefits = true,
// }: EnhancedProductCardProps) {
//   const router = useRouter();
//   const [imageLoading, setImageLoading] = useState(true);
//   const [heartAnimation, setHeartAnimation] = useState("");
//   const heartRef = useRef<HTMLButtonElement>(null);

//   // Use unified cart system for consistent state across all components
//   const {
//     isInCart,
//     getItemQuantity,
//     addToCart,
//     updateQuantity,
//     openCart,
//     isAuthenticated,
//   } = useUnifiedCart();

//   // Favorites functionality
//   const { isFavorite, toggleProductFavorite } = useStandaloneFavorites();

//   const inCart = isAuthenticated ? isInCart(product._id) : false;
//   const quantity = isAuthenticated ? getItemQuantity(product._id) : 0;
//   const isProductFavorite = isAuthenticated ? isFavorite(product._id) : false;

//   // Membership info
//   const membershipInfo = product.membershipInfo;
//   const isEligibleForFree = membershipInfo?.isEligibleForFree || false;
//   const remainingAllocation = membershipInfo?.remainingAllocation || 0;

//   const handleSignInRedirect = () => {
//     if (isEligibleForFree) {
//       toast.info("Sign in to claim your FREE membership product!");
//     } else {
//       toast.info("Please sign in to add items to cart");
//     }
//     router.push("/sign-in");
//   };

//   const handleAddToCart = async (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!isAuthenticated) {
//       handleSignInRedirect();
//       return;
//     }

//     try {
//       await addToCart(product, 1);

//       if (isEligibleForFree) {
//         toast.success(
//           <div className="flex items-center space-x-2">
//             <Crown className="w-4 h-4 text-amber-500" />
//             <span>Added FREE with your membership!</span>
//           </div>
//         );
//       }
//     } catch (error) {
//       console.error("Failed to add to cart:", error);
//     }
//   };

//   const handleUpdateQuantity = async (e: React.MouseEvent, change: number) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!isAuthenticated) {
//       handleSignInRedirect();
//       return;
//     }

//     const newQty = quantity + change;
//     try {
//       await updateQuantity(product._id, newQty);
//     } catch (error) {
//       console.error("Failed to update quantity:", error);
//     }
//   };

//   const handleViewCart = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!isAuthenticated) {
//       handleSignInRedirect();
//       return;
//     }

//     openCart();
//   };

//   const handleToggleFavorite = async (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!isAuthenticated) {
//       toast.info("Please sign in to manage favorites");
//       router.push("/sign-in");
//       return;
//     }

//     setHeartAnimation("heart-click");
//     await toggleProductFavorite(product._id, product.name);
//     setTimeout(() => setHeartAnimation(""), 400);
//   };

//   const handleProductClick = () => {
//     router.push(`/products/${product.slug}`);
//   };

//   // Calculate discount percentage
//   const discountPercentage =
//     product.compareAtPrice && product.compareAtPrice > product.price
//       ? Math.round(
//           ((product.compareAtPrice - product.price) / product.compareAtPrice) *
//             100
//         )
//       : 0;

//   // Heart button component with animations
//   const HeartButton = ({
//     size = "w-4 h-4",
//     position = "absolute top-3 right-3",
//   }) => (
//     <button
//       ref={heartRef}
//       onClick={handleToggleFavorite}
//       className={cn(
//         position,
//         "p-2 rounded-full transition-all duration-300 z-10 shadow-md heart-button heart-transition",
//         isProductFavorite
//           ? "bg-red-500 text-white hover:bg-red-600"
//           : "bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500",
//         heartAnimation
//       )}
//     >
//       <Heart
//         className={cn(
//           size,
//           "heart-transition",
//           isProductFavorite && "fill-current",
//           isProductFavorite && "heart-favorite"
//         )}
//       />
//     </button>
//   );

//   // Membership Benefits Component
//   const MembershipBenefits = ({ className = "" }) => {
//     if (!showMembershipBenefits || !membershipInfo) return null;

//     return (
//       <div className={cn("space-y-2", className)}>
//         {/* Free Badge */}
//         {isEligibleForFree && (
//           <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center justify-center shadow-lg">
//             <Crown className="w-4 h-4 mr-1" />
//             FREE with Membership
//           </div>
//         )}

//         {/* Membership Info */}
//         <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-medium text-amber-700 uppercase tracking-wide">
//               {membershipInfo.membershipTier} Member Benefits
//             </span>
//             <Badge
//               variant="outline"
//               className="text-xs bg-white text-amber-600 border-amber-300"
//             >
//               <Sparkles className="w-3 h-3 mr-1" />
//               {membershipInfo.categoryName}
//             </Badge>
//           </div>

//           {isEligibleForFree ? (
//             <div className="space-y-1">
//               <div className="flex items-center justify-between text-sm">
//                 <span className="text-amber-700 font-medium">You Save:</span>
//                 <span className="text-amber-800 font-bold">
//                   ${membershipInfo.savings.toFixed(2)}
//                 </span>
//               </div>
//               <div className="flex items-center justify-between text-xs text-amber-600">
//                 <span>Remaining this month:</span>
//                 <span className="font-semibold">
//                   {membershipInfo.remainingAllocation} items
//                 </span>
//               </div>

//               {/* Progress Bar */}
//               <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
//                 <div
//                   className="bg-gradient-to-r from-amber-400 to-orange-400 h-2 rounded-full transition-all duration-300"
//                   style={{
//                     width: `${Math.min(100, ((membershipInfo.totalAllocation - membershipInfo.remainingAllocation) / membershipInfo.totalAllocation) * 100)}%`,
//                   }}
//                 />
//               </div>
//               <div className="text-xs text-amber-600 text-center">
//                 {membershipInfo.usedAllocation} of{" "}
//                 {membershipInfo.totalAllocation} used
//               </div>
//             </div>
//           ) : (
//             <div className="text-xs text-amber-600 flex items-center">
//               <Info className="w-3 h-3 mr-1" />
//               No allocations remaining for {membershipInfo.categoryName}
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // Enhanced card with membership features
//   return (
//     <div
//       className={cn("group cursor-pointer", className)}
//       onClick={handleProductClick}
//     >
//       <div
//         className={cn(
//           "bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border transition-all duration-500 hover:transform hover:scale-[1.02] hover:shadow-2xl h-full",
//           isEligibleForFree
//             ? "border-amber-300 hover:border-amber-400 shadow-amber-100/50 hover:shadow-amber-200/50"
//             : "border-orange-200 hover:border-green-300 hover:shadow-green-100/50"
//         )}
//       >
//         {/* Product Image */}
//         <div className="relative h-60 overflow-hidden">
//           {product.images && product.images.length > 0 ? (
//             <Image
//               src={product.images[0]}
//               alt={product.name}
//               fill
//               className={cn(
//                 "object-cover transition-all duration-700 group-hover:scale-110",
//                 imageLoading ? "blur-sm" : "blur-0"
//               )}
//               onLoad={() => setImageLoading(false)}
//             />
//           ) : (
//             <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
//               <div className="text-4xl text-gray-400">📦</div>
//             </div>
//           )}

//           {/* Favorite Button */}
//           <HeartButton />

//           {/* Membership FREE Badge - Top Priority */}
//           {isEligibleForFree && (
//             <div className="absolute top-3 left-3 z-20">
//               <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center shadow-lg animate-pulse">
//                 <Crown className="w-3 h-3 mr-1" />
//                 FREE
//               </div>
//             </div>
//           )}

//           {/* Category Badge */}
//           {showCategory && product.category && !isEligibleForFree && (
//             <div className="absolute top-3 left-3">
//               <span className="px-3 py-1 bg-white/90 text-green-600 text-xs font-semibold rounded-full">
//                 {product.category.name}
//               </span>
//             </div>
//           )}

//           {/* Featured Badge */}
//           {product.isFeatured && (
//             <div className="absolute bottom-3 left-3">
//               <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
//                 <Star className="w-3 h-3 fill-current" />
//                 Featured
//               </span>
//             </div>
//           )}

//           {/* Discount Badge */}
//           {discountPercentage > 0 && !isEligibleForFree && (
//             <div className="absolute top-3 right-14">
//               <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
//                 {discountPercentage}% OFF
//               </span>
//             </div>
//           )}

//           {/* Membership Tier Badge */}
//           {membershipInfo && !isEligibleForFree && (
//             <div className="absolute bottom-3 right-3">
//               <Badge className="bg-amber-100 text-amber-700 text-xs capitalize">
//                 <Crown className="w-3 h-3 mr-1" />
//                 {membershipInfo.membershipTier}
//               </Badge>
//             </div>
//           )}

//           {/* Login Required Overlay for Guests */}
//           {!isAuthenticated && (
//             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
//               <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg text-center">
//                 <p className="text-sm font-medium text-gray-800 flex items-center gap-2 mb-2">
//                   <LogIn className="w-4 h-4" />
//                   Sign in to add to cart
//                 </p>
//                 {isEligibleForFree && (
//                   <p className="text-xs text-amber-600 font-medium">
//                     🎉 This item is FREE with membership!
//                   </p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Product Info */}
//         <div className="p-6 space-y-4">
//           {/* Header Info */}
//           <div className="space-y-2">
//             <div className="flex items-center justify-between mb-2">
//               {showCategory && product.category && (
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

//             <h3 className="font-bold text-lg group-hover:text-green-600 transition-colors">
//               {product.name}
//             </h3>

//             <p className="text-sm text-gray-600 line-clamp-2">
//               {product.shortDescription ||
//                 product.description ||
//                 "Premium organic wellness product"}
//             </p>

//             {/* Features */}
//             {showFeatures &&
//               product.features &&
//               product.features.length > 0 && (
//                 <div className="flex flex-wrap gap-1">
//                   {product.features
//                     .slice(0, maxFeatures)
//                     .map((feature: string, idx: number) => (
//                       <span
//                         key={idx}
//                         className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg"
//                       >
//                         {feature}
//                       </span>
//                     ))}
//                 </div>
//               )}
//           </div>

//           {/* Membership Benefits */}
//           <MembershipBenefits />

//           {/* Price and Cart Actions */}
//           <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
//             {isAuthenticated && inCart ? (
//               <>
//                 {/* Price and Quantity Controls Row */}
//                 <div className="flex items-center justify-between">
//                   <div className="flex flex-col">
//                     {isEligibleForFree ? (
//                       <div className="space-y-1">
//                         <span className="text-2xl font-bold text-amber-600 flex items-center">
//                           FREE
//                           <Crown className="w-5 h-5 ml-1" />
//                         </span>
//                         <span className="text-sm text-gray-500 line-through">
//                           ${product.price.toFixed(2)}
//                         </span>
//                       </div>
//                     ) : (
//                       <div>
//                         {product.compareAtPrice &&
//                           product.compareAtPrice > product.price && (
//                             <div className="flex items-center gap-2 mb-1">
//                               <span className="text-sm text-gray-500 line-through">
//                                 ${product.compareAtPrice.toFixed(2)}
//                               </span>
//                               <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
//                                 {discountPercentage}% OFF
//                               </span>
//                             </div>
//                           )}
//                         <span className="text-2xl font-bold text-green-600">
//                           ${product.price.toFixed(2)}
//                         </span>
//                       </div>
//                     )}
//                   </div>

//                   {/* Quantity Controls */}
//                   <div
//                     className={cn(
//                       "flex items-center gap-2 rounded-xl p-1",
//                       isEligibleForFree ? "bg-amber-50" : "bg-green-50"
//                     )}
//                   >
//                     <button
//                       onClick={(e) => handleUpdateQuantity(e, -1)}
//                       className={cn(
//                         "p-1 rounded-lg transition-colors",
//                         isEligibleForFree
//                           ? "text-amber-600 hover:bg-amber-100"
//                           : "text-green-600 hover:bg-green-100"
//                       )}
//                       title="Decrease quantity"
//                     >
//                       <Minus size={16} />
//                     </button>
//                     <span
//                       className={cn(
//                         "px-2 font-semibold min-w-[2rem] text-center",
//                         isEligibleForFree ? "text-amber-600" : "text-green-600"
//                       )}
//                     >
//                       {quantity}
//                     </span>
//                     <button
//                       onClick={(e) => handleUpdateQuantity(e, 1)}
//                       className={cn(
//                         "p-1 rounded-lg transition-colors",
//                         isEligibleForFree
//                           ? "text-amber-600 hover:bg-amber-100"
//                           : "text-green-600 hover:bg-green-100"
//                       )}
//                       title="Increase quantity"
//                       disabled={
//                         isEligibleForFree && quantity >= remainingAllocation
//                       }
//                     >
//                       <Plus size={16} />
//                     </button>
//                   </div>
//                 </div>

//                 {/* Full Width View Cart Button */}
//                 <button
//                   onClick={handleViewCart}
//                   className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-semibold"
//                 >
//                   <Eye className="w-4 h-4" />
//                   View Cart
//                 </button>
//               </>
//             ) : (
//               <>
//                 {/* Price Row */}
//                 <div className="flex items-center justify-between">
//                   <div className="flex flex-col">
//                     {isEligibleForFree ? (
//                       <div className="space-y-1">
//                         <span className="text-2xl font-bold text-amber-600 flex items-center">
//                           FREE
//                           <Crown className="w-5 h-5 ml-1" />
//                         </span>
//                         <span className="text-sm text-gray-500 line-through">
//                           ${product.price.toFixed(2)}
//                         </span>
//                       </div>
//                     ) : (
//                       <div>
//                         {product.compareAtPrice &&
//                           product.compareAtPrice > product.price && (
//                             <div className="flex items-center gap-2 mb-1">
//                               <span className="text-sm text-gray-500 line-through">
//                                 ${product.compareAtPrice.toFixed(2)}
//                               </span>
//                               <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
//                                 {discountPercentage}% OFF
//                               </span>
//                             </div>
//                           )}
//                         <span className="text-2xl font-bold text-green-600">
//                           ${product.price.toFixed(2)}
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Add to Cart or Sign In Button */}
//                 <button
//                   onClick={handleAddToCart}
//                   disabled={isEligibleForFree && remainingAllocation === 0}
//                   className={cn(
//                     "w-full py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed",
//                     isAuthenticated
//                       ? isEligibleForFree
//                         ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700"
//                         : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
//                       : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
//                   )}
//                 >
//                   {isAuthenticated ? (
//                     isEligibleForFree ? (
//                       remainingAllocation > 0 ? (
//                         <>
//                           <Crown className="w-4 h-4" />
//                           Claim FREE Item
//                         </>
//                       ) : (
//                         <>
//                           <Info className="w-4 h-4" />
//                           No Allocation Left
//                         </>
//                       )
//                     ) : (
//                       <>
//                         <ShoppingBag className="w-4 h-4" />
//                         Add to Cart
//                       </>
//                     )
//                   ) : (
//                     <>
//                       <LogIn className="w-4 h-4" />
//                       Sign In to {isEligibleForFree ? "Claim FREE" : "Purchase"}
//                     </>
//                   )}
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         .line-clamp-2 {
//           display: -webkit-box;
//           -webkit-line-clamp: 2;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }

//         /* Heart animations */
//         .heart-favorite {
//           animation: heartPulse 0.6s ease-in-out;
//         }

//         .heart-click {
//           animation: heartBounce 0.4s ease-in-out;
//         }

//         .heart-transition {
//           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//         }

//         .heart-button:hover {
//           transform: scale(1.1);
//         }

//         .heart-button:active {
//           transform: scale(0.95);
//         }

//         @keyframes heartPulse {
//           0% {
//             transform: scale(1);
//           }
//           15% {
//             transform: scale(1.2);
//           }
//           30% {
//             transform: scale(1);
//           }
//           45% {
//             transform: scale(1.1);
//           }
//           60% {
//             transform: scale(1);
//           }
//         }

//         @keyframes heartBounce {
//           0%,
//           20%,
//           50%,
//           80%,
//           100% {
//             transform: translateY(0) scale(1);
//           }
//           40% {
//             transform: translateY(-2px) scale(1.1);
//           }
//           60% {
//             transform: translateY(-1px) scale(1.05);
//           }
//         }
//       `}</style>
//     </div>
//   );
// }
"use client";

import React, { useState, useRef, useMemo, useCallback } from "react";
import {
  Heart,
  Star,
  ShoppingBag,
  Eye,
  Plus,
  Minus,
  LogIn,
  Crown,
  Gift,
  Sparkles,
  Zap,
  TrendingUp,
  Info,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { useUnifiedCartStore } from "@/store/unifiedCartStore";
import { useStandaloneFavorites } from "@/hooks/useFavourite";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProductWithMembership } from "@/lib/actions/membershipProductServerActions";

interface EnhancedProductCardProps {
  product: ProductWithMembership;
  className?: string;
  showCategory?: boolean;
  showFeatures?: boolean;
  maxFeatures?: number;
  variant?: "default" | "compact" | "list";
  showMembershipBenefits?: boolean;
}

export function EnhancedProductCard({
  product,
  className = "",
  showCategory = true,
  showFeatures = true,
  maxFeatures = 2,
  variant = "default",
  showMembershipBenefits = true,
}: EnhancedProductCardProps) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [imageLoading, setImageLoading] = useState(true);
  const [heartAnimation, setHeartAnimation] = useState("");
  const heartRef = useRef<HTMLButtonElement>(null);

  // Use the unified cart store
  const {
    cart,
    isOpen: isCartOpen,
    openCart,
    isInCart,
    getItemQuantity,
    addToCartOptimistic,
    updateQuantityOptimistic,
    isAddingToCart,
    isUpdatingItem,
  } = useUnifiedCartStore();

  // Favorites functionality
  const { isFavorite, toggleProductFavorite } = useStandaloneFavorites();

  // Memoize expensive calculations to prevent re-renders
  const cartData = useMemo(() => {
    if (!isSignedIn || !product)
      return {
        inCart: false,
        quantity: 0,
        isProductLoading: false,
      };

    const inCart = isInCart(product._id);
    const quantity = getItemQuantity(product._id);
    const isProductLoading =
      isAddingToCart[product._id] || isUpdatingItem[product._id] || false;

    return {
      inCart,
      quantity,
      isProductLoading,
    };
  }, [
    isSignedIn,
    product._id,
    isInCart,
    getItemQuantity,
    isAddingToCart,
    isUpdatingItem,
  ]);

  // Memoize membership calculations
  const membershipData = useMemo(() => {
    const membershipInfo = product.membershipInfo;
    const isEligibleForFree = membershipInfo?.isEligibleForFree || false;
    const remainingAllocation = membershipInfo?.remainingAllocation || 0;

    return {
      membershipInfo,
      isEligibleForFree,
      remainingAllocation,
      effectivelyFree: isEligibleForFree && remainingAllocation > 0,
    };
  }, [product.membershipInfo]);

  // Memoize favorite state
  const isProductFavorite = useMemo(() => {
    return isSignedIn ? isFavorite(product._id) : false;
  }, [isSignedIn, isFavorite, product._id]);

  // Memoize discount calculation
  const discountPercentage = useMemo(() => {
    return product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100
        )
      : 0;
  }, [product.compareAtPrice, product.price]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleSignInRedirect = useCallback(() => {
    if (membershipData.effectivelyFree) {
      toast.info("Sign in to claim your FREE membership product!");
    } else {
      toast.info("Please sign in to add items to cart");
    }
    router.push("/sign-in");
  }, [membershipData.effectivelyFree, router]);

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isSignedIn) {
        handleSignInRedirect();
        return;
      }

      if (cartData.isProductLoading) {
        return;
      }

      // Check membership allocation before adding
      if (
        membershipData.effectivelyFree &&
        membershipData.remainingAllocation <= 0
      ) {
        toast.error("No membership allocation remaining for this product");
        return;
      }

      try {
        await addToCartOptimistic(product, 1);

        // Show membership-specific success message
        if (membershipData.effectivelyFree) {
          toast.success(
            <div className="flex items-center space-x-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Added FREE with your membership!</span>
            </div>
          );
        } else {
          toast.success("Added to cart successfully!");
        }
      } catch (error) {
        console.error("Failed to add to cart:", error);
        toast.error("Failed to add item to cart");
      }
    },
    [
      isSignedIn,
      cartData.isProductLoading,
      membershipData.effectivelyFree,
      membershipData.remainingAllocation,
      addToCartOptimistic,
      product,
      handleSignInRedirect,
    ]
  );

  const handleUpdateQuantity = useCallback(
    async (e: React.MouseEvent, change: number) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isSignedIn) {
        handleSignInRedirect();
        return;
      }

      if (cartData.isProductLoading) {
        return;
      }

      const newQty = cartData.quantity + change;

      // Validate membership allocation for increases
      if (
        change > 0 &&
        membershipData.effectivelyFree &&
        membershipData.remainingAllocation < change
      ) {
        toast.error(
          `Only ${membershipData.remainingAllocation} items remaining in your membership allocation`
        );
        return;
      }

      // Don't allow negative quantities
      if (newQty < 0) {
        return;
      }

      try {
        await updateQuantityOptimistic(product._id, newQty);

        // Show success message for membership items
        if (membershipData.effectivelyFree && change > 0) {
          toast.success(
            <div className="flex items-center space-x-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Updated FREE membership item!</span>
            </div>
          );
        }
      } catch (error) {
        console.error("Failed to update quantity:", error);
        toast.error("Failed to update quantity");
      }
    },
    [
      isSignedIn,
      cartData.isProductLoading,
      cartData.quantity,
      membershipData.effectivelyFree,
      membershipData.remainingAllocation,
      updateQuantityOptimistic,
      product._id,
      handleSignInRedirect,
    ]
  );

  const handleViewCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isSignedIn) {
        handleSignInRedirect();
        return;
      }

      openCart();
    },
    [isSignedIn, openCart, handleSignInRedirect]
  );

  const handleToggleFavorite = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isSignedIn) {
        toast.info("Please sign in to manage favorites");
        router.push("/sign-in");
        return;
      }

      setHeartAnimation("heart-click");
      await toggleProductFavorite(product._id, product.name);
      setTimeout(() => setHeartAnimation(""), 400);
    },
    [isSignedIn, toggleProductFavorite, product._id, product.name, router]
  );

  const handleProductClick = useCallback(() => {
    router.push(`/products/${product.slug}`);
  }, [router, product.slug]);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  // Heart button component with animations
  const HeartButton = React.memo(
    ({
      size = "w-4 h-4",
      position = "absolute top-3 right-3",
    }: {
      size?: string;
      position?: string;
    }) => (
      <button
        ref={heartRef}
        onClick={handleToggleFavorite}
        disabled={cartData.isProductLoading}
        className={cn(
          position,
          "p-2 rounded-full transition-all duration-300 z-10 shadow-md heart-button heart-transition",
          isProductFavorite
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500",
          heartAnimation,
          cartData.isProductLoading && "opacity-50 cursor-not-allowed"
        )}
      >
        <Heart
          className={cn(
            size,
            "heart-transition",
            isProductFavorite && "fill-current",
            isProductFavorite && "heart-favorite"
          )}
        />
      </button>
    )
  );

  // Membership Benefits Component
  const MembershipBenefits = React.memo(
    ({ className = "" }: { className?: string }) => {
      if (!showMembershipBenefits || !membershipData.membershipInfo)
        return null;

      return (
        <div className={cn("space-y-2", className)}>
          {/* Free Badge */}
          {membershipData.effectivelyFree && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center justify-center shadow-lg">
              <Crown className="w-4 h-4 mr-1" />
              FREE with Membership
            </div>
          )}

          {/* Membership Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-700 uppercase tracking-wide">
                {membershipData.membershipInfo.membershipTier} Member Benefits
              </span>
              <Badge
                variant="outline"
                className="text-xs bg-white text-amber-600 border-amber-300"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {membershipData.membershipInfo.categoryName}
              </Badge>
            </div>

            {membershipData.effectivelyFree ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-700 font-medium">You Save:</span>
                  <span className="text-amber-800 font-bold">
                    ${membershipData.membershipInfo.savings.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-amber-600">
                  <span>Remaining this month:</span>
                  <span className="font-semibold">
                    {membershipData.remainingAllocation} items
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-orange-400 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, ((membershipData.membershipInfo.totalAllocation - membershipData.membershipInfo.remainingAllocation) / membershipData.membershipInfo.totalAllocation) * 100)}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-amber-600 text-center">
                  {membershipData.membershipInfo.usedAllocation} of{" "}
                  {membershipData.membershipInfo.totalAllocation} used
                </div>
              </div>
            ) : (
              <div className="text-xs text-amber-600 flex items-center">
                <Info className="w-3 h-3 mr-1" />
                No allocations remaining for{" "}
                {membershipData.membershipInfo.categoryName}
              </div>
            )}
          </div>
        </div>
      );
    }
  );

  // Enhanced card with membership features
  return (
    <div
      className={cn("group cursor-pointer", className)}
      onClick={handleProductClick}
    >
      <div
        className={cn(
          "bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border transition-all duration-500 hover:transform hover:scale-[1.02] hover:shadow-2xl h-full",
          membershipData.effectivelyFree
            ? "border-amber-300 hover:border-amber-400 shadow-amber-100/50 hover:shadow-amber-200/50"
            : "border-orange-200 hover:border-green-300 hover:shadow-green-100/50"
        )}
      >
        {/* Product Image */}
        <div className="relative h-60 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-all duration-700 group-hover:scale-110",
                imageLoading ? "blur-sm" : "blur-0"
              )}
              onLoad={handleImageLoad}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
              <div className="text-4xl text-gray-400">📦</div>
            </div>
          )}

          {/* Favorite Button */}
          <HeartButton />

          {/* Membership FREE Badge - Top Priority */}
          {membershipData.effectivelyFree && (
            <div className="absolute top-3 left-3 z-20">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center shadow-lg animate-pulse">
                <Crown className="w-3 h-3 mr-1" />
                FREE
              </div>
            </div>
          )}

          {/* Category Badge */}
          {showCategory &&
            product.category &&
            !membershipData.effectivelyFree && (
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-white/90 text-green-600 text-xs font-semibold rounded-full">
                  {typeof product.category === 'object' ? product.category.name : product.category}
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

          {/* Discount Badge */}
          {discountPercentage > 0 && !membershipData.effectivelyFree && (
            <div className="absolute top-3 right-14">
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                {discountPercentage}% OFF
              </span>
            </div>
          )}

          {/* Membership Tier Badge */}
          {membershipData.membershipInfo && !membershipData.effectivelyFree && (
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-amber-100 text-amber-700 text-xs capitalize">
                <Crown className="w-3 h-3 mr-1" />
                {membershipData.membershipInfo.membershipTier}
              </Badge>
            </div>
          )}

          {/* Login Required Overlay for Guests */}
          {!isSignedIn && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg text-center">
                <p className="text-sm font-medium text-gray-800 flex items-center gap-2 mb-2">
                  <LogIn className="w-4 h-4" />
                  Sign in to add to cart
                </p>
                {membershipData.effectivelyFree && (
                  <p className="text-xs text-amber-600 font-medium">
                    🎉 This item is FREE with membership!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {cartData.isProductLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-30">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6 space-y-4">
          {/* Header Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              {showCategory && product.category && (
                <span className="text-xs font-medium text-green-600 uppercase tracking-wide">
                  {typeof product.category === 'object' ? product.category.name : product.category}
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

            <h3 className="font-bold text-lg group-hover:text-green-600 transition-colors">
              {product.name}
            </h3>

            <p className="text-sm text-gray-600 line-clamp-2">
              {product.shortDescription ||
                product.description ||
                "Premium organic wellness product"}
            </p>

            {/* Features */}
            {showFeatures &&
              product.features &&
              product.features.length > 0 && (
                <div className="flex flex-wrap gap-1">
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
          </div>

          {/* Membership Benefits */}
          <MembershipBenefits />

          {/* Price and Cart Actions */}
          <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
            {isSignedIn && cartData.inCart ? (
              <>
                {/* Price and Quantity Controls Row */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    {membershipData.effectivelyFree ? (
                      <div className="space-y-1">
                        <span className="text-2xl font-bold text-amber-600 flex items-center">
                          FREE
                          <Crown className="w-5 h-5 ml-1" />
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <div>
                        {product.compareAtPrice &&
                          product.compareAtPrice > product.price && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-gray-500 line-through">
                                ${product.compareAtPrice.toFixed(2)}
                              </span>
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                                {discountPercentage}% OFF
                              </span>
                            </div>
                          )}
                        <span className="text-2xl font-bold text-green-600">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-xl p-1",
                      membershipData.effectivelyFree
                        ? "bg-amber-50"
                        : "bg-green-50"
                    )}
                  >
                    <button
                      onClick={(e) => handleUpdateQuantity(e, -1)}
                      disabled={cartData.isProductLoading}
                      className={cn(
                        "p-1 rounded-lg transition-colors disabled:opacity-50",
                        membershipData.effectivelyFree
                          ? "text-amber-600 hover:bg-amber-100"
                          : "text-green-600 hover:bg-green-100"
                      )}
                      title="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span
                      className={cn(
                        "px-2 font-semibold min-w-[2rem] text-center",
                        membershipData.effectivelyFree
                          ? "text-amber-600"
                          : "text-green-600"
                      )}
                    >
                      {cartData.quantity}
                    </span>
                    <button
                      onClick={(e) => handleUpdateQuantity(e, 1)}
                      disabled={
                        cartData.isProductLoading ||
                        (membershipData.effectivelyFree &&
                          membershipData.remainingAllocation <= 0)
                      }
                      className={cn(
                        "p-1 rounded-lg transition-colors disabled:opacity-50",
                        membershipData.effectivelyFree
                          ? "text-amber-600 hover:bg-amber-100"
                          : "text-green-600 hover:bg-green-100"
                      )}
                      title="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Full Width View Cart Button */}
                <button
                  onClick={handleViewCart}
                  disabled={cartData.isProductLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
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
                    {membershipData.effectivelyFree ? (
                      <div></div>
                    ) : (
                      <div>
                        {product.compareAtPrice &&
                          product.compareAtPrice > product.price && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-gray-500 line-through">
                                ${product.compareAtPrice.toFixed(2)}
                              </span>
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                                {discountPercentage}% OFF
                              </span>
                            </div>
                          )}
                        <span className="text-2xl font-bold text-green-600">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add to Cart or Sign In Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={
                    cartData.isProductLoading ||
                    (membershipData.effectivelyFree &&
                      membershipData.remainingAllocation === 0)
                  }
                  className={cn(
                    "w-full py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed",
                    isSignedIn
                      ? membershipData.effectivelyFree
                        ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700"
                        : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                  )}
                >
                  {cartData.isProductLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Adding...
                    </>
                  ) : isSignedIn ? (
                    membershipData.effectivelyFree ? (
                      membershipData.remainingAllocation > 0 ? (
                        <>
                          <Crown className="w-4 h-4" />
                          Claim FREE Item
                        </>
                      ) : (
                        <>
                          <Info className="w-4 h-4" />
                          No Allocation Left
                        </>
                      )
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        Add to Cart
                      </>
                    )
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign In to{" "}
                      {membershipData.effectivelyFree
                        ? "Claim FREE"
                        : "Purchase"}
                    </>
                  )}
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

        /* Heart animations */
        .heart-favorite {
          animation: heartPulse 0.6s ease-in-out;
        }

        .heart-click {
          animation: heartBounce 0.4s ease-in-out;
        }

        .heart-transition {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .heart-button:hover {
          transform: scale(1.1);
        }

        .heart-button:active {
          transform: scale(0.95);
        }

        @keyframes heartPulse {
          0% {
            transform: scale(1);
          }
          15% {
            transform: scale(1.2);
          }
          30% {
            transform: scale(1);
          }
          45% {
            transform: scale(1.1);
          }
          60% {
            transform: scale(1);
          }
        }

        @keyframes heartBounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0) scale(1);
          }
          40% {
            transform: translateY(-2px) scale(1.1);
          }
          60% {
            transform: translateY(-1px) scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
