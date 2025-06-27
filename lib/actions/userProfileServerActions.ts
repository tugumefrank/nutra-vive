"use server";

import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import { UserProfile, User } from "@/lib/db/models";
import { revalidatePath } from "next/cache";

// Get user profile with saved addresses and preferences
export async function getUserProfile() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    await connectToDatabase();

    // Get user from Clerk ID
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Get or create user profile
    let userProfile = await UserProfile.findOne({ user: user._id });
    
    if (!userProfile) {
      // Create default profile if it doesn't exist
      userProfile = new UserProfile({
        user: user._id,
        savedAddresses: [],
        preferredDeliveryMethod: "standard",
        marketingOptIn: false,
        smsNotifications: true,
        emailNotifications: true,
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
      });
      await userProfile.save();
    }

    return {
      success: true,
      profile: {
        _id: userProfile._id.toString(),
        defaultShippingAddress: userProfile.defaultShippingAddress,
        savedAddresses: userProfile.savedAddresses,
        preferredDeliveryMethod: userProfile.preferredDeliveryMethod,
        deliveryInstructions: userProfile.deliveryInstructions,
        marketingOptIn: userProfile.marketingOptIn,
        smsNotifications: userProfile.smsNotifications,
        emailNotifications: userProfile.emailNotifications,
        totalOrders: userProfile.totalOrders,
        totalSpent: userProfile.totalSpent,
        averageOrderValue: userProfile.averageOrderValue,
        lastOrderDate: userProfile.lastOrderDate,
      },
      user: {
        _id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },
    };
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { success: false, error: "Failed to get user profile" };
  }
}

// Save user checkout preferences (address, delivery method, etc.)
export async function saveCheckoutPreferences(data: {
  address?: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  deliveryMethod?: "standard" | "express" | "pickup";
  deliveryInstructions?: string;
  marketingOptIn?: boolean;
  setAsDefault?: boolean;
  addressLabel?: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return { success: false, error: "User not found" };
    }

    let userProfile = await UserProfile.findOne({ user: user._id });
    if (!userProfile) {
      userProfile = new UserProfile({ user: user._id });
    }

    // Update delivery preferences
    if (data.deliveryMethod) {
      userProfile.preferredDeliveryMethod = data.deliveryMethod;
    }
    if (data.deliveryInstructions !== undefined) {
      userProfile.deliveryInstructions = data.deliveryInstructions;
    }
    if (data.marketingOptIn !== undefined) {
      userProfile.marketingOptIn = data.marketingOptIn;
    }

    // Handle address updates
    if (data.address) {
      if (data.setAsDefault) {
        // Set as default shipping address
        userProfile.defaultShippingAddress = data.address;
      }

      // Add to saved addresses if it's new
      const addressExists = userProfile.savedAddresses.some(
        (addr) =>
          addr.address1 === data.address!.address1 &&
          addr.city === data.address!.city &&
          addr.zipCode === data.address!.zipCode
      );

      if (!addressExists) {
        const newAddressId = `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        userProfile.savedAddresses.push({
          id: newAddressId,
          label: data.addressLabel || "Home",
          ...data.address,
          isDefault: data.setAsDefault || false,
          createdAt: new Date(),
        });

        // If this is set as default, make sure other addresses are not default
        if (data.setAsDefault) {
          userProfile.savedAddresses.forEach((addr) => {
            if (addr.id !== newAddressId) {
              addr.isDefault = false;
            }
          });
        }
      }
    }

    await userProfile.save();

    revalidatePath("/checkout");
    return { success: true, profile: userProfile };
  } catch (error) {
    console.error("Error saving checkout preferences:", error);
    return { success: false, error: "Failed to save preferences" };
  }
}

// Update user basic info (name, phone)
export async function updateUserInfo(data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    await connectToDatabase();

    const updateData: any = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.phone !== undefined) updateData.phone = data.phone;

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      updateData,
      { new: true }
    );

    if (!user) {
      return { success: false, error: "User not found" };
    }

    revalidatePath("/checkout");
    return { success: true, user };
  } catch (error) {
    console.error("Error updating user info:", error);
    return { success: false, error: "Failed to update user info" };
  }
}

// Delete saved address
export async function deleteSavedAddress(addressId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const userProfile = await UserProfile.findOne({ user: user._id });
    if (!userProfile) {
      return { success: false, error: "User profile not found" };
    }

    userProfile.savedAddresses = userProfile.savedAddresses.filter(
      (addr) => addr.id !== addressId
    );

    await userProfile.save();

    revalidatePath("/checkout");
    return { success: true };
  } catch (error) {
    console.error("Error deleting saved address:", error);
    return { success: false, error: "Failed to delete address" };
  }
}

// Update order statistics after successful order
export async function updateOrderStats(orderData: {
  totalAmount: number;
  orderDate: Date;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const userProfile = await UserProfile.findOne({ user: user._id });
    if (userProfile) {
      userProfile.totalOrders += 1;
      userProfile.totalSpent += orderData.totalAmount;
      userProfile.averageOrderValue = userProfile.totalSpent / userProfile.totalOrders;
      userProfile.lastOrderDate = orderData.orderDate;
      
      await userProfile.save();
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating order stats:", error);
    return { success: false, error: "Failed to update order stats" };
  }
}