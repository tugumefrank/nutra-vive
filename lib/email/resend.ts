import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const emailConfig = {
  from: process.env.FROM_EMAIL || "noreply@nutraviveholistic.com",
  adminEmail: "orders@nutraviveholistic.com",
  companyName: process.env.COMPANY_NAME || "Nutra-Vive",
  companyUrl: process.env.COMPANY_URL || "https://nutraviveholistic.com",
};
