// lib/email/templates/customer-support.tsx
import React from "react";
import {
  Text,
  Section,
  Row,
  Column,
} from "@react-email/components";
import BaseEmail, { sharedStyles } from "./_base";

interface CustomerSupportProps {
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  orderNumber?: string;
  companyName?: string;
  companyUrl?: string;
}

export default function CustomerSupportEmail({
  customerName,
  customerEmail,
  subject,
  message,
  orderNumber,
  companyName = "Nutra-Vive",
  companyUrl = "https://nutraviveholistic.com",
}: CustomerSupportProps) {
  return (
    <BaseEmail
      preview={`Customer Support Request: ${subject}`}
      companyName={companyName}
      companyUrl={companyUrl}
    >
      <Section style={sharedStyles.hero}>
        <Text style={sharedStyles.heroTitle}>
          📧 Customer Support Request
        </Text>
        <Text style={sharedStyles.heroText}>
          A customer has submitted a support request through the order tracking page.
        </Text>
      </Section>

      <Section style={sharedStyles.consultationSection}>
        <Text style={sharedStyles.sectionTitle}>Customer Information</Text>

        <Row style={sharedStyles.detailRow}>
          <Column style={sharedStyles.labelCol}>
            <Text style={sharedStyles.label}>Customer Name:</Text>
          </Column>
          <Column>
            <Text style={sharedStyles.value}>{customerName}</Text>
          </Column>
        </Row>

        <Row style={sharedStyles.detailRow}>
          <Column style={sharedStyles.labelCol}>
            <Text style={sharedStyles.label}>Email Address:</Text>
          </Column>
          <Column>
            <Text style={{
              ...sharedStyles.value,
              color: "#0066cc",
              textDecoration: "none",
            }}>
              {customerEmail}
            </Text>
          </Column>
        </Row>

        {orderNumber && (
          <Row style={sharedStyles.detailRow}>
            <Column style={sharedStyles.labelCol}>
              <Text style={sharedStyles.label}>Order Number:</Text>
            </Column>
            <Column>
              <Text style={{
                ...sharedStyles.value,
                fontWeight: "600",
                color: "#059669",
              }}>
                {orderNumber}
              </Text>
            </Column>
          </Row>
        )}

        <Row style={sharedStyles.detailRow}>
          <Column style={sharedStyles.labelCol}>
            <Text style={sharedStyles.label}>Subject:</Text>
          </Column>
          <Column>
            <Text style={{
              ...sharedStyles.value,
              fontWeight: "600",
            }}>
              {subject}
            </Text>
          </Column>
        </Row>
      </Section>

      <Section style={sharedStyles.consultationSection}>
        <Text style={sharedStyles.sectionTitle}>Customer Message</Text>
        
        <Section style={{
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "20px",
          margin: "15px 0",
        }}>
          <Text style={{
            fontSize: "16px",
            lineHeight: "1.6",
            color: "#374151",
            margin: "0",
            whiteSpace: "pre-wrap" as const,
            fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
          }}>
            {message}
          </Text>
        </Section>
      </Section>

      <Section style={sharedStyles.nextStepsSection}>
        <Text style={sharedStyles.nextStepsTitle}>Next Steps</Text>
        <Text style={sharedStyles.nextStepsText}>
          1. Review the customer's message and any order details
          <br />
          2. Reply directly to the customer's email address: {customerEmail}
          <br />
          {orderNumber && (
            <>
              3. Reference order {orderNumber} in your response if applicable
              <br />
            </>
          )}
          3. Update any internal tracking systems if needed
          <br />
          4. Follow up to ensure the customer's issue is resolved
        </Text>
      </Section>

      <Section style={{
        backgroundColor: "#fef3c7",
        border: "2px solid #f59e0b",
        borderRadius: "8px",
        padding: "20px",
        margin: "20px 0",
        textAlign: "center" as const,
      }}>
        <Text style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#92400e",
          margin: "0 0 10px 0",
        }}>
          ⚡ Priority Support Request
        </Text>
        <Text style={{
          fontSize: "14px",
          color: "#78350f",
          margin: "0",
        }}>
          This message was sent through the customer tracking page. 
          Please respond within 24 hours to maintain excellent customer service.
        </Text>
      </Section>
    </BaseEmail>
  );
}