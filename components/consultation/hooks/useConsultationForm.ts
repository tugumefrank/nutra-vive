"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  ConsultationFormData,
  serviceOptions,
  initialFormData,
} from "../types";

export const useConsultationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [paymentInitialized, setPaymentInitialized] = useState(false);
  const totalSteps = 6;

  const [formData, setFormData] =
    useState<ConsultationFormData>(initialFormData);

  const calculateTotal = () => {
    if (
      !formData?.servicesInterested ||
      formData.servicesInterested.length === 0
    ) {
      return 0;
    }
    return formData.servicesInterested.reduce((sum, serviceId) => {
      const service = serviceOptions.find((s) => s.id === serviceId);
      return sum + (service?.price || 0);
    }, 0);
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleArrayUpdate = (
    field: string,
    value: string,
    checked: boolean
  ) => {
    const currentArray = formData[
      field as keyof ConsultationFormData
    ] as string[];
    if (checked) {
      updateField(field, [...currentArray, value]);
    } else {
      // Don't allow removing required services
      if (field === "servicesInterested" && value === "consultation") {
        toast.error("Initial consultation is required and cannot be removed");
        return;
      }
      updateField(
        field,
        currentArray.filter((item) => item !== value)
      );
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.firstName) {
        newErrors.firstName = "First name is required";
        toast.error("Please enter your first name");
      }
      if (!formData.lastName) {
        newErrors.lastName = "Last name is required";
        toast.error("Please enter your last name");
      }
      if (!formData.email) {
        newErrors.email = "Email is required";
        toast.error("Please enter your email address");
      }
      if (!formData.phone) {
        newErrors.phone = "Phone number is required";
        toast.error("Please enter your phone number");
      }
      if (!formData.age || formData.age < 13) {
        newErrors.age = "Valid age is required";
        toast.error("Please enter a valid age (13 or older)");
      }
      if (!formData.gender) {
        newErrors.gender = "Please select your gender";
        toast.error("Please select your gender");
      }
    } else if (currentStep === 2) {
      if (!formData.currentWeight || formData.currentWeight < 50) {
        newErrors.currentWeight = "Current weight must be at least 50 lbs";
        toast.error("Please enter a valid current weight");
      }
      if (!formData.goalWeight || formData.goalWeight < 50) {
        newErrors.goalWeight = "Goal weight must be at least 50 lbs";
        toast.error("Please enter a valid goal weight");
      }
      if (!formData.height) {
        newErrors.height = "Height is required";
        toast.error("Please enter your height");
      }
      if (!formData.activityLevel) {
        newErrors.activityLevel = "Please select your activity level";
        toast.error("Please select your activity level");
      }
    } else if (currentStep === 3) {
      if (formData.primaryGoals.length === 0) {
        newErrors.primaryGoals = "Please select at least one goal";
        toast.error("Please select at least one primary goal");
      }
      if (!formData.mealPrepExperience) {
        newErrors.mealPrepExperience =
          "Please select your meal prep experience";
        toast.error("Please select your meal prep experience level");
      }
      if (!formData.cookingSkills) {
        newErrors.cookingSkills = "Please select your cooking skill level";
        toast.error("Please select your cooking skill level");
      }
      if (!formData.budgetRange) {
        newErrors.budgetRange = "Please select your budget range";
        toast.error("Please select your weekly food budget range");
      }
    } else if (currentStep === 4) {
      if (formData.servicesInterested.length === 0) {
        newErrors.servicesInterested = "Please select at least one service";
        toast.error("Please select at least one service");
      }
      if (!formData.urgencyLevel) {
        newErrors.urgencyLevel = "Please select your urgency level";
        toast.error("Please select when you'd like to start");
      }
      if (!formData.preferredConsultationTime) {
        newErrors.preferredConsultationTime =
          "Please select your preferred time";
        toast.error("Please select your preferred consultation time");
      }
      if (!formData.timeZone) {
        newErrors.timeZone = "Please select your time zone";
        toast.error("Please select your time zone");
      }
      if (!formData.communicationPreference) {
        newErrors.communicationPreference =
          "Please select your communication preference";
        toast.error("Please select your preferred communication method");
      }
    } else if (currentStep === 5) {
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = "You must agree to the terms and conditions";
        toast.error("Please agree to the terms and conditions to continue");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
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
    totalSteps,
    formData,
    setFormData,
    calculateTotal,
    updateField,
    handleArrayUpdate,
    validateStep,
  };
};
