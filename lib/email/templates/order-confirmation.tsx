import React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Img,
  Text,
  Link,
  Button,
  Hr,
} from "@react-email/components";

interface BaseEmailProps {
  children: React.ReactNode;
  preview: string;
  companyName?: string;
  companyUrl?: string;
}

export default function BaseEmail({
  children,
  preview,
  companyName = "Nutra-Vive",
  companyUrl = "https://nutravive.com",
}: BaseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Row>
              <Column>
                <Img
                  src={`${companyUrl}/logo-email.png`}
                  width="150"
                  height="50"
                  alt={companyName}
                  style={logo}
                />
              </Column>
            </Row>
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={hr} />
            <Text style={footerText}>
              © 2025 {companyName}. All rights reserved.
            </Text>
            <Text style={footerText}>
              <Link href={`${companyUrl}/unsubscribe`} style={link}>
                Unsubscribe
              </Link>
              {" | "}
              <Link href={`${companyUrl}/privacy`} style={link}>
                Privacy Policy
              </Link>
            </Text>
            <Text style={footerText}>
              Questions? Contact us at{" "}
              <Link href="mailto:support@nutravive.com" style={link}>
                support@nutravive.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
};

const header = {
  backgroundColor: "#ffffff",
  borderRadius: "12px 12px 0 0",
  padding: "24px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
};

const content = {
  backgroundColor: "#ffffff",
  padding: "24px",
  borderRadius: "0 0 12px 12px",
};

const footer = {
  margin: "32px 0 0 0",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "12px",
  color: "#8898aa",
  lineHeight: "16px",
  margin: "4px 0",
};

const link = {
  color: "#059669",
  textDecoration: "none",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};
