// lib/actions/reviewsServerActions.ts - UPDATED VERSION
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { connectToDatabase } from "../db";
import { Review, Product, User, IReview } from "../db/models";
import mongoose from "mongoose";

// Validation Schemas
const reviewFiltersSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  isVisible: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  product: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(["createdAt", "rating", "product"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

const createReviewSchema = z.object({
  product: z.string().min(1, "Product ID is required"),
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  title: z.string().optional(),
  content: z.string().optional(),
});

const updateReviewSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  isVisible: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});

type ReviewFilters = z.infer<typeof reviewFiltersSchema>;
type CreateReviewData = z.infer<typeof createReviewSchema>;
type UpdateReviewData = z.infer<typeof updateReviewSchema>;

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

// Helper function to serialize review data
const serializeReview = (review: any): any => {
  if (!review) return null;

  return {
    ...review,
    _id: review._id?.toString() || review._id,
    product: review.product
      ? {
          ...review.product,
          _id: review.product._id?.toString() || review.product._id,
        }
      : review.product?.toString() || review.product,
    user: review.user
      ? {
          ...review.user,
          _id: review.user._id?.toString() || review.user._id,
        }
      : review.user?.toString() || review.user,
    createdAt: review.createdAt?.toISOString() || review.createdAt,
    updatedAt: review.updatedAt?.toISOString() || review.updatedAt,
  };
};

