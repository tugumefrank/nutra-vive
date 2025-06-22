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
  companyName = "Nutra-Vive",
  companyUrl = "https://nutraviveholistic.com",
}: WelcomeProps) {
  return (
    <BaseEmail
      preview={`Welcome to ${companyName}! Your wellness journey starts here.`}
      companyName={companyName}
      companyUrl={companyUrl}
    >
      <Section style={sharedStyles.hero}>
        <Text style={sharedStyles.heroTitle}>
          Welcome to the Nutra-Vive Family! 🌿
        </Text>
        <Text style={sharedStyles.heroText}>
          Hi {firstName}, we're thrilled to have you join our community of
          wellness enthusiasts. Your journey to better health starts now!
        </Text>
      </Section>

      <Section style={sharedStyles.benefitsSection}>
        <Text style={sharedStyles.benefitsTitle}>What makes us special:</Text>

        <Row style={sharedStyles.benefitRow}>
          <Column style={sharedStyles.benefitIconCol}>
            <Text style={sharedStyles.benefitIcon}>🥤</Text>
          </Column>
          <Column>
            <Text style={sharedStyles.benefitTitle}>
              100% Organic Ingredients
            </Text>
            <Text style={sharedStyles.benefitText}>
              All our juices and teas are made from certified organic, premium
              ingredients with no artificial additives.
            </Text>
          </Column>
        </Row>

        <Row style={sharedStyles.benefitRow}>
          <Column style={sharedStyles.benefitIconCol}>
            <Text style={sharedStyles.benefitIcon}>⚡</Text>
          </Column>
          <Column>
            <Text style={sharedStyles.benefitTitle}>
              Fresh & Natural Energy
            </Text>
            <Text style={sharedStyles.benefitText}>
              Experience clean energy and vitality with our carefully crafted
              wellness blends.
            </Text>
          </Column>
        </Row>

        <Row style={sharedStyles.benefitRow}>
          <Column style={sharedStyles.benefitIconCol}>
            <Text style={sharedStyles.benefitIcon}>🌱</Text>
          </Column>
          <Column>
            <Text style={sharedStyles.benefitTitle}>Personalized Wellness</Text>
            <Text style={sharedStyles.benefitText}>
              Get personalized nutrition consultations to optimize your health
              journey.
            </Text>
          </Column>
        </Row>
      </Section>

      <Section style={sharedStyles.ctaSection}>
        <Button href={`${companyUrl}/shop`} style={sharedStyles.primaryButton}>
          Explore Our Products
        </Button>
        <Button
          href={`${companyUrl}/consultations`}
          style={sharedStyles.secondaryButton}
        >
          Book a Consultation
        </Button>
      </Section>

      <Section style={sharedStyles.discountSection}>
        <Text style={sharedStyles.discountTitle}>
          Special Welcome Offer! 🎉
        </Text>
        <Text style={sharedStyles.discountText}>
          Use code <Text style={sharedStyles.discountCode}>WELCOME15</Text> for
          15% off your first order
        </Text>
      </Section>
    </BaseEmail>
  );
}
