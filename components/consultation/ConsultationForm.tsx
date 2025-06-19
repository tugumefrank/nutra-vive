// // "use client";

// // import React, { useState } from "react";
// // import { useRouter } from "next/navigation";
// // import { submitConsultationForm } from "@/lib/actions/consultation";
// // import {
// //   User,
// //   Mail,
// //   Phone,
// //   Calendar,
// //   Clock,
// //   Target,
// //   Heart,
// //   AlertCircle,
// //   FileText,
// //   DollarSign,
// //   CheckCircle,
// //   ArrowRight,
// //   ArrowLeft,
// //   Loader2,
// //   CreditCard,
// //   Shield,
// // } from "lucide-react";

// // interface ConsultationFormData {
// //   firstName: string;
// //   lastName: string;
// //   email: string;
// //   phone: string;
// //   age: number;
// //   gender: "male" | "female" | "other" | "prefer-not-to-say" | "";
// //   occupation: string;
// //   currentWeight: number;
// //   goalWeight: number;
// //   height: string;
// //   activityLevel:
// //     | "sedentary"
// //     | "lightly-active"
// //     | "moderately-active"
// //     | "very-active"
// //     | "extremely-active"
// //     | "";
// //   dietaryRestrictions: string[];
// //   allergies: string;
// //   medicalConditions: string;
// //   currentMedications: string;
// //   previousDietExperience: string;
// //   primaryGoals: string[];
// //   motivationLevel: number;
// //   biggestChallenges: string[];
// //   currentEatingHabits: string;
// //   mealPrepExperience: "none" | "beginner" | "intermediate" | "advanced" | "";
// //   cookingSkills: "none" | "basic" | "intermediate" | "advanced" | "";
// //   budgetRange: "under-50" | "50-100" | "100-150" | "150-200" | "over-200" | "";
// //   servicesInterested: string[];
// //   preferredConsultationTime: string;
// //   preferredDate: string;
// //   timeZone: string;
// //   communicationPreference: "email" | "phone" | "video-call" | "text" | "";
// //   urgencyLevel: "low" | "medium" | "high" | "";
// //   additionalNotes: string;
// //   howDidYouHear: string;
// //   agreeToTerms: boolean;
// //   agreeToMarketing: boolean;
// // }

// // const PaymentStep: React.FC<{
// //   totalAmount: number;
// //   clientSecret?: string;
// //   onPaymentSuccess: () => void;
// // }> = ({ totalAmount, clientSecret, onPaymentSuccess }) => {
// //   const [isProcessing, setIsProcessing] = useState(false);
// //   const [cardNumber, setCardNumber] = useState("");
// //   const [expiryDate, setExpiryDate] = useState("");
// //   const [cvv, setCvv] = useState("");
// //   const [billingName, setBillingName] = useState("");
// //   const [paymentError, setPaymentError] = useState<string | null>(null);

// //   const handlePayment = async () => {
// //     setIsProcessing(true);
// //     setPaymentError(null);

// //     try {
// //       // In a real implementation, you would integrate with Stripe here
// //       // For now, we'll simulate the payment process

// //       // Basic validation
// //       if (!billingName || !cardNumber || !expiryDate || !cvv) {
// //         throw new Error("Please fill in all payment fields");
// //       }

// //       if (cardNumber.replace(/\s/g, "").length < 16) {
// //         throw new Error("Please enter a valid card number");
// //       }

// //       // Simulate API call delay
// //       await new Promise((resolve) => setTimeout(resolve, 2000));

// //       // For demo purposes, we'll assume payment succeeded
// //       // In production, you'd use Stripe's API here
// //       console.log("Payment processed successfully");
// //       onPaymentSuccess();
// //     } catch (error) {
// //       console.error("Payment error:", error);
// //       setPaymentError(
// //         error instanceof Error ? error.message : "Payment failed"
// //       );
// //     } finally {
// //       setIsProcessing(false);
// //     }
// //   };

// //   return (
// //     <div className="space-y-6">
// //       <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
// //         <div className="flex items-center gap-3 mb-4">
// //           <div className="p-2 bg-emerald-500 rounded-lg">
// //             <CreditCard className="w-5 h-5 text-white" />
// //           </div>
// //           <div>
// //             <h3 className="text-lg font-semibold text-gray-900">
// //               Secure Payment
// //             </h3>
// //             <p className="text-sm text-gray-600">
// //               Complete your consultation booking
// //             </p>
// //           </div>
// //         </div>

// //         <div className="mb-6">
// //           <div className="flex justify-between items-center text-lg font-semibold">
// //             <span>Total Amount:</span>
// //             <span className="text-emerald-600">${totalAmount.toFixed(2)}</span>
// //           </div>
// //         </div>

// //         <div className="space-y-4">
// //           <div>
// //             <label className="block text-sm font-medium text-gray-700 mb-2">
// //               Cardholder Name
// //             </label>
// //             <input
// //               type="text"
// //               value={billingName}
// //               onChange={(e) => setBillingName(e.target.value)}
// //               placeholder="Full name on card"
// //               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
// //             />
// //           </div>

// //           <div>
// //             <label className="block text-sm font-medium text-gray-700 mb-2">
// //               Card Number
// //             </label>
// //             <input
// //               type="text"
// //               value={cardNumber}
// //               onChange={(e) => setCardNumber(e.target.value)}
// //               placeholder="1234 5678 9012 3456"
// //               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
// //             />
// //           </div>

// //           <div className="grid grid-cols-2 gap-4">
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-2">
// //                 Expiry Date
// //               </label>
// //               <input
// //                 type="text"
// //                 value={expiryDate}
// //                 onChange={(e) => setExpiryDate(e.target.value)}
// //                 placeholder="MM/YY"
// //                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
// //               />
// //             </div>
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-2">
// //                 CVV
// //               </label>
// //               <input
// //                 type="text"
// //                 value={cvv}
// //                 onChange={(e) => setCvv(e.target.value)}
// //                 placeholder="123"
// //                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
// //               />
// //             </div>
// //           </div>
// //         </div>

// //         <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
// //           <Shield className="w-4 h-4" />
// //           <span>Your payment information is secure and encrypted</span>
// //         </div>
// //       </div>

// //       <button
// //         onClick={handlePayment}
// //         disabled={isProcessing}
// //         className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
// //       >
// //         {isProcessing ? (
// //           <>
// //             <Loader2 className="w-4 h-4 animate-spin" />
// //             Processing Payment...
// //           </>
// //         ) : (
// //           <>
// //             <CheckCircle className="w-4 h-4" />
// //             Complete Payment & Book Consultation
// //           </>
// //         )}
// //       </button>
// //     </div>
// //   );
// // };

// // const ConsultationForm: React.FC = () => {
// //   const router = useRouter();
// //   const [currentStep, setCurrentStep] = useState(1);
// //   const [isSubmitting, setIsSubmitting] = useState(false);
// //   const [errors, setErrors] = useState<Record<string, string>>({});
// //   const [showSuccess, setShowSuccess] = useState(false);
// //   const [submitError, setSubmitError] = useState<string | null>(null);
// //   const totalSteps = 6;

// //   const [formData, setFormData] = useState<ConsultationFormData>({
// //     firstName: "",
// //     lastName: "",
// //     email: "",
// //     phone: "",
// //     age: 0,
// //     gender: "",
// //     occupation: "",
// //     currentWeight: 0,
// //     goalWeight: 0,
// //     height: "",
// //     activityLevel: "",
// //     dietaryRestrictions: [],
// //     allergies: "",
// //     medicalConditions: "",
// //     currentMedications: "",
// //     previousDietExperience: "",
// //     primaryGoals: [],
// //     motivationLevel: 5,
// //     biggestChallenges: [],
// //     currentEatingHabits: "",
// //     mealPrepExperience: "",
// //     cookingSkills: "",
// //     budgetRange: "",
// //     servicesInterested: [],
// //     preferredConsultationTime: "",
// //     preferredDate: "",
// //     timeZone: "",
// //     communicationPreference: "",
// //     urgencyLevel: "",
// //     additionalNotes: "",
// //     howDidYouHear: "",
// //     agreeToTerms: false,
// //     agreeToMarketing: false,
// //   });

// //   const serviceOptions = [
// //     {
// //       id: "consultation",
// //       name: "Initial Consultation",
// //       duration: "20 min",
// //       price: 20,
// //       description: "Comprehensive assessment of your needs and goals",
// //     },
// //     {
// //       id: "meal-plan",
// //       name: "Custom Meal Plan",
// //       duration: "7 days",
// //       price: 20,
// //       description: "Personalized meal plan with grocery list",
// //     },
// //     {
// //       id: "coaching",
// //       name: "Ongoing Coaching",
// //       duration: "30 days",
// //       price: 35,
// //       description: "Continuous support and guidance",
// //     },
// //   ];

// //   const dietaryOptions = [
// //     "Vegetarian",
// //     "Vegan",
// //     "Gluten-Free",
// //     "Keto",
// //     "Paleo",
// //     "Mediterranean",
// //     "Low-Carb",
// //     "Dairy-Free",
// //     "Nut-Free",
// //     "Other",
// //   ];

// //   const goalOptions = [
// //     "Weight Loss",
// //     "Weight Gain",
// //     "Muscle Building",
// //     "Improved Energy",
// //     "Better Digestion",
// //     "Hormone Balance",
// //     "Disease Prevention",
// //     "Athletic Performance",
// //     "Healthy Aging",
// //     "Mental Clarity",
// //   ];

// //   const challengeOptions = [
// //     "Time Constraints",
// //     "Lack of Motivation",
// //     "Emotional Eating",
// //     "Social Situations",
// //     "Budget Limitations",
// //     "Cooking Skills",
// //     "Family Preferences",
// //     "Travel/Work Schedule",
// //     "Cravings",
// //     "Meal Planning",
// //   ];

// //   const calculateTotal = () => {
// //     return formData.servicesInterested.reduce((sum, serviceId) => {
// //       const service = serviceOptions.find((s) => s.id === serviceId);
// //       return sum + (service?.price || 0);
// //     }, 0);
// //   };

// //   const updateField = (field: string, value: any) => {
// //     setFormData((prev) => ({ ...prev, [field]: value }));
// //     if (errors[field]) {
// //       setErrors((prev) => ({ ...prev, [field]: "" }));
// //     }
// //   };

// //   const handleArrayUpdate = (
// //     field: string,
// //     value: string,
// //     checked: boolean
// //   ) => {
// //     const currentArray = formData[
// //       field as keyof ConsultationFormData
// //     ] as string[];
// //     if (checked) {
// //       updateField(field, [...currentArray, value]);
// //     } else {
// //       updateField(
// //         field,
// //         currentArray.filter((item) => item !== value)
// //       );
// //     }
// //   };

// //   const validateStep = () => {
// //     const newErrors: Record<string, string> = {};

// //     if (currentStep === 1) {
// //       if (!formData.firstName) newErrors.firstName = "First name is required";
// //       if (!formData.lastName) newErrors.lastName = "Last name is required";
// //       if (!formData.email) newErrors.email = "Email is required";
// //       if (!formData.phone) newErrors.phone = "Phone number is required";
// //       if (!formData.age || formData.age < 13)
// //         newErrors.age = "Valid age is required";
// //       if (!formData.gender) newErrors.gender = "Please select your gender";
// //     } else if (currentStep === 2) {
// //       if (!formData.currentWeight)
// //         newErrors.currentWeight = "Current weight is required";
// //       if (!formData.goalWeight)
// //         newErrors.goalWeight = "Goal weight is required";
// //       if (!formData.height) newErrors.height = "Height is required";
// //       if (!formData.activityLevel)
// //         newErrors.activityLevel = "Please select your activity level";
// //     } else if (currentStep === 3) {
// //       if (formData.primaryGoals.length === 0)
// //         newErrors.primaryGoals = "Please select at least one goal";
// //       if (!formData.mealPrepExperience)
// //         newErrors.mealPrepExperience =
// //           "Please select your meal prep experience";
// //       if (!formData.cookingSkills)
// //         newErrors.cookingSkills = "Please select your cooking skill level";
// //       if (!formData.budgetRange)
// //         newErrors.budgetRange = "Please select your budget range";
// //     } else if (currentStep === 4) {
// //       if (formData.servicesInterested.length === 0)
// //         newErrors.servicesInterested = "Please select at least one service";
// //       if (!formData.preferredDate)
// //         newErrors.preferredDate = "Please select your preferred date";
// //       if (!formData.preferredConsultationTime)
// //         newErrors.preferredConsultationTime =
// //           "Please select your preferred time";
// //       if (!formData.timeZone)
// //         newErrors.timeZone = "Please select your time zone";
// //       if (!formData.communicationPreference)
// //         newErrors.communicationPreference =
// //           "Please select your communication preference";
// //     } else if (currentStep === 5) {
// //       if (!formData.agreeToTerms)
// //         newErrors.agreeToTerms = "You must agree to the terms and conditions";
// //     }

