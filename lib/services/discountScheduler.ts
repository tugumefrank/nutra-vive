// lib/services/discountScheduler.ts
"use server";

import { connectToDatabase } from "../db";
import { ProductDiscount, Product } from "../db/models";
import mongoose from "mongoose";

/**
 * Service for handling automatic discount scheduling and expiration
 */
export class DiscountScheduler {
  /**
   * Process all scheduled discounts that should be activated
   */
  static async processScheduledDiscounts() {
    try {
      await connectToDatabase();
      
      const now = new Date();
      
      // Find scheduled discounts that should be activated
      const scheduledDiscounts = await ProductDiscount.find({
        isActive: false,
        scheduleType: 'scheduled',
        startsAt: { $lte: now }
      });

      console.log(`Found ${scheduledDiscounts.length} scheduled discounts to activate`);

      for (const discount of scheduledDiscounts) {
        try {
          // Activate the discount
          await ProductDiscount.findByIdAndUpdate(discount._id, {
            isActive: true
          });

          // Apply discounts to products
          await this.applyDiscountToProducts(discount);
          
          console.log(`✅ Activated scheduled discount: ${discount.name}`);
        } catch (error) {
          console.error(`❌ Error activating discount ${discount.name}:`, error);
        }
      }

      return {
        success: true,
        activatedCount: scheduledDiscounts.length
      };
    } catch (error) {
      console.error("❌ Error processing scheduled discounts:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process scheduled discounts"
      };
    }
  }

  /**
   * Process all expired discounts that should be deactivated
   */
  static async processExpiredDiscounts() {
    try {
      await connectToDatabase();
      
      const now = new Date();
      
      // Find active discounts that have expired and should be auto-disabled
      const expiredDiscounts = await ProductDiscount.find({
        isActive: true,
        autoDisable: true,
        endsAt: { $lt: now }
      });

      console.log(`Found ${expiredDiscounts.length} expired discounts to deactivate`);

      for (const discount of expiredDiscounts) {
        try {
          // Deactivate the discount
          await ProductDiscount.findByIdAndUpdate(discount._id, {
            isActive: false
          });

          // Remove discounts from products
          await this.removeDiscountFromProducts(discount);
          
          console.log(`✅ Deactivated expired discount: ${discount.name}`);
        } catch (error) {
          console.error(`❌ Error deactivating discount ${discount.name}:`, error);
        }
      }

      return {
        success: true,
        deactivatedCount: expiredDiscounts.length
      };
    } catch (error) {
      console.error("❌ Error processing expired discounts:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process expired discounts"
      };
    }
  }

  /**
   * Apply discount to products based on campaign scope
   */
  private static async applyDiscountToProducts(campaign: any) {
    try {
      // Build query based on campaign scope
      let query: any = {};
      switch (campaign.scope) {
        case 'all_products':
          query = { isActive: true };
          break;
        case 'categories':
          query = { 
            isActive: true,
            category: { $in: campaign.categoryIds.map((id: string) => new mongoose.Types.ObjectId(id)) }
          };
          break;
        case 'specific_products':
          query = { 
            _id: { $in: campaign.productIds.map((id: string) => new mongoose.Types.ObjectId(id)) }
          };
          break;
      }

      // Get products to update
      const products = await Product.find(query);
      console.log(`Applying discount to ${products.length} products`);

      // Calculate discounted prices for each product
      const updatePromises = products.map(async (product) => {
        // Store original price if not already stored
        const originalPrice = product.compareAtPrice || product.price;
        let newPrice: number;
        
        if (campaign.discountType === 'percentage') {
          // Calculate new discounted price
          const discountDecimal = campaign.discountValue / 100;
          newPrice = originalPrice * (1 - discountDecimal);
        } else {
          // Fixed amount discount
          newPrice = Math.max(0, originalPrice - campaign.discountValue);
        }

        // Only update if there's actually a discount to apply
        if (newPrice < originalPrice) {
          return Product.findByIdAndUpdate(
            product._id,
            { 
              price: Math.round(newPrice * 100) / 100,
              compareAtPrice: originalPrice, // Keep original price for display
              isDiscounted: true
            },
            { new: true }
          );
        }
        return null;
      });

      const updateResults = await Promise.all(updatePromises);
      const updatedCount = updateResults.filter(result => result !== null).length;

      // Update campaign with actual applied count
      await ProductDiscount.findByIdAndUpdate(campaign._id, {
        affectedProductCount: updatedCount,
        usageCount: updatedCount
      });

      console.log(`✅ Applied discount to ${updatedCount} products`);
      return updatedCount;
    } catch (error) {
      console.error("❌ Error applying discount to products:", error);
      throw error;
    }
  }

