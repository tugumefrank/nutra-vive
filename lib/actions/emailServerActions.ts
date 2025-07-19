"use server";

import { auth } from "@clerk/nextjs/server";
import { sendEmail } from "../email";
import { User } from "../db/models";
import { connectToDatabase } from "../db";

export async function sendCustomerEmail(data: {
  customerEmail: string;
  subject: string;
  message: string;
  orderNumber: string;
}) {
  try {
    // Check if user is authenticated and is admin
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId });
    if (!user || user.role !== "admin") {
      return { success: false, error: "Admin access required" };
    }

    // Send the email
    const result = await sendEmail({
      to: data.customerEmail,
      subject: data.subject,
      template: "bulk-email",
      data: {
        content: data.message,
        senderName: "Nutra-Vive Support Team",
      },
    });

    if (result.success) {
      console.log(`📧 Customer email sent to ${data.customerEmail} regarding order ${data.orderNumber}`);
      return { success: true, message: `Email sent successfully to ${data.customerEmail}` };
    } else {
      console.error("❌ Failed to send customer email:", result);
      return { success: false, error: "Failed to send email" };
    }
  } catch (error) {
    console.error("❌ Error sending customer email:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}