// //     setErrors(newErrors);
// //     return Object.keys(newErrors).length === 0;
// //   };

// //   const nextStep = () => {
// //     if (validateStep() && currentStep < totalSteps) {
// //       setCurrentStep(currentStep + 1);
// //     }
// //   };

// //   const prevStep = () => {
// //     if (currentStep > 1) {
// //       setCurrentStep(currentStep - 1);
// //     }
// //   };

// //   const handleSubmit = async () => {
// //     if (!validateStep()) return;

// //     setIsSubmitting(true);
// //     setSubmitError(null);

// //     try {
// //       // Prepare form data for submission
// //       const submissionData = {
// //         // Personal Info
// //         firstName: formData.firstName,
// //         lastName: formData.lastName,
// //         email: formData.email,
// //         phone: formData.phone,
// //         age: formData.age,
// //         gender: formData.gender as
// //           | "male"
// //           | "female"
// //           | "other"
// //           | "prefer-not-to-say",
// //         occupation: formData.occupation,

// //         // Health Info
// //         currentWeight: formData.currentWeight,
// //         goalWeight: formData.goalWeight,
// //         height: formData.height,
// //         activityLevel: formData.activityLevel as
// //           | "sedentary"
// //           | "lightly-active"
// //           | "moderately-active"
// //           | "very-active"
// //           | "extremely-active",
// //         dietaryRestrictions: formData.dietaryRestrictions,
// //         allergies: formData.allergies,
// //         medicalConditions: formData.medicalConditions,
// //         currentMedications: formData.currentMedications,
// //         previousDietExperience: formData.previousDietExperience,

// //         // Goals & Lifestyle
// //         primaryGoals: formData.primaryGoals,
// //         motivationLevel: formData.motivationLevel,
// //         biggestChallenges: formData.biggestChallenges,
// //         currentEatingHabits: formData.currentEatingHabits,
// //         mealPrepExperience: formData.mealPrepExperience as
// //           | "none"
// //           | "beginner"
// //           | "intermediate"
// //           | "advanced",
// //         cookingSkills: formData.cookingSkills as
// //           | "none"
// //           | "basic"
// //           | "intermediate"
// //           | "advanced",
// //         budgetRange: formData.budgetRange as
// //           | "under-50"
// //           | "50-100"
// //           | "100-150"
// //           | "150-200"
// //           | "over-200",

// //         // Service Preferences
// //         servicesInterested: formData.servicesInterested,
// //         preferredConsultationTime: formData.preferredConsultationTime,
// //         preferredDate: formData.preferredDate,
// //         timeZone: formData.timeZone,
// //         communicationPreference: formData.communicationPreference as
// //           | "email"
// //           | "phone"
// //           | "video-call"
// //           | "text",
// //         urgencyLevel: formData.urgencyLevel as "low" | "medium" | "high",

// //         // Additional
// //         additionalNotes: formData.additionalNotes,
// //         howDidYouHear: formData.howDidYouHear,
// //         agreeToTerms: formData.agreeToTerms,
// //         agreeToMarketing: formData.agreeToMarketing,
// //       };

// //       console.log("Submitting consultation form:", submissionData);

// //       const result = await submitConsultationForm(submissionData);

