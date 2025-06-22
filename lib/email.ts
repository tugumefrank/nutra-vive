// lib/email.ts - Simplified service that replaces your existing email function

import { Resend } from "resend";
import { render } from "@react-email/render";

// Email template imports
import OrderConfirmationEmail from "./email/templates/order-confirmation";
import OrderStatusUpdateEmail from "./email/templates/order-status-update";
import OrderCancelledEmail from "./email/templates/order-cancelled";
import RefundProcessedEmail from "./email/templates/refund-processed";
import ConsultationConfirmationEmail from "./email/templates/consultation-confirmation";
import PaymentConfirmationEmail from "./email/templates/payment-confirmation";
import WelcomeEmail from "./email/templates/welcome";
import AdminNewOrderEmail from "./email/templates/admin-new-order";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const emailConfig = {
  from: process.env.FROM_EMAIL || "noreply@nutravive.com",
  adminEmail: process.env.ADMIN_EMAIL || "admin@nutravive.com",
  companyName: process.env.COMPANY_NAME || "Nutra-Vive",
  companyUrl: process.env.COMPANY_URL || "https://nutravive.com",
};

export interface EmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  data: Record<string, any>;
  from?: string;
}

// Main email sending function that replaces your existing sendEmail function
export async function sendEmail({
  to,
  subject,
  template,
  data,
  from = emailConfig.from,
}: EmailOptions) {
  try {
    console.log(`📧 Sending ${template} email to:`, to);

    // Get the React component for the template
    const EmailComponent = getEmailTemplate(template);
    if (!EmailComponent) {
      console.error(`❌ Email template "${template}" not found`);

      // In development, just log instead of failing
      if (process.env.NODE_ENV === "development") {
        console.log("📧 [DEV MODE] Email would have been sent:", {
          to,
          subject,
          template,
          data,
        });
        return { success: true, id: "dev-mode" };
      }

      throw new Error(`Email template "${template}" not found`);
    }

    // Render the React component to HTML
    const html = await render(EmailComponent({ ...data, ...emailConfig }));

    // Check if we're in development mode and Resend is not configured
    if (!process.env.RESEND_API_KEY) {
      console.log("📧 [DEV MODE] Resend not configured, logging email:", {
        to,
        subject,
        template,
        data,
      });
      console.log(
        "📧 [DEV MODE] Email HTML preview:",
        html.substring(0, 200) + "..."
      );
      return { success: true, id: "dev-mode" };
    }

    // Send the email with Resend
    const result = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (result.error) {
      console.error("❌ Resend API error:", result.error);
      throw new Error(result.error.message);
    }

    console.log("✅ Email sent successfully:", result.data?.id);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("❌ Email sending failed:", error);

    // In development, log the email instead of failing
    if (process.env.NODE_ENV === "development") {
      console.log("📧 [DEV MODE] Email failed but logged:", {
        to,
        subject,
        template,
        data,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return { success: true, id: "dev-mode-fallback" };
    }

    // In production, we might want to still throw to handle the error properly
    throw error;
  }
}

// Template mapping function
function getEmailTemplate(template: string) {
  const templates: Record<string, any> = {
    "order-confirmation": OrderConfirmationEmail,
    "order-status-update": OrderStatusUpdateEmail,
    "order-cancelled": OrderCancelledEmail,
    "refund-processed": RefundProcessedEmail,
    "admin-new-order": AdminNewOrderEmail,
    "consultation-confirmation": ConsultationConfirmationEmail,
    "payment-confirmation": PaymentConfirmationEmail,
    welcome: WelcomeEmail,
  };

  return templates[template];
}

// Convenience functions for common emails (optional, but makes it easier to use)
export const sendOrderConfirmation = (to: string, data: any) =>
  sendEmail({
    to,
    subject: `Order Confirmed - ${data.orderNumber}`,
    template: "order-confirmation",
    data,
  });

export const sendOrderStatusUpdate = (to: string, data: any) =>
  sendEmail({
    to,
    subject: `Order Update - ${data.orderNumber}`,
    template: "order-status-update",
    data,
  });

export const sendConsultationConfirmation = (to: string, data: any) =>
  sendEmail({
    to,
    subject: "Consultation Request Received - Nutra-Vive",
    template: "consultation-confirmation",
    data,
  });

export const sendOrderCancellation = (to: string, data: any) =>
  sendEmail({
    to,
    subject: `Order Cancelled - ${data.orderNumber}`,
    template: "order-cancelled",
    data,
  });

export const sendRefundNotification = (to: string, data: any) =>
  sendEmail({
    to,
    subject: `Refund Processed - ${data.orderNumber}`,
    template: "refund-processed",
    data,
  });

export const sendWelcomeEmail = (to: string, data: any) =>
  sendEmail({
    to,
    subject: `Welcome to ${emailConfig.companyName}!`,
    template: "welcome",
    data,
  });

// Admin notification helper
export const sendAdminNotification = (
  subject: string,
  data: any,
  template: string = "admin-notification"
) =>
  sendEmail({
    to: emailConfig.adminEmail,
    subject: `[ADMIN] ${subject}`,
    template,
    data,
  });

export const sendAdminNewOrder = (to: string, data: any) =>
  sendEmail({
    to,
    subject: "New Order - Nutra-Vive",
    template: "admin-new-order",
    data,
  });
