import React from "react";
import {
  Leaf,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
  Award,
  Shield,
  Headphones,
} from "lucide-react";
import { StepIndicator } from "./StepIndicator";
import { StepContent } from "./StepContent";
import { ConsultationFormData } from "../types";

interface DesktopLayoutProps {
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

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
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
    <div className="hidden lg:flex min-h-screen pt-16">
      {/* Left Side - Marketing Content */}
      <div className="w-2/5 flex flex-col justify-center px-12 relative">
        {/* WhatsApp Support Badge */}
        <div className="absolute top-8 right-8">
          <a
            href="https://wa.me/9735737764"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-200 hover:bg-white/90 transition-colors"
          >
            <Headphones className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Support</span>
          </a>
        </div>

        <div className="max-w-lg">
          {/* Feature Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-orange-200/50">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Transform Your Health Journey
                </h3>
                <p className="text-gray-600 mb-4">
                  Get personalized nutrition plans with our certified experts.
                  Transform your health naturally with proven results.
                </p>
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-medium">4.9/5 from 2,500+ clients</span>
                </div>
              </div>
            </div>

            {/* Mini Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  95%
                </div>
                <div className="text-xs text-gray-500">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-600" />
                  10K+
                </div>
                <div className="text-xs text-gray-500">Happy Clients</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 flex items-center gap-1">
                  <Zap className="w-4 h-4 text-purple-600" />
                  24/7
                </div>
                <div className="text-xs text-gray-500">Support</div>
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Professional Nutrition Consultation
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our expert nutritionists will create a personalized plan tailored
              to your unique needs, lifestyle, and health goals. Experience the
              difference that professional guidance makes.
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-4">
            {[
              {
                icon: <Users className="w-5 h-5 text-orange-600" />,
                title: "Expert Consultations",
                description: "1-on-1 sessions with certified nutritionists",
              },
              {
                icon: <Award className="w-5 h-5 text-orange-600" />,
                title: "Proven Results",
                description:
                  "95% of clients reach their wellness goals within 30 days",
              },
              {
                icon: <Shield className="w-5 h-5 text-orange-600" />,
                title: "100% Natural Approach",
                description:
                  "Holistic nutrition plans without harmful restrictions",
              },
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-orange-200">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-8 right-8 opacity-20">
          <div className="w-32 h-32 bg-gradient-to-br from-orange-300 to-amber-400 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute top-1/4 right-1/4 opacity-10">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* Right Side - Form Container for Desktop */}
      <div className="w-3/5 flex items-center justify-center p-12">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-orange-200/50 overflow-hidden flex flex-col h-[85vh]">
          {/* Fixed Header */}
          <div className="flex-shrink-0 bg-white/95 backdrop-blur-xl p-6 border-b border-orange-200/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Nutra-Vive</h1>
                <p className="text-sm text-gray-500">Natural Wellness</p>
              </div>
            </div>

            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Nutrition Consultation
              </h1>
              <p className="text-gray-600">
                Start your personalized wellness journey today
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm font-medium text-orange-600">
                  {Math.round((currentStep / totalSteps) * 100)}% Complete
                </span>
              </div>
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

            {/* Step Indicator */}
            <StepIndicator currentStep={currentStep} goToStep={goToStep} />
          </div>

          {/* Scrollable Content */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6">
            <div className="mb-8">
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
              />
            </div>
          </div>

          {/* Fixed Footer */}
          {currentStep !== 6 && (
            <div className="flex-shrink-0 bg-white/95 backdrop-blur-xl p-6 border-t border-orange-200/50 flex gap-4">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex-1" />

              <button
                type="button"
                onClick={currentStep === 5 ? handleSubmit : nextStep}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-2 disabled:opacity-50"
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
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