// //       if (result.success && result.clientSecret) {
// //         // Move to payment step with Stripe client secret
// //         setCurrentStep(6);
// //         // Store the client secret for payment processing
// //         // You might want to store this in state or context
// //       } else {
// //         throw new Error(result.error || "Failed to submit consultation form");
// //       }
// //     } catch (error) {
// //       console.error("Error submitting consultation form:", error);
// //       setSubmitError(
// //         error instanceof Error ? error.message : "An unexpected error occurred"
// //       );
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   const handlePaymentSuccess = () => {
// //     setShowSuccess(true);
// //     // Redirect to success page after a short delay
// //     setTimeout(() => {
// //       router.push("/consultation/success");
// //     }, 2000);
// //   };

// //   if (showSuccess) {
// //     return (
// //       <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
// //         <div className="max-w-md w-full text-center bg-white rounded-2xl p-8 shadow-2xl">
// //           <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
// //             <CheckCircle className="w-8 h-8 text-white" />
// //           </div>
// //           <h2 className="text-2xl font-bold text-gray-900 mb-2">
// //             Payment Successful!
// //           </h2>
// //           <p className="text-gray-600">
// //             Your consultation has been booked. We'll contact you within 24
// //             hours.
// //           </p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="flex-center min-h-screen w-full bg-primary-50">
// //       <div className="max-w-4xl w-full mx-auto px-4 py-12">
// //         <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-200">
// //           {/* Header */}
// //           <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white">
// //             <div className="text-center">
// //               <h1 className="text-3xl font-bold mb-2">
// //                 Nutrition Consultation
// //               </h1>
// //               <p className="text-orange-100">
// //                 Start your personalized wellness journey today
// //               </p>
// //             </div>
// //           </div>

// //           <div className="p-8">
// //             {/* Progress Bar */}
// //             <div className="mb-8">
// //               <div className="flex items-center justify-between mb-4">
// //                 <span className="text-sm font-medium text-gray-600">
// //                   Step {currentStep} of {totalSteps}
// //                 </span>
// //                 <span className="text-sm font-medium text-orange-600">
// //                   {Math.round((currentStep / totalSteps) * 100)}% Complete
// //                 </span>
// //               </div>
// //               <div className="w-full bg-gray-200 rounded-full h-2">
// //                 <div
// //                   className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
// //                   style={{ width: `${(currentStep / totalSteps) * 100}%` }}
// //                 />
// //               </div>
// //             </div>

// //             {(errors.general || submitError) && (
// //               <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg flex items-center gap-3">
// //                 <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
// //                 <span className="text-red-800">
// //                   {errors.general || submitError}
// //                 </span>
// //               </div>
// //             )}

// //             {/* Step Content */}
// //             <div>
// //               {currentStep === 1 && (
// //                 <div className="space-y-6">
// //                   <div className="text-center mb-8">
// //                     <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-4">
// //                       <User className="w-8 h-8 text-white" />
// //                     </div>
// //                     <h2 className="text-2xl font-bold text-gray-800 mb-2">
// //                       Personal Information
// //                     </h2>
// //                     <p className="text-gray-600">
// //                       Let's start with some basic information about you
// //                     </p>
// //                   </div>

// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         First Name *
// //                       </label>
// //                       <input
// //                         type="text"
// //                         value={formData.firstName}
// //                         onChange={(e) =>
// //                           updateField("firstName", e.target.value)
// //                         }
// //                         placeholder="Enter your first name"
// //                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
// //                       />
// //                       {errors.firstName && (
// //                         <p className="text-red-500 text-sm mt-1">
// //                           {errors.firstName}
// //                         </p>
// //                       )}
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Last Name *
// //                       </label>
// //                       <input
// //                         type="text"
// //                         value={formData.lastName}
// //                         onChange={(e) =>
// //                           updateField("lastName", e.target.value)
// //                         }
// //                         placeholder="Enter your last name"
// //                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
// //                       />
// //                       {errors.lastName && (
// //                         <p className="text-red-500 text-sm mt-1">
// //                           {errors.lastName}
// //                         </p>
// //                       )}
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Email Address *
// //                       </label>
// //                       <input
// //                         type="email"
// //                         value={formData.email}
// //                         onChange={(e) => updateField("email", e.target.value)}
// //                         placeholder="your.email@example.com"
// //                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
// //                       />
// //                       {errors.email && (
// //                         <p className="text-red-500 text-sm mt-1">
// //                           {errors.email}
// //                         </p>
// //                       )}
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Phone Number *
// //                       </label>
// //                       <input
// //                         type="tel"
// //                         value={formData.phone}
// //                         onChange={(e) => updateField("phone", e.target.value)}
// //                         placeholder="(555) 123-4567"
// //                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
// //                       />
// //                       {errors.phone && (
// //                         <p className="text-red-500 text-sm mt-1">
// //                           {errors.phone}
// //                         </p>
// //                       )}
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Age *
// //                       </label>
// //                       <input
// //                         type="number"
// //                         value={formData.age || ""}
// //                         onChange={(e) =>
// //                           updateField("age", parseInt(e.target.value) || 0)
// //                         }
// //                         placeholder="Enter your age"
// //                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
// //                       />
// //                       {errors.age && (
// //                         <p className="text-red-500 text-sm mt-1">
// //                           {errors.age}
// //                         </p>
// //                       )}
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Gender *
// //                       </label>
// //                       <select
// //                         value={formData.gender}
// //                         onChange={(e) => updateField("gender", e.target.value)}
// //                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
// //                       >
// //                         <option value="">Select gender</option>
// //                         <option value="male">Male</option>
// //                         <option value="female">Female</option>
// //                         <option value="other">Other</option>
// //                         <option value="prefer-not-to-say">
// //                           Prefer not to say
// //                         </option>
// //                       </select>
// //                       {errors.gender && (
// //                         <p className="text-red-500 text-sm mt-1">
// //                           {errors.gender}
// //                         </p>
// //                       )}
// //                     </div>
// //                   </div>

// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 mb-2">
// //                       Occupation
// //                     </label>
// //                     <input
// //                       type="text"
// //                       value={formData.occupation}
// //                       onChange={(e) =>
// //                         updateField("occupation", e.target.value)
// //                       }
// //                       placeholder="What do you do for work?"
// //                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
// //                     />
// //                   </div>
// //                 </div>
// //               )}

// //               {currentStep === 2 && (
// //                 <div className="space-y-6">
// //                   <div className="text-center mb-8">
// //                     <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
// //                       <Heart className="w-8 h-8 text-white" />
// //                     </div>
// //                     <h2 className="text-2xl font-bold text-gray-800 mb-2">
// //                       Health Information
// //                     </h2>
// //                     <p className="text-gray-600">
// //                       Help us understand your current health status
// //                     </p>
// //                   </div>

// //                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Current Weight (lbs) *
// //                       </label>
// //                       <input
// //                         type="number"
// //                         value={formData.currentWeight || ""}
// //                         onChange={(e) =>
// //                           updateField(
// //                             "currentWeight",
// //                             parseInt(e.target.value) || 0
// //                           )
// //                         }
// //                         placeholder="150"
// //                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
// //                       />
// //                       {errors.currentWeight && (
// //                         <p className="text-red-500 text-sm mt-1">
// //                           {errors.currentWeight}
// //                         </p>
// //                       )}
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Goal Weight (lbs) *
// //                       </label>
// //                       <input
// //                         type="number"
// //                         value={formData.goalWeight || ""}
// //                         onChange={(e) =>
// //                           updateField(
// //                             "goalWeight",
// //                             parseInt(e.target.value) || 0
// //                           )
// //                         }
// //                         placeholder="140"
// //                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
// //                       />
// //                       {errors.goalWeight && (
// //                         <p className="text-red-500 text-sm mt-1">
// //                           {errors.goalWeight}
// //                         </p>
// //                       )}
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Height *
// //                       </label>
// //                       <input
// //                         type="text"
// //                         value={formData.height}
// //                         onChange={(e) => updateField("height", e.target.value)}
// //                         placeholder="5'6&quot; or 168cm"
// //                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
// //                       />
// //                       {errors.height && (
// //                         <p className="text-red-500 text-sm mt-1">
// //                           {errors.height}
// //                         </p>
// //                       )}
// //                     </div>
// //                   </div>

// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 mb-3">
// //                       Activity Level *
// //                     </label>
// //                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
// //                       {[
// //                         {
// //                           value: "sedentary",
// //                           label: "Sedentary",
// //                           desc: "Little to no exercise",
// //                         },
// //                         {
// //                           value: "lightly-active",
// //                           label: "Lightly Active",
// //                           desc: "Light exercise 1-3 days/week",
// //                         },
// //                         {
// //                           value: "moderately-active",
// //                           label: "Moderately Active",
// //                           desc: "Moderate exercise 3-5 days/week",
// //                         },
// //                         {
// //                           value: "very-active",
// //                           label: "Very Active",
// //                           desc: "Hard exercise 6-7 days/week",
// //                         },
// //                         {
// //                           value: "extremely-active",
// //                           label: "Extremely Active",
// //                           desc: "Very hard exercise, physical job",
// //                         },
// //                       ].map((option) => (
// //                         <label
// //                           key={option.value}
// //                           className="relative cursor-pointer"
// //                         >
// //                           <input
// //                             type="radio"
// //                             name="activityLevel"
// //                             value={option.value}
// //                             checked={formData.activityLevel === option.value}
// //                             onChange={(e) =>
// //                               updateField("activityLevel", e.target.value)
// //                             }
// //                             className="sr-only"
// //                           />
// //                           <div
// //                             className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
// //                               formData.activityLevel === option.value
// //                                 ? "border-emerald-500 bg-emerald-50"
// //                                 : "border-gray-200 hover:border-emerald-300"
// //                             }`}
// //                           >
// //                             <div className="font-medium text-gray-800">
// //                               {option.label}
// //                             </div>
// //                             <div className="text-sm text-gray-600">
// //                               {option.desc}
// //                             </div>
// //                           </div>
// //                         </label>
// //                       ))}
// //                     </div>
// //                     {errors.activityLevel && (
// //                       <p className="text-red-500 text-sm mt-1">
// //                         {errors.activityLevel}
// //                       </p>
// //                     )}
// //                   </div>

// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 mb-3">
// //                       Dietary Restrictions/Preferences
// //                     </label>
// //                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
// //                       {dietaryOptions.map((option) => (
// //                         <label key={option} className="relative cursor-pointer">
// //                           <input
// //                             type="checkbox"
// //                             checked={formData.dietaryRestrictions.includes(
// //                               option
// //                             )}
// //                             onChange={(e) =>
// //                               handleArrayUpdate(
// //                                 "dietaryRestrictions",
// //                                 option,
// //                                 e.target.checked
// //                               )
// //                             }
// //                             className="sr-only"
// //                           />
// //                           <div
// //                             className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
// //                               formData.dietaryRestrictions.includes(option)
// //                                 ? "border-emerald-500 bg-emerald-50 text-emerald-700"
// //                                 : "border-gray-200 hover:border-emerald-300"
// //                             }`}
// //                           >
// //                             <div className="text-sm font-medium">{option}</div>
// //                           </div>
// //                         </label>
// //                       ))}
// //                     </div>
// //                   </div>

// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Food Allergies
// //                       </label>
// //                       <textarea
// //                         value={formData.allergies}
// //                         onChange={(e) =>
// //                           updateField("allergies", e.target.value)
// //                         }
// //                         rows={3}
// //                         placeholder="List any food allergies or intolerances..."
// //                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
// //                       />
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Medical Conditions
// //                       </label>
// //                       <textarea
// //                         value={formData.medicalConditions}
// //                         onChange={(e) =>
// //                           updateField("medicalConditions", e.target.value)
// //                         }
// //                         rows={3}
// //                         placeholder="Any relevant medical conditions..."
// //                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
// //                       />
// //                     </div>
// //                   </div>
// //                 </div>
// //               )}

// //               {currentStep === 3 && (
// //                 <div className="space-y-6">
// //                   <div className="text-center mb-8">
// //                     <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
// //                       <Target className="w-8 h-8 text-white" />
// //                     </div>
// //                     <h2 className="text-2xl font-bold text-gray-800 mb-2">
// //                       Goals & Lifestyle
// //                     </h2>
// //                     <p className="text-gray-600">
// //                       Tell us about your goals and current lifestyle
// //                     </p>
// //                   </div>

// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 mb-3">
// //                       Primary Goals * (Select all that apply)
// //                     </label>
// //                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
// //                       {goalOptions.map((option) => (
// //                         <label key={option} className="relative cursor-pointer">
// //                           <input
// //                             type="checkbox"
// //                             checked={formData.primaryGoals.includes(option)}
// //                             onChange={(e) =>
// //                               handleArrayUpdate(
// //                                 "primaryGoals",
// //                                 option,
// //                                 e.target.checked
// //                               )
// //                             }
// //                             className="sr-only"
// //                           />
// //                           <div
// //                             className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
// //                               formData.primaryGoals.includes(option)
// //                                 ? "border-emerald-500 bg-emerald-50 text-emerald-700"
// //                                 : "border-gray-200 hover:border-emerald-300"
// //                             }`}
// //                           >
// //                             <div className="text-sm font-medium">{option}</div>
// //                           </div>
// //                         </label>
// //                       ))}
// //                     </div>
// //                     {errors.primaryGoals && (
// //                       <p className="text-red-500 text-sm mt-1">
// //                         {errors.primaryGoals}
// //                       </p>
// //                     )}
// //                   </div>

// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 mb-3">
// //                       Motivation Level ({formData.motivationLevel}/10)
// //                     </label>
// //                     <div className="px-2">
// //                       <input
// //                         type="range"
// //                         min="1"
// //                         max="10"
// //                         value={formData.motivationLevel}
// //                         onChange={(e) =>
// //                           updateField(
// //                             "motivationLevel",
// //                             parseInt(e.target.value)
// //                           )
// //                         }
// //                         className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
// //                       />
// //                       <div className="flex justify-between text-xs text-gray-500 mt-1">
// //                         <span>Low (1)</span>
// //                         <span>Medium (5)</span>
// //                         <span>High (10)</span>
// //                       </div>
// //                     </div>
// //                   </div>

// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 mb-3">
// //                       Biggest Challenges (Select all that apply)
// //                     </label>
// //                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
// //                       {challengeOptions.map((option) => (
// //                         <label key={option} className="relative cursor-pointer">
// //                           <input
// //                             type="checkbox"
// //                             checked={formData.biggestChallenges.includes(
// //                               option
// //                             )}
// //                             onChange={(e) =>
// //                               handleArrayUpdate(
// //                                 "biggestChallenges",
// //                                 option,
// //                                 e.target.checked
// //                               )
// //                             }
// //                             className="sr-only"
// //                           />
// //                           <div
// //                             className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
// //                               formData.biggestChallenges.includes(option)
// //                                 ? "border-orange-500 bg-orange-50 text-orange-700"
// //                                 : "border-gray-200 hover:border-orange-300"
// //                             }`}
// //                           >
// //                             <div className="text-sm font-medium">{option}</div>
// //                           </div>
// //                         </label>
// //                       ))}
// //                     </div>
// //                   </div>

// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Meal Prep Experience *
// //                       </label>
// //                       <select
// //                         value={formData.mealPrepExperience}
// //                         onChange={(e) =>
// //                           updateField("mealPrepExperience", e.target.value)
// //                         }
// //                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
// //                       >
// //                         <option value="">Select experience level</option>
// //                         <option value="none">
// //                           None - Never done meal prep
// //                         </option>
// //                         <option value="beginner">
// //                           Beginner - Just starting out
// //                         </option>
// //                         <option value="intermediate">
// //                           Intermediate - Some experience
// //                         </option>
// //                         <option value="advanced">
// //                           Advanced - Very experienced
// //                         </option>
// //                       </select>
// //                       {errors.mealPrepExperience && (
// //                         <p className="text-red-500 text-sm mt-1">
// //                           {errors.mealPrepExperience}
// //                         </p>
// //                       )}
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Cooking Skills *
// //                       </label>
// //                       <select
// //                         value={formData.cookingSkills}
// //                         onChange={(e) =>
// //                           updateField("cookingSkills", e.target.value)
// //                         }
// //                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
// //                       >
// //                         <option value="">Select skill level</option>
// //                         <option value="none">None - Don't cook</option>
// //                         <option value="basic">Basic - Simple meals</option>
// //                         <option value="intermediate">
// //                           Intermediate - Comfortable cooking
// //                         </option>
// //                         <option value="advanced">
// //                           Advanced - Love to cook
// //                         </option>
// //                       </select>
// //                       {errors.cookingSkills && (
// //                         <p className="text-red-500 text-sm mt-1">
// //                           {errors.cookingSkills}
// //                         </p>
// //                       )}
// //                     </div>
// //                   </div>

// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 mb-2">
// //                       Weekly Food Budget *
// //                     </label>
// //                     <select
// //                       value={formData.budgetRange}
// //                       onChange={(e) =>
// //                         updateField("budgetRange", e.target.value)
// //                       }
// //                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
// //                     >
// //                       <option value="">Select budget range</option>
// //                       <option value="under-50">Under $50</option>
// //                       <option value="50-100">$50 - $100</option>
// //                       <option value="100-150">$100 - $150</option>
// //                       <option value="150-200">$150 - $200</option>
// //                       <option value="over-200">Over $200</option>
// //                     </select>
// //                     {errors.budgetRange && (
// //                       <p className="text-red-500 text-sm mt-1">
// //                         {errors.budgetRange}
// //                       </p>
// //                     )}
// //                   </div>
// //                 </div>
// //               )}

// //               {currentStep === 4 && (
// //                 <div className="space-y-6">
// //                   <div className="text-center mb-8">
// //                     <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
// //                       <Calendar className="w-8 h-8 text-white" />
// //                     </div>
// //                     <h2 className="text-2xl font-bold text-gray-800 mb-2">
// //                       Choose Your Services
// //                     </h2>
// //                     <p className="text-gray-600">
// //                       Select the services you're interested in
// //                     </p>
// //                   </div>

// //                   <div className="space-y-4">
// //                     {serviceOptions.map((service) => (
// //                       <div
// //                         key={service.id}
// //                         className={`cursor-pointer transition-all duration-200 p-6 border-2 rounded-xl ${
// //                           formData.servicesInterested.includes(service.id)
// //                             ? "border-emerald-500 bg-emerald-50"
// //                             : "border-gray-200 hover:border-emerald-300 hover:shadow-md"
// //                         }`}
// //                         onClick={() => {
// //                           const current = formData.servicesInterested;
// //                           if (current.includes(service.id)) {
// //                             updateField(
// //                               "servicesInterested",
// //                               current.filter((id) => id !== service.id)
// //                             );
// //                           } else {
// //                             updateField("servicesInterested", [
// //                               ...current,
// //                               service.id,
// //                             ]);
// //                           }
// //                         }}
// //                       >
// //                         <div className="flex items-center justify-between">
// //                           <div className="flex-1">
// //                             <div className="flex items-center gap-3 mb-2">
// //                               <input
// //                                 type="checkbox"
// //                                 checked={formData.servicesInterested.includes(
// //                                   service.id
// //                                 )}
// //                                 readOnly
// //                                 className="w-4 h-4 text-emerald-600 rounded"
// //                               />
// //                               <h3 className="text-lg font-semibold">
// //                                 {service.name}
// //                               </h3>
// //                               <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
// //                                 {service.duration}
// //                               </span>
// //                             </div>
// //                             <p className="text-gray-600 ml-7">
// //                               {service.description}
// //                             </p>
// //                           </div>
// //                           <div className="text-right">
// //                             <div className="text-2xl font-bold text-emerald-600">
// //                               ${service.price}
// //                             </div>
// //                           </div>
// //                         </div>
// //                       </div>
// //                     ))}
// //                   </div>

// //                   {errors.servicesInterested && (
// //                     <p className="text-red-500 text-sm mt-1">
// //                       {errors.servicesInterested}
// //                     </p>
// //                   )}

// //                   {formData.servicesInterested.length > 0 && (
// //                     <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl">
// //                       <div className="flex justify-between items-center">
// //                         <span className="text-lg font-semibold">
// //                           Total Amount:
// //                         </span>
// //                         <span className="text-2xl font-bold text-emerald-600">
// //                           ${calculateTotal()}
// //                         </span>
// //                       </div>
// //                     </div>
// //                   )}

// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Preferred Consultation Date *
// //                       </label>
// //                       <input
// //                         type="date"
// //                         value={formData.preferredDate}
// //                         onChange={(e) =>
// //                           updateField("preferredDate", e.target.value)
// //                         }
// //                         min={new Date().toISOString().split("T")[0]}
// //                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
// //                       />
// //                       {errors.preferredDate && (
// //                         <p className="text-red-500 text-sm mt-1">
// //                           {errors.preferredDate}
// //                         </p>
// //                       )}
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Preferred Time *
// //                       </label>
// //                       <select
// //                         value={formData.preferredConsultationTime}
// //                         onChange={(e) =>
// //                           updateField(
// //                             "preferredConsultationTime",
// //                             e.target.value
// //                           )
// //                         }
// //                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
// //                       >
// //                         <option value="">Select time</option>
// //                         <option value="09:00">9:00 AM</option>
// //                         <option value="10:00">10:00 AM</option>
// //                         <option value="11:00">11:00 AM</option>
// //                         <option value="12:00">12:00 PM</option>
// //                         <option value="13:00">1:00 PM</option>
// //                         <option value="14:00">2:00 PM</option>
// //                         <option value="15:00">3:00 PM</option>
// //                         <option value="16:00">4:00 PM</option>
// //                         <option value="17:00">5:00 PM</option>
// //                       </select>
// //                       {errors.preferredConsultationTime && (
// //                         <p className="text-red-500 text-sm mt-1">
// //                           {errors.preferredConsultationTime}
// //                         </p>
// //                       )}
// //                     </div>
// //                   </div>

// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Time Zone *
// //                       </label>
// //                       <select
// //                         value={formData.timeZone}
// //                         onChange={(e) =>
// //                           updateField("timeZone", e.target.value)
// //                         }
// //                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
// //                       >
// //                         <option value="">Select time zone</option>
// //                         <option value="EST">Eastern (EST)</option>
// //                         <option value="CST">Central (CST)</option>
// //                         <option value="MST">Mountain (MST)</option>
// //                         <option value="PST">Pacific (PST)</option>
// //                         <option value="OTHER">Other</option>
// //                       </select>
// //                       {errors.timeZone && (
// //                         <p className="text-red-500 text-sm mt-1">
// //                           {errors.timeZone}
// //                         </p>
// //                       )}
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Preferred Communication *
// //                       </label>
// //                       <select
// //                         value={formData.communicationPreference}
// //                         onChange={(e) =>
// //                           updateField("communicationPreference", e.target.value)
// //                         }
// //                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
// //                       >
// //                         <option value="">Select preference</option>
// //                         <option value="video-call">
// //                           Video Call (Zoom/Meet)
// //                         </option>
// //                         <option value="phone">Phone Call</option>
// //                         <option value="email">Email</option>
// //                         <option value="text">Text Message</option>
// //                       </select>
// //                       {errors.communicationPreference && (
// //                         <p className="text-red-500 text-sm mt-1">
// //                           {errors.communicationPreference}
// //                         </p>
// //                       )}
// //                     </div>
// //                   </div>
// //                 </div>
// //               )}

// //               {currentStep === 5 && (
// //                 <div className="space-y-6">
// //                   <div className="text-center mb-8">
// //                     <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
// //                       <FileText className="w-8 h-8 text-white" />
// //                     </div>
// //                     <h2 className="text-2xl font-bold text-gray-800 mb-2">
// //                       Final Details
// //                     </h2>
// //                     <p className="text-gray-600">
// //                       Just a few more details and you're all set!
// //                     </p>
// //                   </div>

// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 mb-2">
// //                       How did you hear about us?
// //                     </label>
// //                     <select
// //                       value={formData.howDidYouHear}
// //                       onChange={(e) =>
// //                         updateField("howDidYouHear", e.target.value)
// //                       }
// //                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
// //                     >
// //                       <option value="">Select an option</option>
// //                       <option value="social-media">Social Media</option>
// //                       <option value="google-search">Google Search</option>
// //                       <option value="friend-referral">
// //                         Friend/Family Referral
// //                       </option>
// //                       <option value="online-ad">Online Advertisement</option>
// //                       <option value="health-blog">Health Blog/Website</option>
// //                       <option value="other">Other</option>
// //                     </select>
// //                   </div>

// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 mb-2">
// //                       Additional Notes or Questions
// //                     </label>
// //                     <textarea
// //                       value={formData.additionalNotes}
// //                       onChange={(e) =>
// //                         updateField("additionalNotes", e.target.value)
// //                       }
// //                       rows={4}
// //                       placeholder="Anything else you'd like us to know about your health journey, specific concerns, or questions you have..."
// //                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
// //                     />
// //                   </div>

// //                   <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
// //                     <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
// //                       <DollarSign className="w-5 h-5 text-emerald-600" />
// //                       Consultation Fee
// //                     </h3>
// //                     <div className="space-y-3">
// //                       <div className="flex justify-between items-center">
// //                         <span className="text-gray-700">Selected Services</span>
// //                         <div className="text-right">
// //                           {formData.servicesInterested.map((serviceId) => {
// //                             const service = serviceOptions.find(
// //                               (s) => s.id === serviceId
// //                             );
// //                             return service ? (
// //                               <div
// //                                 key={serviceId}
// //                                 className="text-sm text-gray-600"
// //                               >
// //                                 {service.name}: ${service.price}
// //                               </div>
// //                             ) : null;
// //                           })}
// //                         </div>
// //                       </div>
// //                       <div className="border-t border-emerald-200 pt-3">
// //                         <div className="flex justify-between items-center text-lg font-semibold">
// //                           <span className="text-gray-800">Total Due Today</span>
// //                           <span className="text-emerald-600">
// //                             ${calculateTotal()}.00
// //                           </span>
// //                         </div>
// //                         <p className="text-sm text-gray-600 mt-2">
// //                           Payment will be processed securely. Additional
// //                           services will be discussed during your consultation.
// //                         </p>
// //                       </div>
// //                     </div>
// //                   </div>

// //                   <div className="space-y-4">
// //                     <label className="flex items-start space-x-3 cursor-pointer">
// //                       <input
// //                         type="checkbox"
// //                         checked={formData.agreeToTerms}
// //                         onChange={(e) =>
// //                           updateField("agreeToTerms", e.target.checked)
// //                         }
// //                         className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
// //                       />
// //                       <div className="text-sm">
// //                         <span className="text-gray-700">
// //                           I agree to the{" "}
// //                           <a
// //                             href="#"
// //                             className="text-emerald-600 hover:underline"
// //                           >
// //                             Terms and Conditions
// //                           </a>{" "}
// //                           and{" "}
// //                           <a
// //                             href="#"
// //                             className="text-emerald-600 hover:underline"
// //                           >
// //                             Privacy Policy
// //                           </a>
// //                           . I understand that the consultation fee is $
// //                           {calculateTotal()} and additional services are
// //                           optional. *
// //                         </span>
// //                       </div>
// //                     </label>
// //                     {errors.agreeToTerms && (
// //                       <p className="text-red-500 text-sm">
// //                         {errors.agreeToTerms}
// //                       </p>
// //                     )}

// //                     <label className="flex items-start space-x-3 cursor-pointer">
// //                       <input
// //                         type="checkbox"
// //                         checked={formData.agreeToMarketing}
// //                         onChange={(e) =>
// //                           updateField("agreeToMarketing", e.target.checked)
// //                         }
// //                         className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
// //                       />
// //                       <span className="text-sm text-gray-700">
// //                         I would like to receive health tips, nutrition advice,
// //                         and promotional offers via email. (Optional)
// //                       </span>
// //                     </label>
// //                   </div>
// //                 </div>
// //               )}

// //               {currentStep === 6 && (
// //                 <div>
// //                   <div className="text-center mb-8">
// //                     <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
// //                       <CreditCard className="w-8 h-8 text-white" />
// //                     </div>
// //                     <h2 className="text-2xl font-bold text-gray-800 mb-2">
// //                       Complete Payment
// //                     </h2>
// //                     <p className="text-gray-600">
// //                       Secure your consultation booking
// //                     </p>
// //                   </div>

// //                   <PaymentStep
// //                     totalAmount={calculateTotal()}
// //                     onPaymentSuccess={handlePaymentSuccess}
// //                   />
// //                 </div>
// //               )}
// //             </div>

// //             {/* Navigation */}
// //             {currentStep !== 6 && (
// //               <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
// //                 <button
// //                   type="button"
// //                   onClick={prevStep}
// //                   disabled={currentStep === 1}
// //                   className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
// //                 >
// //                   <ArrowLeft className="w-4 h-4" />
// //                   Previous
// //                 </button>

// //                 <button
// //                   type="button"
// //                   onClick={currentStep === 5 ? handleSubmit : nextStep}
// //                   disabled={isSubmitting}
// //                   className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-2 disabled:opacity-50"
// //                 >
// //                   {currentStep === 5 ? (
// //                     isSubmitting ? (
// //                       <>
// //                         <Loader2 className="w-4 h-4 animate-spin" />
// //                         Processing...
// //                       </>
// //                     ) : (
// //                       <>
// //                         Continue to Payment
// //                         <ArrowRight className="w-4 h-4" />
// //                       </>
// //                     )
// //                   ) : (
// //                     <>
// //                       Next Step
// //                       <ArrowRight className="w-4 h-4" />
// //                     </>
// //                   )}
// //                 </button>
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default ConsultationForm;
// "use client";

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   submitConsultationForm,
//   confirmMockPayment,
// } from "@/lib/actions/consultation";
// import {
//   User,
//   Mail,
//   Phone,
//   Calendar,
//   Clock,
//   Target,
//   Heart,
//   AlertCircle,
//   FileText,
//   DollarSign,
//   CheckCircle,
//   ArrowRight,
//   ArrowLeft,
//   Loader2,
//   CreditCard,
//   Shield,
// } from "lucide-react";

// interface ConsultationFormData {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   age: number;
//   gender: "male" | "female" | "other" | "prefer-not-to-say" | "";
//   occupation: string;
//   currentWeight: number;
//   goalWeight: number;
//   height: string;
//   activityLevel:
//     | "sedentary"
//     | "lightly-active"
//     | "moderately-active"
//     | "very-active"
//     | "extremely-active"
//     | "";
//   dietaryRestrictions: string[];
//   allergies: string;
//   medicalConditions: string;
//   currentMedications: string;
//   previousDietExperience: string;
//   primaryGoals: string[];
//   motivationLevel: number;
//   biggestChallenges: string[];
//   currentEatingHabits: string;
//   mealPrepExperience: "none" | "beginner" | "intermediate" | "advanced" | "";
//   cookingSkills: "none" | "basic" | "intermediate" | "advanced" | "";
//   budgetRange: "under-50" | "50-100" | "100-150" | "150-200" | "over-200" | "";
//   servicesInterested: string[];
//   preferredConsultationTime: string;
//   preferredDate: string;
//   timeZone: string;
//   communicationPreference: "email" | "phone" | "video-call" | "text" | "";
//   urgencyLevel: "low" | "medium" | "high" | "";
//   additionalNotes: string;
//   howDidYouHear: string;
//   agreeToTerms: boolean;
//   agreeToMarketing: boolean;
// }

// const PaymentStep: React.FC<{
//   totalAmount: number;
//   clientSecret?: string;
//   consultationId?: string;
//   onPaymentSuccess: () => void;
// }> = ({ totalAmount, clientSecret, consultationId, onPaymentSuccess }) => {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [cardNumber, setCardNumber] = useState("");
//   const [expiryDate, setExpiryDate] = useState("");
//   const [cvv, setCvv] = useState("");
//   const [billingName, setBillingName] = useState("");
//   const [paymentError, setPaymentError] = useState<string | null>(null);

//   const handlePayment = async () => {
//     setIsProcessing(true);
//     setPaymentError(null);

//     try {
//       // Basic validation
//       if (!billingName || !cardNumber || !expiryDate || !cvv) {
//         throw new Error("Please fill in all payment fields");
//       }

//       if (cardNumber.replace(/\s/g, "").length < 16) {
//         throw new Error("Please enter a valid card number");
//       }

//       // MOCK: Simulate payment processing delay
//       await new Promise((resolve) => setTimeout(resolve, 2000));

//       console.log("💳 [MOCK] Payment processed successfully!", {
//         consultationId,
//         amount: totalAmount,
//         clientSecret,
//       });

//       // 📧 [MOCK] In production, this would be handled by Stripe webhooks
//       console.log(
//         "📧 [MOCK] Payment confirmation would trigger webhook to update database"
//       );

//       onPaymentSuccess();
//     } catch (error) {
//       console.error("❌ Payment error:", error);
//       setPaymentError(
//         error instanceof Error ? error.message : "Payment failed"
//       );
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
//         <div className="flex items-center gap-3 mb-4">
//           <div className="p-2 bg-emerald-500 rounded-lg">
//             <CreditCard className="w-5 h-5 text-white" />
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900">
//               Secure Payment
//             </h3>
//             <p className="text-sm text-gray-600">
//               Complete your consultation booking
//             </p>
//           </div>
//         </div>

//         <div className="mb-6">
//           <div className="flex justify-between items-center text-lg font-semibold">
//             <span>Total Amount:</span>
//             <span className="text-emerald-600">${totalAmount.toFixed(2)}</span>
//           </div>
//         </div>

//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Cardholder Name
//             </label>
//             <input
//               type="text"
//               value={billingName}
//               onChange={(e) => setBillingName(e.target.value)}
//               placeholder="Full name on card"
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Card Number
//             </label>
//             <input
//               type="text"
//               value={cardNumber}
//               onChange={(e) => setCardNumber(e.target.value)}
//               placeholder="1234 5678 9012 3456"
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Expiry Date
//               </label>
//               <input
//                 type="text"
//                 value={expiryDate}
//                 onChange={(e) => setExpiryDate(e.target.value)}
//                 placeholder="MM/YY"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 CVV
//               </label>
//               <input
//                 type="text"
//                 value={cvv}
//                 onChange={(e) => setCvv(e.target.value)}
//                 placeholder="123"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//               />
//             </div>
//           </div>
//         </div>

//         <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
//           <Shield className="w-4 h-4" />
//           <span>Your payment information is secure and encrypted</span>
//         </div>
//       </div>

//       <button
//         onClick={handlePayment}
//         disabled={isProcessing}
//         className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
//       >
//         {isProcessing ? (
//           <>
//             <Loader2 className="w-4 h-4 animate-spin" />
//             Processing Payment...
//           </>
//         ) : (
//           <>
//             <CheckCircle className="w-4 h-4" />
//             Complete Payment & Book Consultation
//           </>
//         )}
//       </button>
//     </div>
//   );
// };

// const ConsultationForm: React.FC = () => {
//   const router = useRouter();
//   const [currentStep, setCurrentStep] = useState(1);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [submitError, setSubmitError] = useState<string | null>(null);
//   const [clientSecret, setClientSecret] = useState<string | null>(null);
//   const [consultationId, setConsultationId] = useState<string | null>(null);
//   const [paymentSuccess, setPaymentSuccess] = useState(false);
//   const totalSteps = 6;

//   const [formData, setFormData] = useState<ConsultationFormData>({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     age: 0,
//     gender: "",
//     occupation: "",
//     currentWeight: 0,
//     goalWeight: 0,
//     height: "",
//     activityLevel: "",
//     dietaryRestrictions: [],
//     allergies: "",
//     medicalConditions: "",
//     currentMedications: "",
//     previousDietExperience: "",
//     primaryGoals: [],
//     motivationLevel: 5,
//     biggestChallenges: [],
//     currentEatingHabits: "",
//     mealPrepExperience: "",
//     cookingSkills: "",
//     budgetRange: "",
//     servicesInterested: [],
//     preferredConsultationTime: "",
//     preferredDate: "",
//     timeZone: "",
//     communicationPreference: "",
//     urgencyLevel: "",
//     additionalNotes: "",
//     howDidYouHear: "",
//     agreeToTerms: false,
//     agreeToMarketing: false,
//   });

//   const serviceOptions = [
//     {
//       id: "consultation",
//       name: "Initial Consultation",
//       duration: "20 min",
//       price: 20,
//       description: "Comprehensive assessment of your needs and goals",
//     },
//     {
//       id: "meal-plan",
//       name: "Custom Meal Plan",
//       duration: "7 days",
//       price: 20,
//       description: "Personalized meal plan with grocery list",
//     },
//     {
//       id: "coaching",
//       name: "Ongoing Coaching",
//       duration: "30 days",
//       price: 35,
//       description: "Continuous support and guidance",
//     },
//   ];

//   const dietaryOptions = [
//     "Vegetarian",
//     "Vegan",
//     "Gluten-Free",
//     "Keto",
//     "Paleo",
//     "Mediterranean",
//     "Low-Carb",
//     "Dairy-Free",
//     "Nut-Free",
//     "Other",
//   ];

//   const goalOptions = [
//     "Weight Loss",
//     "Weight Gain",
//     "Muscle Building",
//     "Improved Energy",
//     "Better Digestion",
//     "Hormone Balance",
//     "Disease Prevention",
//     "Athletic Performance",
//     "Healthy Aging",
//     "Mental Clarity",
//   ];

//   const challengeOptions = [
//     "Time Constraints",
//     "Lack of Motivation",
//     "Emotional Eating",
//     "Social Situations",
//     "Budget Limitations",
//     "Cooking Skills",
//     "Family Preferences",
//     "Travel/Work Schedule",
//     "Cravings",
//     "Meal Planning",
//   ];

//   const calculateTotal = () => {
//     return formData.servicesInterested.reduce((sum, serviceId) => {
//       const service = serviceOptions.find((s) => s.id === serviceId);
//       return sum + (service?.price || 0);
//     }, 0);
//   };

//   const updateField = (field: string, value: any) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//     if (errors[field]) {
//       setErrors((prev) => ({ ...prev, [field]: "" }));
//     }
//   };

//   const handleArrayUpdate = (
//     field: string,
//     value: string,
//     checked: boolean
//   ) => {
//     const currentArray = formData[
//       field as keyof ConsultationFormData
//     ] as string[];
//     if (checked) {
//       updateField(field, [...currentArray, value]);
//     } else {
//       updateField(
//         field,
//         currentArray.filter((item) => item !== value)
//       );
//     }
//   };

//   const validateStep = () => {
//     const newErrors: Record<string, string> = {};

//     if (currentStep === 1) {
//       if (!formData.firstName) newErrors.firstName = "First name is required";
//       if (!formData.lastName) newErrors.lastName = "Last name is required";
//       if (!formData.email) newErrors.email = "Email is required";
//       if (!formData.phone) newErrors.phone = "Phone number is required";
//       if (!formData.age || formData.age < 13)
//         newErrors.age = "Valid age is required";
//       if (!formData.gender) newErrors.gender = "Please select your gender";
//     } else if (currentStep === 2) {
//       if (!formData.currentWeight)
//         newErrors.currentWeight = "Current weight is required";
//       if (!formData.goalWeight)
//         newErrors.goalWeight = "Goal weight is required";
//       if (!formData.height) newErrors.height = "Height is required";
//       if (!formData.activityLevel)
//         newErrors.activityLevel = "Please select your activity level";
//     } else if (currentStep === 3) {
//       if (formData.primaryGoals.length === 0)
//         newErrors.primaryGoals = "Please select at least one goal";
//       if (!formData.mealPrepExperience)
//         newErrors.mealPrepExperience =
//           "Please select your meal prep experience";
//       if (!formData.cookingSkills)
//         newErrors.cookingSkills = "Please select your cooking skill level";
//       if (!formData.budgetRange)
//         newErrors.budgetRange = "Please select your budget range";
//     } else if (currentStep === 4) {
//       if (formData.servicesInterested.length === 0)
//         newErrors.servicesInterested = "Please select at least one service";
//       if (!formData.preferredDate)
//         newErrors.preferredDate = "Please select your preferred date";
//       if (!formData.preferredConsultationTime)
//         newErrors.preferredConsultationTime =
//           "Please select your preferred time";
//       if (!formData.timeZone)
//         newErrors.timeZone = "Please select your time zone";
//       if (!formData.communicationPreference)
//         newErrors.communicationPreference =
//           "Please select your communication preference";
//     } else if (currentStep === 5) {
//       if (!formData.agreeToTerms)
//         newErrors.agreeToTerms = "You must agree to the terms and conditions";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const nextStep = () => {
//     if (validateStep() && currentStep < totalSteps) {
//       setCurrentStep(currentStep + 1);
//     }
//   };

//   const prevStep = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!validateStep()) return;

//     setIsSubmitting(true);
//     setSubmitError(null);

//     try {
//       // Prepare form data for submission
//       const submissionData = {
//         // Personal Info
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         email: formData.email,
//         phone: formData.phone,
//         age: formData.age,
//         gender: formData.gender as
//           | "male"
//           | "female"
//           | "other"
//           | "prefer-not-to-say",
//         occupation: formData.occupation,

//         // Health Info
//         currentWeight: formData.currentWeight,
//         goalWeight: formData.goalWeight,
//         height: formData.height,
//         activityLevel: formData.activityLevel as
//           | "sedentary"
//           | "lightly-active"
//           | "moderately-active"
//           | "very-active"
//           | "extremely-active",
//         dietaryRestrictions: formData.dietaryRestrictions,
//         allergies: formData.allergies,
//         medicalConditions: formData.medicalConditions,
//         currentMedications: formData.currentMedications,
//         previousDietExperience: formData.previousDietExperience,

//         // Goals & Lifestyle
//         primaryGoals: formData.primaryGoals,
//         motivationLevel: formData.motivationLevel,
//         biggestChallenges: formData.biggestChallenges,
//         currentEatingHabits: formData.currentEatingHabits,
//         mealPrepExperience: formData.mealPrepExperience as
//           | "none"
//           | "beginner"
//           | "intermediate"
//           | "advanced",
//         cookingSkills: formData.cookingSkills as
//           | "none"
//           | "basic"
//           | "intermediate"
//           | "advanced",
//         budgetRange: formData.budgetRange as
//           | "under-50"
//           | "50-100"
//           | "100-150"
//           | "150-200"
//           | "over-200",

//         // Service Preferences
//         servicesInterested: formData.servicesInterested,
//         preferredConsultationTime: formData.preferredConsultationTime,
//         preferredDate: formData.preferredDate,
//         timeZone: formData.timeZone,
//         communicationPreference: formData.communicationPreference as
//           | "email"
//           | "phone"
//           | "video-call"
//           | "text",
//         urgencyLevel: formData.urgencyLevel as "low" | "medium" | "high",

//         // Additional
//         additionalNotes: formData.additionalNotes,
//         howDidYouHear: formData.howDidYouHear,
//         agreeToTerms: formData.agreeToTerms,
//         agreeToMarketing: formData.agreeToMarketing,
//       };

//       console.log("📝 Submitting consultation form:", submissionData);

//       // 🗄️ SAVE TO DATABASE - Real server action call
//       const result = await submitConsultationForm(submissionData);

//       if (result.success && result.clientSecret) {
//         console.log("✅ Consultation submitted successfully!");
//         setConsultationId(result.consultationId!);
//         setClientSecret(result.clientSecret);
//         setCurrentStep(6); // Move to payment step
//       } else {
//         throw new Error("Failed to submit consultation form");
//       }
//     } catch (error) {
//       console.error("❌ Error submitting consultation form:", error);
//       setSubmitError(
//         error instanceof Error ? error.message : "An unexpected error occurred"
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handlePaymentSuccess = async () => {
//     console.log("🎉 Payment successful! Updating database and redirecting...");

//     try {
//       // Update consultation status in database
//       if (consultationId) {
//         const confirmResult = await confirmMockPayment(consultationId);
//         if (confirmResult.success) {
//           console.log("✅ Consultation status updated in database");
//         } else {
//           console.error(
//             "❌ Failed to update consultation status:",
//             confirmResult.error
//           );
//         }
//       }
//     } catch (error) {
//       console.error("❌ Error updating consultation status:", error);
//     }

//     setShowSuccess(true);

//     // Redirect to success page with consultation ID after a short delay
//     setTimeout(() => {
//       if (consultationId) {
//         router.push(`/consultation/success?id=${consultationId}`);
//       } else {
//         router.push("/consultation/success");
//       }
//     }, 2000);
//   };

//   if (showSuccess) {
//     return (
//       <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
//         <div className="max-w-md w-full text-center bg-white rounded-2xl p-8 shadow-2xl">
//           <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
//             <CheckCircle className="w-8 h-8 text-white" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">
//             Payment Successful!
//           </h2>
//           <p className="text-gray-600">
//             Your consultation has been booked. We'll contact you within 24
//             hours.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex-center min-h-screen w-full bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 ">
//       <div className="max-w-4xl w-full mx-auto px-4 py-12">
//         <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-200 mt-10">
//           {/* Header */}
//           <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white ">
//             <div className="text-center">
//               <h1 className="text-3xl font-bold mb-2">
//                 Nutrition Consultation
//               </h1>
//               <p className="text-orange-100">
//                 Start your personalized wellness journey today
//               </p>
//             </div>
//           </div>

//           <div className="p-8">
//             {/* Progress Bar */}
//             <div className="mb-8">
//               <div className="flex items-center justify-between mb-4">
//                 <span className="text-sm font-medium text-gray-600">
//                   Step {currentStep} of {totalSteps}
//                 </span>
//                 <span className="text-sm font-medium text-orange-600">
//                   {Math.round((currentStep / totalSteps) * 100)}% Complete
//                 </span>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-2">
//                 <div
//                   className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
//                   style={{ width: `${(currentStep / totalSteps) * 100}%` }}
//                 />
//               </div>
//             </div>

//             {(errors.general || submitError) && (
//               <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg flex items-center gap-3">
//                 <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
//                 <span className="text-red-800">
//                   {errors.general || submitError}
//                 </span>
//               </div>
//             )}

//             {/* Step Content */}
//             <div>
//               {currentStep === 1 && (
//                 <div className="space-y-6">
//                   <div className="text-center mb-8">
//                     <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-4">
//                       <User className="w-8 h-8 text-white" />
//                     </div>
//                     <h2 className="text-2xl font-bold text-gray-800 mb-2">
//                       Personal Information
//                     </h2>
//                     <p className="text-gray-600">
//                       Let's start with some basic information about you
//                     </p>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         First Name *
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.firstName}
//                         onChange={(e) =>
//                           updateField("firstName", e.target.value)
//                         }
//                         placeholder="Enter your first name"
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
//                       />
//                       {errors.firstName && (
//                         <p className="text-red-500 text-sm mt-1">
//                           {errors.firstName}
//                         </p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Last Name *
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.lastName}
//                         onChange={(e) =>
//                           updateField("lastName", e.target.value)
//                         }
//                         placeholder="Enter your last name"
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                       />
//                       {errors.lastName && (
//                         <p className="text-red-500 text-sm mt-1">
//                           {errors.lastName}
//                         </p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Email Address *
//                       </label>
//                       <input
//                         type="email"
//                         value={formData.email}
//                         onChange={(e) => updateField("email", e.target.value)}
//                         placeholder="your.email@example.com"
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                       />
//                       {errors.email && (
//                         <p className="text-red-500 text-sm mt-1">
//                           {errors.email}
//                         </p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Phone Number *
//                       </label>
//                       <input
//                         type="tel"
//                         value={formData.phone}
//                         onChange={(e) => updateField("phone", e.target.value)}
//                         placeholder="(555) 123-4567"
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                       />
//                       {errors.phone && (
//                         <p className="text-red-500 text-sm mt-1">
//                           {errors.phone}
//                         </p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Age *
//                       </label>
//                       <input
//                         type="number"
//                         value={formData.age || ""}
//                         onChange={(e) =>
//                           updateField("age", parseInt(e.target.value) || 0)
//                         }
//                         placeholder="Enter your age"
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                       />
//                       {errors.age && (
//                         <p className="text-red-500 text-sm mt-1">
//                           {errors.age}
//                         </p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Gender *
//                       </label>
//                       <select
//                         value={formData.gender}
//                         onChange={(e) => updateField("gender", e.target.value)}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                       >
//                         <option value="">Select gender</option>
//                         <option value="male">Male</option>
//                         <option value="female">Female</option>
//                         <option value="other">Other</option>
//                         <option value="prefer-not-to-say">
//                           Prefer not to say
//                         </option>
//                       </select>
//                       {errors.gender && (
//                         <p className="text-red-500 text-sm mt-1">
//                           {errors.gender}
//                         </p>
//                       )}
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Occupation
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.occupation}
//                       onChange={(e) =>
//                         updateField("occupation", e.target.value)
//                       }
//                       placeholder="What do you do for work?"
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                     />
//                   </div>
//                 </div>
//               )}

