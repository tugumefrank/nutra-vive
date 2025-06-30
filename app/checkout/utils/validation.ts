// app/checkout/utils/validation.ts

import type { FormData, FieldError } from "../types";

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateZipCode = (zipCode: string): boolean => {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode);
};

export const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
};

export const getStepErrors = (step: number, formData: FormData): FieldError => {
  const errors: FieldError = {};

  switch (step) {
    case 1: // Contact
      if (!formData.firstName.trim()) {
        errors.firstName = "First name is required";
      }
      if (!formData.lastName.trim()) {
        errors.lastName = "Last name is required";
      }
      if (!formData.email.trim()) {
        errors.email = "Email is required";
      } else if (!validateEmail(formData.email)) {
        errors.email = "Please enter a valid email address";
      }
      if (formData.phone && !validatePhone(formData.phone)) {
        errors.phone = "Please enter a valid phone number";
      }
      break;

    case 2: // Delivery Method
      if (!formData.deliveryMethod) {
        errors.deliveryMethod = "Please select a delivery method";
      }
      break;

    case 3: // Address
      if (formData.deliveryMethod !== "pickup") {
        if (!formData.address.trim()) {
          errors.address = "Street address is required";
        }
        if (!formData.city.trim()) {
          errors.city = "City is required";
        }
        if (!formData.state.trim()) {
          errors.state = "State is required";
        }
        if (!formData.zipCode.trim()) {
          errors.zipCode = "ZIP code is required";
        } else if (!validateZipCode(formData.zipCode)) {
          errors.zipCode =
            "Please enter a valid ZIP code (e.g., 12345 or 12345-6789)";
        }
      }
      break;

    case 4: // Review
      // Review step doesn't have its own validation, but we check previous steps
      break;

    case 5: // Payment
      // Payment validation is handled by Stripe
      break;
  }

  return errors;
};

export const validateStep = (step: number, formData: FormData): boolean => {
  const errors = getStepErrors(step, formData);
  return Object.keys(errors).length === 0;
};

export const canNavigateToStep = (
  targetStep: number,
  currentStep: number,
  formData: FormData
): boolean => {
  // Can always go back
  if (targetStep <= currentStep) {
    return true;
  }

  // Can only go forward if all previous steps are valid
  for (let i = 1; i < targetStep; i++) {
    if (!validateStep(i, formData)) {
      return false;
    }
  }

  return true;
};
