import mongoose, { Schema, Document, Model } from "mongoose";

// Order Interface
export interface IOrder extends Document {
  _id: string;
  orderNumber: string;
  user?: string; // User ID
  email: string;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  paymentStatus:
    | "pending"
    | "paid"
    | "failed"
    | "refunded"
    | "partially_refunded";
  paymentIntentId?: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
  };
  items: {
    product: string; // Product ID
    productName: string;
    productSlug: string;
    productImage: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }[];
  notes?: string;
  trackingNumber?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Tracking Event Interface
export interface ITrackingEvent extends Document {
  _id: string;
  order: mongoose.Types.ObjectId; // Order ID
  status:
    | "order_placed"
    | "payment_confirmed"
    | "processing"
    | "shipped"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "exception"
    | "returned";
  location?: string;
  description: string;
  timestamp: Date;
  carrier?: string;
  estimatedDelivery?: Date;
  metadata?: {
    facility?: string;
    city?: string;
    state?: string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  isPublic: boolean; // Whether to show this event to customers
  createdAt: Date;
  updatedAt: Date;
}

// Extended Order Tracking Info Interface
export interface IOrderTrackingInfo {
  orderNumber: string;
  trackingNumber?: string;
  status: string;
  estimatedDelivery?: Date;
  shippingCarrier?: string;
  currentLocation?: string;
  events: ITrackingEvent[];
  canTrack: boolean;
  isDelivered: boolean;
  daysInTransit?: number;
}

// Order Schema
const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    email: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending",
    },
    paymentIntentId: String,
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    shippingAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    shippingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      company: String,
      address1: { type: String, required: true },
      address2: String,
      city: { type: String, required: true },
      province: { type: String, required: true },
      country: { type: String, required: true },
      zip: { type: String, required: true },
      phone: String,
    },
    billingAddress: {
      firstName: String,
      lastName: String,
      company: String,
      address1: String,
      address2: String,
      city: String,
      province: String,
      country: String,
      zip: String,
      phone: String,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: { type: String, required: true },
        productSlug: { type: String, required: true },
        productImage: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
      },
    ],
    notes: String,
    trackingNumber: String,
    shippedAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true }
);

// Tracking Event Schema
const trackingEventSchema = new Schema<ITrackingEvent>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    status: {
      type: String,
      enum: [
        "order_placed",
        "payment_confirmed",
        "processing",
        "shipped",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "exception",
        "returned",
      ],
      required: true,
    },
    location: String,
    description: { type: String, required: true },
    timestamp: { type: Date, required: true },
    carrier: String,
    estimatedDelivery: Date,
    metadata: {
      facility: String,
      city: String,
      state: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Add indexes (orderNumber already has unique index from field definition)
orderSchema.index({ user: 1 });
trackingEventSchema.index({ order: 1 });
trackingEventSchema.index({ status: 1 });
trackingEventSchema.index({ timestamp: -1 });
trackingEventSchema.index({ isPublic: 1 });

// Models
export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);

export const TrackingEvent: Model<ITrackingEvent> =
  mongoose.models.TrackingEvent ||
  mongoose.model<ITrackingEvent>("TrackingEvent", trackingEventSchema);
