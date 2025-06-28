// "use server";

// import { auth } from "@clerk/nextjs/server";
// import { revalidatePath } from "next/cache";
// import { z } from "zod";
// import { connectToDatabase } from "../db";
// import { Cart, Product } from "../db/models";

// // Validation Schemas
// const addToCartSchema = z.object({
//   productId: z.string().min(1, "Product ID is required"),
//   quantity: z.number().min(1, "Quantity must be at least 1"),
// });

// const updateCartItemSchema = z.object({
//   productId: z.string().min(1, "Product ID is required"),
//   quantity: z.number().min(0, "Quantity cannot be negative"),
// });

// // Helper function to serialize cart data for client components
// const serializeCart = (cart: any) => {
//   if (!cart) return null;

//   return {
//     ...cart,
//     _id: cart._id?.toString() || null,
//     items:
//       cart.items?.map((item: any) => ({
//         ...item,
//         _id: item._id?.toString(),
//         product: item.product
//           ? {
//               ...item.product,
//               _id: item.product._id?.toString(),
//               category: item.product.category
//                 ? {
//                     ...item.product.category,
//                     _id: item.product.category._id?.toString(),
//                   }
//                 : null,
//             }
//           : null,
//       })) || [],
//   };
// };

// // Helper function to get current user and cart
// async function getUserAndCart() {
//   const { userId } = await auth();
//   if (!userId) {
//     throw new Error("User must be authenticated");
//   }

//   await connectToDatabase();

//   // Use clerkUserId field for better compatibility
//   let cart = await Cart.findOne({ clerkUserId: userId });
//   if (!cart) {
//     cart = new Cart({
//       clerkUserId: userId, // Use clerkUserId instead of user ObjectId
//       items: [],
//     });
//     await cart.save();
//   }

//   return { userId, cart };
// }

// // Add item to cart
// export async function addToCart(
//   productId: string,
//   quantity: number
// ): Promise<{
//   success: boolean;
//   cart?: any;
//   error?: string;
// }> {
//   try {
//     // Validate input
//     const validatedData = addToCartSchema.parse({
//       productId,
//       quantity,
//     });

//     // Get user and cart (throws if not authenticated)
//     const { cart } = await getUserAndCart();

//     // Verify product exists and is active
//     const product = await Product.findById(validatedData.productId);
//     if (!product || !product.isActive) {
//       return {
//         success: false,
//         error: "Product not found or unavailable",
//       };
//     }

//     // Check if item already exists in cart
//     const existingItemIndex = cart.items.findIndex(
//       (item: any) => item.product.toString() === validatedData.productId
//     );

//     if (existingItemIndex >= 0) {
//       // Update existing item quantity
//       cart.items[existingItemIndex].quantity += validatedData.quantity;
//       cart.items[existingItemIndex].price = product.price;
//     } else {
//       // Add new item to cart
//       cart.items.push({
//         product: validatedData.productId,
//         quantity: validatedData.quantity,
//         price: product.price,
//       });
//     }

//     await cart.save();

//     // Populate cart with product details for response
//     await cart.populate({
//       path: "items.product",
//       select: "name slug price images category isActive",
//       populate: {
//         path: "category",
//         select: "name slug",
//       },
//     });

//     console.log("✅ Item added to cart successfully");

//     revalidatePath("/cart");

//     return {
//       success: true,
//       cart: serializeCart(cart.toObject()),
//     };
//   } catch (error) {
//     console.error("❌ Error adding to cart:", error);

//     if (error instanceof z.ZodError) {
//       const errorMessage = error.errors
//         .map((err) => `${err.path.join(".")}: ${err.message}`)
//         .join("; ");

//       return {
//         success: false,
//         error: `Validation failed: ${errorMessage}`,
//       };
//     }

//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "An error occurred",
//     };
//   }
// }

