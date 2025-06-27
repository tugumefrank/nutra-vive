"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../db";
import {
  User,
  UserMembership,
  Product,
  Order,
  IUserMembership,
  IUser,
  IOrder
} from "../db/models";
import mongoose from "mongoose";

interface OrderItem {
  product: string | any;
  productName: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  totalPrice: number;
  appliedDiscount?: number;
}

interface MembershipUsageUpdate {
  categoryId: string;
  categoryName: string;
  quantityUsed: number;
}

export async function deductMembershipUsageOnOrderConfirmation(
  orderId: string,
  skipAuth: boolean = false
): Promise<{
  success: boolean;
  deductedItems?: MembershipUsageUpdate[];
  error?: string;
}> {
  try {
    // Only check auth if not skipping (for internal calls)
    let userId = null;
    if (!skipAuth) {
      const authResult = await auth();
      userId = authResult.userId;
      if (!userId) {
        return {
          success: false,
          error: "Authentication required",
        };
      }
    }

    await connectToDatabase();

    // Get the order with populated product data
    const order = await Order.findById(orderId)
      .populate({
        path: "items.product",
        select: "name category",
        populate: {
          path: "category",
          select: "name _id"
        }
      })
      .lean() as IOrder;

    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    console.log("🔍 Processing membership usage deduction for order:", order.orderNumber);

    // Get the user (try from order first, then from auth)
    let user: IUser | null = null;
    
    if (order.user) {
      user = await User.findById(order.user);
    } else if (userId) {
      user = await User.findOne({ clerkId: userId });
    }

    if (!user) {
      console.log("⚠️ No user found for order, skipping membership deduction");
      return {
        success: true,
        deductedItems: [],
      };
    }

    // Get the user's active membership
    const userMembership = await UserMembership.findOne({
      user: user._id,
      status: "active",
    }).populate("membership") as IUserMembership & { membership: any };

    if (!userMembership || !userMembership.membership) {
      console.log("⚠️ No active membership found for user, skipping deduction");
      return {
        success: true,
        deductedItems: [],
      };
    }

    console.log("📋 User membership found:", {
      tier: userMembership.membership.tier,
      userId: user._id.toString(),
      orderTotal: order.totalAmount
    });

    // Track what we need to deduct
    const deductionMap = new Map<string, MembershipUsageUpdate>();

    // Process each order item
    for (const orderItem of order.items) {
      // Only deduct for free items (membership price = 0) or items with membership discount
      const isFreeFromMembership = orderItem.price === 0 || orderItem.appliedDiscount > 0;
      
      if (!isFreeFromMembership) {
        console.log(`⏭️ Skipping paid item: ${orderItem.productName}`);
        continue;
      }

      // Get the product category
      let categoryId: string;
      let categoryName: string;

      if (orderItem.product && typeof orderItem.product === 'object' && orderItem.product.category) {
        categoryId = orderItem.product.category._id.toString();
        categoryName = orderItem.product.category.name;
      } else {
        // Fallback: get product from database
        const product = await Product.findById(orderItem.product)
          .populate("category", "name _id")
          .lean();
        
        if (!product || !product.category) {
          console.warn(`⚠️ Product category not found for ${orderItem.productName}`);
          continue;
        }

        categoryId = product.category._id.toString();
        categoryName = product.category.name;
      }

      // Check if this category is in the user's membership allocations
      const userUsage = userMembership.productUsage.find(
        (usage) => usage.categoryId.toString() === categoryId
      );

      if (!userUsage) {
        console.warn(`⚠️ Category ${categoryName} not found in user's membership allocations`);
        continue;
      }

      // Accumulate quantities by category
      const existingDeduction = deductionMap.get(categoryId);
      if (existingDeduction) {
        existingDeduction.quantityUsed += orderItem.quantity;
      } else {
        deductionMap.set(categoryId, {
          categoryId,
          categoryName,
          quantityUsed: orderItem.quantity,
        });
      }

      console.log(`📦 Will deduct ${orderItem.quantity} of ${orderItem.productName} from ${categoryName} allocation`);
    }

    // Apply the deductions
    const deductedItems: MembershipUsageUpdate[] = [];
    
    for (const [categoryId, deduction] of deductionMap) {
      try {
        // Find the user's usage for this category
        const usageIndex = userMembership.productUsage.findIndex(
          (usage) => usage.categoryId.toString() === categoryId
        );

        if (usageIndex === -1) {
          console.warn(`⚠️ Usage tracking not found for category ${deduction.categoryName}`);
          continue;
        }

        const currentUsage = userMembership.productUsage[usageIndex];
        const newUsedQuantity = currentUsage.usedQuantity + deduction.quantityUsed;
        const newAvailableQuantity = Math.max(0, currentUsage.allocatedQuantity - newUsedQuantity);

        // Update the user's membership usage
        await UserMembership.findByIdAndUpdate(
          userMembership._id,
          {
            $set: {
              [`productUsage.${usageIndex}.usedQuantity`]: newUsedQuantity,
              [`productUsage.${usageIndex}.availableQuantity`]: newAvailableQuantity,
              [`productUsage.${usageIndex}.lastUsed`]: new Date(),
            },
          }
        );

        deductedItems.push(deduction);

        console.log(`✅ Deducted ${deduction.quantityUsed} from ${deduction.categoryName}:`, {
          previousUsed: currentUsage.usedQuantity,
          newUsed: newUsedQuantity,
          previousAvailable: currentUsage.availableQuantity,
          newAvailable: newAvailableQuantity,
          allocated: currentUsage.allocatedQuantity
        });

      } catch (updateError) {
        console.error(`❌ Failed to update usage for category ${deduction.categoryName}:`, updateError);
        // Continue with other categories even if one fails
      }
    }

    console.log(`✅ Successfully deducted membership usage for order ${order.orderNumber}:`, {
      totalCategories: deductedItems.length,
      deductedItems: deductedItems.map(item => `${item.quantityUsed} ${item.categoryName}`).join(", ")
    });

    // Revalidate paths that display membership data to refresh the UI
    revalidatePath("/shop");
    revalidatePath("/account/memberships");
    revalidatePath("/products");

    return {
      success: true,
      deductedItems,
    };

  } catch (error) {
    console.error("❌ Error deducting membership usage:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to deduct membership usage",
    };
  }
}

