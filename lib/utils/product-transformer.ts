// // utils/product-transformer.ts

// import { Product } from "@/components/shop/ProductCard";

// // Type for your server product data (adjust based on your actual server product type)
// interface ServerProduct {
//   _id: string;
//   name: string;
//   slug: string;
//   price: number;
//   compareAtPrice?: number;
//   category?:
//     | {
//         _id: string;
//         name: string;
//         slug: string;
//         description?: string;
//         imageUrl?: string;
//         isActive: boolean;
//         createdAt: Date;
//         updatedAt: Date;
//       }
//     | string
//     | null;
//   images: string[];
//   description?: string;
//   shortDescription?: string;
//   averageRating: number;
//   reviewCount: number;
//   features: string[];
//   isActive: boolean;
//   isFeatured: boolean;
//   createdAt?: string | Date;
//   updatedAt?: string | Date;
//   tags?: string[];
//   // Add any other fields from your server product type
// }

// /**
//  * Transforms server product data to match ProductCard component interface
//  */
// export function transformProductForCard(serverProduct: ServerProduct): Product {
//   return {
//     _id: serverProduct._id,
//     name: serverProduct.name,
//     slug: serverProduct.slug,
//     price: serverProduct.price,
//     compareAtPrice: serverProduct.compareAtPrice,
//     category:
//       serverProduct.category && typeof serverProduct.category === "object"
//         ? {
//             _id: serverProduct.category._id,
//             name: serverProduct.category.name,
//           }
//         : null, // ProductCard expects null for missing category
//     images: serverProduct.images || [],
//     description: serverProduct.description,
//     shortDescription: serverProduct.shortDescription,
//     averageRating: serverProduct.averageRating || 0,
//     reviewCount: serverProduct.reviewCount || 0,
//     features: serverProduct.features || [],
//     isActive: serverProduct.isActive ?? true,
//     isFeatured: serverProduct.isFeatured ?? false,
//     createdAt:
//       typeof serverProduct.createdAt === "string"
//         ? serverProduct.createdAt
//         : serverProduct.createdAt?.toISOString(),
//   };
// }

// /**
//  * Transforms multiple server products for ProductCard components
//  */
// export function transformProductsForCard(
//   serverProducts: ServerProduct[]
// ): Product[] {
//   return serverProducts.map(transformProductForCard);
// }

// /**
//  * Filters and transforms products, excluding a specific product ID
//  */
// export function getRelatedProductsForCard(
//   serverProducts: ServerProduct[],
//   excludeProductId: string,
//   limit?: number
// ): Product[] {
//   const filtered = serverProducts.filter((p) => p._id !== excludeProductId);
//   const limited = limit ? filtered.slice(0, limit) : filtered;
//   return transformProductsForCard(limited);
// }