// // Update cart item quantity
// export async function updateCartItem(
//   productId: string,
//   quantity: number
// ): Promise<{
//   success: boolean;
//   cart?: any;
//   error?: string;
// }> {
//   try {
//     // Validate input
//     const validatedData = updateCartItemSchema.parse({
//       productId,
//       quantity,
//     });

//     // Get user and cart (throws if not authenticated)
//     const { cart } = await getUserAndCart();

//     if (validatedData.quantity === 0) {
//       // Remove item from cart
//       cart.items = cart.items.filter(
//         (item: any) => item.product.toString() !== validatedData.productId
//       );
//     } else {
//       // Update existing item quantity
//       const existingItemIndex = cart.items.findIndex(
//         (item: any) => item.product.toString() === validatedData.productId
//       );

//       if (existingItemIndex >= 0) {
//         cart.items[existingItemIndex].quantity = validatedData.quantity;
//       } else {
//         return {
//           success: false,
//           error: "Item not found in cart",
//         };
//       }
//     }

//     await cart.save();

//     // Populate cart with product details for response
//     await cart.populate({
//       path: "items.product",
//       select: "name slug price images category isActive",
//       populate: {
//         path: "category",
//         select: "name slug",
//       },
//     });

//     console.log("✅ Cart item updated successfully");

//     revalidatePath("/cart");

//     return {
//       success: true,
//       cart: serializeCart(cart.toObject()),
//     };
//   } catch (error) {
//     console.error("❌ Error updating cart item:", error);

//     if (error instanceof z.ZodError) {
//       const errorMessage = error.errors
//         .map((err) => `${err.path.join(".")}: ${err.message}`)
//         .join("; ");

//       return {
//         success: false,
//         error: `Validation failed: ${errorMessage}`,
//       };
//     }

//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "An error occurred",
//     };
//   }
// }

// // Remove item from cart
// export async function removeFromCart(productId: string): Promise<{
//   success: boolean;
//   cart?: any;
//   error?: string;
// }> {
//   try {
//     // Get user and cart (throws if not authenticated)
//     const { cart } = await getUserAndCart();

//     // Remove item from cart
//     cart.items = cart.items.filter(
//       (item: any) => item.product.toString() !== productId
//     );

//     await cart.save();

//     // Populate cart with product details for response
//     await cart.populate({
//       path: "items.product",
//       select: "name slug price images category isActive",
//       populate: {
//         path: "category",
//         select: "name slug",
//       },
//     });

//     console.log("✅ Item removed from cart successfully");

//     revalidatePath("/cart");

//     return {
//       success: true,
//       cart: serializeCart(cart.toObject()),
//     };
//   } catch (error) {
//     console.error("❌ Error removing from cart:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "An error occurred",
//     };
//   }
// }

// // Get cart contents
// export async function getCart(): Promise<{
//   success: boolean;
//   cart?: any;
//   error?: string;
// }> {
//   try {
//     // Get user and cart (throws if not authenticated)
//     const { cart } = await getUserAndCart();

//     // Populate cart with product details
//     await cart.populate({
//       path: "items.product",
//       select: "name slug price images category isActive",
//       populate: {
//         path: "category",
//         select: "name slug",
//       },
//     });

//     // Filter out inactive products
//     cart.items = cart.items.filter((item: any) => item.product?.isActive);

//     // Save cart if items were filtered out
//     if (cart.isModified()) {
//       await cart.save();
//     }

//     return {
//       success: true,
//       cart: serializeCart(cart.toObject()),
//     };
//   } catch (error) {
//     console.error("❌ Error getting cart:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "An error occurred",
//     };
//   }
// }

// // Clear cart
// export async function clearCart(): Promise<{
//   success: boolean;
//   error?: string;
// }> {
//   try {
//     // Get user and cart (throws if not authenticated)
//     const { cart } = await getUserAndCart();

//     // Clear cart items
//     cart.items = [];
//     await cart.save();

//     console.log("✅ Cart cleared successfully");

