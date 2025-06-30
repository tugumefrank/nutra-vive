// Export all User models
export * from "./user";

// Export all Product models (Category, Product, Review)
export * from "./product";

// Export all Order models (Order, TrackingEvent)
export * from "./order";

// Export all Cart models (Cart, Favorite, DiscountCode)
export * from "./cart";

// Export all Consultation models
export * from "./consultation";

// Export all Promotion models
export * from "./promotion";

// Export all Notification models
export * from "./notification";

// Re-export mongoose types for convenience
export { Document, Schema, Model } from "mongoose";