// Get Reviews with Filtering and Pagination (Admin)
export async function getReviews(filters?: Partial<ReviewFilters>): Promise<{
  reviews: any[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  error?: string;
}> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const validatedFilters = reviewFiltersSchema.parse(filters || {});

    // Build query
    const query: any = {};

    if (validatedFilters.rating) {
      query.rating = validatedFilters.rating;
    }

    if (validatedFilters.isVisible !== undefined) {
      query.isVisible = validatedFilters.isVisible;
    }

    if (validatedFilters.isVerified !== undefined) {
      query.isVerified = validatedFilters.isVerified;
    }

    if (validatedFilters.product) {
      query.product = validatedFilters.product;
    }

    if (validatedFilters.search) {
      query.$or = [
        { title: { $regex: validatedFilters.search, $options: "i" } },
        { content: { $regex: validatedFilters.search, $options: "i" } },
        {
          "user.firstName": { $regex: validatedFilters.search, $options: "i" },
        },
        { "user.lastName": { $regex: validatedFilters.search, $options: "i" } },
        { "product.name": { $regex: validatedFilters.search, $options: "i" } },
      ];
    }

    if (validatedFilters.dateFrom || validatedFilters.dateTo) {
      query.createdAt = {};
      if (validatedFilters.dateFrom) {
        query.createdAt.$gte = new Date(validatedFilters.dateFrom);
      }
      if (validatedFilters.dateTo) {
        query.createdAt.$lte = new Date(validatedFilters.dateTo);
      }
    }

    // Build sort
    const sort: any = {};
    sort[validatedFilters.sortBy] =
      validatedFilters.sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const page = validatedFilters.page;
    const limit = validatedFilters.limit;
    const skip = (page - 1) * limit;

    // Execute queries
    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate("product", "name slug images price")
        .populate("user", "firstName lastName email imageUrl")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    console.log(`✅ Fetched ${reviews.length} reviews from database`);

    return {
      reviews: reviews.map((review) => serializeReview(review)),
      pagination: {
        total,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error("❌ Error fetching reviews:", error);
    return {
      reviews: [],
      pagination: {
        total: 0,
        totalPages: 0,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
      error: error instanceof Error ? error.message : "Failed to fetch reviews",
    };
  }
}

// Create Review (Customer) - UPDATED: Reviews hidden by default
export async function createReview(
  data: CreateReviewData
): Promise<{ success: boolean; review?: any; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    await connectToDatabase();

    // Validate data
    const validatedData = createReviewSchema.parse(data);

    // Check if user exists
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Check if product exists
    const product = await Product.findById(validatedData.product);
    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: user._id,
      product: validatedData.product,
    });

    if (existingReview) {
      return {
        success: false,
        error: "You have already reviewed this product",
      };
    }

    // Create review - HIDDEN BY DEFAULT FOR MODERATION
    const review = new Review({
      ...validatedData,
      user: user._id,
      isVerified: false, // Admin can verify later
      isVisible: false, // HIDDEN BY DEFAULT - Admin must approve
    });

    await review.save();

    console.log("✅ Review created successfully (pending moderation)");

    // Don't update product rating yet - only after approval
    revalidatePath("/admin/reviews");

    // Populate review data for response
    await review.populate([
      { path: "product", select: "name slug images price" },
      { path: "user", select: "firstName lastName email imageUrl" },
    ]);

    return {
      success: true,
      review: serializeReview(review.toObject()),
    };
  } catch (error) {
    console.error("❌ Error creating review:", error);

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

// Approve Review (Admin) - NEW FUNCTION
export async function approveReview(
  reviewId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const review = await Review.findByIdAndUpdate(
      reviewId,
      {
        isVisible: true,
        isVerified: true, // Auto-verify when approving
      },
      { new: true }
    );

    if (!review) {
      return {
        success: false,
        error: "Review not found",
      };
    }

    // Update product rating now that review is approved
    await updateProductRating(review.product.toString());

    console.log("✅ Review approved successfully");

    revalidatePath("/admin/reviews");
    revalidatePath(`/products`); // Refresh product pages

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Error approving review:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Reject Review (Admin) - NEW FUNCTION
export async function rejectReview(
  reviewId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const review = await Review.findById(reviewId);
    if (!review) {
      return {
        success: false,
        error: "Review not found",
      };
    }

    // Delete the review instead of just hiding it
    await Review.findByIdAndDelete(reviewId);

    console.log("✅ Review rejected and deleted successfully");

    revalidatePath("/admin/reviews");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Error rejecting review:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Update Review (Admin)
export async function updateReview(
  reviewId: string,
  data: UpdateReviewData
): Promise<{ success: boolean; review?: any; error?: string }> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    // Validate data
    const validatedData = updateReviewSchema.parse(data);

    // Update review
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      validatedData,
      { new: true }
    )
      .populate("product", "name slug images price")
      .populate("user", "firstName lastName email imageUrl");

    if (!updatedReview) {
      return {
        success: false,
        error: "Review not found",
      };
    }

    // If rating was updated or visibility changed, recalculate product rating
    if (validatedData.rating || validatedData.isVisible !== undefined) {
      await updateProductRating(updatedReview.product._id.toString());
    }

    console.log("✅ Review updated successfully");

    revalidatePath("/admin/reviews");

    return {
      success: true,
      review: serializeReview(updatedReview.toObject()),
    };
  } catch (error) {
    console.error("❌ Error updating review:", error);

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

// Delete Review (Admin)
export async function deleteReview(
  reviewId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const review = await Review.findById(reviewId);
    if (!review) {
      return {
        success: false,
        error: "Review not found",
      };
    }

    const productId = review.product.toString();

    // Delete review
    await Review.findByIdAndDelete(reviewId);

    // Update product rating
    await updateProductRating(productId);

    console.log("✅ Review deleted successfully");

    revalidatePath("/admin/reviews");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Error deleting review:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Toggle Review Visibility
export async function toggleReviewVisibility(
  reviewId: string
): Promise<{ success: boolean; isVisible?: boolean; error?: string }> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const review = await Review.findById(reviewId);
    if (!review) {
      return {
        success: false,
        error: "Review not found",
      };
    }

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { isVisible: !review.isVisible },
      { new: true }
    );

    // Update product rating when visibility changes
    await updateProductRating(review.product.toString());

    console.log(
      `✅ Review ${updatedReview?.isVisible ? "shown" : "hidden"} successfully`
    );

    revalidatePath("/admin/reviews");

    return {
      success: true,
      isVisible: updatedReview?.isVisible,
    };
  } catch (error) {
    console.error("❌ Error toggling review visibility:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Toggle Review Verification
export async function toggleReviewVerification(
  reviewId: string
): Promise<{ success: boolean; isVerified?: boolean; error?: string }> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const review = await Review.findById(reviewId);
    if (!review) {
      return {
        success: false,
        error: "Review not found",
      };
    }

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { isVerified: !review.isVerified },
      { new: true }
    );

    console.log(
      `✅ Review ${updatedReview?.isVerified ? "verified" : "unverified"} successfully`
    );

    revalidatePath("/admin/reviews");

    return {
      success: true,
      isVerified: updatedReview?.isVerified,
    };
  } catch (error) {
    console.error("❌ Error toggling review verification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Bulk Approve Reviews (NEW)
export async function bulkApproveReviews(
  reviewIds: string[]
): Promise<{ success: boolean; approved: number; error?: string }> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const result = await Review.updateMany(
      { _id: { $in: reviewIds } },
      { isVisible: true, isVerified: true }
    );

    // Update product ratings for all affected products
    const reviews = await Review.find({ _id: { $in: reviewIds } }).select(
      "product"
    );
    const productIds = [
      ...new Set(reviews.map((review) => review.product.toString())),
    ];

    for (const productId of productIds) {
      await updateProductRating(productId);
    }

    console.log(`✅ Bulk approved ${result.modifiedCount} reviews`);

    revalidatePath("/admin/reviews");

    return {
      success: true,
      approved: result.modifiedCount,
    };
  } catch (error) {
    console.error("❌ Error bulk approving reviews:", error);
    return {
      success: false,
      approved: 0,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Bulk Update Reviews
export async function bulkUpdateReviews(
  reviewIds: string[],
  updates: {
    isVisible?: boolean;
    isVerified?: boolean;
  }
): Promise<{ success: boolean; updated: number; error?: string }> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const updateData: any = {};

    if (updates.isVisible !== undefined) {
      updateData.isVisible = updates.isVisible;
    }

    if (updates.isVerified !== undefined) {
      updateData.isVerified = updates.isVerified;
    }

    const result = await Review.updateMany(
      { _id: { $in: reviewIds } },
      updateData
    );

    // Update product ratings for all affected products if visibility changed
    if (updates.isVisible !== undefined) {
      const reviews = await Review.find({ _id: { $in: reviewIds } }).select(
        "product"
      );
      const productIds = [
        ...new Set(reviews.map((review) => review.product.toString())),
      ];

      for (const productId of productIds) {
        await updateProductRating(productId);
      }
    }

    console.log(`✅ Bulk updated ${result.modifiedCount} reviews`);

    revalidatePath("/admin/reviews");

    return {
      success: true,
      updated: result.modifiedCount,
    };
  } catch (error) {
    console.error("❌ Error bulk updating reviews:", error);
    return {
      success: false,
      updated: 0,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Bulk Delete Reviews
export async function bulkDeleteReviews(
  reviewIds: string[]
): Promise<{ success: boolean; deleted: number; error?: string }> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    // Get all affected products before deletion
    const reviews = await Review.find({ _id: { $in: reviewIds } }).select(
      "product"
    );
    const productIds = [
      ...new Set(reviews.map((review) => review.product.toString())),
    ];

    // Delete reviews
    const result = await Review.deleteMany({ _id: { $in: reviewIds } });

    // Update product ratings for all affected products
    for (const productId of productIds) {
      await updateProductRating(productId);
    }

    console.log(`✅ Bulk deleted ${result.deletedCount} reviews`);

    revalidatePath("/admin/reviews");

    return {
      success: true,
      deleted: result.deletedCount,
    };
  } catch (error) {
    console.error("❌ Error bulk deleting reviews:", error);
    return {
      success: false,
      deleted: 0,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Get Review Statistics - UPDATED with pending reviews
export async function getReviewStats(): Promise<{
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  visibleReviews: number;
  hiddenReviews: number;
  pendingReviews: number; // NEW
  verifiedReviews: number;
  unverifiedReviews: number;
  recentReviews: number;
  topRatedProducts: Array<{
    productName: string;
    averageRating: number;
    reviewCount: number;
  }>;
  recentReviewsList: any[];
}> {
  try {
    await checkAdminAuth();
    await connectToDatabase();

    const [
      totalReviews,
      averageRatingResult,
      ratingDistribution,
      visibleReviews,
      hiddenReviews,
      pendingReviews, // NEW
      verifiedReviews,
      unverifiedReviews,
      recentReviews,
      recentReviewsList,
    ] = await Promise.all([
      Review.countDocuments(),
      Review.aggregate([
        { $match: { isVisible: true } }, // Only count visible reviews for average
        { $group: { _id: null, avgRating: { $avg: "$rating" } } },
      ]),
      Review.aggregate([
        { $match: { isVisible: true } }, // Only count visible reviews for distribution
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Review.countDocuments({ isVisible: true }),
      Review.countDocuments({ isVisible: false }),
      Review.countDocuments({ isVisible: false }), // Pending = hidden reviews
      Review.countDocuments({ isVerified: true }),
      Review.countDocuments({ isVerified: false }),
      Review.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
      Review.find()
        .populate("product", "name slug images")
        .populate("user", "firstName lastName imageUrl")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Process rating distribution
    const distribution: { [key: number]: number } = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    ratingDistribution.forEach((item: any) => {
      distribution[item._id] = item.count;
    });

    // Get top rated products (only from visible reviews)
    const topRatedProducts = await Review.aggregate([
      { $match: { isVisible: true } },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
      { $match: { reviewCount: { $gte: 3 } } }, // At least 3 reviews
      { $sort: { averageRating: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          productName: "$product.name",
          averageRating: { $round: ["$averageRating", 1] },
          reviewCount: 1,
          _id: 0,
        },
      },
    ]);

    const averageRating = averageRatingResult[0]?.avgRating || 0;

    console.log("✅ Review statistics calculated successfully");

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution: distribution,
      visibleReviews,
      hiddenReviews,
      pendingReviews, // NEW
      verifiedReviews,
      unverifiedReviews,
      recentReviews,
      topRatedProducts,
      recentReviewsList: recentReviewsList.map((review) =>
        serializeReview(review)
      ),
    };
  } catch (error) {
    console.error("❌ Error fetching review statistics:", error);
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      visibleReviews: 0,
      hiddenReviews: 0,
      pendingReviews: 0, // NEW
      verifiedReviews: 0,
      unverifiedReviews: 0,
      recentReviews: 0,
      topRatedProducts: [],
      recentReviewsList: [],
    };
  }
}

// Get Product Reviews (Public) - Only visible reviews
export async function getProductReviews(
  productId: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  reviews: any[];
  total: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
}> {
  try {
    await connectToDatabase();

    const skip = (page - 1) * limit;

    const [reviews, total, stats] = await Promise.all([
      Review.find({
        product: productId,
        isVisible: true, // ONLY VISIBLE REVIEWS
      })
        .populate("user", "firstName lastName imageUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({
        product: productId,
        isVisible: true, // ONLY VISIBLE REVIEWS
      }),
      Review.aggregate([
        {
          $match: {
            product: new mongoose.Types.ObjectId(productId),
            isVisible: true,
          },
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
            ratingCounts: {
              $push: "$rating",
            },
          },
        },
      ]),
    ]);

    // Calculate rating distribution
    const distribution: { [key: number]: number } = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    if (stats[0]?.ratingCounts) {
      stats[0].ratingCounts.forEach((rating: number) => {
        distribution[rating]++;
      });
    }

    const averageRating = stats[0]?.avgRating || 0;

    return {
      reviews: reviews.map((review) => serializeReview(review)),
      total,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution: distribution,
    };
  } catch (error) {
    console.error("❌ Error fetching product reviews:", error);
    return {
      reviews: [],
      total: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }
}

// Helper function to update product rating - Only count visible reviews
async function updateProductRating(productId: string): Promise<void> {
  try {
    const stats = await Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
          isVisible: true, // ONLY VISIBLE REVIEWS
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    const { averageRating = 0, reviewCount = 0 } = stats[0] || {};

    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount,
    });

    console.log(
      `✅ Updated product rating: ${averageRating} (${reviewCount} visible reviews)`
    );
  } catch (error) {
    console.error("❌ Error updating product rating:", error);
  }
}
