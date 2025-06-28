// lib/email/templates/admin-new-user.tsx
import React from "react";
import { Text, Button, Section, Row, Column } from "@react-email/components";
import BaseEmail, { sharedStyles } from "./_base";

interface AdminNewUserProps {
  userName: string;
  userEmail: string;
  signupDate: string;
  companyName?: string;
  companyUrl?: string;
}

export default function AdminNewUserEmail({
  userName,
  userEmail,
  signupDate,
  companyName = "Nutra-Vive",
  companyUrl = "https://nutraviveholistic.com",
}: AdminNewUserProps) {
  return (
    <BaseEmail
      preview={`👋 New user signup: ${userName} (${userEmail})`}
      companyName={companyName}
      companyUrl={companyUrl}
    >
      <Section style={alertSection}>
        <Text style={alertTitle}>👋 New User Signup</Text>
        <Text style={alertText}>
          A new user has joined the Nutra-Vive community!
        </Text>
      </Section>

      <Section style={sharedStyles.orderSection}>
        <Text style={sharedStyles.sectionTitle}>User Details</Text>

        <Row style={sharedStyles.detailRow}>
          <Column style={sharedStyles.labelCol}>
            <Text style={sharedStyles.label}>Name:</Text>
          </Column>
          <Column>
            <Text style={sharedStyles.value}>{userName}</Text>
          </Column>
        </Row>

        <Row style={sharedStyles.detailRow}>
          <Column style={sharedStyles.labelCol}>
            <Text style={sharedStyles.label}>Email:</Text>
          </Column>
          <Column>
            <Text style={sharedStyles.value}>{userEmail}</Text>
          </Column>
        </Row>

        <Row style={sharedStyles.detailRow}>
          <Column style={sharedStyles.labelCol}>
            <Text style={sharedStyles.label}>Signup Date:</Text>
          </Column>
          <Column>
            <Text style={sharedStyles.value}>{signupDate}</Text>
          </Column>
        </Row>
      </Section>

      <Section style={infoSection}>
        <Text style={infoTitle}>📋 What's Next</Text>
        <Text style={infoText}>
          • Welcome email with 5% discount code has been sent automatically
          <br />
          • User can now browse products and make purchases
          <br />
          • Consider following up with personalized recommendations
          <br />• Monitor for first purchase activity
        </Text>
      </Section>

      <Section style={sharedStyles.ctaSection}>
        <Button
          href={`${companyUrl}/admin/users`}
          style={adminButton}
        >
          View User in Admin
        </Button>
        <Button
          href={`${companyUrl}/admin`}
          style={sharedStyles.secondaryButton}
        >
          Admin Dashboard
        </Button>
      </Section>
    </BaseEmail>
  );
}

// Admin-specific styles
const alertSection = {
  backgroundColor: "#f0fdf4",
  border: "2px solid #059669",
  borderRadius: "8px",
  padding: "20px",
  textAlign: "center" as const,
  margin: "0 0 24px 0",
};

const alertTitle = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#166534",
  margin: "0 0 8px 0",
};

const alertText = {
  fontSize: "16px",
  color: "#166534",
  margin: "0",
};

const infoSection = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const infoTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#111827",
  margin: "0 0 12px 0",
};

const infoText = {
  fontSize: "14px",
  color: "#6b7280",
  lineHeight: "20px",
  margin: "0",
};

const adminButton = {
  backgroundColor: "#059669",
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