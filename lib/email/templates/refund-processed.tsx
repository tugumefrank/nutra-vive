// lib/email/templates/refund-processed.tsx
import React from "react";
import { Text, Button, Section, Row, Column } from "@react-email/components";
import BaseEmail, { sharedStyles } from "./_base";

interface RefundProcessedProps {
  orderNumber: string;
  customerName: string;
  refundAmount: number;
  refundId: string;
  companyName?: string;
  companyUrl?: string;
}

export default function RefundProcessedEmail({
  orderNumber,
  customerName,
  refundAmount,
  refundId,
  companyName = "Nutra-Vive",
  companyUrl = "https://nutraviveholistic.com",
}: RefundProcessedProps) {
  return (
    <BaseEmail
      preview={`Refund processed for order ${orderNumber}`}
      companyName={companyName}
      companyUrl={companyUrl}
    >
      <Section style={sharedStyles.hero}>
        <Text style={sharedStyles.heroTitle}>Refund Processed ✅</Text>
        <Text style={sharedStyles.heroText}>
          Hi {customerName}, your refund for order #{orderNumber} has been
          processed.
        </Text>
      </Section>

      <Section style={sharedStyles.refundSection}>
        <Text style={sharedStyles.sectionTitle}>Refund Details</Text>

        <Row style={sharedStyles.detailRow}>
          <Column style={sharedStyles.labelCol}>
            <Text style={sharedStyles.label}>Order Number:</Text>
          </Column>
          <Column>
            <Text style={sharedStyles.value}>#{orderNumber}</Text>
          </Column>
        </Row>

        <Row style={sharedStyles.detailRow}>
          <Column style={sharedStyles.labelCol}>
            <Text style={sharedStyles.label}>Refund Amount:</Text>
          </Column>
          <Column>
            <Text style={sharedStyles.refundAmount}>
              ${refundAmount.toFixed(2)}
            </Text>
          </Column>
        </Row>

        <Row style={sharedStyles.detailRow}>
          <Column style={sharedStyles.labelCol}>
            <Text style={sharedStyles.label}>Refund ID:</Text>
          </Column>
          <Column>
            <Text style={sharedStyles.refundId}>{refundId}</Text>
          </Column>
        </Row>
      </Section>

      <Section style={sharedStyles.timelineSection}>
        <Text style={sharedStyles.timelineTitle}>Refund Timeline</Text>
        <Text style={sharedStyles.timelineText}>
          • Your refund has been processed immediately
          <br />
          • You should see the credit in your account within 3-5 business days
          <br />• The exact timing depends on your bank or card issuer
        </Text>
      </Section>

      <Section style={sharedStyles.ctaSection}>
        <Button
          href={`${companyUrl}/orders/${orderNumber}`}
          style={sharedStyles.button}
        >
          View Order Details
        </Button>
      </Section>
    </BaseEmail>
  );
}
