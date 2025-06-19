// lib/email.ts

import { emailTemplates } from "./email-templates";

interface EmailOptions {
  to: string;
  subject?: string;
  template?: keyof typeof emailTemplates;
  data?: Record<string, any>;
  html?: string;
  text?: string;
}

interface EmailResponse {
  success: boolean;
  error?: string;
  messageId?: string;
}

// Main email sending function using Resend
export async function sendEmail(options: EmailOptions): Promise<EmailResponse> {
  try {
    // Check if we're in development mode
    if (process.env.NODE_ENV === "development") {
      console.log("📧 [DEV MODE] Email would be sent:", {
        to: options.to,
        subject: options.subject,
        template: options.template,
        data: options.data,
      });

      // Return mock success in development
      return {
        success: true,
        messageId: `mock-${Date.now()}`,
      };
    }

    // Production email sending with Resend
    return await sendEmailWithResend(options);
  } catch (error: any) {
    console.error("Email service error:", error);
    return {
      success: false,
      error: error.message || "Failed to send email",
    };
  }
}

// Resend Implementation
async function sendEmailWithResend(
  options: EmailOptions
): Promise<EmailResponse> {
  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { Resend } = require("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    let html = options.html;
    let text = options.text;
    let subject = options.subject;

    // Use template if provided
    if (options.template && options.data) {
      const emailTemplate = emailTemplates[options.template](options.data);
      html = emailTemplate.html;
      text = emailTemplate.text;
      subject = subject || emailTemplate.subject;
    }

    // Validate required fields
    if (!html && !text) {
      throw new Error("Either HTML or text content is required");
    }

    if (!subject) {
      throw new Error("Email subject is required");
    }

    const emailData = {
      from: process.env.FROM_EMAIL || "Nutra-Vive <noreply@nutravive.com>",
      to: options.to,
      subject,
      ...(html && { html }),
      ...(text && { text }),
    };

    console.log("📧 Sending email via Resend:", {
      to: options.to,
      subject,
      template: options.template,
    });

    const response = await resend.emails.send(emailData);

    if (response.error) {
      throw new Error(response.error.message || "Resend API error");
    }

    console.log("✅ Email sent successfully:", response.data?.id);

    return {
      success: true,
      messageId: response.data?.id,
    };
  } catch (error: any) {
    console.error("❌ Resend email error:", error);
    return {
      success: false,
      error: error.message || "Failed to send email via Resend",
    };
  }
}

// Utility function to send consultation emails
export async function sendConsultationEmail(
  type:
    | "confirmation"
    | "payment-confirmation"
    | "admin-notification"
    | "status-update"
    | "reminder",
  to: string,
  data: Record<string, any>
): Promise<EmailResponse> {
  const templateMap = {
    confirmation: "consultation-confirmation",
    "payment-confirmation": "payment-confirmation",
    "admin-notification": "admin-consultation-notification",
    "status-update": "consultation-status-update",
    reminder: "consultation-reminder",
  } as const;

  return sendEmail({
    to,
    template: templateMap[type],
    data,
  });
}

// Utility function to send bulk emails (for marketing, etc.)
export async function sendBulkEmails(
  emails: { to: string; data?: Record<string, any> }[],
  template: keyof typeof emailTemplates,
  commonData: Record<string, any> = {}
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Send emails with a delay to respect rate limits
  for (const email of emails) {
    try {
      const result = await sendEmail({
        to: email.to,
        template,
        data: { ...commonData, ...email.data },
      });

      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push(`Failed to send to ${email.to}: ${result.error}`);
      }

      // Add small delay between emails to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error: any) {
      results.failed++;
      results.errors.push(`Error sending to ${email.to}: ${error.message}`);
    }
  }

  return results;
}

// Test email function for development
export async function sendTestEmail(to: string): Promise<EmailResponse> {
  return sendEmail({
    to,
    subject: "Nutra-Vive - Test Email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #f97316;">Nutra-Vive Email Test</h1>
        <p>This is a test email to verify your email configuration is working correctly.</p>
        <p>If you received this email, your Resend integration is set up properly! 🎉</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          This email was sent from your Nutra-Vive application.
        </p>
      </div>
    `,
    text: "Nutra-Vive Email Test - If you received this email, your Resend integration is working correctly!",
  });
}
