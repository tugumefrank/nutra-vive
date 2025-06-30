"use server";

import { connectToDatabase } from "../db";
import {
  Order,
  TrackingEvent,
  IOrderTrackingInfo,
  ITrackingEvent,
} from "../db/models";
import { z } from "zod";
import { createTrackingEvent } from "../utils/CreateTrackingEvent";

// Validation Schemas
const trackOrderSchema = z.object({
  identifier: z.string().min(1, "Order number or tracking number is required"),
  email: z.string().email("Valid email is required").optional(),
});

const createTrackingEventSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  status: z.enum([
    "order_placed",
    "payment_confirmed",
    "processing",
    "shipped",
    "in_transit",
    "out_for_delivery",
    "delivered",
    "exception",
    "returned",
  ]),
  description: z.string().min(1, "Description is required"),
  location: z.string().optional(),
  carrier: z.string().optional(),
  estimatedDelivery: z.date().optional(),
  metadata: z
    .object({
      facility: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      coordinates: z
        .object({
          lat: z.number(),
          lng: z.number(),
        })
        .optional(),
    })
    .optional(),
});

type TrackOrderData = z.infer<typeof trackOrderSchema>;
type CreateTrackingEventData = z.infer<typeof createTrackingEventSchema>;

// Helper function to serialize tracking data
const serializeTrackingData = (
  order: any,
  events: any[]
): IOrderTrackingInfo => {
  const sortedEvents = events.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const isDelivered =
    order.status === "delivered" ||
    events.some((event) => event.status === "delivered");

  const daysInTransit = order.shippedAt
    ? Math.ceil(
        (new Date().getTime() - new Date(order.shippedAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : undefined;

  return {
    orderNumber: order.orderNumber,
    trackingNumber: order.trackingNumber,
    status: order.status,
    estimatedDelivery: order.estimatedDelivery,
    shippingCarrier: order.shippingCarrier,
    currentLocation:
      events.length > 0 ? events[events.length - 1].location : undefined,
    events: sortedEvents.map((event) => ({
      ...event,
      _id: event._id.toString(),
      order: event.order.toString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    })),
    canTrack: !!order.trackingNumber,
    isDelivered,
    daysInTransit,
  };
};

// Track order by order number or tracking number
export async function trackOrder(data: TrackOrderData): Promise<{
  success: boolean;
  trackingInfo?: IOrderTrackingInfo;
  order?: any;
  error?: string;
}> {
  try {
    await connectToDatabase();

    console.log("🔍 Tracking order with identifier:", data.identifier);

    // Validate input
    const validatedData = trackOrderSchema.parse(data);

    // Search for order by order number or tracking number
    const orderQuery: any = {
      $or: [
        { orderNumber: validatedData.identifier },
        { trackingNumber: validatedData.identifier },
      ],
    };

    // If email is provided, add it to the query for additional security
    if (validatedData.email) {
      orderQuery.email = validatedData.email;
    }

    const order = await Order.findOne(orderQuery)
      .populate({
        path: "items.product",
        select: "name slug images price",
      })
      .lean();

    if (!order) {
      return {
        success: false,
        error:
          "Order not found. Please check your order number or tracking number.",
      };
    }

    // Get tracking events for this order
    const trackingEvents = await TrackingEvent.find({
      order: order._id,
      isPublic: true,
    })
      .sort({ timestamp: 1 })
      .lean();

    // If no tracking events exist, create default ones based on order status
    if (trackingEvents.length === 0) {
      await createDefaultTrackingEvents(order._id.toString(), order);

      // Refetch events
      const newEvents = await TrackingEvent.find({
        order: order._id,
        isPublic: true,
      })
        .sort({ timestamp: 1 })
        .lean();

      const trackingInfo = serializeTrackingData(order, newEvents);

      return {
        success: true,
        trackingInfo,
        order: {
          ...order,
          _id: order._id.toString(),
          items: order.items.map((item: any) => ({
            ...item,
            _id: item._id?.toString(),
            product: item.product
              ? {
                  ...item.product,
                  _id: item.product._id?.toString(),
                }
              : null,
          })),
        },
      };
    }

    const trackingInfo = serializeTrackingData(order, trackingEvents);

    console.log("✅ Order tracking info retrieved successfully");

    return {
      success: true,
      trackingInfo,
      order: {
        ...order,
        _id: order._id.toString(),
        items: order.items.map((item: any) => ({
          ...item,
          _id: item._id?.toString(),
          product: item.product
            ? {
                ...item.product,
                _id: item.product._id?.toString(),
              }
            : null,
        })),
      },
    };
  } catch (error) {
    console.error("❌ Error tracking order:", error);

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

// Create a new tracking event (Admin function)
export async function addTrackingEvent(data: CreateTrackingEventData): Promise<{
  success: boolean;
  event?: any;
  error?: string;
}> {
  try {
    await connectToDatabase();

    console.log("📦 Adding tracking event for order:", data.orderId);

    // Validate input
    const validatedData = createTrackingEventSchema.parse(data);

    // Check if order exists
    const order = await Order.findById(validatedData.orderId);
    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    // Create tracking event
    const trackingEvent = await createTrackingEvent(
      validatedData.orderId,
      validatedData.status,
      validatedData.description,
      {
        location: validatedData.location,
        carrier: validatedData.carrier,
        estimatedDelivery: validatedData.estimatedDelivery,
        metadata: validatedData.metadata && {
          ...validatedData.metadata,
          coordinates:
            validatedData.metadata.coordinates &&
            typeof validatedData.metadata.coordinates.lat === "number" &&
            typeof validatedData.metadata.coordinates.lng === "number"
              ? {
                  lat: validatedData.metadata.coordinates.lat,
                  lng: validatedData.metadata.coordinates.lng,
                }
              : undefined,
        },
      }
    );

    // Update order's last tracking update
    await Order.findByIdAndUpdate(validatedData.orderId, {
      lastTrackingUpdate: new Date(),
    });

    console.log("✅ Tracking event added successfully");

    return {
      success: true,
      event: {
        ...trackingEvent.toObject(),
        _id: trackingEvent._id.toString(),
        order: trackingEvent.order.toString(),
      },
    };
  } catch (error) {
    console.error("❌ Error adding tracking event:", error);

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

// Update tracking information for an order (Admin function)
export async function updateOrderTracking(
  orderId: string,
  updates: {
    trackingNumber?: string;
    shippingCarrier?: string;
    estimatedDelivery?: Date;
    trackingUrl?: string;
  }
): Promise<{
  success: boolean;
  order?: any;
  error?: string;
}> {
  try {
    await connectToDatabase();

    console.log("📝 Updating tracking info for order:", orderId);

    const updateData: any = {
      lastTrackingUpdate: new Date(),
    };

    if (updates.trackingNumber)
      updateData.trackingNumber = updates.trackingNumber;
    if (updates.shippingCarrier)
      updateData.shippingCarrier = updates.shippingCarrier;
    if (updates.estimatedDelivery)
      updateData.estimatedDelivery = updates.estimatedDelivery;
    if (updates.trackingUrl) updateData.trackingUrl = updates.trackingUrl;

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
    });

    if (!updatedOrder) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    console.log("✅ Order tracking info updated successfully");

    return {
      success: true,
      order: {
        ...updatedOrder.toObject(),
        _id: updatedOrder._id.toString(),
      },
    };
  } catch (error) {
    console.error("❌ Error updating order tracking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Get tracking events for an order
export async function getOrderTrackingEvents(orderId: string): Promise<{
  success: boolean;
  events?: any[];
  error?: string;
}> {
  try {
    await connectToDatabase();

    const events = await TrackingEvent.find({
      order: orderId,
      isPublic: true,
    })
      .sort({ timestamp: 1 })
      .lean();

    return {
      success: true,
      events: events.map((event) => ({
        ...event,
        _id: event._id.toString(),
        order: event.order.toString(),
      })),
    };
  } catch (error) {
    console.error("❌ Error getting tracking events:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Helper function to create default tracking events based on order status
async function createDefaultTrackingEvents(
  orderId: string,
  order: any
): Promise<void> {
  const events = [];

  // Order placed
  events.push({
    status: "order_placed" as const,
    description: "Your order has been received and is being reviewed.",
    timestamp: order.createdAt,
  });

  // Payment confirmed
  if (order.paymentStatus === "paid") {
    events.push({
      status: "payment_confirmed" as const,
      description:
        "Payment has been confirmed and your order is being prepared.",
      timestamp: order.createdAt,
    });
  }

  // Processing
  if (["processing", "shipped", "delivered"].includes(order.status)) {
    events.push({
      status: "processing" as const,
      description: "Your order is being processed and prepared for shipment.",
      timestamp: order.createdAt,
    });
  }

  // Shipped
  if (["shipped", "delivered"].includes(order.status) && order.shippedAt) {
    events.push({
      status: "shipped" as const,
      description: `Your order has been shipped${order.shippingCarrier ? ` via ${order.shippingCarrier}` : ""}.`,
      timestamp: order.shippedAt,
      carrier: order.shippingCarrier,
    });
  }

  // Delivered
  if (order.status === "delivered" && order.deliveredAt) {
    events.push({
      status: "delivered" as const,
      description: "Your order has been delivered successfully.",
      timestamp: order.deliveredAt,
    });
  }

  // Create all events
  for (const event of events) {
    await createTrackingEvent(orderId, event.status, event.description, {
      timestamp: event.timestamp,
      carrier: event.carrier,
    });
  }
}

// Bulk update tracking for multiple orders (Admin function)
export async function bulkUpdateTracking(
  orderIds: string[],
  updates: {
    shippingCarrier?: string;
    status?: string;
    trackingNumbers?: { orderId: string; trackingNumber: string }[];
  }
): Promise<{
  success: boolean;
  updated: number;
  error?: string;
}> {
  try {
    await connectToDatabase();

    let updated = 0;

    // Update carrier for all orders
    if (updates.shippingCarrier) {
      const result = await Order.updateMany(
        { _id: { $in: orderIds } },
        {
          shippingCarrier: updates.shippingCarrier,
          lastTrackingUpdate: new Date(),
        }
      );
      updated += result.modifiedCount;
    }

    // Update individual tracking numbers
    if (updates.trackingNumbers) {
      for (const item of updates.trackingNumbers) {
        await Order.findByIdAndUpdate(item.orderId, {
          trackingNumber: item.trackingNumber,
          lastTrackingUpdate: new Date(),
        });
        updated++;
      }
    }

    // Update status and create tracking events
    if (updates.status) {
      const statusDescriptions: Record<string, string> = {
        processing: "Your order is being processed and prepared for shipment.",
        shipped: "Your order has been shipped and is on its way to you.",
        delivered: "Your order has been delivered successfully.",
      };

      for (const orderId of orderIds) {
        await Order.findByIdAndUpdate(orderId, {
          status: updates.status,
          ...(updates.status === "shipped" && { shippedAt: new Date() }),
          ...(updates.status === "delivered" && { deliveredAt: new Date() }),
          lastTrackingUpdate: new Date(),
        });

        if (statusDescriptions[updates.status]) {
          await createTrackingEvent(
            orderId,
            updates.status as any,
            statusDescriptions[updates.status]
          );
        }
      }
    }

    console.log(`✅ Bulk updated tracking for ${updated} orders`);

    return {
      success: true,
      updated,
    };
  } catch (error) {
    console.error("❌ Error bulk updating tracking:", error);
    return {
      success: false,
      updated: 0,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
