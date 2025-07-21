// lib/actions/supportServerActions.ts
"use server";

import { Resend } from "resend";
import CustomerSupportEmail from "@/lib/email/templates/customer-support";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendCustomerSupportEmailParams {
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  orderNumber?: string;
  mobileContext?: {
    userId?: string;
    deviceInfo?: {
      platform?: string;
      version?: string;
      model?: string;
    };
    timestamp?: string;
    source?: string;
  };
}

export async function sendCustomerSupportEmail({
  customerName,
  customerEmail,
  subject,
  message,
  orderNumber,
  mobileContext,
}: SendCustomerSupportEmailParams): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate required fields
    if (!customerName?.trim()) {
      return { success: false, error: "Customer name is required" };
    }

    if (!customerEmail?.trim()) {
      return { success: false, error: "Customer email is required" };
    }

    if (!subject?.trim()) {
      return { success: false, error: "Subject is required" };
    }

    if (!message?.trim()) {
      return { success: false, error: "Message is required" };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return { success: false, error: "Please enter a valid email address" };
    }

    // Send support email to support team
    const emailResult = await resend.emails.send({
      from: "Nutra-Vive Support <noreply@nutraviveholistic.com>",
      to: ["support@nutraviveholistic.com"],
      replyTo: customerEmail,
      subject: `Customer Support: ${subject}`,
      react: CustomerSupportEmail({
        customerName,
        customerEmail,
        subject,
        message,
        orderNumber,
        companyName: "Nutra-Vive",
        companyUrl: "https://nutraviveholistic.com",
        mobileContext,
      }),
    });

    if (emailResult.error) {
      console.error("Error sending support email:", emailResult.error);
      return {
        success: false,
        error: "Failed to send support message. Please try again.",
      };
    }

    console.log("✅ Support email sent successfully:", {
      messageId: emailResult.data?.id,
      customerEmail,
      subject,
      orderNumber,
      source: mobileContext?.source || "web",
      userId: mobileContext?.userId,
    });

    return { success: true };
  } catch (error) {
    console.error("Error in sendCustomerSupportEmail:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}