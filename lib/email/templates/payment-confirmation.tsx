// lib/email/templates/payment-confirmation.tsx
import React from "react";
import { Text, Button, Section, Row, Column } from "@react-email/components";
import BaseEmail, { sharedStyles } from "./_base";

interface PaymentConfirmationProps {
  firstName: string;
  consultationNumber: string;
  totalAmount: number;
  companyName?: string;
  companyUrl?: string;
}

export default function PaymentConfirmationEmail({
  firstName,
  consultationNumber,
  totalAmount,
  companyName = "Nutra-Vive",
  companyUrl = "https://nutraviveholistic.com",
}: PaymentConfirmationProps) {
  return (
    <BaseEmail
      preview={`Payment confirmed for consultation ${consultationNumber}`}
      companyName={companyName}
      companyUrl={companyUrl}
    >
      <Section style={sharedStyles.hero}>
        <Text style={sharedStyles.heroTitle}>Payment Confirmed! ✅</Text>
        <Text style={sharedStyles.heroText}>
          Hi {firstName}, your payment has been processed successfully. We're
          excited to help you on your wellness journey!
        </Text>
      </Section>

      <Section style={sharedStyles.orderSection}>
        <Text style={sharedStyles.sectionTitle}>Payment Details</Text>

        <Row style={sharedStyles.detailRow}>
          <Column style={sharedStyles.labelCol}>
            <Text style={sharedStyles.label}>Consultation:</Text>
          </Column>
          <Column>
            <Text style={sharedStyles.value}>#{consultationNumber}</Text>
          </Column>
        </Row>

        <Row style={sharedStyles.detailRow}>
          <Column style={sharedStyles.labelCol}>
            <Text style={sharedStyles.label}>Amount Paid:</Text>
          </Column>
          <Column>
            <Text style={paymentAmount}>${totalAmount.toFixed(2)}</Text>
          </Column>
        </Row>

        <Row style={sharedStyles.detailRow}>
          <Column style={sharedStyles.labelCol}>
            <Text style={sharedStyles.label}>Status:</Text>
          </Column>
          <Column>
            <Text style={statusPaid}>Paid ✓</Text>
          </Column>
        </Row>
      </Section>

      <Section style={nextStepsSection}>
        <Text style={nextStepsTitle}>What happens next?</Text>
        <Text style={nextStepsText}>
          🌱 Our wellness expert will review your information within 24 hours
          <br />
          📞 We'll contact you to schedule your consultation
          <br />
          📋 Your personalized wellness plan will be created
          <br />
          🚀 Start your journey to better health with our guidance
        </Text>
      </Section>

      <Section style={sharedStyles.ctaSection}>
        <Button
          href={`${companyUrl}/consultations/${consultationNumber}`}
          style={sharedStyles.button}
        >
          View Consultation Details
        </Button>
      </Section>
    </BaseEmail>
  );
}

// Additional styles specific to this template
const paymentAmount = {
  fontSize: "18px",
  color: "#059669",
  fontWeight: "bold",
  margin: "0",
};

const statusPaid = {
  fontSize: "14px",
  color: "#059669",
  fontWeight: "600",
  margin: "0",
};

const nextStepsSection = {
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const nextStepsTitle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#166534",
  margin: "0 0 12px 0",
};

const nextStepsText = {
  fontSize: "14px",
  color: "#166534",
  lineHeight: "20px",
  margin: "0",
};
