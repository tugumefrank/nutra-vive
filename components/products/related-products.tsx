// // components/products/related-products.tsx
// "use client";

// import { motion } from "framer-motion";
// import Link from "next/link";
// import Image from "next/image";
// import { Star, ShoppingCart, Heart } from "lucide-react";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { cn } from "@/lib/utils";

// interface Product {
//   _id: string;
//   name: string;
//   slug: string;
//   price: number;
//   compareAtPrice?: number;
//   images: string[];
//   averageRating: number;
//   reviewCount: number;
//   shortDescription?: string;
//   category?: {
//     name: string;
//     slug: string;
//   };
//   tags: string[];
// }

// interface RelatedProductsProps {
//   products: Product[];
// }

// export default function RelatedProducts({ products }: RelatedProductsProps) {
//   if (products.length === 0) {
//     return null;
//   }

//   return (
//     <div className="space-y-8">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="text-center"
//       >
//         <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
//           You Might Also Like
//         </h2>
//         <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
//           Discover more amazing products from our premium collection of natural
//           juices and teas
//         </p>
//       </motion.div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {products.map((product, index) => (
//           <motion.div
//             key={product._id}
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: index * 0.1 }}
//             whileHover={{ y: -5 }}
//             className="group"
//           >
//             <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
//               {/* Product Image */}
//               <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-800">
//                 <Link href={`/products/${product.slug}`}>
//                   <Image
//                     src={product.images[0] || "/placeholder-product.jpg"}
//                     alt={product.name}
//                     fill
//                     className="object-cover transition-transform duration-500 group-hover:scale-110"
//                     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
//                   />
//                 </Link>

//                 {/* Discount Badge */}
//                 {product.compareAtPrice &&
//                   product.compareAtPrice > product.price && (
//                     <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 text-white">
//                       {Math.round(
//                         ((product.compareAtPrice - product.price) /
//                           product.compareAtPrice) *
//                           100
//                       )}
//                       % OFF
//                     </Badge>
//                   )}

//                 {/* Quick Actions */}
//                 <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                   <motion.button
//                     whileHover={{ scale: 1.1 }}
//                     whileTap={{ scale: 0.9 }}
//                     className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
//                   >
//                     <Heart className="h-4 w-4 text-gray-600 dark:text-gray-300" />
//                   </motion.button>
//                 </div>

//                 {/* Floating Elements */}
//                 <motion.div
//                   animate={{
//                     y: [0, -10, 0],
//                     rotate: [0, 5, -5, 0],
//                   }}
//                   transition={{
//                     duration: 4,
//                     repeat: Infinity,
//                     ease: "easeInOut",
//                     delay: index * 0.5,
//                   }}
//                   className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400/30 to-blue-400/30 rounded-full pointer-events-none"
//                 />
//               </div>

//               {/* Product Info */}
//               <div className="p-6 space-y-4">
//                 {/* Category */}
//                 {product.category && (
//                   <Badge
//                     variant="secondary"
//                     className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
//                   >
//                     {product.category.name}
//                   </Badge>
//                 )}

//                 {/* Product Name */}
//                 <div>
//                   <Link href={`/products/${product.slug}`}>
//                     <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2">
//                       {product.name}
//                     </h3>
//                   </Link>
//                   {product.shortDescription && (
//                     <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
//                       {product.shortDescription}
//                     </p>
//                   )}
//                 </div>

//                 {/* Rating */}
//                 <div className="flex items-center space-x-2">
//                   <div className="flex items-center">
//                     {[...Array(5)].map((_, i) => (
//                       <Star
//                         key={i}
//                         className={cn(
//                           "h-4 w-4",
//                           i < Math.floor(product.averageRating)
//                             ? "text-yellow-400 fill-current"
//                             : "text-gray-300"
//                         )}
//                       />
//                     ))}
//                   </div>
//                   <span className="text-sm text-gray-600 dark:text-gray-400">
//                     ({product.reviewCount})
//                   </span>
//                 </div>

