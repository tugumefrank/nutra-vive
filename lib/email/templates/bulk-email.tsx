// lib/email/templates/bulk-email.tsx
import React from "react";
import {
  Text,
  Section,
} from "@react-email/components";
import BaseEmail, { sharedStyles } from "./_base";

interface BulkEmailProps {
  content: string;
  senderName?: string;
  companyName?: string;
  companyUrl?: string;
}

export default function BulkEmail({
  content,
  senderName = "Nutra-Vive Team",
  companyName = "Nutra-Vive",
  companyUrl = "https://nutraviveholistic.com",
}: BulkEmailProps) {
  // Convert line breaks to HTML
  const formatContent = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <BaseEmail
      preview={content.substring(0, 100) + "..."}
      companyName={companyName}
      companyUrl={companyUrl}
    >
      <Section style={sharedStyles.infoSection}>
        <Text style={contentStyle}>
          {formatContent(content)}
        </Text>
        
        <Text style={signatureStyle}>
          Best regards,<br />
          {senderName}
        </Text>
      </Section>
    </BaseEmail>
  );
}

const contentStyle = {
  fontSize: "16px",
  color: "#374151",
  lineHeight: "24px",
  margin: "0 0 24px 0",
  whiteSpace: "pre-wrap" as const,
};

const signatureStyle = {
  fontSize: "14px",
  color: "#6b7280",
  lineHeight: "20px",
  margin: "24px 0 0 0",
  borderTop: "1px solid #e5e7eb",
  paddingTop: "16px",
};