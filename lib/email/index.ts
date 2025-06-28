import { render } from "@react-email/render";
import { resend, emailConfig } from "./resend";

// Email template imports
import OrderConfirmationEmail from "./templates/order-confirmation";
import OrderStatusUpdateEmail from "./templates/order-status-update";
import OrderCancelledEmail from "./templates/order-cancelled";
import RefundProcessedEmail from "./templates/refund-processed";
import ConsultationConfirmationEmail from "./templates/consultation-confirmation";
import PaymentConfirmationEmail from "./templates/payment-confirmation";
import WelcomeEmail from "./templates/welcome";
import AdminNewOrderEmail from "./templates/admin-new-order";
import AdminNewUserEmail from "./templates/admin-new-user";
import BulkEmail from "./templates/bulk-email";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  data: Record<string, any>;
  from?: string;
}

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
      throw new Error(`Email template "${template}" not found`);
    }

    // Render the React component to HTML
    const html = await render(EmailComponent({ ...data, ...emailConfig }));

    // Send the email
    const result = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    console.log("✅ Email sent successfully:", result.data?.id);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("❌ Email sending failed:", error);

    // In development, log the email instead of failing
    if (process.env.NODE_ENV === "development") {
      console.log("📧 [DEV MODE] Email would have been sent:", {
        to,
        subject,
        template,
        data,
      });
      return { success: true, id: "dev-mode" };
    }

    throw error;
  }
}

function getEmailTemplate(template: string) {
  const templates: Record<string, any> = {
    "order-confirmation": OrderConfirmationEmail,
    "order-status-update": OrderStatusUpdateEmail,
    "order-cancelled": OrderCancelledEmail,
    "refund-processed": RefundProcessedEmail,
    "consultation-confirmation": ConsultationConfirmationEmail,
    "admin-new-order": AdminNewOrderEmail,
    "admin-new-user": AdminNewUserEmail,
    "payment-confirmation": PaymentConfirmationEmail,
    "bulk-email": BulkEmail,
    welcome: WelcomeEmail,
  };

  console.log(`Looking for template: ${template}`);
  console.log(`Available templates:`, Object.keys(templates));
  console.log(`BulkEmail import:`, BulkEmail);

  return templates[template];
}

// Convenience functions for common emails
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
export const sendAdminNewOrder = (to: string, data: any) =>
  sendEmail({
    to,
    subject: "New Order - Nutra-Vive",
    template: "admin-new-order",
    data,
  });

export const sendWelcomeEmail = (to: string, data: any) =>
  sendEmail({
    to,
    subject: "Your Nutra-Vive account has been created",
    template: "welcome",
    data,
  });

export const sendAdminNewUser = (to: string, data: any) =>
  sendEmail({
    to,
    subject: "New User Signup - Nutra-Vive",
    template: "admin-new-user",
    data,
  });
