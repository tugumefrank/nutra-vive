import mongoose, { Schema, Document, Model } from "mongoose";

// Consultation Interface
export interface IConsultation extends Document {
  _id: string;
  consultationNumber: string;
  user?: string; // User ID if logged in

  // Personal Information
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    age: number;
    gender: "male" | "female" | "other" | "prefer-not-to-say";
    occupation?: string;
  };

  // Health Information
  healthInfo: {
    currentWeight: number;
    goalWeight: number;
    height: string;
    activityLevel:
      | "sedentary"
      | "lightly-active"
      | "moderately-active"
      | "very-active"
      | "extremely-active";
    dietaryRestrictions: string[];
    allergies?: string;
    medicalConditions?: string;
    currentMedications?: string;
    previousDietExperience?: string;
  };

  // Goals & Lifestyle
  goalsAndLifestyle: {
    primaryGoals: string[];
    motivationLevel: number; // 1-10
    biggestChallenges: string[];
    currentEatingHabits?: string;
    mealPrepExperience: "none" | "beginner" | "intermediate" | "advanced";
    cookingSkills: "none" | "basic" | "intermediate" | "advanced";
    budgetRange: "under-50" | "50-100" | "100-150" | "150-200" | "over-200";
  };

  // Service Preferences
  servicePreferences: {
    servicesInterested: string[]; // consultation, meal-plan, coaching
    preferredConsultationTime: string;
    preferredDate: string;
    timeZone: string;
    communicationPreference: "email" | "phone" | "video-call" | "text";
    urgencyLevel: "3-5-days" | "1-week" | "2-weeks" | "1-month" | "";
  };

  // Additional Information
  additionalNotes?: string;
  howDidYouHear?: string;
  agreeToTerms: boolean;
  agreeToMarketing: boolean;

  // Payment & Booking Info
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentIntentId?: string; // Stripe payment intent
  totalAmount: number;
  currency: string;

  // Consultation Status
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled";
  scheduledAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;

  // Consultant Notes
  consultantNotes?: string;
  followUpRequired: boolean;
  followUpDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

// Consultation Notes Interface
export interface IConsultationNote extends Document {
  _id: string;
  consultation: mongoose.Types.ObjectId;
  consultant: mongoose.Types.ObjectId; // Admin/Consultant user
  session: number; // Session number (1, 2, 3...)
  sessionType: "initial" | "follow-up" | "check-in";
  notes: string;
  recommendations: string[];
  nextSteps?: string;
  nextSessionDate?: Date;
  createdAt: Date;
}

// Meal Plans Interface
export interface IMealPlan extends Document {
  _id: string;
  consultation: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  duration: number; // days

  meals: {
    day: number;
    breakfast?: {
      name: string;
      ingredients: string[];
      instructions: string;
      calories?: number;
      macros?: {
        protein: number;
        carbs: number;
        fat: number;
      };
    };
    lunch?: {
      name: string;
      ingredients: string[];
      instructions: string;
      calories?: number;
      macros?: {
        protein: number;
        carbs: number;
        fat: number;
      };
    };
    dinner?: {
      name: string;
      ingredients: string[];
      instructions: string;
      calories?: number;
      macros?: {
        protein: number;
        carbs: number;
        fat: number;
      };
    };
    snacks?: {
      name: string;
      ingredients: string[];
      instructions: string;
      calories?: number;
    }[];
  }[];

  shoppingList: string[];
  totalCalories: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Consultation Schema
const consultationSchema = new Schema<IConsultation>(
  {
    consultationNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },

    personalInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      age: { type: Number, required: true },
      gender: {
        type: String,
        enum: ["male", "female", "other", "prefer-not-to-say"],
        required: true,
      },
      occupation: String,
    },

    healthInfo: {
      currentWeight: { type: Number, required: true },
      goalWeight: { type: Number, required: true },
      height: { type: String, required: true },
      activityLevel: {
        type: String,
        enum: [
          "sedentary",
          "lightly-active",
          "moderately-active",
          "very-active",
          "extremely-active",
        ],
        required: true,
      },
      dietaryRestrictions: [String],
      allergies: String,
      medicalConditions: String,
      currentMedications: String,
      previousDietExperience: String,
    },

