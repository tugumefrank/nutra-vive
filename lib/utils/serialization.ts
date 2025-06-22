// lib/utils/serialization.ts

/**
 * Recursively converts MongoDB ObjectIds to strings and handles Date objects
 * to ensure objects can be safely passed from Server Components to Client Components
 */
export function serializeDocument<T>(doc: any): T {
  if (doc === null || doc === undefined) {
    return doc;
  }

  // Handle arrays
  if (Array.isArray(doc)) {
    return doc.map((item) => serializeDocument(item)) as T;
  }

  // Handle Date objects
  if (doc instanceof Date) {
    return doc.toISOString() as T;
  }

  // Handle MongoDB ObjectId (has _id property with buffer)
  if (doc._id && typeof doc._id === "object" && doc._id.buffer) {
    return doc._id.toString() as T;
  }

  // Handle plain objects
  if (typeof doc === "object" && doc !== null) {
    const serialized: any = {};

    for (const [key, value] of Object.entries(doc)) {
      // Convert _id fields to strings
      if (
        key === "_id" &&
        value &&
        typeof value === "object" &&
        value.toString
      ) {
        serialized[key] = value.toString();
      }
      // Recursively serialize nested objects
      else if (typeof value === "object") {
        serialized[key] = serializeDocument(value);
      }
      // Keep primitive values as is
      else {
        serialized[key] = value;
      }
    }

    return serialized as T;
  }

  // Return primitive values as is
  return doc as T;
}

/**
 * Specifically for order objects with their complex nested structure
 */
export function serializeOrder(order: any) {
  if (!order) return null;

  return {
    ...order,
    _id: order._id?.toString() || order._id,
    user: order.user?.toString() || order.user,
    items:
      order.items?.map((item: any) => ({
        ...item,
        _id: item._id?.toString() || item._id,
        product: item.product
          ? {
              ...item.product,
              _id: item.product._id?.toString() || item.product._id,
              category: item.product.category
                ? {
                    ...item.product.category,
                    _id:
                      item.product.category._id?.toString() ||
                      item.product.category._id,
                  }
                : item.product.category,
            }
          : item.product,
      })) || [],
    createdAt: order.createdAt?.toISOString() || order.createdAt,
    updatedAt: order.updatedAt?.toISOString() || order.updatedAt,
    shippedAt: order.shippedAt?.toISOString() || order.shippedAt,
    deliveredAt: order.deliveredAt?.toISOString() || order.deliveredAt,
    cancelledAt: order.cancelledAt?.toISOString() || order.cancelledAt,
  };
}

/**
 * Specifically for product objects
 */
export function serializeProduct(product: any) {
  if (!product) return null;

  return {
    ...product,
    _id: product._id?.toString() || product._id,
    category: product.category
      ? {
          ...product.category,
          _id: product.category._id?.toString() || product.category._id,
        }
      : product.category,
    createdAt: product.createdAt?.toISOString() || product.createdAt,
    updatedAt: product.updatedAt?.toISOString() || product.updatedAt,
  };
}

/**
 * Specifically for consultation objects
 */
export function serializeConsultation(consultation: any) {
  if (!consultation) return null;

  return {
    ...consultation,
    _id: consultation._id?.toString() || consultation._id,
    user: consultation.user?.toString() || consultation.user,
    createdAt: consultation.createdAt?.toISOString() || consultation.createdAt,
    updatedAt: consultation.updatedAt?.toISOString() || consultation.updatedAt,
    scheduledAt:
      consultation.scheduledAt?.toISOString() || consultation.scheduledAt,
    completedAt:
      consultation.completedAt?.toISOString() || consultation.completedAt,
    cancelledAt:
      consultation.cancelledAt?.toISOString() || consultation.cancelledAt,
    followUpDate:
      consultation.followUpDate?.toISOString() || consultation.followUpDate,
  };
}
