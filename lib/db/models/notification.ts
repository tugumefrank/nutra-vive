import mongoose, { Schema, Document, Model } from "mongoose";

// Notification Interface
export interface INotification extends Document {
  _id: string;
  user?: string; // User ID
  type: "order" | "inventory" | "review" | "payment" | "system";
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

// Notification Schema
const notificationSchema = new Schema<INotification>(
  {
    user: { type: String, ref: "User" },
    type: {
      type: String,
      enum: ["order", "inventory", "review", "payment", "system"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: Schema.Types.Mixed,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Add indexes
notificationSchema.index({ user: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });

// Model
export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);
