import {
  User,
  Calendar,
  Target,
  Heart,
  AlertCircle,
  FileText,
  CreditCard,
} from "lucide-react";

export interface ConsultationFormData {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  gender: "male" | "female" | "other" | "prefer-not-to-say" | "";
  occupation: string;

  // Health Info
  currentWeight: number;
  goalWeight: number;
  height: string;
  activityLevel:
    | "sedentary"
    | "lightly-active"
    | "moderately-active"
    | "very-active"
    | "extremely-active"
    | "";
  dietaryRestrictions: string[];
  allergies: string;
  medicalConditions: string;
  currentMedications: string;
  previousDietExperience: string;

  // Goals & Lifestyle
  primaryGoals: string[];
  motivationLevel: number;
  biggestChallenges: string[];
  currentEatingHabits: string;
  mealPrepExperience: "none" | "beginner" | "intermediate" | "advanced" | "";
  cookingSkills: "none" | "basic" | "intermediate" | "advanced" | "";
  budgetRange: "under-50" | "50-100" | "100-150" | "150-200" | "over-200" | "";

  // Service Preferences
  servicesInterested: string[];
  preferredConsultationTime: string;
  preferredDate: string;
  timeZone: string;
  communicationPreference: "email" | "phone" | "video-call" | "text" | "";
  urgencyLevel: "3-5-days" | "1-week" | "2-weeks" | "1-month" | "";

  // Additional
  additionalNotes: string;
  howDidYouHear: string;
  agreeToTerms: boolean;
  agreeToMarketing: boolean;
}

export const serviceOptions = [
  {
    id: "consultation",
    name: "Initial Consultation",
    duration: "20 min",
    price: 20,
    description: "Comprehensive assessment of your needs and goals",
    required: true,
  },
  {
    id: "meal-plan",
    name: "Custom Meal Plan",
    duration: "7 days",
    price: 35,
    description: "Personalized meal plan with grocery list",
  },
  {
    id: "coaching",
    name: "Ongoing Coaching",
    duration: "30 days",
    price: 35,
    description: "Continuous support and guidance",
  },
];

export const dietaryOptions = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Keto",
  "Paleo",
  "Mediterranean",
  "Low-Carb",
  "Dairy-Free",
  "Nut-Free",
  "Other",
];

export const goalOptions = [
  "Weight Loss",
  "Weight Gain",
  "Muscle Building",
  "Improved Energy",
  "Better Digestion",
  "Hormone Balance",
  "Disease Prevention",
  "Athletic Performance",
  "Healthy Aging",
  "Mental Clarity",
];

export const challengeOptions = [
  "Time Constraints",
  "Lack of Motivation",
  "Emotional Eating",
  "Social Situations",
  "Budget Limitations",
  "Cooking Skills",
  "Family Preferences",
  "Travel/Work Schedule",
  "Cravings",
  "Meal Planning",
];

export const urgencyOptions = [
  {
    value: "3-5-days",
    label: "ASAP (3-5 days)",
    desc: "Urgent - Need help immediately",
  },
  { value: "1-week", label: "Within 1 week", desc: "Soon - Ready to start" },
  {
    value: "2-weeks",
    label: "Within 2 weeks",
    desc: "Flexible - Planning ahead",
  },
  {
    value: "1-month",
    label: "Within 1 month",
    desc: "No rush - Exploring options",
  },
];

export const activityLevelOptions = [
  {
    value: "sedentary",
    label: "Sedentary",
    desc: "Little to no exercise",
  },
  {
    value: "lightly-active",
    label: "Lightly Active",
    desc: "Light exercise 1-3 days/week",
  },
  {
    value: "moderately-active",
    label: "Moderately Active",
    desc: "Moderate exercise 3-5 days/week",
  },
  {
    value: "very-active",
    label: "Very Active",
    desc: "Hard exercise 6-7 days/week",
  },
  {
    value: "extremely-active",
    label: "Extremely Active",
    desc: "Very hard exercise, physical job",
  },
];

// Step configuration with icons
export const steps = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Health Info", icon: Heart },
  { id: 3, title: "Goals & Lifestyle", icon: Target },
  { id: 4, title: "Services & Booking", icon: Calendar },
  { id: 5, title: "Review & Terms", icon: FileText },
  { id: 6, title: "Payment", icon: CreditCard },
];

export const initialFormData: ConsultationFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  age: 0,
  gender: "",
  occupation: "",
  currentWeight: 150,
  goalWeight: 140,
  height: "",
  activityLevel: "",
  dietaryRestrictions: [],
  allergies: "",
  medicalConditions: "",
  currentMedications: "",
  previousDietExperience: "",
  primaryGoals: [],
  motivationLevel: 5,
  biggestChallenges: [],
  currentEatingHabits: "",
  mealPrepExperience: "",
  cookingSkills: "",
  budgetRange: "",
  servicesInterested: ["consultation"], // Pre-select consultation as required
  preferredConsultationTime: "",
  preferredDate: "",
  timeZone: "",
  communicationPreference: "",
  urgencyLevel: "1-week",
  additionalNotes: "",
  howDidYouHear: "",
  agreeToTerms: false,
  agreeToMarketing: false,
};
