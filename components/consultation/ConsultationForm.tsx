"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Leaf,
  X,
  Plus,
  Star,
  TrendingUp,
  Users,
  Zap,
  Sparkles,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { submitConsultationForm } from "@/lib/actions/consultation";
import { toast } from "sonner";

// Import refactored components
import { ConsultationFormData, serviceOptions, steps } from "./types";
import { useConsultationForm } from "./hooks/useConsultationForm";
import { StepIndicator } from "./components/StepIndicator";
import { DesktopLayout } from "./components/DesktopLayout";
import { MobileLayout } from "./components/MobileLayout";
import { SuccessModal } from "./components/SuccessModal";

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const ConsultationForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    currentStep,
    setCurrentStep,
    isSubmitting,
    setIsSubmitting,
    errors,
    setErrors,
    submitError,
    setSubmitError,
    clientSecret,
    setClientSecret,
    consultationId,
    setConsultationId,
    paymentInitialized,
    setPaymentInitialized,
    formData,
    updateField,
    handleArrayUpdate,
    validateStep,
    calculateTotal,
    totalSteps,
  } = useConsultationForm();

  const scrollContainerRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;

  // Scroll to top when step changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  const nextStep = () => {
    if (validateStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepNumber: number) => {
    // Don't lose payment data when navigating back from step 6
    if (currentStep === 6 && stepNumber < 6 && paymentInitialized) {
      console.log("Preserving payment state when navigating back");
    }

    // Allow navigation to previous steps or current step
    if (stepNumber <= currentStep) {
      setCurrentStep(stepNumber);
    } else {
      // For future steps, validate current step first
      if (validateStep()) {
        setCurrentStep(stepNumber);
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare form data for submission
      const submissionData = {
        // Personal Info
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        age: formData.age,
        gender: formData.gender as
          | "male"
          | "female"
          | "other"
          | "prefer-not-to-say",
        occupation: formData.occupation,

        // Health Info
        currentWeight: formData.currentWeight,
        goalWeight: formData.goalWeight,
        height: formData.height,
        activityLevel: formData.activityLevel as
          | "sedentary"
          | "lightly-active"
          | "moderately-active"
          | "very-active"
          | "extremely-active",
        dietaryRestrictions: formData.dietaryRestrictions,
        allergies: formData.allergies,
        medicalConditions: formData.medicalConditions,
        currentMedications: formData.currentMedications,
        previousDietExperience: formData.previousDietExperience,

        // Goals & Lifestyle
        primaryGoals: formData.primaryGoals,
        motivationLevel: formData.motivationLevel,
        biggestChallenges: formData.biggestChallenges,
        currentEatingHabits: formData.currentEatingHabits,
        mealPrepExperience: formData.mealPrepExperience as
          | "none"
          | "beginner"
          | "intermediate"
          | "advanced",
        cookingSkills: formData.cookingSkills as
          | "none"
          | "basic"
          | "intermediate"
          | "advanced",
        budgetRange: formData.budgetRange as
          | "under-50"
          | "50-100"
          | "100-150"
          | "150-200"
          | "over-200",

        // Service Preferences
        servicesInterested: formData.servicesInterested,
        preferredConsultationTime: formData.preferredConsultationTime,
        preferredDate: new Date().toISOString().split("T")[0],
        timeZone: formData.timeZone,
        communicationPreference: formData.communicationPreference as
          | "email"
          | "phone"
          | "video-call"
          | "text",
        urgencyLevel: formData.urgencyLevel as
          | "3-5-days"
          | "1-week"
          | "2-weeks"
          | "1-month",

        // Additional
        additionalNotes: formData.additionalNotes,
        howDidYouHear: formData.howDidYouHear,
        agreeToTerms: formData.agreeToTerms,
        agreeToMarketing: formData.agreeToMarketing,
      };

      console.log("📝 Submitting consultation form:", submissionData);

      const result = await submitConsultationForm(submissionData);

      if (result.success && result.clientSecret) {
        console.log("✅ Consultation submitted successfully!");
        setConsultationId(result.consultationId!);
        setClientSecret(result.clientSecret);
        setPaymentInitialized(true);
        setCurrentStep(6); // Move to payment step
      } else {
        throw new Error(result.error || "Failed to submit consultation form");
      }
    } catch (error) {
      console.error("❌ Error submitting consultation form:", error);
      setSubmitError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setShowSuccess(true);
    toast.success("Payment successful! Your consultation has been booked.");
    setTimeout(() => {
      window.location.href = "/consultation/success";
    }, 2000);
  };

  const navigationProps = {
    currentStep,
    totalSteps,
    prevStep,
    nextStep,
    handleSubmit,
    isSubmitting,
    goToStep,
  };

  const formProps = {
    formData,
    updateField,
    handleArrayUpdate,
    errors,
    calculateTotal,
    clientSecret,
    consultationId,
    handlePaymentSuccess,
  };

  const commonProps = {
    scrollContainerRef,
    submitError,
    ...formProps,
    ...navigationProps,
  };

  if (showSuccess) {
    return <SuccessModal />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Desktop Layout */}
      <DesktopLayout {...commonProps} />

      {/* Mobile Layout */}
      <MobileLayout {...commonProps} isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
};

export default ConsultationForm;
