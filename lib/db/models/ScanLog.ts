// === lib/db/models/ScanLog.ts ===
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IScanLog extends Document {
  ip: string;
  userAgent: string;
  timestamp: Date;
  country?: string; // New field for country
  city?: string; // New field for city
  deviceType?: string; // New field for device type (e.g., "mobile", "desktop", "tablet")
  os?: string; // New field for operating system
  browser?: string; // New field for browser
}

const ScanLogSchema: Schema = new Schema<IScanLog>(
  {
    ip: { type: String, required: true },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now },
    country: { type: String },
    city: { type: String },
    deviceType: { type: String },
    os: { type: String },
    browser: { type: String },
  },
  {
    collection: "scan_logs",
    timestamps: false,
  }
);

export const ScanLog: Model<IScanLog> =
  mongoose.models.ScanLog || mongoose.model<IScanLog>("ScanLog", ScanLogSchema);
