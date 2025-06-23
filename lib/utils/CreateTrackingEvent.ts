import { ITrackingEvent, TrackingEvent } from "../db/models";

// Helper function to create standard tracking events
export const createTrackingEvent = async (
  orderId: string,
  status: ITrackingEvent["status"],
  description: string,
  options?: {
    location?: string;
    carrier?: string;
    estimatedDelivery?: Date;
    metadata?: ITrackingEvent["metadata"];
    timestamp?: Date;
  }
) => {
  const trackingEvent = new TrackingEvent({
    order: orderId,
    status,
    description,
    timestamp: options?.timestamp || new Date(),
    location: options?.location,
    carrier: options?.carrier,
    estimatedDelivery: options?.estimatedDelivery,
    metadata: options?.metadata,
    isPublic: true,
  });

  await trackingEvent.save();
  return trackingEvent;
};