//     revalidatePath("/cart");

//     return {
//       success: true,
//     };
//   } catch (error) {
//     console.error("❌ Error clearing cart:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "An error occurred",
//     };
//   }
// }

// // Get cart stats (total items, total price)
// export async function getCartStats(): Promise<{
//   success: boolean;
//   stats?: {
//     totalItems: number;
//     totalPrice: number;
//     itemCount: number;
//   };
//   error?: string;
// }> {
//   try {
//     const cartResult = await getCart();

//     if (!cartResult.success || !cartResult.cart) {
//       return {
//         success: true,
//         stats: {
//           totalItems: 0,
//           totalPrice: 0,
//           itemCount: 0,
//         },
//       };
//     }

//     const cart = cartResult.cart;
//     const totalItems = cart.items.reduce(
//       (sum: number, item: any) => sum + item.quantity,
//       0
//     );
//     const totalPrice = cart.items.reduce(
//       (sum: number, item: any) => sum + item.quantity * item.price,
//       0
//     );
//     const itemCount = cart.items.length;

//     return {
//       success: true,
//       stats: {
//         totalItems,
//         totalPrice,
//         itemCount,
//       },
//     };
//   } catch (error) {
//     console.error("❌ Error getting cart stats:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "An error occurred",
//     };
//   }
// }
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectToDatabase } from "../db";
import {
  Cart,
  Product,
  Promotion,
  CustomerPromotionUsage,
  User,
} from "../db/models";
import mongoose from "mongoose";

// Validation Schemas
const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

const updateCartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(0, "Quantity cannot be negative"),
});

// Enhanced Cart Interface with Promotions
export interface CartWithPromotion {
  _id: string;
  items: any[];
  subtotal: number;
  promotionDiscount: number;
  promotionCode?: string;
  promotionName?: string;
  promotionId?: string;
  finalTotal: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  hasPromotionApplied: boolean;
}

// Helper function to calculate shipping
function calculateShipping(
  subtotal: number,
  deliveryMethod: string = "standard"
): number {
  if (deliveryMethod === "pickup") return 0;
  if (subtotal >= 25) return 0; // Free shipping over $25
  return deliveryMethod === "express" ? 9.99 : 5.99;
}

// Helper function to calculate tax
function calculateTax(amount: number): number {
  return Math.round(amount * 0.08 * 100) / 100; // 8% tax
}

// Enhanced serialization function
const serializeCart = (cart: any): CartWithPromotion | null => {
  if (!cart) return null;

  // Calculate subtotal from items
  const subtotal =
    cart.items?.reduce(
      (sum: number, item: any) => sum + item.quantity * item.price,
      0
    ) || 0;

  // Get promotion discount
  const promotionDiscount = cart.promotionDiscount || 0;

  // Calculate final total after promotion
  const finalTotal = Math.max(0, subtotal - promotionDiscount);

  // Calculate shipping and tax
  const shippingAmount = calculateShipping(finalTotal);
  const taxAmount = calculateTax(finalTotal + shippingAmount);
  const totalAmount = finalTotal + shippingAmount + taxAmount;

  return {
    _id: cart._id?.toString() || "",
    items:
      cart.items?.map((item: any) => ({
        ...item,
        _id: item._id?.toString(),
        product: item.product
          ? {
              ...item.product,
              _id: item.product._id?.toString(),
              category: item.product.category
                ? {
                    ...item.product.category,
                    _id: item.product.category._id?.toString(),
                  }
                : null,
            }
          : null,
      })) || [],
    subtotal,
    promotionDiscount,
    promotionCode: cart.promotionCode,
    promotionName: cart.promotionName,
    promotionId: cart.promotionId?.toString(),
    finalTotal,
    shippingAmount,
    taxAmount,
    totalAmount,
    hasPromotionApplied: !!(cart.promotionCode && promotionDiscount > 0),
  };
};

