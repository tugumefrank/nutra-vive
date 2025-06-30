import mongoose, { Schema, Document, Model } from "mongoose";

// User Interface
export interface IUser extends Document {
  _id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

// User Schema
const userSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    firstName: String,
    lastName: String,
    imageUrl: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

// Add indexes
userSchema.index({ clerkId: 1 });
userSchema.index({ email: 1 });

// User Model
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