//                 {/* Price */}
//                 <div className="flex items-center space-x-2">
//                   <span className="text-lg font-bold text-gray-900 dark:text-white">
//                     ${product.price.toFixed(2)}
//                   </span>
//                   {product.compareAtPrice &&
//                     product.compareAtPrice > product.price && (
//                       <span className="text-sm text-gray-500 line-through">
//                         ${product.compareAtPrice.toFixed(2)}
//                       </span>
//                     )}
//                 </div>

//                 {/* Add to Cart Button */}
//                 <motion.div
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   <Button
//                     className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-500/25 group-hover:shadow-green-500/40 transition-all duration-300"
//                     size="sm"
//                   >
//                     <ShoppingCart className="h-4 w-4 mr-2" />
//                     Add to Cart
//                   </Button>
//                 </motion.div>
//               </div>

//               {/* Hover Effect Overlay */}
//               <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
//             </Card>
//           </motion.div>
//         ))}
//       </div>

//       {/* View All Products Link */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.5 }}
//         className="text-center pt-8"
//       >
//         <Link href="/products">
//           <Button
//             variant="outline"
//             size="lg"
//             className="hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300"
//           >
//             View All Products
//           </Button>
//         </Link>
//       </motion.div>

//       {/* Decorative Elements */}
//       <div className="absolute -z-10 opacity-30">
//         <motion.div
//           animate={{
//             scale: [1, 1.2, 1],
//             rotate: [0, 180, 360],
//           }}
//           transition={{
//             duration: 20,
//             repeat: Infinity,
//             ease: "linear",
//           }}
//           className="w-32 h-32 border border-green-200 dark:border-green-800 rounded-full absolute -top-16 -right-16"
//         />
//         <motion.div
//           animate={{
//             scale: [1.2, 1, 1.2],
//             rotate: [360, 180, 0],
//           }}
//           transition={{
//             duration: 15,
//             repeat: Infinity,
//             ease: "linear",
//           }}
//           className="w-24 h-24 border border-blue-200 dark:border-blue-800 rounded-full absolute -bottom-12 -left-12"
//         />
//       </div>
//     </div>
//   );
// }
// components/products/related-products.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Product, ProductCard } from "../shop/ProductCard";

interface RelatedProductsProps {
  products: Product[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          You Might Also Like
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Discover more amazing products from our premium collection of natural
          juices and teas
        </p>
      </motion.div>

      {/* Products Grid using Standard ProductCard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.1,
              type: "spring",
              stiffness: 100,
              damping: 10,
            }}
            whileHover={{ y: -5 }}
            className="group"
          >
            <ProductCard
              product={product}
              showCategory={true}
              showFeatures={true}
              maxFeatures={2}
              variant="default"
              className="h-full transform transition-all duration-300"
            />
          </motion.div>
        ))}
      </div>

      {/* View All Products Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center pt-8"
      >
        <Link href="/shop">
          <Button
            variant="outline"
            size="lg"
            className="hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 hover:border-green-300 dark:hover:border-green-500 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            View All Products
          </Button>
        </Link>
      </motion.div>

      {/* Enhanced Decorative Elements */}
      <div className="absolute -z-10 opacity-30 pointer-events-none">
        {/* Rotating Circle 1 */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-32 h-32 border border-green-200 dark:border-green-800 rounded-full absolute -top-16 -right-16"
        />

        {/* Rotating Circle 2 */}
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-24 h-24 border border-blue-200 dark:border-blue-800 rounded-full absolute -bottom-12 -left-12"
        />

        {/* Floating Gradient Orbs */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-16 h-16 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full absolute top-1/4 right-1/4"
        />

        <motion.div
          animate={{
            y: [0, 15, 0],
            x: [0, -10, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="w-12 h-12 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full absolute bottom-1/4 left-1/4"
        />
      </div>

      {/* Background Gradient */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-green-50/30 via-transparent to-blue-50/30 dark:from-green-900/10 dark:to-blue-900/10 rounded-3xl" />
    </div>
  );
}
