// lib/email/templates/welcome.tsx
import React from "react";
import {
  Text,
  Button,
  Section,
  Row,
  Column,
  Img,
} from "@react-email/components";
import BaseEmail, { sharedStyles } from "./_base";

interface WelcomeProps {
  firstName: string;
  companyName?: string;
  companyUrl?: string;
}

export default function WelcomeEmail({
  firstName,
  companyName = "NutraVive",
  companyUrl = "https://nutraviveholistic.com",
}: WelcomeProps) {
  return (
    <BaseEmail
      preview={`Your ${companyName} account has been successfully created.`}
      companyName={companyName}
      companyUrl={companyUrl}
    >
      <Section style={sharedStyles.hero}>
        <Text style={sharedStyles.heroTitle}>
          Welcome to Nutra-Vive, {firstName}
        </Text>
        <Text style={sharedStyles.heroText}>
          Your account has been successfully created. You can now access our
          wellness products and personalized nutrition services.
        </Text>
      </Section>

      <Section style={sharedStyles.infoSection}>
        <Text style={sharedStyles.infoTitle}>Getting Started</Text>
        <Text style={sharedStyles.infoText}>
          • Browse our organic juice and tea collections
          <br />
          • Book personalized nutrition consultations  
          <br />
          • Track your orders and manage your account
          <br />
          • Update your preferences anytime
        </Text>
      </Section>

      <Section style={sharedStyles.ctaSection}>
        <Button href={`${companyUrl}/account`} style={sharedStyles.primaryButton}>
          Access Your Account
        </Button>
        <Button
          href={`${companyUrl}/shop`}
          style={sharedStyles.secondaryButton}
        >
          Browse Products
        </Button>
      </Section>

      <Section style={sharedStyles.infoSection}>
        <Text style={sharedStyles.infoTitle}>Need Help?</Text>
        <Text style={sharedStyles.infoText}>
          If you have any questions, contact our support team at{" "}
          <Text style={sharedStyles.supportLink}>support@nutraviveholistic.com</Text>
        </Text>
      </Section>
    </BaseEmail>
  );
}
