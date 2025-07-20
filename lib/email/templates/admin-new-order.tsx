// lib/email/templates/admin-new-order.tsx
import React from "react";
import { Text, Button, Section, Row, Column, Img } from "@react-email/components";
import BaseEmail, { sharedStyles } from "./_base";

interface AdminNewOrderProps {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderId: string; // MongoDB ObjectId
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    totalPrice: number;
    productImage?: string;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  companyName?: string;
  companyUrl?: string;
  // Membership-specific props
  isMembershipOrder?: boolean;
  membershipTier?: string;
  membershipDiscount?: number;
  promotionDiscount?: number;
  totalSavings?: number;
}

export default function AdminNewOrderEmail({
  orderNumber,
  customerName,
  customerEmail,
  orderId,
  items,
  subtotal,
  shipping,
  tax,
  total,
  companyName = "Nutra-Vive",
  companyUrl = "https://nutraviveholistic.com",
  isMembershipOrder = false,
  membershipTier,
  membershipDiscount = 0,
  promotionDiscount = 0,
  totalSavings = 0,
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
            <Text style={sharedStyles.label}>Email:</Text>
          </Column>
          <Column>
            <Text style={sharedStyles.value}>{customerEmail}</Text>
          </Column>
        </Row>

        <Row style={sharedStyles.detailRow}>
          <Column style={sharedStyles.labelCol}>
            <Text style={sharedStyles.label}>Items:</Text>
          </Column>
          <Column>
            <Text style={sharedStyles.value}>
              {items.length} item{items.length > 1 ? "s" : ""}
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

      {/* Order Items */}
      <Section style={sharedStyles.orderSection}>
        <Text style={sharedStyles.sectionTitle}>Order Items</Text>

        {items.map((item, index) => (
          <Row
            key={index}
            style={{
              ...sharedStyles.detailRow,
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "15px",
              marginBottom: "15px",
            }}
          >
            {item.productImage && (
              <Column style={{ width: "60px", paddingRight: "15px" }}>
                <Img
                  src={item.productImage}
                  alt={item.productName}
                  width="50"
                  height="50"
                  style={{
                    borderRadius: "8px",
                    objectFit: "cover" as const,
                  }}
                />
              </Column>
            )}
            <Column>
              <Text
                style={{
                  ...sharedStyles.value,
                  fontWeight: "600",
                  margin: "0 0 5px 0",
                }}
              >
                {item.productName}
              </Text>
              <Text
                style={{
                  ...sharedStyles.label,
                  margin: "0",
                  fontSize: "14px",
                }}
              >
                Qty: {item.quantity} × ${item.price.toFixed(2)}
              </Text>
            </Column>
            <Column style={{ textAlign: "right" as const, width: "80px" }}>
              <Text
                style={{
                  ...sharedStyles.value,
                  fontWeight: "600",
                  margin: "0",
                }}
              >
                ${item.totalPrice.toFixed(2)}
              </Text>
            </Column>
          </Row>
        ))}
      </Section>

      {/* Membership Benefits Section */}
      {isMembershipOrder && totalSavings > 0 && (
        <Section
          style={{
            backgroundColor: "#fef3c7",
            border: "2px solid #f59e0b",
            padding: "20px",
            borderRadius: "8px",
            margin: "20px 0",
            textAlign: "center" as const,
          }}
        >
          <Text
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#92400e",
              margin: "0 0 10px 0",
            }}
          >
            🏆 {membershipTier} Member Benefits Applied!
          </Text>
          <Text
            style={{
              fontSize: "16px",
              color: "#92400e",
              margin: "0 0 15px 0",
            }}
          >
            Customer saved ${totalSavings.toFixed(2)} on this order!
          </Text>
          {membershipDiscount > 0 && (
            <Text
              style={{
                fontSize: "14px",
                color: "#78350f",
                margin: "5px 0",
              }}
            >
              • Membership Discount: ${membershipDiscount.toFixed(2)}
            </Text>
          )}
          {promotionDiscount > 0 && (
            <Text
              style={{
                fontSize: "14px",
                color: "#78350f",
                margin: "5px 0",
              }}
            >
              • Promotion Discount: ${promotionDiscount.toFixed(2)}
            </Text>
          )}
          {total === 0 && (
            <Text
              style={{
                fontSize: "14px",
                color: "#059669",
                fontWeight: "600",
                margin: "10px 0 0 0",
              }}
            >
              ✨ This order is completely FREE thanks to membership!
            </Text>
          )}
        </Section>
      )}

      {/* Order Summary */}
      <Section
        style={{
          backgroundColor: "#f9fafb",
          padding: "20px",
          borderRadius: "8px",
          margin: "20px 0",
        }}
      >
        <Text style={sharedStyles.sectionTitle}>Order Summary</Text>
        
        <Row style={sharedStyles.detailRow}>
          <Column style={sharedStyles.labelCol}>
            <Text style={sharedStyles.label}>Subtotal:</Text>
          </Column>
          <Column style={{ textAlign: "right" as const }}>
            <Text style={sharedStyles.value}>${subtotal.toFixed(2)}</Text>
          </Column>
        </Row>

        <Row style={sharedStyles.detailRow}>
          <Column style={sharedStyles.labelCol}>
            <Text style={sharedStyles.label}>Shipping:</Text>
          </Column>
          <Column style={{ textAlign: "right" as const }}>
            <Text style={sharedStyles.value}>
              {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
            </Text>
          </Column>
        </Row>

        <Row style={sharedStyles.detailRow}>
          <Column style={sharedStyles.labelCol}>
            <Text style={sharedStyles.label}>Tax:</Text>
          </Column>
          <Column style={{ textAlign: "right" as const }}>
            <Text style={sharedStyles.value}>${tax.toFixed(2)}</Text>
          </Column>
        </Row>

        <Row
          style={{
            ...sharedStyles.detailRow,
            borderTop: "2px solid #059669",
            paddingTop: "15px",
            marginTop: "15px",
          }}
        >
          <Column style={sharedStyles.labelCol}>
            <Text
              style={{
                ...sharedStyles.label,
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              Total:
            </Text>
          </Column>
          <Column style={{ textAlign: "right" as const }}>
            <Text
              style={{
                ...sharedStyles.value,
                fontSize: "18px",
                fontWeight: "700",
                color: "#059669",
              }}
            >
              ${total.toFixed(2)}
            </Text>
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
          href={`${companyUrl}/admin/orders/${orderId}`}
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
