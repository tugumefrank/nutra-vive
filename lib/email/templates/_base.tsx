// // lib/email/templates/_base.tsx

// import React from "react";
// import {
//   Html,
//   Head,
//   Preview,
//   Body,
//   Container,
//   Section,
//   Row,
//   Column,
//   Img,
//   Text,
//   Link,
//   Button,
//   Hr,
// } from "@react-email/components";

// interface BaseEmailProps {
//   children: React.ReactNode;
//   preview: string;
//   companyName?: string;
//   companyUrl?: string;
// }

// export default function BaseEmail({
//   children,
//   preview,
//   companyName = "Nutra-Vive",
//   companyUrl = "https://nutraviveholistic.com",
// }: BaseEmailProps) {
//   return (
//     <Html>
//       <Head />
//       <Preview>{preview}</Preview>
//       <Body style={main}>
//         <Container style={container}>
//           {/* Header */}
//           <Section style={header}>
//             <Row>
//               <Column>
//                 <Img
//                   src={`${companyUrl}/logo-email.png`}
//                   width="150"
//                   height="50"
//                   alt={companyName}
//                   style={logo}
//                 />
//               </Column>
//             </Row>
//           </Section>

//           {/* Content */}
//           <Section style={content}>{children}</Section>

//           {/* Footer */}
//           <Section style={footer}>
//             <Hr style={hr} />
//             <Text style={footerText}>
//               © 2025 {companyName}. All rights reserved.
//             </Text>
//             <Text style={footerText}>
//               <Link href={`${companyUrl}/unsubscribe`} style={link}>
//                 Unsubscribe
//               </Link>
//               {" | "}
//               <Link href={`${companyUrl}/privacy`} style={link}>
//                 Privacy Policy
//               </Link>
//             </Text>
//             <Text style={footerText}>
//               Questions? Contact us at{" "}
//               <Link href="mailto:support@nutraviveholistic.com" style={link}>
//                 support@nutraviveholistic.com
//               </Link>
//             </Text>
//           </Section>
//         </Container>
//       </Body>
//     </Html>
//   );
// }

// // =============================================================================
// // SHARED STYLES - Put all the shared styles here
// // =============================================================================

// // Base layout styles
// const main = {
//   backgroundColor: "#f6f9fc",
//   fontFamily:
//     '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
// };

// const container = {
//   margin: "0 auto",
//   padding: "20px 0 48px",
//   maxWidth: "600px",
// };

// const header = {
//   backgroundColor: "#ffffff",
//   borderRadius: "12px 12px 0 0",
//   padding: "24px",
//   textAlign: "center" as const,
// };

// const logo = {
//   margin: "0 auto",
// };

// const content = {
//   backgroundColor: "#ffffff",
//   padding: "24px",
//   borderRadius: "0 0 12px 12px",
// };

// const footer = {
//   margin: "32px 0 0 0",
//   textAlign: "center" as const,
// };

// const footerText = {
//   fontSize: "12px",
//   color: "#8898aa",
//   lineHeight: "16px",
//   margin: "4px 0",
// };

// const link = {
//   color: "#059669",
//   textDecoration: "none",
// };

// const hr = {
//   borderColor: "#e6ebf1",
//   margin: "20px 0",
// };

// // Shared component styles that templates can use
// export const sharedStyles = {
//   // Hero sections
//   hero: {
//     textAlign: "center" as const,
//     padding: "32px 24px",
//     backgroundColor: "#f0fdf4",
//     borderRadius: "12px",
//     margin: "0 0 32px 0",
//   },

//   heroTitle: {
//     fontSize: "32px",
//     fontWeight: "bold",
//     color: "#166534",
//     margin: "0 0 16px 0",
//     lineHeight: "1.2",
//   },

//   heroText: {
//     fontSize: "18px",
//     color: "#374151",
//     lineHeight: "28px",
//     margin: "0",
//   },

//   // Section styles
//   sectionTitle: {
//     fontSize: "24px",
//     fontWeight: "bold",
//     color: "#111827",
//     margin: "0 0 20px 0",
//   },

