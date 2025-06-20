"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectToDatabase } from "../db";
import { Cart, Product } from "../db/models";

// Validation Schemas
const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

const updateCartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(0, "Quantity cannot be negative"),
});

// Helper function to serialize cart data for client components
const serializeCart = (cart: any) => {
  if (!cart) return null;

  return {
    ...cart,
    _id: cart._id?.toString() || null,
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
  };
};

// Helper function to get current user and cart
async function getUserAndCart() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User must be authenticated");
  }

  await connectToDatabase();

  // Use clerkUserId field to avoid conflicts with existing ObjectId user field
  let cart = await Cart.findOne({ clerkUserId: userId });
  if (!cart) {
    cart = new Cart({
      clerkUserId: userId, // Use new field name
      items: [],
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
  cart?: any;
  error?: string;
}> {
  try {
    // Validate input
    const validatedData = addToCartSchema.parse({
      productId,
      quantity,
    });

    // Get user and cart (throws if not authenticated)
    const { cart } = await getUserAndCart();

    // Verify product exists and is active
    const product = await Product.findById(validatedData.productId);
    if (!product || !product.isActive) {
      return {
        success: false,
        error: "Product not found or unavailable",
      };
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.product.toString() === validatedData.productId
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += validatedData.quantity;
      cart.items[existingItemIndex].price = product.price;
    } else {
      // Add new item to cart
      cart.items.push({
        product: validatedData.productId,
        quantity: validatedData.quantity,
        price: product.price,
      });
    }

    await cart.save();

    // Populate cart with product details for response
    await cart.populate({
      path: "items.product",
      select: "name slug price images category",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    console.log("✅ Item added to cart successfully");

    revalidatePath("/cart");

    return {
      success: true,
      cart: serializeCart(cart.toObject()),
    };
  } catch (error) {
    console.error("❌ Error adding to cart:", error);

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ");

      return {
        success: false,
        error: `Validation failed: ${errorMessage}`,
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
  cart?: any;
  error?: string;
}> {
  try {
    // Validate input
    const validatedData = updateCartItemSchema.parse({
      productId,
      quantity,
    });

    // Get user and cart (throws if not authenticated)
    const { cart } = await getUserAndCart();

    if (validatedData.quantity === 0) {
      // Remove item from cart
      cart.items = cart.items.filter(
        (item: any) => item.product.toString() !== validatedData.productId
      );
    } else {
      // Update existing item quantity
      const existingItemIndex = cart.items.findIndex(
        (item: any) => item.product.toString() === validatedData.productId
      );

      if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity = validatedData.quantity;
      } else {
        return {
          success: false,
          error: "Item not found in cart",
        };
      }
    }

    await cart.save();

    // Populate cart with product details for response
    await cart.populate({
      path: "items.product",
      select: "name slug price images category",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    console.log("✅ Cart item updated successfully");

    revalidatePath("/cart");

    return {
      success: true,
      cart: serializeCart(cart.toObject()),
    };
  } catch (error) {
    console.error("❌ Error updating cart item:", error);

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ");

      return {
        success: false,
        error: `Validation failed: ${errorMessage}`,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Remove item from cart
export async function removeFromCart(productId: string): Promise<{
  success: boolean;
  cart?: any;
  error?: string;
}> {
  try {
    // Get user and cart (throws if not authenticated)
    const { cart } = await getUserAndCart();

    // Remove item from cart
    cart.items = cart.items.filter(
      (item: any) => item.product.toString() !== productId
    );

    await cart.save();

    // Populate cart with product details for response
    await cart.populate({
      path: "items.product",
      select: "name slug price images category",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    console.log("✅ Item removed from cart successfully");

    revalidatePath("/cart");

    return {
      success: true,
      cart: serializeCart(cart.toObject()),
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
  cart?: any;
  error?: string;
}> {
  try {
    // Get user and cart (throws if not authenticated)
    const { cart } = await getUserAndCart();

    // Populate cart with product details
    await cart.populate({
      path: "items.product",
      select: "name slug price images category isActive",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    // Filter out inactive products
    cart.items = cart.items.filter((item: any) => item.product?.isActive);

    // Save cart if items were filtered out
    if (cart.isModified()) {
      await cart.save();
    }

    return {
      success: true,
      cart: serializeCart(cart.toObject()),
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
    // Get user and cart (throws if not authenticated)
    const { cart } = await getUserAndCart();

    // Clear cart items
    cart.items = [];
    await cart.save();

    console.log("✅ Cart cleared successfully");

    revalidatePath("/cart");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Error clearing cart:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Get cart stats (total items, total price)
export async function getCartStats(): Promise<{
  success: boolean;
  stats?: {
    totalItems: number;
    totalPrice: number;
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
          totalPrice: 0,
          itemCount: 0,
        },
      };
    }

    const cart = cartResult.cart;
    const totalItems = cart.items.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0
    );
    const totalPrice = cart.items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.price,
      0
    );
    const itemCount = cart.items.length;

    return {
      success: true,
      stats: {
        totalItems,
        totalPrice,
        itemCount,
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
