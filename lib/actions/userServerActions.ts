"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { connectToDatabase } from "../db";
import { User, IUser } from "../db/models";
import mongoose from "mongoose";

// Validation Schemas
const createUserSchema = z.object({
  clerkId: z.string().min(1, "Clerk ID is required"),
  email: z.string().email("Valid email is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  imageUrl: z.string().optional(),
  username: z.string().optional(), // For webhook compatibility
  photo: z.string().optional(), // For webhook compatibility
});

const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  imageUrl: z.string().optional(),
  username: z.string().optional(), // For webhook compatibility
  photo: z.string().optional(), // For webhook compatibility
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type CreateUserData = z.infer<typeof createUserSchema>;
type UpdateUserData = z.infer<typeof updateUserSchema>;
type UpdateProfileData = z.infer<typeof updateProfileSchema>;

// Helper function to check admin access
async function checkAdminAuth() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  await connectToDatabase();
  const user = await User.findOne({ clerkId: userId });

  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  return user;
}

// Helper function to serialize user data
const serializeUser = (user: any): IUser => {
  if (!user) return user;

  return {
    ...user,
    _id: user._id.toString(),
  };
};

// Create User (for Clerk webhook)
export async function createUser(
  userData: CreateUserData
): Promise<{ success: boolean; user?: IUser; error?: string }> {
  try {
    await connectToDatabase();

    console.log("🔍 Creating user from webhook...");

    // Validate user data
    const validatedData = createUserSchema.parse(userData);

    // Check if user already exists
    const existingUser = await User.findOne({ clerkId: validatedData.clerkId });
    if (existingUser) {
      console.log("ℹ️ User already exists:", existingUser.email);
      return {
        success: true,
        user: serializeUser(existingUser.toObject()),
      };
    }

    // Create new user
    const newUser = new User({
      clerkId: validatedData.clerkId,
      email: validatedData.email,
      firstName: validatedData.firstName || "",
      lastName: validatedData.lastName || "",
      imageUrl: validatedData.imageUrl || validatedData.photo || "",
      role: "user", // Default role
    });

    await newUser.save();

    console.log("✅ User created successfully:", newUser.email);

    revalidatePath("/admin/users");

    return {
      success: true,
      user: serializeUser(newUser.toObject()),
    };
  } catch (error) {
    console.error("❌ Error creating user:", error);

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

// Update User (for Clerk webhook)
export async function updateUser(
  clerkId: string,
  userData: UpdateUserData
): Promise<{ success: boolean; user?: IUser; error?: string }> {
  try {
    await connectToDatabase();

    console.log("🔍 Updating user from webhook:", clerkId);

    // Validate user data
    const validatedData = updateUserSchema.parse(userData);

    // Find and update user
    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      {
        firstName: validatedData.firstName || "",
        lastName: validatedData.lastName || "",
        imageUrl: validatedData.imageUrl || validatedData.photo || "",
      },
      { new: true }
    );

    if (!updatedUser) {
      console.warn("⚠️ User not found for update:", clerkId);
      return {
        success: false,
        error: "User not found",
      };
    }

    console.log("✅ User updated successfully:", updatedUser.email);

    revalidatePath("/admin/users");

    return {
      success: true,
      user: serializeUser(updatedUser.toObject()),
    };
  } catch (error) {
    console.error("❌ Error updating user:", error);

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

// Delete User (for Clerk webhook)
export async function deleteUser(
  clerkId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();

    console.log("🗑️ Deleting user from webhook:", clerkId);

    const deletedUser = await User.findOneAndDelete({ clerkId });

    if (!deletedUser) {
      console.warn("⚠️ User not found for deletion:", clerkId);
      return {
        success: false,
        error: "User not found",
      };
    }

    // TODO: Handle cleanup of related data (orders, cart, favorites, etc.)
    // You might want to implement soft delete or data retention policies

    console.log("✅ User deleted successfully:", deletedUser.email);

    revalidatePath("/admin/users");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Get User by Clerk ID
export async function getUserByClerkId(clerkId: string): Promise<IUser | null> {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId }).lean();

    if (!user) {
      return null;
    }

    return serializeUser(user);
  } catch (error) {
    console.error("❌ Error fetching user by Clerk ID:", error);
    return null;
  }
}

// Get Current User
export async function getCurrentUser(): Promise<IUser | null> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return null;
    }

    return await getUserByClerkId(userId);
  } catch (error) {
    console.error("❌ Error fetching current user:", error);
    return null;
  }
}