//   // Buttons
//   button: {
//     backgroundColor: "#059669",
//     borderRadius: "8px",
//     color: "#ffffff",
//     fontSize: "16px",
//     fontWeight: "600",
//     textDecoration: "none",
//     textAlign: "center" as const,
//     display: "inline-block",
//     padding: "14px 28px",
//     margin: "0 8px",
//   },

//   primaryButton: {
//     backgroundColor: "#059669",
//     borderRadius: "8px",
//     color: "#ffffff",
//     fontSize: "16px",
//     fontWeight: "600",
//     textDecoration: "none",
//     textAlign: "center" as const,
//     display: "inline-block",
//     padding: "14px 28px",
//     margin: "0 8px",
//   },

//   secondaryButton: {
//     backgroundColor: "#6b7280",
//     borderRadius: "8px",
//     color: "#ffffff",
//     fontSize: "16px",
//     fontWeight: "600",
//     textDecoration: "none",
//     textAlign: "center" as const,
//     display: "inline-block",
//     padding: "14px 28px",
//     margin: "8px 8px 0 8px",
//   },

//   // Sections
//   ctaSection: {
//     textAlign: "center" as const,
//     margin: "32px 0",
//   },

//   orderSection: {
//     border: "1px solid #e5e7eb",
//     borderRadius: "12px",
//     padding: "24px",
//     margin: "0 0 32px 0",
//     backgroundColor: "#fafafa",
//   },

//   // Detail rows
//   detailRow: {
//     margin: "12px 0",
//   },

//   labelCol: {
//     width: "140px",
//   },

//   label: {
//     fontSize: "14px",
//     color: "#6b7280",
//     fontWeight: "500",
//     margin: "0",
//   },

//   value: {
//     fontSize: "14px",
//     color: "#111827",
//     fontWeight: "600",
//     margin: "0",
//   },
// };
// lib/email/templates/_base.tsx - Complete with ALL shared styles

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
  companyUrl = "https://nutraviveholistic.com",
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
              <Link href="mailto:support@nutraviveholistic.com" style={link}>
                support@nutraviveholistic.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// =============================================================================
// ALL SHARED STYLES - Use these in your templates with sharedStyles.styleName
// =============================================================================

