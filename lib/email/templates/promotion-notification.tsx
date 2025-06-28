import React from "react";
import {
  Text,
  Button,
  Section,
  Row,
  Column,
} from "@react-email/components";
import BaseEmail, { sharedStyles } from "./_base";

interface PromotionNotificationProps {
  customerName: string;
  promotionName: string;
  promotionDescription?: string;
  promotionCode?: string;
  discountValue: number;
  discountType: "percentage" | "fixed_amount" | "buy_x_get_y";
  expiresAt?: Date;
  companyName?: string;
  companyUrl?: string;
}

function PromotionNotification({
  customerName,
  promotionName,
  promotionDescription,
  promotionCode,
  discountValue,
  discountType,
  expiresAt,
  companyName = "Nutra-Vive",
  companyUrl = "https://nutraviveholistic.com",
}: PromotionNotificationProps) {
  const formatDiscount = () => {
    if (discountType === "percentage") {
      return `${discountValue}% OFF`;
    } else if (discountType === "fixed_amount") {
      return `$${discountValue} OFF`;
    }
    return "Special Offer";
  };

  const formatExpiryDate = () => {
    if (!expiresAt) return null;
    return new Date(expiresAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <BaseEmail
      preview={`Exclusive offer: ${formatDiscount()} on ${promotionName}`}
      companyName={companyName}
      companyUrl={companyUrl}
    >
      <Section style={sharedStyles.hero}>
        <Text style={sharedStyles.heroTitle}>
          Exclusive Offer Just for You! 🎉
        </Text>
        <Text style={sharedStyles.heroText}>
          Hi {customerName}, we have a special offer tailored just for you!
        </Text>
      </Section>

      <Section style={promotionSection}>
        <Text style={promotionTitle}>{promotionName}</Text>
        {promotionDescription && (
          <Text style={promotionDescription}>{promotionDescription}</Text>
        )}
        
        <div style={discountBadge}>
          <Text style={discountText}>{formatDiscount()}</Text>
        </div>

        {promotionCode && (
          <Section style={codeSection}>
            <Text style={codeLabel}>Use Code:</Text>
            <Text style={codeText}>{promotionCode}</Text>
          </Section>
        )}

        {expiresAt && (
          <Text style={expiryText}>
            ⏰ Offer expires on {formatExpiryDate()}
          </Text>
        )}
      </Section>

      <Section style={sharedStyles.benefitsSection}>
        <Text style={sharedStyles.benefitsTitle}>Why Shop with Us?</Text>

        <Row style={sharedStyles.benefitRow}>
          <Column style={sharedStyles.benefitIconCol}>
            <Text style={sharedStyles.benefitIcon}>🌿</Text>
          </Column>
          <Column>
            <Text style={sharedStyles.benefitTitle}>
              100% Organic Products
            </Text>
            <Text style={sharedStyles.benefitText}>
              Premium quality organic juices and teas with no artificial additives.
            </Text>
          </Column>
        </Row>

        <Row style={sharedStyles.benefitRow}>
          <Column style={sharedStyles.benefitIconCol}>
            <Text style={sharedStyles.benefitIcon}>🚚</Text>
          </Column>
          <Column>
            <Text style={sharedStyles.benefitTitle}>
              Fast & Free Shipping
            </Text>
            <Text style={sharedStyles.benefitText}>
              Free shipping on orders over $50 with quick delivery.
            </Text>
          </Column>
        </Row>

        <Row style={sharedStyles.benefitRow}>
          <Column style={sharedStyles.benefitIconCol}>
            <Text style={sharedStyles.benefitIcon}>💚</Text>
          </Column>
          <Column>
            <Text style={sharedStyles.benefitTitle}>
              Wellness Support
            </Text>
            <Text style={sharedStyles.benefitText}>
              Expert nutrition consultations and personalized recommendations.
            </Text>
          </Column>
        </Row>
      </Section>

      <Section style={sharedStyles.ctaSection}>
        <Button href={`${companyUrl}/shop`} style={sharedStyles.primaryButton}>
          Shop Now & Save
        </Button>
        <Button
          href={`${companyUrl}/consultation`}
          style={sharedStyles.secondaryButton}
        >
          Book Consultation
        </Button>
      </Section>

      <Section style={sharedStyles.infoSection}>
        <Text style={sharedStyles.infoTitle}>Terms & Conditions</Text>
        <Text style={sharedStyles.infoText}>
          • This offer is exclusive to you and cannot be transferred
          <br />
          • Cannot be combined with other promotions
          <br />
          • Valid for online purchases only
          <br />
          • Offer subject to product availability
        </Text>
      </Section>
    </BaseEmail>
  );
}

const promotionSection = {
  backgroundColor: "#f0fdf4",
  border: "2px solid #059669",
  borderRadius: "12px",
  padding: "24px",
  textAlign: "center" as const,
  margin: "24px 0",
};

const promotionTitle = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#166534",
  margin: "0 0 12px 0",
};

const promotionDescription = {
  fontSize: "16px",
  color: "#374151",
  margin: "0 0 20px 0",
  lineHeight: "24px",
};

const discountBadge = {
  backgroundColor: "#059669",
  borderRadius: "8px",
  padding: "16px 24px",
  margin: "16px auto",
  maxWidth: "200px",
};

const discountText = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#ffffff",
  margin: "0",
  textAlign: "center" as const,
};

const codeSection = {
  backgroundColor: "#f9fafb",
  border: "1px dashed #059669",
  borderRadius: "8px",
  padding: "16px",
  margin: "16px 0",
  textAlign: "center" as const,
};

const codeLabel = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0 0 4px 0",
};

const codeText = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#059669",
  fontFamily: "monospace",
  letterSpacing: "2px",
  margin: "0",
};

const expiryText = {
  fontSize: "14px",
  color: "#dc2626",
  fontWeight: "600",
  margin: "16px 0 0 0",
  textAlign: "center" as const,
};

export default PromotionNotification;