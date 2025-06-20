"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import Stripe from "stripe";

import { connectToDatabase } from "../db";
import { sendEmail } from "../email";
import { Consultation, IConsultation, User } from "../db/models";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

// Validation Schema
const consultationFormSchema = z.object({
  // Personal Info
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  age: z.number().min(13, "Must be at least 13 years old"),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"]),
  occupation: z.string().optional(),

  // Health Info
  currentWeight: z
    .number()
    .min(50, "Current weight must be at least 50 lbs")
    .max(500, "Current weight must be less than 500 lbs"),
  goalWeight: z
    .number()
    .min(50, "Goal weight must be at least 50 lbs")
    .max(500, "Goal weight must be less than 500 lbs"),
  height: z.string().min(1, "Height is required"),
  activityLevel: z.enum([
    "sedentary",
    "lightly-active",
    "moderately-active",
    "very-active",
    "extremely-active",
  ]),
  dietaryRestrictions: z.array(z.string()).default([]),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  currentMedications: z.string().optional(),
  previousDietExperience: z.string().optional(),

  // Goals & Lifestyle
  primaryGoals: z.array(z.string()).min(1, "At least one goal is required"),
  motivationLevel: z.number().min(1).max(10),
  biggestChallenges: z.array(z.string()).default([]),
  currentEatingHabits: z.string().optional(),
  mealPrepExperience: z.enum(["none", "beginner", "intermediate", "advanced"]),
  cookingSkills: z.enum(["none", "basic", "intermediate", "advanced"]),
  budgetRange: z.enum(["under-50", "50-100", "100-150", "150-200", "over-200"]),

  // Service Preferences
  servicesInterested: z
    .array(z.string())
    .min(1, "At least one service is required"),
  preferredConsultationTime: z.string().min(1, "Preferred time is required"),
  preferredDate: z.string().min(1, "Preferred date is required"),
  timeZone: z.string().min(1, "Time zone is required"),
  communicationPreference: z.enum(["email", "phone", "video-call", "text"]),
  urgencyLevel: z.enum(["low", "medium", "high"]),

  // Additional
  additionalNotes: z.string().optional(),
  howDidYouHear: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to terms and conditions",
  }),
  agreeToMarketing: z.boolean().default(false),
});

type ConsultationFormData = z.infer<typeof consultationFormSchema>;

