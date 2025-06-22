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
//   companyUrl = "https://nutravive.com",
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
//               <Link href="mailto:support@nutravive.com" style={link}>
//                 support@nutravive.com
//               </Link>
//             </Text>
//           </Section>
//         </Container>
//       </Body>
//     </Html>
//   );
// }

// // Styles
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
// lib/email/templates/order-confirmation.tsx
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

interface OrderConfirmationProps {
  orderNumber: string;
  customerName: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    totalPrice: number;
    productImage?: string;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  companyName?: string;
  companyUrl?: string;
}

export default function OrderConfirmationEmail({
  orderNumber,
  customerName,
  items,
  subtotal,
  shipping,
  tax,
  total,
  companyName = "Nutra-Vive",
  companyUrl = "https://nutraviveholistic.com",
}: OrderConfirmationProps) {
  return (
    <BaseEmail
      preview={`Your order ${orderNumber} has been confirmed!`}
      companyName={companyName}
      companyUrl={companyUrl}
    >
      <Section style={sharedStyles.hero}>
        <Text style={sharedStyles.heroTitle}>Order Confirmed! 🎉</Text>
        <Text style={sharedStyles.heroText}>
          Hi {customerName}, thank you for your order! We've received your
          payment and will start preparing your wellness products right away.
        </Text>
      </Section>

      <Section style={sharedStyles.consultationSection}>
        <Text style={sharedStyles.sectionTitle}>Order #{orderNumber}</Text>

        {/* Order Items */}
        <Section style={{ margin: "20px 0" }}>
          <Text
            style={{
              ...sharedStyles.label,
              fontSize: "16px",
              marginBottom: "15px",
            }}
          >
            Your Items:
          </Text>

          {items.map((item, index) => (
            <Row
              key={index}
              style={{
                ...sharedStyles.detailRow,
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "15px",
                marginBottom: "15px",
              }}
            >
              {item.productImage && (
                <Column style={{ width: "60px", paddingRight: "15px" }}>
                  <Img
                    src={item.productImage}
                    alt={item.productName}
                    width="50"
                    height="50"
                    style={{
                      borderRadius: "8px",
                      objectFit: "cover" as const,
                    }}
                  />
                </Column>
              )}
              <Column>
                <Text
                  style={{
                    ...sharedStyles.value,
                    fontWeight: "600",
                    margin: "0 0 5px 0",
                  }}
                >
                  {item.productName}
                </Text>
                <Text
                  style={{
                    ...sharedStyles.label,
                    margin: "0",
                    fontSize: "14px",
                  }}
                >
                  Qty: {item.quantity} × ${item.price.toFixed(2)}
                </Text>
              </Column>
              <Column style={{ textAlign: "right" as const, width: "80px" }}>
                <Text
                  style={{
                    ...sharedStyles.value,
                    fontWeight: "600",
                    margin: "0",
                  }}
                >
                  ${item.totalPrice.toFixed(2)}
                </Text>
              </Column>
            </Row>
          ))}
        </Section>

        {/* Order Summary */}
        <Section
          style={{
            backgroundColor: "#f9fafb",
            padding: "20px",
            borderRadius: "8px",
            margin: "20px 0",
          }}
        >
          <Row style={sharedStyles.detailRow}>
            <Column style={sharedStyles.labelCol}>
              <Text style={sharedStyles.label}>Subtotal:</Text>
            </Column>
            <Column style={{ textAlign: "right" as const }}>
              <Text style={sharedStyles.value}>${subtotal.toFixed(2)}</Text>
            </Column>
          </Row>

          <Row style={sharedStyles.detailRow}>
            <Column style={sharedStyles.labelCol}>
              <Text style={sharedStyles.label}>Shipping:</Text>
            </Column>
            <Column style={{ textAlign: "right" as const }}>
              <Text style={sharedStyles.value}>
                {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
              </Text>
            </Column>
          </Row>

          <Row style={sharedStyles.detailRow}>
            <Column style={sharedStyles.labelCol}>
              <Text style={sharedStyles.label}>Tax:</Text>
            </Column>
            <Column style={{ textAlign: "right" as const }}>
              <Text style={sharedStyles.value}>${tax.toFixed(2)}</Text>
            </Column>
          </Row>

          <Row
            style={{
              ...sharedStyles.detailRow,
              borderTop: "2px solid #059669",
              paddingTop: "15px",
              marginTop: "15px",
            }}
          >
            <Column style={sharedStyles.labelCol}>
              <Text
                style={{
                  ...sharedStyles.label,
                  fontSize: "18px",
                  fontWeight: "700",
                }}
              >
                Total:
              </Text>
            </Column>
            <Column style={{ textAlign: "right" as const }}>
              <Text
                style={{
                  ...sharedStyles.value,
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#059669",
                }}
              >
                ${total.toFixed(2)}
              </Text>
            </Column>
          </Row>
        </Section>
      </Section>

      <Section style={sharedStyles.nextStepsSection}>
        <Text style={sharedStyles.nextStepsTitle}>What happens next?</Text>
        <Text style={sharedStyles.nextStepsText}>
          1. We'll prepare your order within 1-2 business days
          <br />
          2. You'll receive a shipping confirmation with tracking info
          <br />
          3. Your wellness products will arrive in 3-5 business days
          <br />
          4. Start your journey to better health with our organic products
        </Text>
      </Section>

      <Section style={sharedStyles.ctaSection}>
        <Button
          href={`${companyUrl}/orders/${orderNumber}`}
          style={sharedStyles.button}
        >
          Track Your Order
        </Button>
      </Section>
    </BaseEmail>
  );
}