// Update User Profile (for authenticated user)
export async function updateUserProfile(
  data: UpdateProfileData
): Promise<{ success: boolean; user?: IUser; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "User must be authenticated",
      };
    }

    await connectToDatabase();

    console.log("🔍 Updating user profile:", userId);

    // Validate profile data
    const validatedData = updateProfileSchema.parse(data);

    // Update user profile
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
      },
      { new: true }
    );

    if (!updatedUser) {
      return {
        success: false,
        error: "User not found",
      };
    }

    console.log("✅ User profile updated successfully:", updatedUser.email);

    revalidatePath("/profile");

    return {
      success: true,
      user: serializeUser(updatedUser.toObject()),
    };
  } catch (error) {
    console.error("❌ Error updating user profile:", error);

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

// Toggle User Role (Admin only)
export async function toggleUserRole(
  userId: string
): Promise<{ success: boolean; user?: IUser; error?: string }> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    console.log("🔍 Toggling user role:", userId);

    const user = await User.findById(userId);
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Toggle role between user and admin
    const newRole = user.role === "admin" ? "user" : "admin";

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true }
    );

    console.log(`✅ User role changed to ${newRole}:`, updatedUser?.email);

    revalidatePath("/admin/users");

    return {
      success: true,
      user: serializeUser(updatedUser?.toObject()),
    };
  } catch (error) {
    console.error("❌ Error toggling user role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Get Users with Filters (Admin only)
export async function getUsers(filters?: {
  role?: "user" | "admin";
  search?: string;
  sortBy?: "firstName" | "lastName" | "email" | "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}): Promise<{
  users: IUser[];
  total: number;
  totalPages: number;
  currentPage: number;
}> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const query: any = {};
    const sortOptions: any = {};

    // Apply filters
    if (filters?.role) {
      query.role = filters.role;
    }

    if (filters?.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: "i" } },
        { lastName: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } },
      ];
    }

    // Apply sorting
    const sortBy = filters?.sortBy || "createdAt";
    const sortOrder = filters?.sortOrder === "asc" ? 1 : -1;
    sortOptions[sortBy] = sortOrder;

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    // Execute queries
    const [users, total] = await Promise.all([
      User.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    console.log(`✅ Fetched ${users.length} users from database`);

    return {
      users: users.map((user) => serializeUser(user)),
      total,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return {
      users: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
}

// Get User Stats (Admin only)
export async function getUserStats(): Promise<{
  total: number;
  totalUsers: number;
  totalAdmins: number;
  recentUsers: number;
  activeUsers: number;
}> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [total, totalUsers, totalAdmins, recentUsers, activeUsers] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "user" }),
        User.countDocuments({ role: "admin" }),
        User.countDocuments({
          createdAt: { $gte: sevenDaysAgo },
        }),
        User.countDocuments({
          updatedAt: { $gte: thirtyDaysAgo },
        }),
      ]);

    console.log("✅ Fetched user stats:", {
      total,
      totalUsers,
      totalAdmins,
      recentUsers,
      activeUsers,
    });

    return {
      total,
      totalUsers,
      totalAdmins,
      recentUsers,
      activeUsers,
    };
  } catch (error) {
    console.error("❌ Error fetching user stats:", error);
    return {
      total: 0,
      totalUsers: 0,
      totalAdmins: 0,
      recentUsers: 0,
      activeUsers: 0,
    };
  }
}

// Get User by ID (Admin only)
export async function getUserById(id: string): Promise<IUser | null> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const user = await User.findById(id).lean();

    if (!user) {
      return null;
    }

    return serializeUser(user);
  } catch (error) {
    console.error("❌ Error fetching user by ID:", error);
    return null;
  }
}

// Bulk Delete Users (Admin only)
export async function bulkDeleteUsers(
  userIds: string[]
): Promise<{ success: boolean; deleted: number; error?: string }> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    console.log("🗑️ Bulk deleting users:", userIds.length);

    // Prevent deletion of current admin
    const { userId } = await auth();
    const currentUser = await User.findOne({ clerkId: userId });

    if (currentUser && userIds.includes(currentUser._id.toString())) {
      return {
        success: false,
        deleted: 0,
        error: "Cannot delete your own account",
      };
    }

    const result = await User.deleteMany({
      _id: { $in: userIds },
    });

    console.log(`✅ Bulk deleted ${result.deletedCount} users`);

    revalidatePath("/admin/users");

    return {
      success: true,
      deleted: result.deletedCount,
    };
  } catch (error) {
    console.error("❌ Error bulk deleting users:", error);
    return {
      success: false,
      deleted: 0,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Check if user is admin
export async function isUserAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return false;
    }

    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId });

    return user?.role === "admin";
  } catch (error) {
    console.error("❌ Error checking admin status:", error);
    return false;
  }
}