    goalsAndLifestyle: {
      primaryGoals: { type: [String], required: true },
      motivationLevel: { type: Number, min: 1, max: 10, required: true },
      biggestChallenges: [String],
      currentEatingHabits: String,
      mealPrepExperience: {
        type: String,
        enum: ["none", "beginner", "intermediate", "advanced"],
        required: true,
      },
      cookingSkills: {
        type: String,
        enum: ["none", "basic", "intermediate", "advanced"],
        required: true,
      },
      budgetRange: {
        type: String,
        enum: ["under-50", "50-100", "100-150", "150-200", "over-200"],
        required: true,
      },
    },

    servicePreferences: {
      servicesInterested: { type: [String], required: true },
      preferredConsultationTime: { type: String, required: true },
      preferredDate: { type: String, required: true },
      timeZone: { type: String, required: true },
      communicationPreference: {
        type: String,
        enum: ["email", "phone", "video-call", "text"],
        required: true,
      },
      urgencyLevel: {
        type: String,
        enum: ["3-5-days", "1-week", "2-weeks", "1-month"],
        required: true,
      },
    },

    additionalNotes: String,
    howDidYouHear: String,
    agreeToTerms: { type: Boolean, required: true },
    agreeToMarketing: { type: Boolean, default: false },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentIntentId: String,
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: "USD" },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "rescheduled"],
      default: "pending",
    },
    scheduledAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancellationReason: String,

    consultantNotes: String,
    followUpRequired: { type: Boolean, default: false },
    followUpDate: Date,
  },
  { timestamps: true }
);

// Consultation Note Schema
const consultationNoteSchema = new Schema<IConsultationNote>(
  {
    consultation: {
      type: Schema.Types.ObjectId,
      ref: "Consultation",
      required: true,
    },
    consultant: { type: Schema.Types.ObjectId, ref: "User", required: true },
    session: { type: Number, required: true },
    sessionType: {
      type: String,
      enum: ["initial", "follow-up", "check-in"],
      required: true,
    },
    notes: { type: String, required: true },
    recommendations: [String],
    nextSteps: String,
    nextSessionDate: Date,
  },
  { timestamps: true }
);

// Meal Plan Schema
const mealPlanSchema = new Schema<IMealPlan>(
  {
    consultation: {
      type: Schema.Types.ObjectId,
      ref: "Consultation",
      required: true,
    },
    title: { type: String, required: true },
    description: String,
    duration: { type: Number, required: true },

    meals: [
      {
        day: { type: Number, required: true },
        breakfast: {
          name: String,
          ingredients: [String],
          instructions: String,
          calories: Number,
          macros: {
            protein: Number,
            carbs: Number,
            fat: Number,
          },
        },
        lunch: {
          name: String,
          ingredients: [String],
          instructions: String,
          calories: Number,
          macros: {
            protein: Number,
            carbs: Number,
            fat: Number,
          },
        },
        dinner: {
          name: String,
          ingredients: [String],
          instructions: String,
          calories: Number,
          macros: {
            protein: Number,
            carbs: Number,
            fat: Number,
          },
        },
        snacks: [
          {
            name: String,
            ingredients: [String],
            instructions: String,
            calories: Number,
          },
        ],
      },
    ],

    shoppingList: [String],
    totalCalories: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Add indexes (consultationNumber already has unique index from field definition)
consultationSchema.index({ user: 1 });
consultationSchema.index({ status: 1 });
consultationSchema.index({ paymentStatus: 1 });
consultationSchema.index({ scheduledAt: 1 });
consultationSchema.index({ "personalInfo.email": 1 });

consultationNoteSchema.index({ consultation: 1 });
consultationNoteSchema.index({ consultant: 1 });

mealPlanSchema.index({ consultation: 1 });

// Auto-generate consultation number
consultationSchema.pre("save", async function (next) {
  if (!this.consultationNumber) {
    const count = await mongoose.model("Consultation").countDocuments();
    this.consultationNumber = `CONS-${(count + 1).toString().padStart(6, "0")}`;
  }
  next();
});

// Models
export const Consultation: Model<IConsultation> =
  mongoose.models.Consultation ||
  mongoose.model<IConsultation>("Consultation", consultationSchema);

export const ConsultationNote: Model<IConsultationNote> =
  mongoose.models.ConsultationNote ||
  mongoose.model<IConsultationNote>("ConsultationNote", consultationNoteSchema);

export const MealPlan: Model<IMealPlan> =
  mongoose.models.MealPlan ||
  mongoose.model<IMealPlan>("MealPlan", mealPlanSchema);
