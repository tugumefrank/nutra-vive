import React from "react";
import { CheckCircle } from "lucide-react";
import { steps } from "../types";

interface StepIndicatorProps {
  currentStep: number;
  goToStep: (stepNumber: number) => void;
  isMobile?: boolean;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  goToStep,
  isMobile = false,
}) => {
  if (isMobile) {
    return (
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div
              className={`flex items-center cursor-pointer hover:scale-105 transition-all ${
                step.id <= currentStep ? "text-orange-600" : "text-gray-400"
              }`}
              onClick={() => goToStep(step.id)}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  step.id === currentStep
                    ? "border-orange-600 bg-orange-50 text-orange-600"
                    : step.id < currentStep
                      ? "border-orange-600 bg-orange-600 text-white"
                      : "border-gray-300 text-gray-400"
                }`}
              >
                {step.id < currentStep ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <step.icon className="h-3 w-3" />
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-4 h-0.5 mx-1 transition-colors duration-300 ${
                  step.id < currentStep ? "bg-orange-600" : "bg-gray-300"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center mb-6">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div
            className={`flex items-center cursor-pointer transition-all hover:scale-105 ${
              step.id <= currentStep ? "text-orange-600" : "text-gray-400"
            } ${step.id === currentStep ? "scale-110" : ""}`}
            onClick={() => goToStep(step.id)}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                step.id === currentStep
                  ? "border-orange-600 bg-orange-50 text-orange-600 shadow-lg"
                  : step.id < currentStep
                    ? "border-orange-600 bg-orange-600 text-white"
                    : "border-gray-300 text-gray-400"
              }`}
            >
              {step.id < currentStep ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </div>
            <span
              className={`ml-2 text-xs font-medium hidden sm:block transition-colors ${
                step.id <= currentStep ? "text-orange-600" : "text-gray-400"
              }`}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-6 h-0.5 mx-2 transition-colors duration-300 ${
                step.id < currentStep ? "bg-orange-600" : "bg-gray-300"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