// Helper function to get current user and cart
async function getUserAndCart() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User must be authenticated");
  }

  await connectToDatabase();

  let cart = await Cart.findOne({ clerkUserId: userId });
  if (!cart) {
    cart = new Cart({
      clerkUserId: userId,
      items: [],
      promotionDiscount: 0,
    });
    await cart.save();
  }

  return { userId, cart };
}

// Add item to cart
export async function addToCart(
  productId: string,
  quantity: number
): Promise<{
  success: boolean;
  cart?: CartWithPromotion;
  error?: string;
}> {
  try {
    const validatedData = addToCartSchema.parse({ productId, quantity });
    const { cart } = await getUserAndCart();

    const product = await Product.findById(validatedData.productId);
    if (!product || !product.isActive) {
      return {
        success: false,
        error: "Product not found or unavailable",
      };
    }

    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.product.toString() === validatedData.productId
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += validatedData.quantity;
      cart.items[existingItemIndex].price = product.price;
      // Store original price for comparison
      if (!cart.items[existingItemIndex].originalPrice) {
        cart.items[existingItemIndex].originalPrice =
          product.compareAtPrice || product.price;
      }
    } else {
      cart.items.push({
        product: new mongoose.Types.ObjectId(validatedData.productId),
        quantity: validatedData.quantity,
        price: product.price,
        originalPrice: product.compareAtPrice || product.price,
      });
    }

    // Revalidate promotion if one is applied
    if (cart.promotionCode) {
      const validation = await validatePromotionForCart(cart);
      if (!validation.isValid) {
        // Remove invalid promotion
        cart.promotionCode = undefined;
        cart.promotionDiscount = 0;
        cart.promotionName = undefined;
        cart.promotionId = undefined;
      } else {
        cart.promotionDiscount = validation.discountAmount || 0;
      }
    }

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name slug price images category isActive compareAtPrice",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    console.log("✅ Item added to cart successfully");
    revalidatePath("/cart");

    return {
      success: true,
      cart: serializeCart(cart.toObject()) ?? undefined,
    };
  } catch (error) {
    console.error("❌ Error adding to cart:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((err) => err.message).join(", "),
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Update cart item quantity
export async function updateCartItem(
  productId: string,
  quantity: number
): Promise<{
  success: boolean;
  cart?: CartWithPromotion;
  error?: string;
}> {
  try {
    const validatedData = updateCartItemSchema.parse({ productId, quantity });
    const { cart } = await getUserAndCart();

    if (validatedData.quantity === 0) {
      cart.items = cart.items.filter(
        (item: any) => item.product.toString() !== validatedData.productId
      );
    } else {
      const existingItemIndex = cart.items.findIndex(
        (item: any) => item.product.toString() === validatedData.productId
      );

      if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity = validatedData.quantity;
      } else {
        return { success: false, error: "Item not found in cart" };
      }
    }

    // Revalidate promotion if one is applied
    if (cart.promotionCode) {
      const validation = await validatePromotionForCart(cart);
      if (!validation.isValid) {
        cart.promotionCode = undefined;
        cart.promotionDiscount = 0;
        cart.promotionName = undefined;
        cart.promotionId = undefined;
      } else {
        cart.promotionDiscount = validation.discountAmount || 0;
      }
    }

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name slug price images category isActive compareAtPrice",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    console.log("✅ Cart item updated successfully");
    revalidatePath("/cart");

    return {
      success: true,
      cart: serializeCart(cart.toObject()) ?? undefined,
    };
  } catch (error) {
    console.error("❌ Error updating cart item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Remove item from cart
export async function removeFromCart(productId: string): Promise<{
  success: boolean;
  cart?: CartWithPromotion;
  error?: string;
}> {
  try {
    const { cart } = await getUserAndCart();

    cart.items = cart.items.filter(
      (item: any) => item.product.toString() !== productId
    );

    // Revalidate promotion if one is applied
    if (cart.promotionCode) {
      const validation = await validatePromotionForCart(cart);
      if (!validation.isValid) {
        cart.promotionCode = undefined;
        cart.promotionDiscount = 0;
        cart.promotionName = undefined;
        cart.promotionId = undefined;
      } else {
        cart.promotionDiscount = validation.discountAmount || 0;
      }
    }

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name slug price images category isActive compareAtPrice",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    console.log("✅ Item removed from cart successfully");
    revalidatePath("/cart");

    return {
      success: true,
      cart: serializeCart(cart.toObject()) ?? undefined,
    };
  } catch (error) {
    console.error("❌ Error removing from cart:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Get cart contents
export async function getCart(): Promise<{
  success: boolean;
  cart?: CartWithPromotion;
  error?: string;
}> {
  try {
    const { cart } = await getUserAndCart();

    await cart.populate({
      path: "items.product",
      select: "name slug price images category isActive compareAtPrice",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    // Filter out inactive products
    const originalItemCount = cart.items.length;
    cart.items = cart.items.filter((item: any) => item.product?.isActive);

    // If items were removed, revalidate promotion
    if (cart.items.length !== originalItemCount && cart.promotionCode) {
      const validation = await validatePromotionForCart(cart);
      if (!validation.isValid) {
        cart.promotionCode = undefined;
        cart.promotionDiscount = 0;
        cart.promotionName = undefined;
        cart.promotionId = undefined;
      } else {
        cart.promotionDiscount = validation.discountAmount || 0;
      }
    }

    if (cart.isModified()) {
      await cart.save();
    }

    return {
      success: true,
      cart: serializeCart(cart.toObject()) ?? undefined,
    };
  } catch (error) {
    console.error("❌ Error getting cart:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Clear cart
export async function clearCart(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { cart } = await getUserAndCart();

    cart.items = [];
    cart.promotionCode = undefined;
    cart.promotionDiscount = 0;
    cart.promotionName = undefined;
    cart.promotionId = undefined;

    await cart.save();

    console.log("✅ Cart cleared successfully");
    revalidatePath("/cart");

    return { success: true };
  } catch (error) {
    console.error("❌ Error clearing cart:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// PROMOTION FUNCTIONS

// Validate promotion code for current cart
export async function validatePromotionCode(code: string): Promise<{
  isValid: boolean;
  promotion?: any;
  discountAmount?: number;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { isValid: false, error: "Authentication required" };
    }

    const { cart } = await getUserAndCart();
    await cart.populate({
      path: "items.product",
      select: "name price category compareAtPrice promotionEligible",
      populate: { path: "category", select: "_id name" },
    });

    if (!cart || cart.items.length === 0) {
      return { isValid: false, error: "Your cart is empty" };
    }

    const validation = await validatePromotionForCart(cart, code);
    return validation;
  } catch (error) {
    console.error("❌ Error validating promotion code:", error);
    return { isValid: false, error: "Failed to validate promotion code" };
  }
}

// Apply promotion to cart
export async function applyPromotionToCart(code: string): Promise<{
  success: boolean;
  cart?: CartWithPromotion;
  error?: string;
}> {
  try {
    console.log(`🎫 Applying promotion code: ${code}`);

    const validation = await validatePromotionCode(code);
    if (!validation.isValid) {
      console.log(`❌ Promotion validation failed: ${validation.error}`);
      return { success: false, error: validation.error };
    }

    const { cart } = await getUserAndCart();

    cart.promotionCode = code.toUpperCase();
    cart.promotionDiscount = validation.discountAmount || 0;
    cart.promotionName = validation.promotion?.name;
    cart.promotionId = validation.promotion?._id;

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name slug price images category compareAtPrice",
      populate: { path: "category", select: "name slug" },
    });

    console.log(
      `✅ Applied promotion ${code} with discount $${validation.discountAmount}`
    );
    revalidatePath("/cart");

    return {
      success: true,
      cart: serializeCart(cart.toObject()) ?? undefined,
    };
  } catch (error) {
    console.error("❌ Error applying promotion to cart:", error);
    return { success: false, error: "Failed to apply promotion" };
  }
}

// Remove promotion from cart
export async function removePromotionFromCart(): Promise<{
  success: boolean;
  cart?: CartWithPromotion;
  error?: string;
}> {
  try {
    const { cart } = await getUserAndCart();

    const wasApplied = cart.promotionCode;

    cart.promotionCode = undefined;
    cart.promotionDiscount = 0;
    cart.promotionName = undefined;
    cart.promotionId = undefined;

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name slug price images category compareAtPrice",
      populate: { path: "category", select: "name slug" },
    });

    if (wasApplied) {
      console.log(`✅ Removed promotion ${wasApplied} from cart`);
    }

    revalidatePath("/cart");

    return {
      success: true,
      cart: serializeCart(cart.toObject()) ?? undefined,
    };
  } catch (error) {
    console.error("❌ Error removing promotion from cart:", error);
    return { success: false, error: "Failed to remove promotion" };
  }
}

// Helper function to validate promotion for a specific cart
async function validatePromotionForCart(
  cart: any,
  code?: string
): Promise<{
  isValid: boolean;
  promotion?: any;
  discountAmount?: number;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    const promotionCode = code || cart.promotionCode;

    if (!promotionCode) {
      return { isValid: false, error: "No promotion code provided" };
    }

    await connectToDatabase();

    console.log(`🔍 Validating promotion: ${promotionCode}`);

    const promotion = await Promotion.findOne({
      "codes.code": promotionCode.toUpperCase(),
      isActive: true,
    }).populate([
      { path: "targetCategories", select: "_id name" },
      { path: "targetProducts", select: "_id name" },
      { path: "excludedCategories", select: "_id name" },
      { path: "excludedProducts", select: "_id name" },
    ]);

    if (!promotion) {
      console.log(`❌ Promotion not found: ${promotionCode}`);
      return { isValid: false, error: "Invalid promotion code" };
    }

    const codeObj = promotion.codes.find(
      (c: any) => c.code === promotionCode.toUpperCase()
    );
    if (!codeObj || !codeObj.isActive) {
      console.log(`❌ Promotion code inactive: ${promotionCode}`);
      return { isValid: false, error: "Promotion code is not active" };
    }

    const now = new Date();
    if (promotion.startsAt && promotion.startsAt > now) {
      return { isValid: false, error: "Promotion has not started yet" };
    }

    if (promotion.endsAt && promotion.endsAt < now) {
      return { isValid: false, error: "Promotion has expired" };
    }

    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      return { isValid: false, error: "Promotion usage limit exceeded" };
    }

    if (codeObj.usageLimit && codeObj.usedCount >= codeObj.usageLimit) {
      return { isValid: false, error: "Promotion code usage limit exceeded" };
    }

    // Check customer usage limits
    if (userId && promotion.usageLimitPerCustomer) {
      const user = await User.findOne({ clerkId: userId });
      if (user) {
        const customerUsage = await CustomerPromotionUsage.countDocuments({
          user: user._id,
          promotion: promotion._id,
        });
        if (customerUsage >= promotion.usageLimitPerCustomer) {
          return {
            isValid: false,
            error: "You have reached the usage limit for this promotion",
          };
        }
      }
    }

    const cartSubtotal = cart.items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.price,
      0
    );

    console.log(`💰 Cart subtotal: $${cartSubtotal}`);

    if (
      promotion.minimumPurchaseAmount &&
      cartSubtotal < promotion.minimumPurchaseAmount
    ) {
      return {
        isValid: false,
        error: `Minimum purchase amount of $${promotion.minimumPurchaseAmount} required`,
      };
    }

    if (promotion.minimumQuantity) {
      const totalQuantity = cart.items.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
      );
      if (totalQuantity < promotion.minimumQuantity) {
        return {
          isValid: false,
          error: `Minimum ${promotion.minimumQuantity} items required`,
        };
      }
    }

    const discountCalculation = calculatePromotionDiscount(
      promotion,
      cart.items
    );

    console.log(
      `🎯 Calculated discount: $${discountCalculation.discountAmount}`
    );

    if (discountCalculation.discountAmount === 0) {
      return {
        isValid: false,
        error: "This promotion does not apply to any items in your cart",
      };
    }

    return {
      isValid: true,
      promotion: promotion.toObject(),
      discountAmount: discountCalculation.discountAmount,
    };
  } catch (error) {
    console.error("❌ Error validating promotion for cart:", error);
    return { isValid: false, error: "Failed to validate promotion" };
  }
}

// Calculate promotion discount
function calculatePromotionDiscount(
  promotion: any,
  cartItems: any[]
): { discountAmount: number; applicableItems: string[] } {
  console.log(
    `🧮 Calculating discount for ${promotion.name} (${promotion.discountType})`
  );

  let discountAmount = 0;
  const applicableItems: string[] = [];

  const eligibleItems = cartItems.filter((item) => {
    const product = item.product;

    // Skip if product is not promotion eligible
    if (product.promotionEligible === false) {
      console.log(`❌ Product ${product.name} not promotion eligible`);
      return false;
    }

    // Check exclusions
    if (
      promotion.excludedProducts.some(
        (id: any) => id.toString() === product._id.toString()
      )
    ) {
      console.log(`❌ Product ${product.name} excluded`);
      return false;
    }

    if (
      promotion.excludedCategories.some(
        (id: any) => id.toString() === product.category?._id.toString()
      )
    ) {
      console.log(`❌ Category ${product.category?.name} excluded`);
      return false;
    }

    if (
      promotion.excludeDiscountedItems &&
      product.compareAtPrice &&
      product.compareAtPrice > product.price
    ) {
      console.log(`❌ Product ${product.name} already discounted`);
      return false;
    }

    // Check scope
    switch (promotion.applicabilityScope) {
      case "entire_store":
        console.log(`✅ Product ${product.name} eligible (entire store)`);
        return true;
      case "categories":
        const categoryMatch = promotion.targetCategories.some(
          (id: any) => id.toString() === product.category?._id.toString()
        );
        console.log(
          `${categoryMatch ? "✅" : "❌"} Product ${product.name} category match: ${categoryMatch}`
        );
        return categoryMatch;
      case "products":
        const productMatch = promotion.targetProducts.some(
          (id: any) => id.toString() === product._id.toString()
        );
        console.log(
          `${productMatch ? "✅" : "❌"} Product ${product.name} direct match: ${productMatch}`
        );
        return productMatch;
      default:
        console.log(`❌ Unknown scope: ${promotion.applicabilityScope}`);
        return false;
    }
  });

  console.log(`📦 Eligible items: ${eligibleItems.length}/${cartItems.length}`);

  if (eligibleItems.length === 0) {
    return { discountAmount: 0, applicableItems: [] };
  }

  switch (promotion.discountType) {
    case "percentage":
      const eligibleSubtotal = eligibleItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
      discountAmount = (eligibleSubtotal * promotion.discountValue) / 100;
      applicableItems.push(
        ...eligibleItems.map((item) => item.product._id.toString())
      );
      console.log(
        `💯 Percentage discount: ${promotion.discountValue}% of $${eligibleSubtotal} = $${discountAmount}`
      );
      break;

    case "fixed_amount":
      discountAmount = promotion.discountValue;
      applicableItems.push(
        ...eligibleItems.map((item) => item.product._id.toString())
      );
      console.log(`💵 Fixed amount discount: $${discountAmount}`);
      break;

    case "buy_x_get_y":
      if (promotion.buyXGetYConfig) {
        const { buyQuantity, getQuantity, getDiscountPercentage } =
          promotion.buyXGetYConfig;
        const sortedItems = [...eligibleItems].sort(
          (a, b) => a.price - b.price
        );

        const totalEligibleQty = eligibleItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const setsEligible = Math.floor(totalEligibleQty / buyQuantity);
        const discountableQty = Math.min(
          setsEligible * getQuantity,
          totalEligibleQty
        );

        console.log(
          `🎁 Buy ${buyQuantity} get ${getQuantity}: ${setsEligible} sets eligible, ${discountableQty} items to discount`
        );

        let remainingDiscountQty = discountableQty;
        for (const item of sortedItems) {
          if (remainingDiscountQty <= 0) break;
          const qtyToDiscount = Math.min(item.quantity, remainingDiscountQty);
          const itemDiscount =
            (item.price * qtyToDiscount * getDiscountPercentage) / 100;
          discountAmount += itemDiscount;
          applicableItems.push(item.product._id.toString());
          remainingDiscountQty -= qtyToDiscount;
          console.log(
            `🏷️ Applied ${getDiscountPercentage}% discount to ${qtyToDiscount}x ${item.product.name}: $${itemDiscount}`
          );
        }
      }
      break;
  }

  const finalDiscount = Math.round(discountAmount * 100) / 100;
  console.log(`🎉 Final discount amount: $${finalDiscount}`);

  return {
    discountAmount: finalDiscount,
    applicableItems,
  };
}

// Get cart stats with promotions
export async function getCartStats(): Promise<{
  success: boolean;
  stats?: {
    totalItems: number;
    subtotal: number;
    promotionDiscount: number;
    finalTotal: number;
    itemCount: number;
  };
  error?: string;
}> {
  try {
    const cartResult = await getCart();

    if (!cartResult.success || !cartResult.cart) {
      return {
        success: true,
        stats: {
          totalItems: 0,
          subtotal: 0,
          promotionDiscount: 0,
          finalTotal: 0,
          itemCount: 0,
        },
      };
    }

    const cart = cartResult.cart;
    const totalItems = cart.items.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0
    );

    return {
      success: true,
      stats: {
        totalItems,
        subtotal: cart.subtotal,
        promotionDiscount: cart.promotionDiscount,
        finalTotal: cart.finalTotal,
        itemCount: cart.items.length,
      },
    };
  } catch (error) {
    console.error("❌ Error getting cart stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Record promotion usage (call this after successful order)
export async function recordPromotionUsage(
  promotionCode: string,
  orderId: string,
  discountAmount: number,
  orderTotal: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const promotion = await Promotion.findOne({
      "codes.code": promotionCode.toUpperCase(),
    });

    if (!promotion) {
      return { success: false, error: "Promotion not found" };
    }

    // Record usage
    const usage = new CustomerPromotionUsage({
      user: user._id,
      promotion: promotion._id,
      customerEmail: user.email,
      code: promotionCode.toUpperCase(),
      order: orderId,
      discountAmount,
      orderTotal,
      metadata: {
        originalTotal: orderTotal + discountAmount,
        finalTotal: orderTotal,
      },
    });

    await usage.save();

    // Update promotion counters
    await Promotion.findByIdAndUpdate(promotion._id, {
      $inc: {
        usedCount: 1,
        totalRedemptions: 1,
        totalRevenue: discountAmount,
      },
    });

    // Update specific code counter
    await Promotion.findOneAndUpdate(
      {
        _id: promotion._id,
        "codes.code": promotionCode.toUpperCase(),
      },
      {
        $inc: { "codes.$.usedCount": 1 },
      }
    );

    console.log(`✅ Recorded promotion usage: ${promotionCode}`);

    return { success: true };
  } catch (error) {
    console.error("❌ Error recording promotion usage:", error);
    return { success: false, error: "Failed to record promotion usage" };
  }
}