//               {currentStep === 2 && (
//                 <div className="space-y-6">
//                   <div className="text-center mb-8">
//                     <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
//                       <Heart className="w-8 h-8 text-white" />
//                     </div>
//                     <h2 className="text-2xl font-bold text-gray-800 mb-2">
//                       Health Information
//                     </h2>
//                     <p className="text-gray-600">
//                       Help us understand your current health status
//                     </p>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Current Weight (lbs) *
//                       </label>
//                       <input
//                         type="number"
//                         value={formData.currentWeight || ""}
//                         onChange={(e) =>
//                           updateField(
//                             "currentWeight",
//                             parseInt(e.target.value) || 0
//                           )
//                         }
//                         placeholder="150"
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                       />
//                       {errors.currentWeight && (
//                         <p className="text-red-500 text-sm mt-1">
//                           {errors.currentWeight}
//                         </p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Goal Weight (lbs) *
//                       </label>
//                       <input
//                         type="number"
//                         value={formData.goalWeight || ""}
//                         onChange={(e) =>
//                           updateField(
//                             "goalWeight",
//                             parseInt(e.target.value) || 0
//                           )
//                         }
//                         placeholder="140"
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                       />
//                       {errors.goalWeight && (
//                         <p className="text-red-500 text-sm mt-1">
//                           {errors.goalWeight}
//                         </p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Height *
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.height}
//                         onChange={(e) => updateField("height", e.target.value)}
//                         placeholder="5'6&quot; or 168cm"
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                       />
//                       {errors.height && (
//                         <p className="text-red-500 text-sm mt-1">
//                           {errors.height}
//                         </p>
//                       )}
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-3">
//                       Activity Level *
//                     </label>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//                       {[
//                         {
//                           value: "sedentary",
//                           label: "Sedentary",
//                           desc: "Little to no exercise",
//                         },
//                         {
//                           value: "lightly-active",
//                           label: "Lightly Active",
//                           desc: "Light exercise 1-3 days/week",
//                         },
//                         {
//                           value: "moderately-active",
//                           label: "Moderately Active",
//                           desc: "Moderate exercise 3-5 days/week",
//                         },
//                         {
//                           value: "very-active",
//                           label: "Very Active",
//                           desc: "Hard exercise 6-7 days/week",
//                         },
//                         {
//                           value: "extremely-active",
//                           label: "Extremely Active",
//                           desc: "Very hard exercise, physical job",
//                         },
//                       ].map((option) => (
//                         <label
//                           key={option.value}
//                           className="relative cursor-pointer"
//                         >
//                           <input
//                             type="radio"
//                             name="activityLevel"
//                             value={option.value}
//                             checked={formData.activityLevel === option.value}
//                             onChange={(e) =>
//                               updateField("activityLevel", e.target.value)
//                             }
//                             className="sr-only"
//                           />
//                           <div
//                             className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
//                               formData.activityLevel === option.value
//                                 ? "border-emerald-500 bg-emerald-50"
//                                 : "border-gray-200 hover:border-emerald-300"
//                             }`}
//                           >
//                             <div className="font-medium text-gray-800">
//                               {option.label}
//                             </div>
//                             <div className="text-sm text-gray-600">
//                               {option.desc}
//                             </div>
//                           </div>
//                         </label>
//                       ))}
//                     </div>
//                     {errors.activityLevel && (
//                       <p className="text-red-500 text-sm mt-1">
//                         {errors.activityLevel}
//                       </p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-3">
//                       Dietary Restrictions/Preferences
//                     </label>
//                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
//                       {dietaryOptions.map((option) => (
//                         <label key={option} className="relative cursor-pointer">
//                           <input
//                             type="checkbox"
//                             checked={formData.dietaryRestrictions.includes(
//                               option
//                             )}
//                             onChange={(e) =>
//                               handleArrayUpdate(
//                                 "dietaryRestrictions",
//                                 option,
//                                 e.target.checked
//                               )
//                             }
//                             className="sr-only"
//                           />
//                           <div
//                             className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
//                               formData.dietaryRestrictions.includes(option)
//                                 ? "border-emerald-500 bg-emerald-50 text-emerald-700"
//                                 : "border-gray-200 hover:border-emerald-300"
//                             }`}
//                           >
//                             <div className="text-sm font-medium">{option}</div>
//                           </div>
//                         </label>
//                       ))}
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Food Allergies
//                       </label>
//                       <textarea
//                         value={formData.allergies}
//                         onChange={(e) =>
//                           updateField("allergies", e.target.value)
//                         }
//                         rows={3}
//                         placeholder="List any food allergies or intolerances..."
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Medical Conditions
//                       </label>
//                       <textarea
//                         value={formData.medicalConditions}
//                         onChange={(e) =>
//                           updateField("medicalConditions", e.target.value)
//                         }
//                         rows={3}
//                         placeholder="Any relevant medical conditions..."
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {currentStep === 3 && (
//                 <div className="space-y-6">
//                   <div className="text-center mb-8">
//                     <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
//                       <Target className="w-8 h-8 text-white" />
//                     </div>
//                     <h2 className="text-2xl font-bold text-gray-800 mb-2">
//                       Goals & Lifestyle
//                     </h2>
//                     <p className="text-gray-600">
//                       Tell us about your goals and current lifestyle
//                     </p>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-3">
//                       Primary Goals * (Select all that apply)
//                     </label>
//                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
//                       {goalOptions.map((option) => (
//                         <label key={option} className="relative cursor-pointer">
//                           <input
//                             type="checkbox"
//                             checked={formData.primaryGoals.includes(option)}
//                             onChange={(e) =>
//                               handleArrayUpdate(
//                                 "primaryGoals",
//                                 option,
//                                 e.target.checked
//                               )
//                             }
//                             className="sr-only"
//                           />
//                           <div
//                             className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
//                               formData.primaryGoals.includes(option)
//                                 ? "border-emerald-500 bg-emerald-50 text-emerald-700"
//                                 : "border-gray-200 hover:border-emerald-300"
//                             }`}
//                           >
//                             <div className="text-sm font-medium">{option}</div>
//                           </div>
//                         </label>
//                       ))}
//                     </div>
//                     {errors.primaryGoals && (
//                       <p className="text-red-500 text-sm mt-1">
//                         {errors.primaryGoals}
//                       </p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-3">
//                       Motivation Level ({formData.motivationLevel}/10)
//                     </label>
//                     <div className="px-2">
//                       <input
//                         type="range"
//                         min="1"
//                         max="10"
//                         value={formData.motivationLevel}
//                         onChange={(e) =>
//                           updateField(
//                             "motivationLevel",
//                             parseInt(e.target.value)
//                           )
//                         }
//                         className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                       />
//                       <div className="flex justify-between text-xs text-gray-500 mt-1">
//                         <span>Low (1)</span>
//                         <span>Medium (5)</span>
//                         <span>High (10)</span>
//                       </div>
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-3">
//                       Biggest Challenges (Select all that apply)
//                     </label>
//                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
//                       {challengeOptions.map((option) => (
//                         <label key={option} className="relative cursor-pointer">
//                           <input
//                             type="checkbox"
//                             checked={formData.biggestChallenges.includes(
//                               option
//                             )}
//                             onChange={(e) =>
//                               handleArrayUpdate(
//                                 "biggestChallenges",
//                                 option,
//                                 e.target.checked
//                               )
//                             }
//                             className="sr-only"
//                           />
//                           <div
//                             className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
//                               formData.biggestChallenges.includes(option)
//                                 ? "border-orange-500 bg-orange-50 text-orange-700"
//                                 : "border-gray-200 hover:border-orange-300"
//                             }`}
//                           >
//                             <div className="text-sm font-medium">{option}</div>
//                           </div>
//                         </label>
//                       ))}
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Meal Prep Experience *
//                       </label>
//                       <select
//                         value={formData.mealPrepExperience}
//                         onChange={(e) =>
//                           updateField("mealPrepExperience", e.target.value)
//                         }
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                       >
//                         <option value="">Select experience level</option>
//                         <option value="none">
//                           None - Never done meal prep
//                         </option>
//                         <option value="beginner">
//                           Beginner - Just starting out
//                         </option>
//                         <option value="intermediate">
//                           Intermediate - Some experience
//                         </option>
//                         <option value="advanced">
//                           Advanced - Very experienced
//                         </option>
//                       </select>
//                       {errors.mealPrepExperience && (
//                         <p className="text-red-500 text-sm mt-1">
//                           {errors.mealPrepExperience}
//                         </p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Cooking Skills *
//                       </label>
//                       <select
//                         value={formData.cookingSkills}
//                         onChange={(e) =>
//                           updateField("cookingSkills", e.target.value)
//                         }
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                       >
//                         <option value="">Select skill level</option>
//                         <option value="none">None - Don't cook</option>
//                         <option value="basic">Basic - Simple meals</option>
//                         <option value="intermediate">
//                           Intermediate - Comfortable cooking
//                         </option>
//                         <option value="advanced">
//                           Advanced - Love to cook
//                         </option>
//                       </select>
//                       {errors.cookingSkills && (
//                         <p className="text-red-500 text-sm mt-1">
//                           {errors.cookingSkills}
//                         </p>
//                       )}
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Weekly Food Budget *
//                     </label>
//                     <select
//                       value={formData.budgetRange}
//                       onChange={(e) =>
//                         updateField("budgetRange", e.target.value)
//                       }
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                     >
//                       <option value="">Select budget range</option>
//                       <option value="under-50">Under $50</option>
//                       <option value="50-100">$50 - $100</option>
//                       <option value="100-150">$100 - $150</option>
//                       <option value="150-200">$150 - $200</option>
//                       <option value="over-200">Over $200</option>
//                     </select>
//                     {errors.budgetRange && (
//                       <p className="text-red-500 text-sm mt-1">
//                         {errors.budgetRange}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {currentStep === 4 && (
//                 <div className="space-y-6">
//                   <div className="text-center mb-8">
//                     <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
//                       <Calendar className="w-8 h-8 text-white" />
//                     </div>
//                     <h2 className="text-2xl font-bold text-gray-800 mb-2">
//                       Choose Your Services
//                     </h2>
//                     <p className="text-gray-600">
//                       Select the services you're interested in
//                     </p>
//                   </div>

//                   <div className="space-y-4">
//                     {serviceOptions.map((service) => (
//                       <div
//                         key={service.id}
//                         className={`cursor-pointer transition-all duration-200 p-6 border-2 rounded-xl ${
//                           formData.servicesInterested.includes(service.id)
//                             ? "border-emerald-500 bg-emerald-50"
//                             : "border-gray-200 hover:border-emerald-300 hover:shadow-md"
//                         }`}
//                         onClick={() => {
//                           const current = formData.servicesInterested;
//                           if (current.includes(service.id)) {
//                             updateField(
//                               "servicesInterested",
//                               current.filter((id) => id !== service.id)
//                             );
//                           } else {
//                             updateField("servicesInterested", [
//                               ...current,
//                               service.id,
//                             ]);
//                           }
//                         }}
//                       >
//                         <div className="flex items-center justify-between">
//                           <div className="flex-1">
//                             <div className="flex items-center gap-3 mb-2">
//                               <input
//                                 type="checkbox"
//                                 checked={formData.servicesInterested.includes(
//                                   service.id
//                                 )}
//                                 readOnly
//                                 className="w-4 h-4 text-emerald-600 rounded"
//                               />
//                               <h3 className="text-lg font-semibold">
//                                 {service.name}
//                               </h3>
//                               <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
//                                 {service.duration}
//                               </span>
//                             </div>
//                             <p className="text-gray-600 ml-7">
//                               {service.description}
//                             </p>
//                           </div>
//                           <div className="text-right">
//                             <div className="text-2xl font-bold text-emerald-600">
//                               ${service.price}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   {errors.servicesInterested && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {errors.servicesInterested}
//                     </p>
//                   )}

//                   {formData.servicesInterested.length > 0 && (
//                     <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl">
//                       <div className="flex justify-between items-center">
//                         <span className="text-lg font-semibold">
//                           Total Amount:
//                         </span>
//                         <span className="text-2xl font-bold text-emerald-600">
//                           ${calculateTotal()}
//                         </span>
//                       </div>
//                     </div>
//                   )}

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Preferred Consultation Date *
//                       </label>
//                       <input
//                         type="date"
//                         value={formData.preferredDate}
//                         onChange={(e) =>
//                           updateField("preferredDate", e.target.value)
//                         }
//                         min={new Date().toISOString().split("T")[0]}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                       />
//                       {errors.preferredDate && (
//                         <p className="text-red-500 text-sm mt-1">
//                           {errors.preferredDate}
//                         </p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Preferred Time *
//                       </label>
//                       <select
//                         value={formData.preferredConsultationTime}
//                         onChange={(e) =>
//                           updateField(
//                             "preferredConsultationTime",
//                             e.target.value
//                           )
//                         }
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                       >
//                         <option value="">Select time</option>
//                         <option value="09:00">9:00 AM</option>
//                         <option value="10:00">10:00 AM</option>
//                         <option value="11:00">11:00 AM</option>
//                         <option value="12:00">12:00 PM</option>
//                         <option value="13:00">1:00 PM</option>
//                         <option value="14:00">2:00 PM</option>
//                         <option value="15:00">3:00 PM</option>
//                         <option value="16:00">4:00 PM</option>
//                         <option value="17:00">5:00 PM</option>
//                       </select>
//                       {errors.preferredConsultationTime && (
//                         <p className="text-red-500 text-sm mt-1">
//                           {errors.preferredConsultationTime}
//                         </p>
//                       )}
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Time Zone *
//                       </label>
//                       <select
//                         value={formData.timeZone}
//                         onChange={(e) =>
//                           updateField("timeZone", e.target.value)
//                         }
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                       >
//                         <option value="">Select time zone</option>
//                         <option value="EST">Eastern (EST)</option>
//                         <option value="CST">Central (CST)</option>
//                         <option value="MST">Mountain (MST)</option>
//                         <option value="PST">Pacific (PST)</option>
//                         <option value="OTHER">Other</option>
//                       </select>
//                       {errors.timeZone && (
//                         <p className="text-red-500 text-sm mt-1">
//                           {errors.timeZone}
//                         </p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Preferred Communication *
//                       </label>
//                       <select
//                         value={formData.communicationPreference}
//                         onChange={(e) =>
//                           updateField("communicationPreference", e.target.value)
//                         }
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                       >
//                         <option value="">Select preference</option>
//                         <option value="video-call">
//                           Video Call (Zoom/Meet)
//                         </option>
//                         <option value="phone">Phone Call</option>
//                         <option value="email">Email</option>
//                         <option value="text">Text Message</option>
//                       </select>
//                       {errors.communicationPreference && (
//                         <p className="text-red-500 text-sm mt-1">
//                           {errors.communicationPreference}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {currentStep === 5 && (
//                 <div className="space-y-6">
//                   <div className="text-center mb-8">
//                     <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
//                       <FileText className="w-8 h-8 text-white" />
//                     </div>
//                     <h2 className="text-2xl font-bold text-gray-800 mb-2">
//                       Final Details
//                     </h2>
//                     <p className="text-gray-600">
//                       Just a few more details and you're all set!
//                     </p>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       How did you hear about us?
//                     </label>
//                     <select
//                       value={formData.howDidYouHear}
//                       onChange={(e) =>
//                         updateField("howDidYouHear", e.target.value)
//                       }
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                     >
//                       <option value="">Select an option</option>
//                       <option value="social-media">Social Media</option>
//                       <option value="google-search">Google Search</option>
//                       <option value="friend-referral">
//                         Friend/Family Referral
//                       </option>
//                       <option value="online-ad">Online Advertisement</option>
//                       <option value="health-blog">Health Blog/Website</option>
//                       <option value="other">Other</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Additional Notes or Questions
//                     </label>
//                     <textarea
//                       value={formData.additionalNotes}
//                       onChange={(e) =>
//                         updateField("additionalNotes", e.target.value)
//                       }
//                       rows={4}
//                       placeholder="Anything else you'd like us to know about your health journey, specific concerns, or questions you have..."
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
//                     />
//                   </div>

//                   <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
//                     <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                       <DollarSign className="w-5 h-5 text-emerald-600" />
//                       Consultation Fee
//                     </h3>
//                     <div className="space-y-3">
//                       <div className="flex justify-between items-center">
//                         <span className="text-gray-700">Selected Services</span>
//                         <div className="text-right">
//                           {formData.servicesInterested.map((serviceId) => {
//                             const service = serviceOptions.find(
//                               (s) => s.id === serviceId
//                             );
//                             return service ? (
//                               <div
//                                 key={serviceId}
//                                 className="text-sm text-gray-600"
//                               >
//                                 {service.name}: ${service.price}
//                               </div>
//                             ) : null;
//                           })}
//                         </div>
//                       </div>
//                       <div className="border-t border-emerald-200 pt-3">
//                         <div className="flex justify-between items-center text-lg font-semibold">
//                           <span className="text-gray-800">Total Due Today</span>
//                           <span className="text-emerald-600">
//                             ${calculateTotal()}.00
//                           </span>
//                         </div>
//                         <p className="text-sm text-gray-600 mt-2">
//                           Payment will be processed securely. Additional
//                           services will be discussed during your consultation.
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="space-y-4">
//                     <label className="flex items-start space-x-3 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         checked={formData.agreeToTerms}
//                         onChange={(e) =>
//                           updateField("agreeToTerms", e.target.checked)
//                         }
//                         className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
//                       />
//                       <div className="text-sm">
//                         <span className="text-gray-700">
//                           I agree to the{" "}
//                           <a
//                             href="#"
//                             className="text-emerald-600 hover:underline"
//                           >
//                             Terms and Conditions
//                           </a>{" "}
//                           and{" "}
//                           <a
//                             href="#"
//                             className="text-emerald-600 hover:underline"
//                           >
//                             Privacy Policy
//                           </a>
//                           . I understand that the consultation fee is $
//                           {calculateTotal()} and additional services are
//                           optional. *
//                         </span>
//                       </div>
//                     </label>
//                     {errors.agreeToTerms && (
//                       <p className="text-red-500 text-sm">
//                         {errors.agreeToTerms}
//                       </p>
//                     )}

//                     <label className="flex items-start space-x-3 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         checked={formData.agreeToMarketing}
//                         onChange={(e) =>
//                           updateField("agreeToMarketing", e.target.checked)
//                         }
//                         className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
//                       />
//                       <span className="text-sm text-gray-700">
//                         I would like to receive health tips, nutrition advice,
//                         and promotional offers via email. (Optional)
//                       </span>
//                     </label>
//                   </div>
//                 </div>
//               )}

//               {currentStep === 6 && (
//                 <div>
//                   <div className="text-center mb-8">
//                     <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
//                       <CreditCard className="w-8 h-8 text-white" />
//                     </div>
//                     <h2 className="text-2xl font-bold text-gray-800 mb-2">
//                       Complete Payment
//                     </h2>
//                     <p className="text-gray-600">
//                       Secure your consultation booking
//                     </p>
//                   </div>

//                   <PaymentStep
//                     totalAmount={calculateTotal()}
//                     clientSecret={clientSecret || undefined}
//                     consultationId={consultationId || undefined}
//                     onPaymentSuccess={handlePaymentSuccess}
//                   />
//                 </div>
//               )}
//             </div>

//             {/* Navigation */}
//             {currentStep !== 6 && (
//               <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
//                 <button
//                   type="button"
//                   onClick={prevStep}
//                   disabled={currentStep === 1}
//                   className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
//                 >
//                   <ArrowLeft className="w-4 h-4" />
//                   Previous
//                 </button>

//                 <button
//                   type="button"
//                   onClick={currentStep === 5 ? handleSubmit : nextStep}
//                   disabled={isSubmitting}
//                   className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-2 disabled:opacity-50"
//                 >
//                   {currentStep === 5 ? (
//                     isSubmitting ? (
//                       <>
//                         <Loader2 className="w-4 h-4 animate-spin" />
//                         Processing...
//                       </>
//                     ) : (
//                       <>
//                         Continue to Payment
//                         <ArrowRight className="w-4 h-4" />
//                       </>
//                     )
//                   ) : (
//                     <>
//                       Next Step
//                       <ArrowRight className="w-4 h-4" />
//                     </>
//                   )}
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ConsultationForm;
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  submitConsultationForm,
  confirmMockPayment,
} from "@/lib/actions/consultation";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Target,
  Heart,
  AlertCircle,
  FileText,
  DollarSign,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CreditCard,
  Shield,
} from "lucide-react";

