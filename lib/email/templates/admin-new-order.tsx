// lib/email/templates/admin-new-order.tsx
import React from "react";
import { Text, Button, Section, Row, Column } from "@react-email/components";
import BaseEmail, { sharedStyles } from "./_base";

interface AdminNewOrderProps {
  orderNumber: string;
  customerName: string;
  total: number;
  itemCount: number;
  companyName?: string;
  companyUrl?: string;
}

export default function AdminNewOrderEmail({
  orderNumber,
  customerName,
  total,
  itemCount,
  companyName = "Nutra-Vive",
  companyUrl = "https://nutraviveholistic.com",
}: AdminNewOrderProps) {
  return (
    <BaseEmail
      preview={`🛒 New order ${orderNumber} from ${customerName}`}
      companyName={companyName}
      companyUrl={companyUrl}
    >
      <Section style={alertSection}>
        <Text style={alertTitle}>🛒 New Order Alert</Text>
        <Text style={alertText}>
          A new order has been placed and requires your attention.
        </Text>
      </Section>

      <Section style={sharedStyles.orderSection}>
        <Text style={sharedStyles.sectionTitle}>Order Details</Text>

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
            <Text style={sharedStyles.label}>Customer:</Text>
          </Column>
          <Column>
            <Text style={sharedStyles.value}>{customerName}</Text>
          </Column>
        </Row>

        <Row style={sharedStyles.detailRow}>
          <Column style={sharedStyles.labelCol}>
            <Text style={sharedStyles.label}>Items:</Text>
          </Column>
          <Column>
            <Text style={sharedStyles.value}>
              {itemCount} item{itemCount > 1 ? "s" : ""}
            </Text>
          </Column>
        </Row>

        <Row style={sharedStyles.detailRow}>
          <Column style={sharedStyles.labelCol}>
            <Text style={sharedStyles.label}>Total:</Text>
          </Column>
          <Column>
            <Text style={totalValue}>${total.toFixed(2)}</Text>
          </Column>
        </Row>
      </Section>

      <Section style={urgencySection}>
        <Text style={urgencyTitle}>⚡ Action Required</Text>
        <Text style={urgencyText}>
          • Review and process the order
          <br />
          • Prepare items for shipment
          <br />
          • Update inventory if needed
          <br />• Send shipping confirmation to customer
        </Text>
      </Section>

      <Section style={sharedStyles.ctaSection}>
        <Button
          href={`${companyUrl}/admin/orders/${orderNumber}`}
          style={adminButton}
        >
          View Order in Admin
        </Button>
        <Button
          href={`${companyUrl}/admin/orders`}
          style={sharedStyles.secondaryButton}
        >
          View All Orders
        </Button>
      </Section>
    </BaseEmail>
  );
}

// Admin-specific styles
const alertSection = {
  backgroundColor: "#fef3c7",
  border: "2px solid #f59e0b",
  borderRadius: "8px",
  padding: "20px",
  textAlign: "center" as const,
  margin: "0 0 24px 0",
};

const alertTitle = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#92400e",
  margin: "0 0 8px 0",
};

const alertText = {
  fontSize: "16px",
  color: "#92400e",
  margin: "0",
};

const totalValue = {
  fontSize: "18px",
  color: "#059669",
  fontWeight: "bold",
  margin: "0",
};

const urgencySection = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fca5a5",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const urgencyTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#dc2626",
  margin: "0 0 12px 0",
};

const urgencyText = {
  fontSize: "14px",
  color: "#dc2626",
  lineHeight: "20px",
  margin: "0",
};

const adminButton = {
  backgroundColor: "#dc2626",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 28px",
  margin: "0 8px",
};
