import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  User,
  Heart,
  Target,
  Calendar,
  FileText,
  CreditCard,
  DollarSign,
  Shield,
} from "lucide-react";
import {
  ConsultationFormData,
  serviceOptions,
  dietaryOptions,
  goalOptions,
  challengeOptions,
  urgencyOptions,
  activityLevelOptions,
} from "../types";
import StripeCheckout from "../../common/StripeCheckout";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface StepContentProps {
  currentStep: number;
  formData: ConsultationFormData;
  updateField: (field: string, value: any) => void;
  handleArrayUpdate: (field: string, value: string, checked: boolean) => void;
  errors: Record<string, string>;
  calculateTotal: () => number;
  clientSecret: string | null;
  consultationId: string | null;
  handlePaymentSuccess: () => Promise<void>;
  isMobile?: boolean;
}

export const StepContent: React.FC<StepContentProps> = ({
  currentStep,
  formData,
  updateField,
  handleArrayUpdate,
  errors,
  calculateTotal,
  clientSecret,
  consultationId,
  handlePaymentSuccess,
  isMobile = false,
}) => {
  const gridClass = isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2";
  const spacing = isMobile ? "space-y-4" : "space-y-6";

  if (currentStep === 1) {
    return (
      <div className={spacing}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Personal Information
          </h2>
          <p className="text-gray-600">
            Let's start with some basic information about you
          </p>
        </div>

        <div className={`grid ${gridClass} gap-4`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              placeholder="Enter your first name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              placeholder="Enter your last name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age *
            </label>
            <input
              type="number"
              value={formData.age || ""}
              onChange={(e) =>
                updateField("age", parseInt(e.target.value) || 0)
              }
              placeholder="Enter your age"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
            {errors.age && (
              <p className="text-red-500 text-sm mt-1">{errors.age}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender *
            </label>
            <select
              value={formData.gender}
              onChange={(e) => updateField("gender", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Occupation
          </label>
          <input
            type="text"
            value={formData.occupation}
            onChange={(e) => updateField("occupation", e.target.value)}
            placeholder="What do you do for work?"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className={spacing}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Health Information
          </h2>
          <p className="text-gray-600">
            Help us understand your current health status
          </p>
        </div>

        <div
          className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"} gap-4`}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Weight (lbs) *
            </label>
            <input
              type="number"
              value={formData.currentWeight || ""}
              onChange={(e) =>
                updateField("currentWeight", parseInt(e.target.value) || 0)
              }
              placeholder="150"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
            {errors.currentWeight && (
              <p className="text-red-500 text-sm mt-1">
                {errors.currentWeight}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Weight (lbs) *
            </label>
            <input
              type="number"
              value={formData.goalWeight || ""}
              onChange={(e) =>
                updateField("goalWeight", parseInt(e.target.value) || 0)
              }
              placeholder="140"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
            {errors.goalWeight && (
              <p className="text-red-500 text-sm mt-1">{errors.goalWeight}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height *
            </label>
            <input
              type="text"
              value={formData.height}
              onChange={(e) => updateField("height", e.target.value)}
              placeholder="5'6&quot; or 168cm"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
            {errors.height && (
              <p className="text-red-500 text-sm mt-1">{errors.height}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Activity Level *
          </label>
          <div
            className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"} gap-3`}
          >
            {activityLevelOptions.map((option) => (
              <label key={option.value} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="activityLevel"
                  value={option.value}
                  checked={formData.activityLevel === option.value}
                  onChange={(e) => updateField("activityLevel", e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.activityLevel === option.value
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="font-medium text-gray-800">
                    {option.label}
                  </div>
                  <div className="text-sm text-gray-600">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>
          {errors.activityLevel && (
            <p className="text-red-500 text-sm mt-1">{errors.activityLevel}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Dietary Restrictions/Preferences
          </label>
          <div
            className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"} gap-3`}
          >
            {dietaryOptions.map((option) => (
              <label key={option} className="relative cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.dietaryRestrictions.includes(option)}
                  onChange={(e) =>
                    handleArrayUpdate(
                      "dietaryRestrictions",
                      option,
                      e.target.checked
                    )
                  }
                  className="sr-only"
                />
                <div
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                    formData.dietaryRestrictions.includes(option)
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="text-sm font-medium">{option}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className={`grid ${gridClass} gap-4`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Food Allergies
            </label>
            <textarea
              value={formData.allergies}
              onChange={(e) => updateField("allergies", e.target.value)}
              rows={3}
              placeholder="List any food allergies or intolerances..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medical Conditions
            </label>
            <textarea
              value={formData.medicalConditions}
              onChange={(e) => updateField("medicalConditions", e.target.value)}
              rows={3}
              placeholder="Any relevant medical conditions..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 3) {
    return (
      <div className={spacing}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Goals & Lifestyle
          </h2>
          <p className="text-gray-600">
            Tell us about your goals and current lifestyle
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Primary Goals * (Select all that apply)
          </label>
          <div
            className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"} gap-3`}
          >
            {goalOptions.map((option) => (
              <label key={option} className="relative cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.primaryGoals.includes(option)}
                  onChange={(e) =>
                    handleArrayUpdate("primaryGoals", option, e.target.checked)
                  }
                  className="sr-only"
                />
                <div
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                    formData.primaryGoals.includes(option)
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="text-sm font-medium">{option}</div>
                </div>
              </label>
            ))}
          </div>
          {errors.primaryGoals && (
            <p className="text-red-500 text-sm mt-1">{errors.primaryGoals}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Motivation Level ({formData.motivationLevel}/10)
          </label>
          <div className="px-2">
            <input
              type="range"
              min="1"
              max="10"
              value={formData.motivationLevel}
              onChange={(e) =>
                updateField("motivationLevel", parseInt(e.target.value))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low (1)</span>
              <span>Medium (5)</span>
              <span>High (10)</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Biggest Challenges (Select all that apply)
          </label>
          <div
            className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"} gap-3`}
          >
            {challengeOptions.map((option) => (
              <label key={option} className="relative cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.biggestChallenges.includes(option)}
                  onChange={(e) =>
                    handleArrayUpdate(
                      "biggestChallenges",
                      option,
                      e.target.checked
                    )
                  }
                  className="sr-only"
                />
                <div
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                    formData.biggestChallenges.includes(option)
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 hover:border-orange-300"
                  }`}
                >
                  <div className="text-sm font-medium">{option}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className={`grid ${gridClass} gap-4`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meal Prep Experience *
            </label>
            <select
              value={formData.mealPrepExperience}
              onChange={(e) =>
                updateField("mealPrepExperience", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">Select experience level</option>
              <option value="none">None - Never done meal prep</option>
              <option value="beginner">Beginner - Just starting out</option>
              <option value="intermediate">
                Intermediate - Some experience
              </option>
              <option value="advanced">Advanced - Very experienced</option>
            </select>
            {errors.mealPrepExperience && (
              <p className="text-red-500 text-sm mt-1">
                {errors.mealPrepExperience}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cooking Skills *
            </label>
            <select
              value={formData.cookingSkills}
              onChange={(e) => updateField("cookingSkills", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">Select skill level</option>
              <option value="none">None - Don't cook</option>
              <option value="basic">Basic - Simple meals</option>
              <option value="intermediate">
                Intermediate - Comfortable cooking
              </option>
              <option value="advanced">Advanced - Love to cook</option>
            </select>
            {errors.cookingSkills && (
              <p className="text-red-500 text-sm mt-1">
                {errors.cookingSkills}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weekly Food Budget *
          </label>
          <select
            value={formData.budgetRange}
            onChange={(e) => updateField("budgetRange", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          >
            <option value="">Select budget range</option>
            <option value="under-50">Under $50</option>
            <option value="50-100">$50 - $100</option>
            <option value="100-150">$100 - $150</option>
            <option value="150-200">$150 - $200</option>
            <option value="over-200">Over $200</option>
          </select>
          {errors.budgetRange && (
            <p className="text-red-500 text-sm mt-1">{errors.budgetRange}</p>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 4) {
    return (
      <div className={spacing}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Choose Your Services
          </h2>
          <p className="text-gray-600">
            Select the services you're interested in
          </p>
        </div>

        <div className="space-y-4">
          {serviceOptions.map((service) => (
            <div
              key={service.id}
              className={`cursor-pointer transition-all duration-200 p-4 border-2 rounded-xl ${
                formData.servicesInterested.includes(service.id)
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-emerald-300 hover:shadow-md"
              } ${service.required ? "opacity-90" : ""}`}
              onClick={() => {
                if (service.required) return;
                const current = formData.servicesInterested;
                if (current.includes(service.id)) {
                  updateField(
                    "servicesInterested",
                    current.filter((id) => id !== service.id)
                  );
                } else {
                  updateField("servicesInterested", [...current, service.id]);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.servicesInterested.includes(service.id)}
                      disabled={service.required}
                      readOnly
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <h3
                      className={`${isMobile ? "text-base" : "text-lg"} font-semibold`}
                    >
                      {service.name}
                      {service.required && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full ml-2">
                          Required
                        </span>
                      )}
                    </h3>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                      {service.duration}
                    </span>
                  </div>
                  <p className="text-gray-600 ml-7 text-sm">
                    {service.description}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <div
                    className={`${isMobile ? "text-xl" : "text-2xl"} font-bold text-emerald-600`}
                  >
                    ${service.price}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {errors.servicesInterested && (
          <p className="text-red-500 text-sm mt-1">
            {errors.servicesInterested}
          </p>
        )}

        {formData.servicesInterested.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl">
            <div className="flex justify-between items-center">
              <span
                className={`${isMobile ? "text-base" : "text-lg"} font-semibold`}
              >
                Total Amount:
              </span>
              <span
                className={`${isMobile ? "text-xl" : "text-2xl"} font-bold text-emerald-600`}
              >
                ${(calculateTotal() || 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            When would you like to start? *
          </label>
          <div
            className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"} gap-3`}
          >
            {urgencyOptions.map((option) => (
              <label key={option.value} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="urgencyLevel"
                  value={option.value}
                  checked={formData.urgencyLevel === option.value}
                  onChange={(e) => updateField("urgencyLevel", e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.urgencyLevel === option.value
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="font-medium text-gray-800 mb-1">
                    {option.label}
                  </div>
                  <div className="text-sm text-gray-600">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>
          {errors.urgencyLevel && (
            <p className="text-red-500 text-sm mt-1">{errors.urgencyLevel}</p>
          )}
        </div>

        <div className={`grid ${gridClass} gap-4`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Time *
            </label>
            <select
              value={formData.preferredConsultationTime}
              onChange={(e) =>
                updateField("preferredConsultationTime", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">Select time</option>
              <option value="09:00">9:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="13:00">1:00 PM</option>
              <option value="14:00">2:00 PM</option>
              <option value="15:00">3:00 PM</option>
              <option value="16:00">4:00 PM</option>
              <option value="17:00">5:00 PM</option>
            </select>
            {errors.preferredConsultationTime && (
              <p className="text-red-500 text-sm mt-1">
                {errors.preferredConsultationTime}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Zone *
            </label>
            <select
              value={formData.timeZone}
              onChange={(e) => updateField("timeZone", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">Select time zone</option>
              <option value="EST">Eastern (EST)</option>
              <option value="CST">Central (CST)</option>
              <option value="MST">Mountain (MST)</option>
              <option value="PST">Pacific (PST)</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.timeZone && (
              <p className="text-red-500 text-sm mt-1">{errors.timeZone}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Communication *
          </label>
          <select
            value={formData.communicationPreference}
            onChange={(e) =>
              updateField("communicationPreference", e.target.value)
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          >
            <option value="">Select preference</option>
            <option value="video-call">Video Call (Zoom/Meet)</option>
            <option value="phone">Phone Call</option>
            <option value="email">Email</option>
            <option value="text">Text Message</option>
          </select>
          {errors.communicationPreference && (
            <p className="text-red-500 text-sm mt-1">
              {errors.communicationPreference}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 5) {
    return (
      <div className={spacing}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Final Details
          </h2>
          <p className="text-gray-600">
            Just a few more details and you're all set!
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How did you hear about us?
          </label>
          <select
            value={formData.howDidYouHear}
            onChange={(e) => updateField("howDidYouHear", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          >
            <option value="">Select an option</option>
            <option value="social-media">Social Media</option>
            <option value="google-search">Google Search</option>
            <option value="friend-referral">Friend/Family Referral</option>
            <option value="online-ad">Online Advertisement</option>
            <option value="health-blog">Health Blog/Website</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes or Questions
          </label>
          <textarea
            value={formData.additionalNotes}
            onChange={(e) => updateField("additionalNotes", e.target.value)}
            rows={4}
            placeholder="Anything else you'd like us to know about your health journey, specific concerns, or questions you have..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
          />
        </div>

        <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
          <h3
            className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-gray-800 mb-4 flex items-center gap-2`}
          >
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Consultation Fee
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Selected Services</span>
              <div className="text-right">
                {formData.servicesInterested.map((serviceId) => {
                  const service = serviceOptions.find(
                    (s) => s.id === serviceId
                  );
                  return service ? (
                    <div key={serviceId} className="text-sm text-gray-600">
                      {service.name}: ${service.price}
                    </div>
                  ) : null;
                })}
              </div>
            </div>
            <div className="border-t border-emerald-200 pt-3">
              <div
                className={`flex justify-between items-center ${isMobile ? "text-base" : "text-lg"} font-semibold`}
              >
                <span className="text-gray-800">Total Due Today</span>
                <span className="text-emerald-600">${calculateTotal()}.00</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Payment will be processed securely. Additional services will be
                discussed during your consultation.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => updateField("agreeToTerms", e.target.checked)}
              className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <div className="text-sm">
              <span className="text-gray-700">
                I agree to the{" "}
                <a href="#" className="text-emerald-600 hover:underline">
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a href="#" className="text-emerald-600 hover:underline">
                  Privacy Policy
                </a>
                . I understand that the consultation fee is $
                {(calculateTotal() || 0).toFixed(2)} and additional services are
                optional. *
              </span>
            </div>
          </label>
          {errors.agreeToTerms && (
            <p className="text-red-500 text-sm">{errors.agreeToTerms}</p>
          )}

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.agreeToMarketing}
              onChange={(e) =>
                updateField("agreeToMarketing", e.target.checked)
              }
              className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">
              I would like to receive health tips, nutrition advice, and
              promotional offers via email. (Optional)
            </span>
          </label>
        </div>
      </div>
    );
  }

  if (currentStep === 6) {
    return (
      <div>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Complete Payment
          </h2>
          <p className="text-gray-600">Secure your consultation booking</p>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3
                  className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-gray-900`}
                >
                  Secure Payment
                </h3>
                <p className="text-sm text-gray-600">
                  Complete your consultation booking
                </p>
              </div>
            </div>

            <div className="mb-6">
              <div
                className={`flex justify-between items-center ${isMobile ? "text-base" : "text-lg"} font-semibold`}
              >
                <span>Total Amount:</span>
                <span className="text-emerald-600">
                  ${(calculateTotal() || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div>
              {clientSecret ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret: clientSecret,
                    appearance: { theme: "stripe" },
                  }}
                >
                  <StripeCheckout
                    amount={calculateTotal()}
                    onPaymentSuccess={handlePaymentSuccess}
                  />
                </Elements>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
                    <p className="text-gray-600">Preparing secure payment...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Your payment information is secure and encrypted</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