interface ConsultationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  gender: "male" | "female" | "other" | "prefer-not-to-say" | "";
  occupation: string;
  currentWeight: number;
  goalWeight: number;
  height: string;
  activityLevel:
    | "sedentary"
    | "lightly-active"
    | "moderately-active"
    | "very-active"
    | "extremely-active"
    | "";
  dietaryRestrictions: string[];
  allergies: string;
  medicalConditions: string;
  currentMedications: string;
  previousDietExperience: string;
  primaryGoals: string[];
  motivationLevel: number;
  biggestChallenges: string[];
  currentEatingHabits: string;
  mealPrepExperience: "none" | "beginner" | "intermediate" | "advanced" | "";
  cookingSkills: "none" | "basic" | "intermediate" | "advanced" | "";
  budgetRange: "under-50" | "50-100" | "100-150" | "150-200" | "over-200" | "";
  servicesInterested: string[];
  preferredConsultationTime: string;
  preferredDate: string;
  timeZone: string;
  communicationPreference: "email" | "phone" | "video-call" | "text" | "";
  urgencyLevel: "low" | "medium" | "high" | "";
  additionalNotes: string;
  howDidYouHear: string;
  agreeToTerms: boolean;
  agreeToMarketing: boolean;
}

const PaymentStep: React.FC<{
  totalAmount: number;
  clientSecret?: string;
  consultationId?: string;
  onPaymentSuccess: () => void;
}> = ({ totalAmount, clientSecret, consultationId, onPaymentSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [billingName, setBillingName] = useState("");
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Basic validation
      if (!billingName || !cardNumber || !expiryDate || !cvv) {
        throw new Error("Please fill in all payment fields");
      }

      if (cardNumber.replace(/\s/g, "").length < 16) {
        throw new Error("Please enter a valid card number");
      }

      // MOCK: Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("💳 [MOCK] Payment processed successfully!", {
        consultationId,
        amount: totalAmount,
        clientSecret,
      });

      // 📧 [MOCK] In production, this would be handled by Stripe webhooks
      console.log(
        "📧 [MOCK] Payment confirmation would trigger webhook to update database"
      );

      onPaymentSuccess();
    } catch (error) {
      console.error("❌ Payment error:", error);
      setPaymentError(
        error instanceof Error ? error.message : "Payment failed"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-500 rounded-lg">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Secure Payment
            </h3>
            <p className="text-sm text-gray-600">
              Complete your consultation booking
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Amount:</span>
            <span className="text-emerald-600">${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cardholder Name
            </label>
            <input
              type="text"
              value={billingName}
              onChange={(e) => setBillingName(e.target.value)}
              placeholder="Full name on card"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Number
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="1234 5678 9012 3456"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="MM/YY"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="123"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
          <Shield className="w-4 h-4" />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            Complete Payment & Book Consultation
          </>
        )}
      </button>
    </div>
  );
};

