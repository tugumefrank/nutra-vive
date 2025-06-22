// lib/email/templates/order-cancelled.tsx
import React from "react";
import { Text, Button, Section } from "@react-email/components";
import BaseEmail, { sharedStyles } from "./_base";

interface OrderCancelledProps {
  orderNumber: string;
  customerName: string;
  reason?: string;
  refundInfo?: string;
  companyName?: string;
  companyUrl?: string;
}

export default function OrderCancelledEmail({
  orderNumber,
  customerName,
  reason,
  refundInfo,
  companyName = "Nutra-Vive",
  companyUrl = "https://nutravive.com",
}: OrderCancelledProps) {
  return (
    <BaseEmail
      preview={`Order ${orderNumber} has been cancelled`}
      companyName={companyName}
      companyUrl={companyUrl}
    >
      <Section style={sharedStyles.hero}>
        <Text style={sharedStyles.heroTitle}>Order Cancelled</Text>
        <Text style={sharedStyles.heroText}>
          Hi {customerName}, your order #{orderNumber} has been cancelled.
        </Text>
      </Section>

      <Section style={sharedStyles.infoSection}>
        {reason && (
          <>
            <Text style={sharedStyles.reasonTitle}>
              Reason for cancellation:
            </Text>
            <Text style={sharedStyles.reasonText}>{reason}</Text>
          </>
        )}

        {refundInfo && (
          <>
            <Text style={sharedStyles.refundTitle}>Refund Information:</Text>
            <Text style={sharedStyles.refundText}>{refundInfo}</Text>
          </>
        )}
      </Section>

      <Section style={sharedStyles.ctaSection}>
        <Button href={`${companyUrl}/shop`} style={sharedStyles.button}>
          Continue Shopping
        </Button>
      </Section>

      <Section style={sharedStyles.supportSection}>
        <Text style={sharedStyles.supportText}>
          Questions about your cancellation? Contact our support team at{" "}
          <Text style={sharedStyles.supportLink}>support@nutravive.com</Text>
        </Text>
      </Section>
    </BaseEmail>
  );
}
