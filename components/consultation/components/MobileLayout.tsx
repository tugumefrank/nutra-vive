import React from "react";
import {
  X,
  Plus,
  Star,
  TrendingUp,
  Users,
  Zap,
  Sparkles,
  Leaf,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { StepIndicator } from "./StepIndicator";
import { StepContent } from "./StepContent";
import { ConsultationFormData } from "../types";

interface MobileLayoutProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentStep: number;
  totalSteps: number;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  submitError: string | null;
  formData: ConsultationFormData;
  updateField: (field: string, value: any) => void;
  handleArrayUpdate: (field: string, value: string, checked: boolean) => void;
  errors: Record<string, string>;
  calculateTotal: () => number;
  clientSecret: string | null;
  consultationId: string | null;
  handlePaymentSuccess: () => Promise<void>;
  prevStep: () => void;
  nextStep: () => void;
  handleSubmit: () => Promise<void>;
  isSubmitting: boolean;
  goToStep: (stepNumber: number) => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  isOpen,
  setIsOpen,
  currentStep,
  totalSteps,
  scrollContainerRef,
  submitError,
  formData,
  updateField,
  handleArrayUpdate,
  errors,
  calculateTotal,
  clientSecret,
  consultationId,
  handlePaymentSuccess,
  prevStep,
  nextStep,
  handleSubmit,
  isSubmitting,
  goToStep,
}) => {
  return (
    <div className="lg:hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 pt-16">
        <div className="flex flex-col items-center justify-center h-full p-4">
          {/* Feature Card for Mobile */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-orange-200/50 max-w-sm w-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Professional Nutrition Consultation
              </h3>
              <p className="text-gray-600 mb-4">
                Get personalized nutrition plans with our certified experts.
                Transform your health naturally.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-orange-600 mb-6">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-medium">4.9/5 from 2,500+ clients</span>
              </div>

              <button
                onClick={() => setIsOpen(true)}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Start Consultation
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-sm w-full">
            <div className="bg-white rounded-xl p-4 text-center border border-orange-200/50">
              <div className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                95%
              </div>
              <div className="text-xs text-gray-500">Success Rate</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-orange-200/50">
              <div className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1">
                <Users className="w-4 h-4 text-blue-600" />
                10K+
              </div>
              <div className="text-xs text-gray-500">Happy Clients</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-orange-200/50">
              <div className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1">
                <Zap className="w-4 h-4 text-purple-600" />
                24/7
              </div>
              <div className="text-xs text-gray-500">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex-shrink-0 bg-white/95 backdrop-blur-xl p-4 border-b border-orange-200/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">
                      Nutra-Vive
                    </h1>
                    <p className="text-xs text-gray-500">
                      Step {currentStep} of {totalSteps}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  />
                </div>
              </div>

              {/* Error Display */}
              {(errors.general || submitError) && (
                <div className="mb-4 p-4 border border-red-200 bg-red-50 rounded-lg flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span className="text-red-800">
                    {errors.general || submitError}
                  </span>
                </div>
              )}

              {/* Mobile Step Indicator */}
              <StepIndicator
                currentStep={currentStep}
                goToStep={goToStep}
                isMobile={true}
              />
            </div>

            {/* Scrollable Content */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-4"
            >
              <StepContent
                currentStep={currentStep}
                formData={formData}
                updateField={updateField}
                handleArrayUpdate={handleArrayUpdate}
                errors={errors}
                calculateTotal={calculateTotal}
                clientSecret={clientSecret}
                consultationId={consultationId}
                handlePaymentSuccess={handlePaymentSuccess}
                isMobile={true}
              />
            </div>

            {/* Fixed Footer */}
            {currentStep !== 6 && (
              <div className="flex-shrink-0 bg-white/95 backdrop-blur-xl p-4 border-t border-orange-200/50 flex gap-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </button>
                )}

                <button
                  type="button"
                  onClick={currentStep === 5 ? handleSubmit : nextStep}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {currentStep === 5 ? (
                    isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Continue to Payment
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
