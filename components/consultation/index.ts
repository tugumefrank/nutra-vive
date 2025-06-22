// Main component
export { default as ConsultationForm } from "./ConsultationForm";

// Types and constants
export * from "./types";

// Hooks
export { useConsultationForm } from "./hooks/useConsultationForm";

// Components
export { StepIndicator } from "./components/StepIndicator";
export { SuccessModal } from "./components/SuccessModal";
export { DesktopLayout } from "./components/DesktopLayout";
export { MobileLayout } from "./components/MobileLayout";
export { StepContent } from "./components/StepContent";
export { PaymentStep } from "./components/PaymentStep";

// Form Fields
export {
  InputField,
  SelectField,
  TextareaField,
  CheckboxGroup,
  RadioGroup,
  RangeSlider,
} from "./components/FormFields";