  /**
   * Remove discount from products based on campaign scope
   */
  private static async removeDiscountFromProducts(campaign: any) {
    try {
      // Build query based on campaign scope
      let query: any = {};
      switch (campaign.scope) {
        case 'all_products':
          query = { isActive: true, isDiscounted: true };
          break;
        case 'categories':
          query = { 
            isActive: true,
            isDiscounted: true,
            category: { $in: campaign.categoryIds.map((id: string) => new mongoose.Types.ObjectId(id)) }
          };
          break;
        case 'specific_products':
          query = { 
            isDiscounted: true,
            _id: { $in: campaign.productIds.map((id: string) => new mongoose.Types.ObjectId(id)) }
          };
          break;
      }

      // Restore original prices and remove discount flags
      const productsToRestore = await Product.find(query);
      
      const restorePromises = productsToRestore.map(async (product) => {
        // If there's a compareAtPrice, it means there was an original price to restore
        if (product.compareAtPrice && product.compareAtPrice > product.price) {
          return Product.findByIdAndUpdate(
            product._id,
            {
              price: product.compareAtPrice, // Restore original price
              $unset: { compareAtPrice: 1 }, // Remove compareAtPrice
              $set: { isDiscounted: false }  // Remove discount flag
            },
            { new: true }
          );
        } else {
          // Just remove the discount flag if no price restoration needed
          return Product.findByIdAndUpdate(
            product._id,
            { $set: { isDiscounted: false } },
            { new: true }
          );
        }
      });
      
      const restoreResults = await Promise.all(restorePromises);
      const restoredCount = restoreResults.filter(result => result !== null).length;

      console.log(`✅ Restored original prices for ${restoredCount} products`);
      return restoredCount;
    } catch (error) {
      console.error("❌ Error removing discount from products:", error);
      throw error;
    }
  }

  /**
   * Run the complete discount scheduler process
   */
  static async runScheduler() {
    console.log("🔄 Running discount scheduler...");
    
    const scheduledResult = await this.processScheduledDiscounts();
    const expiredResult = await this.processExpiredDiscounts();
    
    const summary = {
      timestamp: new Date().toISOString(),
      scheduledDiscounts: {
        success: scheduledResult.success,
        count: scheduledResult.activatedCount || 0,
        error: scheduledResult.error
      },
      expiredDiscounts: {
        success: expiredResult.success,
        count: expiredResult.deactivatedCount || 0,
        error: expiredResult.error
      }
    };
    
    console.log("📊 Scheduler summary:", summary);
    return summary;
  }

  /**
   * Get analytics for scheduled discounts
   */
  static async getSchedulerAnalytics() {
    try {
      await connectToDatabase();
      
      const now = new Date();
      
      // Count various discount states
      const [
        totalCampaigns,
        activeCampaigns,
        scheduledCampaigns,
        expiredCampaigns,
        autoDisableCampaigns
      ] = await Promise.all([
        ProductDiscount.countDocuments(),
        ProductDiscount.countDocuments({ isActive: true }),
        ProductDiscount.countDocuments({ 
          isActive: false,
          scheduleType: 'scheduled',
          startsAt: { $gt: now }
        }),
        ProductDiscount.countDocuments({
          isActive: true,
          endsAt: { $lt: now }
        }),
        ProductDiscount.countDocuments({ autoDisable: true })
      ]);

      // Get upcoming scheduled discounts
      const upcomingDiscounts = await ProductDiscount.find({
        isActive: false,
        scheduleType: 'scheduled',
        startsAt: { $gt: now, $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) } // Next 24 hours
      }).select('name startsAt').limit(10);

      // Get expiring discounts
      const expiringDiscounts = await ProductDiscount.find({
        isActive: true,
        endsAt: { $gt: now, $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) } // Next 24 hours
      }).select('name endsAt autoDisable').limit(10);

      return {
        success: true,
        analytics: {
          totalCampaigns,
          activeCampaigns,
          scheduledCampaigns,
          expiredCampaigns,
          autoDisableCampaigns,
          upcomingDiscounts: upcomingDiscounts.map(d => ({
            id: d._id.toString(),
            name: d.name,
            startsAt: d.startsAt
          })),
          expiringDiscounts: expiringDiscounts.map(d => ({
            id: d._id.toString(),
            name: d.name,
            endsAt: d.endsAt,
            autoDisable: d.autoDisable
          }))
        }
      };
    } catch (error) {
      console.error("❌ Error getting scheduler analytics:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get analytics"
      };
    }
  }
}

// Server action wrapper for running the scheduler
export async function runDiscountScheduler() {
  return await DiscountScheduler.runScheduler();
}

// Server action wrapper for getting analytics
export async function getDiscountSchedulerAnalytics() {
  return await DiscountScheduler.getSchedulerAnalytics();
}