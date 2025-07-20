// lib/email-templates.ts

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface EmailData {
  [key: string]: any;
}

// Helper  function to generate HTML email template.
const createEmailTemplate = (content: string, title: string) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 0;
              background-color: #f5f7fa;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
          }
          .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
          }
          .header p {
              margin: 10px 0 0 0;
              opacity: 0.9;
              font-size: 16px;
          }
          .content {
              padding: 40px 30px;
          }
          .highlight-box {
              background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
              border: 1px solid #10b981;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
          }
          .button {
              display: inline-block;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
          }
          .footer {
              background-color: #f9fafb;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
          }
          .footer p {
              margin: 5px 0;
              color: #6b7280;
              font-size: 14px;
          }
          .text-center { text-align: center; }
          .text-emerald { color: #10b981; }
          .font-bold { font-weight: 700; }
          .mb-4 { margin-bottom: 16px; }
          .mt-4 { margin-top: 16px; }
      </style>
  </head>
  <body>
      <div class="container">
          ${content}
          <div class="footer">
              <p><strong>Nutra-Vive</strong></p>
              <p>Where Wellness Meets Flavor—Naturally</p>
              <p>📧 support@nutraviveholistic.com | 📞 (555) 123-4567</p>
              <p>🌐 <a href="https://nutraviveholistic.com" style="color: #10b981;">nutraviveholistic.com</a></p>
          </div>
      </div>
  </body>
  </html>
  `;

export const emailTemplates = {
  // Consultation Confirmation Email
  "consultation-confirmation": (data: EmailData): EmailTemplate => {
    const content = `
        <div class="header">
            <h1>Consultation Request Received! 🌿</h1>
            <p>Thank you for choosing Nutra-Vive for your wellness journey</p>
        </div>
        <div class="content">
            <p>Hi ${data.firstName},</p>
            
            <p>We've successfully received your consultation request and are excited to help you achieve your health and wellness goals!</p>
            
            <div class="highlight-box">
                <h3 class="text-emerald font-bold mb-4">Consultation Details</h3>
                <p><strong>Consultation Number:</strong> ${
                  data.consultationNumber
                }</p>
                <p><strong>Total Amount:</strong> $${data.totalAmount}</p>
                <p><strong>Services Selected:</strong></p>
                <ul>
                    ${data.services
                      .map((service: string) => `<li>${service}</li>`)
                      .join("")}
                </ul>
            </div>
            
            <h3>What Happens Next?</h3>
            <ol>
                <li><strong>Payment Processing:</strong> We'll process your payment securely</li>
                <li><strong>Confirmation Call:</strong> Our team will contact you within 24 hours to confirm your appointment</li>
                <li><strong>Consultation Prep:</strong> We'll send you a preparation guide before your session</li>
                <li><strong>Your Session:</strong> Meet with our certified nutritionist at your scheduled time</li>
            </ol>
            
            <div class="text-center mt-4">
                <a href="https://nutraviveholistic.com/consultation/manage?id=${
                  data.consultationNumber
                }" class="button">
                    Manage Your Consultation
                </a>
            </div>
            
            <p class="mt-4">If you have any questions or need to reschedule, please don't hesitate to contact us at support@nutraviveholistic.com or (555) 123-4567.</p>
            
            <p>Looking forward to helping you on your wellness journey!</p>
            
            <p>Best regards,<br>
            <strong>The Nutra-Vive Team</strong><br>
            <em>Your Partners in Natural Wellness</em></p>
        </div>
      `;

    return {
      subject: `Consultation Request Confirmed - ${data.consultationNumber}`,
      html: createEmailTemplate(content, "Consultation Confirmed"),
      text: `Hi ${data.firstName},
  
  We've received your consultation request (${data.consultationNumber}) for $${
    data.totalAmount
  }.
  
  Our team will contact you within 24 hours to confirm your appointment.
  
  Services selected: ${data.services.join(", ")}
  
  Best regards,
  The Nutra-Vive Team`,
    };
  },

  // Payment Confirmation Email
  "payment-confirmation": (data: EmailData): EmailTemplate => {
    const content = `
        <div class="header">
            <h1>Payment Confirmed! ✅</h1>
            <p>Your consultation is now officially booked</p>
        </div>
        <div class="content">
            <p>Hi ${data.firstName},</p>
            
            <p>Great news! Your payment has been successfully processed and your consultation is now confirmed.</p>
            
            <div class="highlight-box">
                <h3 class="text-emerald font-bold mb-4">Payment Summary</h3>
                <p><strong>Consultation Number:</strong> ${
                  data.consultationNumber
                }</p>
                <p><strong>Amount Paid:</strong> $${data.totalAmount}</p>
                <p><strong>Payment Status:</strong> <span style="color: #10b981; font-weight: 600;">CONFIRMED</span></p>
                <p><strong>Transaction Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <h3>Next Steps</h3>
            <p>Our nutrition specialist will contact you within the next 24 hours to:</p>
            <ul>
                <li>Confirm your preferred consultation time</li>
                <li>Send you a pre-consultation questionnaire</li>
                <li>Provide preparation instructions</li>
                <li>Share the meeting link (if virtual consultation)</li>
            </ul>
            
            <div class="text-center mt-4">
                <a href="https://nutraviveholistic.com/consultation/${
                  data.consultationNumber
                }" class="button">
                    View Consultation Details
                </a>
            </div>
            
            <p class="mt-4">We're excited to begin this wellness journey with you!</p>
            
            <p>Best regards,<br>
            <strong>The Nutra-Vive Team</strong></p>
        </div>
      `;

    return {
      subject: `Payment Confirmed - Your Consultation is Booked!`,
      html: createEmailTemplate(content, "Payment Confirmed"),
      text: `Hi ${data.firstName},
  
  Your payment for consultation ${data.consultationNumber} has been confirmed!
  
  Amount: $${data.totalAmount}
  Status: CONFIRMED
  
  Our team will contact you within 24 hours to schedule your session.
  
  Best regards,
  The Nutra-Vive Team`,
    };
  },

  // Admin Notification Email
  "admin-consultation-notification": (data: EmailData): EmailTemplate => {
    const urgencyColors = {
      high: "#ef4444",
      medium: "#f59e0b",
      low: "#10b981",
    };

    const content = `
        <div class="header">
            <h1>New Consultation Request 📋</h1>
            <p>A new consultation booking requires your attention</p>
        </div>
        <div class="content">
            <div class="highlight-box">
                <h3 class="text-emerald font-bold mb-4">Consultation Details</h3>
                <p><strong>Consultation Number:</strong> ${
                  data.consultationNumber
                }</p>
                <p><strong>Customer:</strong> ${data.customerName}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Total Amount:</strong> $${data.totalAmount}</p>
                <p><strong>Urgency Level:</strong> 
                    <span style="color: ${
                      urgencyColors[data.urgency as keyof typeof urgencyColors]
                    }; font-weight: 600; text-transform: uppercase;">
                        ${data.urgency}
                    </span>
                </p>
                <p><strong>Services:</strong> ${data.services.join(", ")}</p>
            </div>
            
            <h3>Action Required</h3>
            <p>Please review the consultation request and contact the customer within 24 hours to confirm scheduling.</p>
            
            <div class="text-center mt-4">
                <a href="https://nutraviveholistic.com/admin/consultations/${
                  data.consultationNumber
                }" class="button">
                    Review Consultation
                </a>
            </div>
            
            <p class="mt-4"><em>This is an automated notification from the Nutra-Vive consultation system.</em></p>
        </div>
      `;

    return {
      subject: `New Consultation Request - ${
        data.consultationNumber
      } (${data.urgency.toUpperCase()} Priority)`,
      html: createEmailTemplate(content, "New Consultation Request"),
      text: `New consultation request received:
  
  Consultation: ${data.consultationNumber}
  Customer: ${data.customerName}
  Email: ${data.email}
  Amount: $${data.totalAmount}
  Urgency: ${data.urgency.toUpperCase()}
  Services: ${data.services.join(", ")}
  
  Please review and contact customer within 24 hours.`,
    };
  },

  // Consultation Status Update Email
  "consultation-status-update": (data: EmailData): EmailTemplate => {
    const statusMessages = {
      confirmed: "Your consultation has been confirmed! 🎉",
      completed: "Thank you for your consultation! 🌟",
      cancelled: "Your consultation has been cancelled 😔",
      rescheduled: "Your consultation has been rescheduled 📅",
    };

    const statusContent = {
      confirmed: `
          <p>Great news! Your consultation has been officially confirmed.</p>
          <div class="highlight-box">
              <p><strong>Scheduled Date & Time:</strong> ${
                data.scheduledAt
                  ? new Date(data.scheduledAt).toLocaleString()
                  : "To be determined"
              }</p>
              ${
                data.consultantNotes
                  ? `<p><strong>Notes:</strong> ${data.consultantNotes}</p>`
                  : ""
              }
          </div>
          <p>We'll send you a reminder 24 hours before your scheduled session. Please make sure to:</p>
          <ul>
              <li>Complete any pre-consultation forms we send you</li>
              <li>Prepare your health questions and goals</li>
              <li>Have a quiet space ready for your consultation</li>
          </ul>
        `,
      completed: `
          <p>Thank you for taking the time to meet with our nutrition specialist! We hope you found the session valuable and informative.</p>
          ${
            data.consultantNotes
              ? `
          <div class="highlight-box">
              <h4>Session Summary</h4>
              <p>${data.consultantNotes}</p>
          </div>
          `
              : ""
          }
          <p>Your personalized recommendations and meal plans (if applicable) will be sent to you within 2-3 business days.</p>
          <p>Remember, this is just the beginning of your wellness journey. We're here to support you every step of the way!</p>
        `,
      cancelled: `
          <p>We understand that plans can change. Your consultation has been cancelled as requested.</p>
          ${
            data.consultantNotes
              ? `<p><strong>Reason:</strong> ${data.consultantNotes}</p>`
              : ""
          }
          <p>If you'd like to reschedule or book a new consultation, we're here to help. Just reply to this email or contact us at support@nutraviveholistic.com.</p>
          <p>Your wellness journey is important to us, and we hope to work with you in the future!</p>
        `,
      rescheduled: `
          <p>Your consultation has been rescheduled to accommodate your needs.</p>
          <div class="highlight-box">
              <p><strong>New Date & Time:</strong> ${
                data.scheduledAt
                  ? new Date(data.scheduledAt).toLocaleString()
                  : "To be determined"
              }</p>
              ${
                data.consultantNotes
                  ? `<p><strong>Notes:</strong> ${data.consultantNotes}</p>`
                  : ""
              }
          </div>
          <p>We'll send you a confirmation and reminder for your new appointment time.</p>
        `,
    };

    const content = `
        <div class="header">
            <h1>${
              statusMessages[data.status as keyof typeof statusMessages]
            }</h1>
            <p>Update for consultation ${data.consultationNumber}</p>
        </div>
        <div class="content">
            <p>Hi ${data.firstName},</p>
            
            ${statusContent[data.status as keyof typeof statusContent]}
            
            <div class="text-center mt-4">
                <a href="https://nutraviveholistic.com/consultation/${
                  data.consultationNumber
                }" class="button">
                    View Consultation Details
                </a>
            </div>
            
            <p class="mt-4">If you have any questions, please don't hesitate to reach out to us.</p>
            
            <p>Best regards,<br>
            <strong>The Nutra-Vive Team</strong></p>
        </div>
      `;

    return {
      subject: `Consultation Update - ${data.consultationNumber}`,
      html: createEmailTemplate(content, "Consultation Update"),
      text: `Hi ${data.firstName},
  
  Your consultation ${
    data.consultationNumber
  } status has been updated to: ${data.status.toUpperCase()}
  
  ${
    data.scheduledAt
      ? `Scheduled for: ${new Date(data.scheduledAt).toLocaleString()}`
      : ""
  }
  ${data.consultantNotes ? `Notes: ${data.consultantNotes}` : ""}
  
  Best regards,
  The Nutra-Vive Team`,
    };
  },

  // Consultation Reminder Email
  "consultation-reminder": (data: EmailData): EmailTemplate => {
    const content = `
        <div class="header">
            <h1>Consultation Reminder ⏰</h1>
            <p>Your session is coming up soon!</p>
        </div>
        <div class="content">
            <p>Hi ${data.firstName},</p>
            
            <p>This is a friendly reminder that your nutrition consultation is scheduled for tomorrow!</p>
            
            <div class="highlight-box">
                <h3 class="text-emerald font-bold mb-4">Consultation Details</h3>
                <p><strong>Date & Time:</strong> ${new Date(
                  data.scheduledAt
                ).toLocaleString()}</p>
                <p><strong>Consultation Number:</strong> ${
                  data.consultationNumber
                }</p>
                <p><strong>Duration:</strong> 20-30 minutes</p>
                ${
                  data.meetingLink
                    ? `<p><strong>Meeting Link:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>`
                    : ""
                }
                ${
                  data.consultantName
                    ? `<p><strong>Your Nutritionist:</strong> ${data.consultantName}</p>`
                    : ""
                }
            </div>
            
            <h3>To Prepare for Your Session:</h3>
            <ul>
                <li>✅ Complete your pre-consultation questionnaire (if not done already)</li>
                <li>✅ Prepare a list of your health goals and questions</li>
                <li>✅ Have your current medications/supplements list ready</li>
                <li>✅ Find a quiet, private space for the call</li>
                <li>✅ Test your internet connection and camera (for video calls)</li>
            </ul>
            
            <div class="text-center mt-4">
                ${
                  data.meetingLink
                    ? `
                <a href="${data.meetingLink}" class="button">
                    Join Consultation
                </a>
                `
                    : `
                <a href="https://nutraviveholistic.com/consultation/${data.consultationNumber}" class="button">
                    View Details
                </a>
                `
                }
            </div>
            
            <p class="mt-4">Need to reschedule? Contact us at least 4 hours before your appointment by replying to this email or calling (555) 123-4567.</p>
            
            <p>Looking forward to helping you on your wellness journey!</p>
            
            <p>Best regards,<br>
            <strong>The Nutra-Vive Team</strong></p>
        </div>
      `;

    return {
      subject: `Reminder: Your Nutrition Consultation Tomorrow - ${data.consultationNumber}`,
      html: createEmailTemplate(content, "Consultation Reminder"),
      text: `Hi ${data.firstName},
  
  Reminder: Your nutrition consultation is scheduled for tomorrow!
  
  Date & Time: ${new Date(data.scheduledAt).toLocaleString()}
  Consultation: ${data.consultationNumber}
  
  ${data.meetingLink ? `Meeting Link: ${data.meetingLink}` : ""}
  
  Please prepare:
  - Complete pre-consultation questionnaire
  - List of health goals and questions
  - Current medications/supplements list
  
  Contact us if you need to reschedule.
  
  Best regards,
  The Nutra-Vive Team`,
    };
  },
};

// Email sending utility using your preferred email service
export const sendEmail = async (options: {
  to: string;
  subject?: string;
  template: keyof typeof emailTemplates;
  data: EmailData;
}) => {
  const { to, template, data, subject } = options;

  try {
    const emailTemplate = emailTemplates[template](data);

    // Replace with your email service (SendGrid, Mailgun, AWS SES, etc.)
    // Example with a generic email service:
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        subject: subject || emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }

    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error };
  }
};