const ConsultationForm: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const totalSteps = 6;

  const [formData, setFormData] = useState<ConsultationFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: 0,
    gender: "",
    occupation: "",
    currentWeight: 150, // Default to reasonable value
    goalWeight: 140, // Default to reasonable value
    height: "",
    activityLevel: "",
    dietaryRestrictions: [],
    allergies: "",
    medicalConditions: "",
    currentMedications: "",
    previousDietExperience: "",
    primaryGoals: [],
    motivationLevel: 5,
    biggestChallenges: [],
    currentEatingHabits: "",
    mealPrepExperience: "",
    cookingSkills: "",
    budgetRange: "",
    servicesInterested: [],
    preferredConsultationTime: "",
    preferredDate: "",
    timeZone: "",
    communicationPreference: "",
    urgencyLevel: "medium", // Default to medium priority
    additionalNotes: "",
    howDidYouHear: "",
    agreeToTerms: false,
    agreeToMarketing: false,
  });

  const serviceOptions = [
    {
      id: "consultation",
      name: "Initial Consultation",
      duration: "20 min",
      price: 20,
      description: "Comprehensive assessment of your needs and goals",
    },
    {
      id: "meal-plan",
      name: "Custom Meal Plan",
      duration: "7 days",
      price: 20,
      description: "Personalized meal plan with grocery list",
    },
    {
      id: "coaching",
      name: "Ongoing Coaching",
      duration: "30 days",
      price: 35,
      description: "Continuous support and guidance",
    },
  ];

  const dietaryOptions = [
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Keto",
    "Paleo",
    "Mediterranean",
    "Low-Carb",
    "Dairy-Free",
    "Nut-Free",
    "Other",
  ];

  const goalOptions = [
    "Weight Loss",
    "Weight Gain",
    "Muscle Building",
    "Improved Energy",
    "Better Digestion",
    "Hormone Balance",
    "Disease Prevention",
    "Athletic Performance",
    "Healthy Aging",
    "Mental Clarity",
  ];

  const challengeOptions = [
    "Time Constraints",
    "Lack of Motivation",
    "Emotional Eating",
    "Social Situations",
    "Budget Limitations",
    "Cooking Skills",
    "Family Preferences",
    "Travel/Work Schedule",
    "Cravings",
    "Meal Planning",
  ];

  const calculateTotal = () => {
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
      updateField(
        field,
        currentArray.filter((item) => item !== value)
      );
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.firstName) newErrors.firstName = "First name is required";
      if (!formData.lastName) newErrors.lastName = "Last name is required";
      if (!formData.email) newErrors.email = "Email is required";
      if (!formData.phone) newErrors.phone = "Phone number is required";
      if (!formData.age || formData.age < 13)
        newErrors.age = "Valid age is required";
      if (!formData.gender) newErrors.gender = "Please select your gender";
    } else if (currentStep === 2) {
      if (!formData.currentWeight || formData.currentWeight < 50) {
        newErrors.currentWeight = "Current weight must be at least 50 lbs";
      }
      if (!formData.goalWeight || formData.goalWeight < 50) {
        newErrors.goalWeight = "Goal weight must be at least 50 lbs";
      }
      if (!formData.height) newErrors.height = "Height is required";
      if (!formData.activityLevel)
        newErrors.activityLevel = "Please select your activity level";
    } else if (currentStep === 3) {
      if (formData.primaryGoals.length === 0)
        newErrors.primaryGoals = "Please select at least one goal";
      if (!formData.mealPrepExperience)
        newErrors.mealPrepExperience =
          "Please select your meal prep experience";
      if (!formData.cookingSkills)
        newErrors.cookingSkills = "Please select your cooking skill level";
      if (!formData.budgetRange)
        newErrors.budgetRange = "Please select your budget range";
    } else if (currentStep === 4) {
      if (formData.servicesInterested.length === 0)
        newErrors.servicesInterested = "Please select at least one service";
      if (!formData.preferredDate)
        newErrors.preferredDate = "Please select your preferred date";
      if (!formData.preferredConsultationTime)
        newErrors.preferredConsultationTime =
          "Please select your preferred time";
      if (!formData.timeZone)
        newErrors.timeZone = "Please select your time zone";
      if (!formData.communicationPreference)
        newErrors.communicationPreference =
          "Please select your communication preference";
      if (!formData.urgencyLevel)
        newErrors.urgencyLevel = "Please select urgency level";
    } else if (currentStep === 5) {
      if (!formData.agreeToTerms)
        newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
        preferredDate: formData.preferredDate,
        timeZone: formData.timeZone,
        communicationPreference: formData.communicationPreference as
          | "email"
          | "phone"
          | "video-call"
          | "text",
        urgencyLevel: formData.urgencyLevel as "low" | "medium" | "high",

        // Additional
        additionalNotes: formData.additionalNotes,
        howDidYouHear: formData.howDidYouHear,
        agreeToTerms: formData.agreeToTerms,
        agreeToMarketing: formData.agreeToMarketing,
      };

      console.log("📝 Submitting consultation form:", submissionData);

      // 🗄️ SAVE TO DATABASE - Real server action call
      const result = await submitConsultationForm(submissionData);

      if (result.success && result.clientSecret) {
        console.log("✅ Consultation submitted successfully!");
        setConsultationId(result.consultationId!);
        setClientSecret(result.clientSecret);
        setCurrentStep(6); // Move to payment step
      } else {
        throw new Error("Failed to submit consultation form");
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
    console.log("🎉 Payment successful! Updating database and redirecting...");

    try {
      // Update consultation status in database
      if (consultationId) {
        const confirmResult = await confirmMockPayment(consultationId);
        if (confirmResult.success) {
          console.log("✅ Consultation status updated in database");
        } else {
          console.error(
            "❌ Failed to update consultation status:",
            confirmResult.error
          );
        }
      }
    } catch (error) {
      console.error("❌ Error updating consultation status:", error);
    }

    setShowSuccess(true);

    // Redirect to success page with consultation ID after a short delay
    setTimeout(() => {
      if (consultationId) {
        router.push(`/consultation/success?id=${consultationId}`);
      } else {
        router.push("/consultation/success");
      }
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600">
            Your consultation has been booked. We'll contact you within 24
            hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-center min-h-screen w-full bg-primary-50">
      <div className="max-w-4xl w-full mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">
                Nutrition Consultation
              </h1>
              <p className="text-orange-100">
                Start your personalized wellness journey today
              </p>
            </div>
          </div>

          <div className="p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
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

            {(errors.general || submitError) && (
              <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span className="text-red-800">
                  {errors.general || submitError}
                </span>
              </div>
            )}

            {/* Step Content */}
            <div>
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          updateField("firstName", e.target.value)
                        }
                        placeholder="Enter your first name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          updateField("lastName", e.target.value)
                        }
                        placeholder="Enter your last name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.lastName}
                        </p>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.email}
                        </p>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.phone}
                        </p>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      />
                      {errors.age && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.age}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender *
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => updateField("gender", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">
                          Prefer not to say
                        </option>
                      </select>
                      {errors.gender && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.gender}
                        </p>
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
                      onChange={(e) =>
                        updateField("occupation", e.target.value)
                      }
                      placeholder="What do you do for work?"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Weight (lbs) *
                      </label>
                      <input
                        type="number"
                        value={formData.currentWeight || ""}
                        onChange={(e) =>
                          updateField(
                            "currentWeight",
                            parseInt(e.target.value) || 0
                          )
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
                          updateField(
                            "goalWeight",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="140"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      />
                      {errors.goalWeight && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.goalWeight}
                        </p>
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
                        <p className="text-red-500 text-sm mt-1">
                          {errors.height}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Activity Level *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        {
                          value: "sedentary",
                          label: "Sedentary",
                          desc: "Little to no exercise",
                        },
                        {
                          value: "lightly-active",
                          label: "Lightly Active",
                          desc: "Light exercise 1-3 days/week",
                        },
                        {
                          value: "moderately-active",
                          label: "Moderately Active",
                          desc: "Moderate exercise 3-5 days/week",
                        },
                        {
                          value: "very-active",
                          label: "Very Active",
                          desc: "Hard exercise 6-7 days/week",
                        },
                        {
                          value: "extremely-active",
                          label: "Extremely Active",
                          desc: "Very hard exercise, physical job",
                        },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="relative cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="activityLevel"
                            value={option.value}
                            checked={formData.activityLevel === option.value}
                            onChange={(e) =>
                              updateField("activityLevel", e.target.value)
                            }
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
                            <div className="text-sm text-gray-600">
                              {option.desc}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.activityLevel && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.activityLevel}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Dietary Restrictions/Preferences
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {dietaryOptions.map((option) => (
                        <label key={option} className="relative cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.dietaryRestrictions.includes(
                              option
                            )}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Food Allergies
                      </label>
                      <textarea
                        value={formData.allergies}
                        onChange={(e) =>
                          updateField("allergies", e.target.value)
                        }
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
                        onChange={(e) =>
                          updateField("medicalConditions", e.target.value)
                        }
                        rows={3}
                        placeholder="Any relevant medical conditions..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {goalOptions.map((option) => (
                        <label key={option} className="relative cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.primaryGoals.includes(option)}
                            onChange={(e) =>
                              handleArrayUpdate(
                                "primaryGoals",
                                option,
                                e.target.checked
                              )
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
                      <p className="text-red-500 text-sm mt-1">
                        {errors.primaryGoals}
                      </p>
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
                          updateField(
                            "motivationLevel",
                            parseInt(e.target.value)
                          )
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {challengeOptions.map((option) => (
                        <label key={option} className="relative cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.biggestChallenges.includes(
                              option
                            )}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <option value="none">
                          None - Never done meal prep
                        </option>
                        <option value="beginner">
                          Beginner - Just starting out
                        </option>
                        <option value="intermediate">
                          Intermediate - Some experience
                        </option>
                        <option value="advanced">
                          Advanced - Very experienced
                        </option>
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
                        onChange={(e) =>
                          updateField("cookingSkills", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="">Select skill level</option>
                        <option value="none">None - Don't cook</option>
                        <option value="basic">Basic - Simple meals</option>
                        <option value="intermediate">
                          Intermediate - Comfortable cooking
                        </option>
                        <option value="advanced">
                          Advanced - Love to cook
                        </option>
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
                      onChange={(e) =>
                        updateField("budgetRange", e.target.value)
                      }
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
                      <p className="text-red-500 text-sm mt-1">
                        {errors.budgetRange}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
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
                        className={`cursor-pointer transition-all duration-200 p-6 border-2 rounded-xl ${
                          formData.servicesInterested.includes(service.id)
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 hover:border-emerald-300 hover:shadow-md"
                        }`}
                        onClick={() => {
                          const current = formData.servicesInterested;
                          if (current.includes(service.id)) {
                            updateField(
                              "servicesInterested",
                              current.filter((id) => id !== service.id)
                            );
                          } else {
                            updateField("servicesInterested", [
                              ...current,
                              service.id,
                            ]);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <input
                                type="checkbox"
                                checked={formData.servicesInterested.includes(
                                  service.id
                                )}
                                readOnly
                                className="w-4 h-4 text-emerald-600 rounded"
                              />
                              <h3 className="text-lg font-semibold">
                                {service.name}
                              </h3>
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                                {service.duration}
                              </span>
                            </div>
                            <p className="text-gray-600 ml-7">
                              {service.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-emerald-600">
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
                    <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">
                          Total Amount:
                        </span>
                        <span className="text-2xl font-bold text-emerald-600">
                          ${calculateTotal()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Consultation Date *
                      </label>
                      <input
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) =>
                          updateField("preferredDate", e.target.value)
                        }
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      />
                      {errors.preferredDate && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.preferredDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Time *
                      </label>
                      <select
                        value={formData.preferredConsultationTime}
                        onChange={(e) =>
                          updateField(
                            "preferredConsultationTime",
                            e.target.value
                          )
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Zone *
                      </label>
                      <select
                        value={formData.timeZone}
                        onChange={(e) =>
                          updateField("timeZone", e.target.value)
                        }
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
                        <p className="text-red-500 text-sm mt-1">
                          {errors.timeZone}
                        </p>
                      )}
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
                        <option value="video-call">
                          Video Call (Zoom/Meet)
                        </option>
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
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
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
                      onChange={(e) =>
                        updateField("howDidYouHear", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Select an option</option>
                      <option value="social-media">Social Media</option>
                      <option value="google-search">Google Search</option>
                      <option value="friend-referral">
                        Friend/Family Referral
                      </option>
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
                      onChange={(e) =>
                        updateField("additionalNotes", e.target.value)
                      }
                      rows={4}
                      placeholder="Anything else you'd like us to know about your health journey, specific concerns, or questions you have..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
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
                              <div
                                key={serviceId}
                                className="text-sm text-gray-600"
                              >
                                {service.name}: ${service.price}
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                      <div className="border-t border-emerald-200 pt-3">
                        <div className="flex justify-between items-center text-lg font-semibold">
                          <span className="text-gray-800">Total Due Today</span>
                          <span className="text-emerald-600">
                            ${calculateTotal()}.00
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Payment will be processed securely. Additional
                          services will be discussed during your consultation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agreeToTerms}
                        onChange={(e) =>
                          updateField("agreeToTerms", e.target.checked)
                        }
                        className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <div className="text-sm">
                        <span className="text-gray-700">
                          I agree to the{" "}
                          <a
                            href="#"
                            className="text-emerald-600 hover:underline"
                          >
                            Terms and Conditions
                          </a>{" "}
                          and{" "}
                          <a
                            href="#"
                            className="text-emerald-600 hover:underline"
                          >
                            Privacy Policy
                          </a>
                          . I understand that the consultation fee is $
                          {calculateTotal()} and additional services are
                          optional. *
                        </span>
                      </div>
                    </label>
                    {errors.agreeToTerms && (
                      <p className="text-red-500 text-sm">
                        {errors.agreeToTerms}
                      </p>
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
                        I would like to receive health tips, nutrition advice,
                        and promotional offers via email. (Optional)
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div>
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
                      <CreditCard className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Complete Payment
                    </h2>
                    <p className="text-gray-600">
                      Secure your consultation booking
                    </p>
                  </div>

                  <PaymentStep
                    totalAmount={calculateTotal()}
                    clientSecret={clientSecret || undefined}
                    consultationId={consultationId || undefined}
                    onPaymentSuccess={handlePaymentSuccess}
                  />
                </div>
              )}
            </div>

            {/* Navigation */}
            {currentStep !== 6 && (
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>

                <button
                  type="button"
                  onClick={currentStep === 5 ? handleSubmit : nextStep}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-2 disabled:opacity-50"
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
    </div>
  );
};

export default ConsultationForm;