export const sharedStyles = {
  // ==========================================================================
  // HERO SECTIONS
  // ==========================================================================
  hero: {
    textAlign: "center" as const,
    padding: "32px 24px",
    backgroundColor: "#f0fdf4",
    borderRadius: "12px",
    margin: "0 0 32px 0",
  },

  heroTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#166534",
    margin: "0 0 16px 0",
    lineHeight: "1.2",
  },

  heroText: {
    fontSize: "18px",
    color: "#374151",
    lineHeight: "28px",
    margin: "0",
  },

  // ==========================================================================
  // SECTION TITLES & HEADERS
  // ==========================================================================
  sectionTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#111827",
    margin: "0 0 20px 0",
  },

  subSectionTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#111827",
    margin: "0 0 16px 0",
  },

  smallSectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 12px 0",
  },

  // ==========================================================================
  // BUTTONS
  // ==========================================================================
  button: {
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
  },

  primaryButton: {
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
  },

  secondaryButton: {
    backgroundColor: "#6b7280",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "14px 28px",
    margin: "8px 8px 0 8px",
  },

  adminButton: {
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
  },

  consultationButton: {
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
  },

  // ==========================================================================
  // SECTIONS & CONTAINERS
  // ==========================================================================
  ctaSection: {
    textAlign: "center" as const,
    margin: "32px 0",
  },

  orderSection: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    margin: "0 0 32px 0",
    backgroundColor: "#fafafa",
  },

  consultationSection: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    margin: "0 0 32px 0",
    backgroundColor: "#fafafa",
  },

  refundSection: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    margin: "0 0 32px 0",
    backgroundColor: "#fafafa",
  },

  infoSection: {
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    padding: "20px",
    margin: "24px 0 0 0",
  },

  nextStepsSection: {
    backgroundColor: "#f0fdf4",
    borderRadius: "8px",
    padding: "20px",
    margin: "24px 0",
  },

  timelineSection: {
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    padding: "20px",
    margin: "24px 0",
  },

  trackingSection: {
    backgroundColor: "#eff6ff",
    border: "1px solid #dbeafe",
    borderRadius: "8px",
    padding: "16px",
    margin: "16px 0",
  },

  supportSection: {
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    padding: "20px",
    textAlign: "center" as const,
    margin: "32px 0",
  },

  // ==========================================================================
  // ALERT & NOTIFICATION SECTIONS
  // ==========================================================================
  alertSection: {
    backgroundColor: "#fef3c7",
    border: "2px solid #f59e0b",
    borderRadius: "8px",
    padding: "20px",
    textAlign: "center" as const,
    margin: "0 0 24px 0",
  },

  urgencySection: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fca5a5",
    borderRadius: "8px",
    padding: "20px",
    margin: "24px 0",
  },

  discountSection: {
    backgroundColor: "#fef3c7",
    border: "2px solid #f59e0b",
    borderRadius: "12px",
    padding: "24px",
    textAlign: "center" as const,
    margin: "32px 0",
  },

  benefitsSection: {
    margin: "32px 0",
  },

  // ==========================================================================
  // DETAIL ROWS & TABLES
  // ==========================================================================
  detailRow: {
    margin: "12px 0",
  },

  totalRow: {
    margin: "8px 0",
  },

  totalRowFinal: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: "8px",
    margin: "16px 0 0 0",
  },

  itemRow: {
    borderBottom: "1px solid #f3f4f6",
    padding: "12px 0",
  },

  benefitRow: {
    margin: "20px 0",
    verticalAlign: "top",
  },

  // ==========================================================================
  // COLUMNS
  // ==========================================================================
  labelCol: {
    width: "140px",
  },

  itemImageCol: {
    width: "80px",
    verticalAlign: "top",
  },

  itemDetailsCol: {
    verticalAlign: "top",
    paddingLeft: "12px",
  },

  itemPriceCol: {
    width: "100px",
    textAlign: "right" as const,
    verticalAlign: "top",
  },

  benefitIconCol: {
    width: "60px",
    textAlign: "center" as const,
  },

  // ==========================================================================
  // TEXT STYLES
  // ==========================================================================
  label: {
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: "500",
    margin: "0",
  },

  value: {
    fontSize: "14px",
    color: "#111827",
    fontWeight: "600",
    margin: "0",
  },

  totalLabel: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0",
  },

  totalValue: {
    fontSize: "14px",
    color: "#111827",
    textAlign: "right" as const,
    margin: "0",
  },

  totalLabelFinal: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#111827",
    margin: "0",
  },

  totalValueFinal: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#111827",
    textAlign: "right" as const,
    margin: "0",
  },

  // ==========================================================================
  // SPECIAL VALUES & AMOUNTS
  // ==========================================================================
  paymentAmount: {
    fontSize: "18px",
    color: "#059669",
    fontWeight: "bold",
    margin: "0",
  },

  refundAmount: {
    fontSize: "18px",
    color: "#059669",
    fontWeight: "bold",
    margin: "0",
  },

  itemPrice: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
    margin: "0",
  },

  totalAmountValue: {
    fontSize: "18px",
    color: "#059669",
    fontWeight: "bold",
    margin: "0",
  },

  // ==========================================================================
  // STATUS & BADGES
  // ==========================================================================
  statusPaid: {
    fontSize: "14px",
    color: "#059669",
    fontWeight: "600",
    margin: "0",
  },

  urgencyBadge: {
    fontSize: "12px",
    color: "#ffffff",
    fontWeight: "bold",
    padding: "4px 8px",
    borderRadius: "4px",
    display: "inline-block",
  },

  // ==========================================================================
  // ITEM STYLES
  // ==========================================================================
  itemImage: {
    borderRadius: "6px",
  },

  itemName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 4px 0",
  },

  itemDetails: {
    fontSize: "12px",
    color: "#6b7280",
    margin: "0",
  },

  // ==========================================================================
  // INFO TEXT STYLES
  // ==========================================================================
  infoTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 12px 0",
  },

  infoText: {
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "20px",
    margin: "0",
  },

  nextStepsTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#166534",
    margin: "0 0 12px 0",
  },

  nextStepsText: {
    fontSize: "14px",
    color: "#166534",
    lineHeight: "20px",
    margin: "0",
  },

  timelineTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 12px 0",
  },

  timelineText: {
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "20px",
    margin: "0",
  },

  reasonTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 8px 0",
  },

  reasonText: {
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "20px",
    margin: "0 0 16px 0",
  },

  refundTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#059669",
    margin: "0 0 8px 0",
  },

  refundText: {
    fontSize: "14px",
    color: "#059669",
    lineHeight: "20px",
    margin: "0",
  },

  supportText: {
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "20px",
    margin: "0",
  },

  supportLink: {
    color: "#059669",
    textDecoration: "none",
    fontWeight: "600",
  },

  // ==========================================================================
  // ALERT TEXT STYLES
  // ==========================================================================
  alertTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#92400e",
    margin: "0 0 8px 0",
  },

  alertText: {
    fontSize: "16px",
    color: "#92400e",
    margin: "0",
  },

  urgencyTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#dc2626",
    margin: "0 0 12px 0",
  },

  urgencyText: {
    fontSize: "14px",
    color: "#dc2626",
    lineHeight: "20px",
    margin: "0",
  },

  // ==========================================================================
  // DISCOUNT & PROMOTION STYLES
  // ==========================================================================
  discountTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#92400e",
    margin: "0 0 12px 0",
  },

  discountText: {
    fontSize: "16px",
    color: "#92400e",
    margin: "0",
  },

  discountCode: {
    backgroundColor: "#f59e0b",
    color: "#ffffff",
    padding: "4px 8px",
    borderRadius: "4px",
    fontWeight: "bold",
    fontFamily: "monospace",
  },

  // ==========================================================================
  // BENEFIT & FEATURE STYLES
  // ==========================================================================
  benefitsTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#111827",
    margin: "0 0 24px 0",
    textAlign: "center" as const,
  },

  benefitIcon: {
    fontSize: "24px",
    margin: "0",
  },

  benefitTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 8px 0",
  },

  benefitText: {
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "20px",
    margin: "0",
  },

  // ==========================================================================
  // TRACKING & DELIVERY STYLES
  // ==========================================================================
  trackingLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e40af",
    margin: "0 0 4px 0",
  },

  trackingNumber: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#1e40af",
    fontFamily: "monospace",
    margin: "0",
  },

  deliveryText: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "12px 0 0 0",
  },

  statusDescription: {
    fontSize: "16px",
    color: "#374151",
    lineHeight: "24px",
    margin: "0 0 16px 0",
  },

  // ==========================================================================
  // MISC STYLES
  // ==========================================================================
  refundId: {
    fontSize: "12px",
    color: "#6b7280",
    fontFamily: "monospace",
    margin: "0",
  },

  totalsSection: {
    borderTop: "2px solid #e5e7eb",
    paddingTop: "16px",
    marginTop: "16px",
  },

  // ==========================================================================
  // BASE LAYOUT STYLES (for the email container)
  // ==========================================================================
  main: {
    backgroundColor: "#f6f9fc",
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  },

  container: {
    margin: "0 auto",
    padding: "20px 0 48px",
    maxWidth: "600px",
  },

  header: {
    backgroundColor: "#ffffff",
    borderRadius: "12px 12px 0 0",
    padding: "24px",
    textAlign: "center" as const,
  },

  logo: {
    margin: "0 auto",
  },

  content: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "0 0 12px 12px",
  },

  footer: {
    margin: "32px 0 0 0",
    textAlign: "center" as const,
  },

  footerText: {
    fontSize: "12px",
    color: "#8898aa",
    lineHeight: "16px",
    margin: "4px 0",
  },

  link: {
    color: "#059669",
    textDecoration: "none",
  },

  hr: {
    borderColor: "#e6ebf1",
    margin: "20px 0",
  },
};

// Keep the original styles for the base layout
const main = sharedStyles.main;
const container = sharedStyles.container;
const header = sharedStyles.header;
const logo = sharedStyles.logo;
const content = sharedStyles.content;
const footer = sharedStyles.footer;
const footerText = sharedStyles.footerText;
const link = sharedStyles.link;
const hr = sharedStyles.hr;
