// app/checkout/components/ValidationSummary.tsx

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { StepErrors, FormData } from "../types";

interface ValidationSummaryProps {
  stepErrors: StepErrors;
  currentStep: number;
  onNavigateToStep: (step: number) => void;
  formData: FormData;
}

export default function ValidationSummary({
  stepErrors,
  currentStep,
  onNavigateToStep,
  formData,
}: ValidationSummaryProps) {
  const stepNames = {
    1: "Contact Information",
    2: "Delivery Method",
    3: "Shipping Address",
    4: "Order Review",
    5: "Payment"
  };

  const hasErrors = Object.keys(stepErrors).length > 0;
  if (!hasErrors) return null;

  const errorSteps = Object.keys(stepErrors).map(Number).sort();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-red-900 mb-2">
                Please complete the following required fields:
              </h3>
              
              <div className="space-y-3">
                {errorSteps.map(stepNumber => {
                  const stepName = stepNames[stepNumber as keyof typeof stepNames];
                  const errors = stepErrors[stepNumber];
                  const errorFields = Object.keys(errors);
                  const isCurrentStep = stepNumber === currentStep;
                  
                  return (
                    <div key={stepNumber} className="flex items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {isCurrentStep ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <div className="w-4 h-4 bg-red-400 rounded-full flex-shrink-0" />
                          )}
                          <span className={`text-sm font-medium ${
                            isCurrentStep ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {stepName}
                            {isCurrentStep && ' (Current)'}
                          </span>
                        </div>
                        
                        <div className="ml-6 text-xs text-red-600">
                          {errorFields.map(field => {
                            const fieldLabels = {
                              firstName: 'First Name',
                              lastName: 'Last Name', 
                              email: 'Email Address',
                              phone: 'Phone Number',
                              address: 'Street Address',
                              city: 'City',
                              state: 'State',
                              zipCode: 'ZIP Code',
                              deliveryMethod: 'Delivery Method'
                            };
                            
                            const fieldLabel = fieldLabels[field as keyof typeof fieldLabels] || field;
                            return (
                              <div key={field} className="flex items-center gap-1">
                                <span>•</span>
                                <span>{fieldLabel}: {errors[field]}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {!isCurrentStep && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onNavigateToStep(stepNumber)}
                          className="border-red-300 text-red-700 hover:bg-red-100 text-xs px-2 py-1"
                        >
                          Fix <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                💡 <strong>Tip:</strong> Fields marked with * are required. Make sure all required information is filled out correctly.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}