import mongoose, { Schema, Document, Model } from "mongoose";

export interface IScanLog extends Document {
  ip: string;
  userAgent: string;
  timestamp: Date;
}

const ScanLogSchema: Schema = new Schema<IScanLog>(
  {
    ip: { type: String, required: true },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  {
    collection: "scan_logs",
    timestamps: false,
  }
);

export const ScanLog: Model<IScanLog> =
  mongoose.models.ScanLog || mongoose.model<IScanLog>("ScanLog", ScanLogSchema);