export async function submitConsultationForm(
  data: ConsultationFormData
): Promise<{
  success: boolean;
  consultationId?: string;
  clientSecret?: string;
  error?: string;
}> {
  try {
    await connectToDatabase();

    console.log("🔍 Validating form data...");

    // Validate form data with better error handling
    let validatedData;
    try {
      validatedData = consultationFormSchema.parse(data);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errorMessage = validationError.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join("; ");

        console.error("❌ Form validation failed:", errorMessage);
        return {
          success: false,
          error: `Validation failed: ${errorMessage}`,
        };
      }
      throw validationError;
    }

    console.log("✅ Form data validated successfully");

    // Get current user if logged in
    const { userId } = await auth();
    let user = null;
    if (userId) {
      user = await User.findOne({ clerkId: userId });
    }

    // Calculate total amount based on selected services
    const servicesPricing = {
      consultation: 20,
      "meal-plan": 20,
      coaching: 35,
    };

    const totalAmount = validatedData.servicesInterested.reduce(
      (sum, service) => {
        return (
          sum + (servicesPricing[service as keyof typeof servicesPricing] || 0)
        );
      },
      0
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100, // Stripe expects amount in cents
      currency: "usd",
      metadata: {
        customerEmail: validatedData.email,
        customerName: `${validatedData.firstName} ${validatedData.lastName}`,
        services: validatedData.servicesInterested.join(", "),
      },
    });
    // Generate consultation number manually if needed
    const consultationCount = await Consultation.countDocuments();
    const consultationNumber = `CONS-${(consultationCount + 1).toString().padStart(6, "0")}`;
    // Create consultation record in MongoDB
    const consultation = new Consultation({
      consultationNumber,
      user: user?._id,
      personalInfo: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        age: validatedData.age,
        gender: validatedData.gender,
        occupation: validatedData.occupation,
      },
      healthInfo: {
        currentWeight: validatedData.currentWeight,
        goalWeight: validatedData.goalWeight,
        height: validatedData.height,
        activityLevel: validatedData.activityLevel,
        dietaryRestrictions: validatedData.dietaryRestrictions,
        allergies: validatedData.allergies,
        medicalConditions: validatedData.medicalConditions,
        currentMedications: validatedData.currentMedications,
        previousDietExperience: validatedData.previousDietExperience,
      },
      goalsAndLifestyle: {
        primaryGoals: validatedData.primaryGoals,
        motivationLevel: validatedData.motivationLevel,
        biggestChallenges: validatedData.biggestChallenges,
        currentEatingHabits: validatedData.currentEatingHabits,
        mealPrepExperience: validatedData.mealPrepExperience,
        cookingSkills: validatedData.cookingSkills,
        budgetRange: validatedData.budgetRange,
      },
      servicePreferences: {
        servicesInterested: validatedData.servicesInterested,
        preferredConsultationTime: validatedData.preferredConsultationTime,
        preferredDate: validatedData.preferredDate,
        timeZone: validatedData.timeZone,
        communicationPreference: validatedData.communicationPreference,
        urgencyLevel: validatedData.urgencyLevel,
      },
      additionalNotes: validatedData.additionalNotes,
      howDidYouHear: validatedData.howDidYouHear,
      agreeToTerms: validatedData.agreeToTerms,
      agreeToMarketing: validatedData.agreeToMarketing,
      paymentIntentId: paymentIntent.id,
      totalAmount,
      currency: "USD",
      paymentStatus: "pending", // Will be updated on mock payment success
      status: "pending",
    });

    await consultation.save();

    console.log(
      "✅ Consultation saved to database:",
      consultation.consultationNumber
    );

    // 📧 MOCK EMAIL - Send confirmation email (mocked in development)
    try {
      await sendEmail({
        to: validatedData.email,
        subject: "Consultation Request Received - Nutra-Vive",
        template: "consultation-confirmation",
        data: {
          firstName: validatedData.firstName,
          consultationNumber: consultation.consultationNumber,
          totalAmount,
          services: validatedData.servicesInterested,
        },
      });

      console.log("📧 [MOCK] Confirmation email sent (or logged in dev mode)");
    } catch (emailError) {
      console.error("📧 Email sending failed:", emailError);
      // Don't fail the entire operation if email fails
    }

    // 📧 MOCK EMAIL - Send notification to admin (mocked in development)
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || "admin@nutravive.com",
        subject: `New Consultation Request - ${consultation.consultationNumber}`,
        template: "admin-consultation-notification",
        data: {
          consultationNumber: consultation.consultationNumber,
          customerName: `${validatedData.firstName} ${validatedData.lastName}`,
          email: validatedData.email,
          urgency: validatedData.urgencyLevel,
          services: validatedData.servicesInterested,
          totalAmount,
        },
      });

      console.log(
        "📧 [MOCK] Admin notification email sent (or logged in dev mode)"
      );
    } catch (emailError) {
      console.error("📧 Admin email sending failed:", emailError);
      // Don't fail the entire operation if email fails
    }

    return {
      success: true,
      consultationId: consultation._id.toString(),
      clientSecret: paymentIntent.client_secret ?? undefined,
    };
  } catch (error) {
    console.error("❌ Error submitting consultation form:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

export async function confirmMockPayment(
  consultationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();

    // Find and update consultation status
    const consultation = await Consultation.findByIdAndUpdate(
      consultationId,
      {
        paymentStatus: "paid",
        status: "confirmed",
        scheduledAt: new Date(), // Will be updated when admin actually schedules
      },
      { new: true }
    );

    if (!consultation) {
      return {
        success: false,
        error: "Consultation not found",
      };
    }

    console.log(
      "✅ [MOCK] Payment confirmed for consultation:",
      consultation.consultationNumber
    );

    // 📧 MOCK EMAIL - Send payment confirmation email
    try {
      await sendEmail({
        to: consultation.personalInfo.email,
        subject: "Payment Confirmed - Consultation Scheduled",
        template: "payment-confirmation",
        data: {
          firstName: consultation.personalInfo.firstName,
          consultationNumber: consultation.consultationNumber,
          totalAmount: consultation.totalAmount,
        },
      });

      console.log("📧 [MOCK] Payment confirmation email sent");
    } catch (emailError) {
      console.error("📧 Payment confirmation email failed:", emailError);
    }

    revalidatePath("/dashboard/consultations");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Error confirming mock payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

export async function getConsultationById(
  id: string
): Promise<IConsultation | null> {
  try {
    await connectToDatabase();
    const consultation = await Consultation.findById(id).lean();
    return consultation;
  } catch (error) {
    console.error("Error fetching consultation:", error);
    return null;
  }
}

export async function getConsultations(filters?: {
  status?: string;
  paymentStatus?: string;
  urgency?: string;
  search?: string;
}): Promise<IConsultation[]> {
  try {
    await connectToDatabase();

    const query: any = {};

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.paymentStatus) {
      query.paymentStatus = filters.paymentStatus;
    }

    if (filters?.urgency) {
      query["servicePreferences.urgencyLevel"] = filters.urgency;
    }

    if (filters?.search) {
      query.$or = [
        { consultationNumber: { $regex: filters.search, $options: "i" } },
        { "personalInfo.firstName": { $regex: filters.search, $options: "i" } },
        { "personalInfo.lastName": { $regex: filters.search, $options: "i" } },
        { "personalInfo.email": { $regex: filters.search, $options: "i" } },
      ];
    }

    const consultations = await Consultation.find(query)
      .sort({ createdAt: -1 })
      .lean();

    console.log(
      `✅ Fetched ${consultations.length} consultations from database`
    );

    return consultations.map((consultation) => ({
      ...consultation,
      _id: consultation._id.toString(),
    }));
  } catch (error) {
    console.error("❌ Error fetching consultations:", error);
    return [];
  }
}

export async function updateConsultationStatus(
  id: string,
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled",
  scheduledAt?: Date,
  consultantNotes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();

    const updateData: any = { status };

    if (scheduledAt) {
      updateData.scheduledAt = scheduledAt;
    }

    if (consultantNotes) {
      updateData.consultantNotes = consultantNotes;
    }

    if (status === "completed") {
      updateData.completedAt = new Date();
    }

    if (status === "cancelled") {
      updateData.cancelledAt = new Date();
    }

    const consultation = await Consultation.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!consultation) {
      return {
        success: false,
        error: "Consultation not found",
      };
    }

    console.log(
      `✅ Updated consultation ${consultation.consultationNumber} status to ${status}`
    );

    // 📧 MOCK EMAIL - Send status update email
    try {
      await sendEmail({
        to: consultation.personalInfo.email,
        subject: `Consultation Update - ${consultation.consultationNumber}`,
        template: "consultation-status-update",
        data: {
          firstName: consultation.personalInfo.firstName,
          consultationNumber: consultation.consultationNumber,
          status,
          scheduledAt,
          consultantNotes,
        },
      });

      console.log("📧 [MOCK] Status update email sent");
    } catch (emailError) {
      console.error("📧 Status update email failed:", emailError);
    }

    revalidatePath("/admin/consultations");

    return { success: true };
  } catch (error) {
    console.error("❌ Error updating consultation status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

export async function getConsultationStats(): Promise<{
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  revenue: number;
  recentConsultations: number;
}> {
  try {
    await connectToDatabase();

    const [
      total,
      pending,
      confirmed,
      completed,
      paidConsultations,
      recentConsultations,
    ] = await Promise.all([
      Consultation.countDocuments(),
      Consultation.countDocuments({ status: "pending" }),
      Consultation.countDocuments({ status: "confirmed" }),
      Consultation.countDocuments({ status: "completed" }),
      Consultation.find({ paymentStatus: "paid" }).lean(),
      Consultation.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    const revenue = paidConsultations.reduce((sum, consultation) => {
      return sum + (consultation.totalAmount || 0);
    }, 0);

    console.log("✅ Fetched consultation stats:", {
      total,
      pending,
      confirmed,
      completed,
      revenue,
    });

    return {
      total,
      pending,
      confirmed,
      completed,
      revenue,
      recentConsultations,
    };
  } catch (error) {
    console.error("❌ Error fetching consultation stats:", error);
    return {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      revenue: 0,
      recentConsultations: 0,
    };
  }
}

export async function addConsultationNote(
  consultationId: string,
  consultantId: string,
  note: string,
  sessionType: "initial" | "follow-up" | "check-in" = "follow-up"
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();

    // For now, we'll add the note directly to the consultation
    // In a more complex system, you might use the ConsultationNote model
    const consultation = await Consultation.findByIdAndUpdate(
      consultationId,
      {
        $push: {
          consultantNotes: {
            note,
            consultantId,
            sessionType,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!consultation) {
      return {
        success: false,
        error: "Consultation not found",
      };
    }

    console.log(
      `✅ Added note to consultation ${consultation.consultationNumber}`
    );

    revalidatePath("/admin/consultations");

    return { success: true };
  } catch (error) {
    console.error("❌ Error adding consultation note:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

export async function getUserConsultations(
  userId?: string
): Promise<IConsultation[]> {
  try {
    if (!userId) return [];

    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId });
    if (!user) return [];

    const consultations = await Consultation.find({ user: user._id })
      .sort({ createdAt: -1 })
      .lean();

    return consultations;
  } catch (error) {
    console.error("Error fetching user consultations:", error);
    return [];
  }
}
