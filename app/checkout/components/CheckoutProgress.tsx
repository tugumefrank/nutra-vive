// app/checkout/components/CheckoutProgress.tsx

import { motion } from "framer-motion";
import { Check, AlertCircle } from "lucide-react";
import { checkoutSteps } from "../utils/constants";
import { canNavigateToStep } from "../utils/validation";
import type { FormData, StepErrors } from "../types";

interface CheckoutProgressProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  stepErrors: StepErrors;
  formData: FormData;
}

export default function CheckoutProgress({
  currentStep,
  onStepClick,
  stepErrors,
  formData,
}: CheckoutProgressProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <div className="relative">
          {/* Progress Bar Background */}
          <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 rounded-full" />

          {/* Progress Bar Fill */}
          <div
            className="absolute top-8 left-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
            style={{
              width: `${((currentStep - 1) / (checkoutSteps.length - 1)) * 100}%`,
            }}
          />

          {/* Steps */}
          <div className="relative flex justify-between">
            {checkoutSteps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const hasErrors =
                stepErrors[step.id] &&
                Object.keys(stepErrors[step.id]).length > 0;
              const canNavigate = canNavigateToStep(
                step.id,
                currentStep,
                formData
              );
              const IconComponent = step.icon;

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <motion.button
                    onClick={() => canNavigate && onStepClick(step.id)}
                    disabled={!canNavigate}
                    initial={false}
                    animate={{
                      scale: isActive ? 1.1 : 1,
                    }}
                    whileHover={
                      canNavigate ? { scale: isActive ? 1.15 : 1.05 } : {}
                    }
                    whileTap={canNavigate ? { scale: 0.95 } : {}}
                    className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                      hasErrors
                        ? "bg-red-100 border-red-300 text-red-600"
                        : isCompleted
                          ? "bg-green-500 border-white text-white shadow-lg"
                          : isActive
                            ? "bg-orange-500 border-white text-white shadow-lg"
                            : "bg-gray-100 border-gray-300 text-gray-500"
                    } ${
                      canNavigate
                        ? "cursor-pointer hover:shadow-md"
                        : "cursor-not-allowed opacity-60"
                    }`}
                  >
                    {hasErrors ? (
                      <AlertCircle className="w-6 h-6" />
                    ) : isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <IconComponent className="w-6 h-6" />
                    )}
                  </motion.button>

                  <div className="mt-3 text-center">
                    <p
                      className={`text-sm font-medium transition-colors ${
                        hasErrors
                          ? "text-red-600"
                          : isActive || isCompleted
                            ? "text-gray-900"
                            : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p
                      className={`text-xs transition-colors ${
                        hasErrors
                          ? "text-red-500"
                          : isActive || isCompleted
                            ? "text-gray-600"
                            : "text-gray-400"
                      }`}
                    >
                      {step.subtitle}
                    </p>

                    {/* Error indicator */}
                    {hasErrors && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1"
                      >
                        <div className="w-2 h-2 bg-red-500 rounded-full mx-auto" />
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