export async function restoreMembershipUsageOnOrderCancellation(
  orderId: string
): Promise<{
  success: boolean;
  restoredItems?: MembershipUsageUpdate[];
  error?: string;
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    await connectToDatabase();

    // Get the order with populated product data
    const order = await Order.findById(orderId)
      .populate({
        path: "items.product",
        select: "name category",
        populate: {
          path: "category",
          select: "name _id"
        }
      })
      .lean() as IOrder;

    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    console.log("🔄 Restoring membership usage for cancelled order:", order.orderNumber);

    // Get the user
    let user: IUser | null = null;
    
    if (order.user) {
      user = await User.findById(order.user);
    } else {
      user = await User.findOne({ clerkId: userId });
    }

    if (!user) {
      return {
        success: true,
        restoredItems: [],
      };
    }

    // Get the user's active membership
    const userMembership = await UserMembership.findOne({
      user: user._id,
      status: "active",
    }).populate("membership") as IUserMembership & { membership: any };

    if (!userMembership) {
      return {
        success: true,
        restoredItems: [],
      };
    }

    // Track what we need to restore
    const restorationMap = new Map<string, MembershipUsageUpdate>();

    // Process each order item (similar logic to deduction)
    for (const orderItem of order.items) {
      const isFreeFromMembership = orderItem.price === 0 || orderItem.appliedDiscount > 0;
      
      if (!isFreeFromMembership) {
        continue;
      }

      let categoryId: string;
      let categoryName: string;

      if (orderItem.product && typeof orderItem.product === 'object' && orderItem.product.category) {
        categoryId = orderItem.product.category._id.toString();
        categoryName = orderItem.product.category.name;
      } else {
        const product = await Product.findById(orderItem.product)
          .populate("category", "name _id")
          .lean();
        
        if (!product || !product.category) {
          continue;
        }

        categoryId = product.category._id.toString();
        categoryName = product.category.name;
      }

      // Accumulate quantities by category
      const existingRestoration = restorationMap.get(categoryId);
      if (existingRestoration) {
        existingRestoration.quantityUsed += orderItem.quantity;
      } else {
        restorationMap.set(categoryId, {
          categoryId,
          categoryName,
          quantityUsed: orderItem.quantity,
        });
      }
    }

    // Apply the restorations
    const restoredItems: MembershipUsageUpdate[] = [];
    
    for (const [categoryId, restoration] of restorationMap) {
      try {
        const usageIndex = userMembership.productUsage.findIndex(
          (usage) => usage.categoryId.toString() === categoryId
        );

        if (usageIndex === -1) {
          continue;
        }

        const currentUsage = userMembership.productUsage[usageIndex];
        const newUsedQuantity = Math.max(0, currentUsage.usedQuantity - restoration.quantityUsed);
        const newAvailableQuantity = Math.min(
          currentUsage.allocatedQuantity,
          currentUsage.availableQuantity + restoration.quantityUsed
        );

        // Update the user's membership usage
        await UserMembership.findByIdAndUpdate(
          userMembership._id,
          {
            $set: {
              [`productUsage.${usageIndex}.usedQuantity`]: newUsedQuantity,
              [`productUsage.${usageIndex}.availableQuantity`]: newAvailableQuantity,
            },
          }
        );

        restoredItems.push(restoration);

        console.log(`✅ Restored ${restoration.quantityUsed} to ${restoration.categoryName}:`, {
          previousUsed: currentUsage.usedQuantity,
          newUsed: newUsedQuantity,
          previousAvailable: currentUsage.availableQuantity,
          newAvailable: newAvailableQuantity
        });

      } catch (updateError) {
        console.error(`❌ Failed to restore usage for category ${restoration.categoryName}:`, updateError);
      }
    }

    console.log(`✅ Successfully restored membership usage for cancelled order ${order.orderNumber}`);

    return {
      success: true,
      restoredItems,
    };

  } catch (error) {
    console.error("❌ Error restoring membership usage:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to restore membership usage",
    };
  }
}