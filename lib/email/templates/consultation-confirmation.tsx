// lib/email/templates/consultation-confirmation.tsx
import React from "react";
import { Text, Button, Section, Row, Column } from "@react-email/components";
import BaseEmail, { sharedStyles } from "./_base";

interface ConsultationConfirmationProps {
  firstName: string;
  consultationNumber: string;
  totalAmount: number;
  services: string[];
  companyName?: string;
  companyUrl?: string;
}

export default function ConsultationConfirmationEmail({
  firstName,
  consultationNumber,
  totalAmount,
  services,
  companyName = "Nutra-Vive",
  companyUrl = "https://nutraviveholistic.com",
}: ConsultationConfirmationProps) {
  return (
    <BaseEmail
      preview={`Your consultation request ${consultationNumber} has been received!`}
      companyName={companyName}
      companyUrl={companyUrl}
    >
      <Section style={sharedStyles.hero}>
        <Text style={sharedStyles.heroTitle}>
          Consultation Request Received! 🌱
        </Text>
        <Text style={sharedStyles.heroText}>
          Hi {firstName}, we've received your wellness consultation request. Our
          team will review your information and contact you soon.
        </Text>
      </Section>

      <Section style={sharedStyles.consultationSection}>
        <Text style={sharedStyles.sectionTitle}>
          Consultation #{consultationNumber}
        </Text>

        <Row style={sharedStyles.detailRow}>
          <Column style={sharedStyles.labelCol}>
            <Text style={sharedStyles.label}>Services Requested:</Text>
          </Column>
          <Column>
            <Text style={sharedStyles.value}>{services.join(", ")}</Text>
          </Column>
        </Row>

        <Row style={sharedStyles.detailRow}>
          <Column style={sharedStyles.labelCol}>
            <Text style={sharedStyles.label}>Total Amount:</Text>
          </Column>
          <Column>
            <Text style={sharedStyles.value}>${totalAmount.toFixed(2)}</Text>
          </Column>
        </Row>
      </Section>

      <Section style={sharedStyles.nextStepsSection}>
        <Text style={sharedStyles.nextStepsTitle}>What happens next?</Text>
        <Text style={sharedStyles.nextStepsText}>
          1. Our wellness expert will review your submission within 24 hours
          <br />
          2. We'll contact you to schedule your consultation
          <br />
          3. Your personalized wellness plan will be created
          <br />
          4. Start your journey to better health with our guidance
        </Text>
      </Section>

      <Section style={sharedStyles.ctaSection}>
        <Button
          href={`${companyUrl}/account/consultations/${consultationNumber}`}
          style={sharedStyles.button}
        >
          View Your Request
        </Button>
      </Section>
    </BaseEmail>
  );
}
