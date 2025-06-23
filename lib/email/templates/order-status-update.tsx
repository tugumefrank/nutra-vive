// lib/email/templates/order-status-update.tsx
import React from "react";
import { Text, Button, Section } from "@react-email/components";
import BaseEmail, { sharedStyles } from "./_base";

interface OrderStatusUpdateProps {
  orderNumber: string;
  customerName: string;
  status: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  companyName?: string;
  companyUrl?: string;
}

export default function OrderStatusUpdateEmail({
  orderNumber,
  customerName,
  status,
  trackingNumber,
  estimatedDelivery,
  companyName = "Nutra-Vive",
  companyUrl = "https://nutraviveholistic.com",
}: OrderStatusUpdateProps) {
  const getStatusMessage = () => {
    switch (status) {
      case "processing":
        return {
          emoji: "⚡",
          title: "Your order is being prepared",
          description:
            "We're carefully preparing your organic goodness for shipment.",
        };
      case "shipped":
        return {
          emoji: "🚚",
          title: "Your order is on its way!",
          description: "Your package has been shipped and is heading to you.",
        };
      case "delivered":
        return {
          emoji: "📦",
          title: "Your order has been delivered",
          description: "Your organic wellness package has arrived! Enjoy.",
        };
      default:
        return {
          emoji: "📋",
          title: "Order update",
          description: `Your order status has been updated to: ${status}`,
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <BaseEmail
      preview={`Order ${orderNumber} update: ${status}`}
      companyName={companyName}
      companyUrl={companyUrl}
    >
      <Section style={sharedStyles.hero}>
        <Text style={sharedStyles.heroTitle}>
          {statusInfo.title} {statusInfo.emoji}
        </Text>
        <Text style={sharedStyles.heroText}>
          Hi {customerName}, here's an update on your order.
        </Text>
      </Section>

      <Section style={sharedStyles.orderSection}>
        <Text style={sharedStyles.sectionTitle}>Order #{orderNumber}</Text>
        <Text style={sharedStyles.statusDescription}>
          {statusInfo.description}
        </Text>

        {trackingNumber && (
          <Section style={sharedStyles.trackingSection}>
            <Text style={sharedStyles.trackingLabel}>Tracking Number:</Text>
            <Text style={sharedStyles.trackingNumber}>{trackingNumber}</Text>
          </Section>
        )}

        {estimatedDelivery && (
          <Text style={sharedStyles.deliveryText}>
            Estimated delivery: {estimatedDelivery}
          </Text>
        )}
      </Section>

      <Section style={sharedStyles.ctaSection}>
        <Button
          href={`${companyUrl}/track/${orderNumber}`}
          style={sharedStyles.button}
        >
          Track Your Order
        </Button>
      </Section>
    </BaseEmail>
  );
}
