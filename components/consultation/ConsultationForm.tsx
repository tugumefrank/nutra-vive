// "use client";
// import React, { useState, useRef, useEffect } from "react";
// import {
//   User,
//   Calendar,
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
//   Leaf,
//   Sparkles,
//   Users,
//   Award,
//   Headphones,
//   Star,
//   TrendingUp,
//   Zap,
//   X,
//   Plus,
// } from "lucide-react";
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements } from "@stripe/react-stripe-js";
// import StripeCheckout from "../common/StripeCheckout";
// import { submitConsultationForm } from "@/lib/actions/consultation";
// import { toast } from "sonner";

// if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
//   throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
// }
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

// interface ConsultationFormData {
//   // Personal Info
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   age: number;
//   gender: "male" | "female" | "other" | "prefer-not-to-say" | "";
//   occupation: string;

//   // Health Info
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

//   // Goals & Lifestyle
//   primaryGoals: string[];
//   motivationLevel: number;
//   biggestChallenges: string[];
//   currentEatingHabits: string;
//   mealPrepExperience: "none" | "beginner" | "intermediate" | "advanced" | "";
//   cookingSkills: "none" | "basic" | "intermediate" | "advanced" | "";
//   budgetRange: "under-50" | "50-100" | "100-150" | "150-200" | "over-200" | "";

//   // Service Preferences
//   servicesInterested: string[];
//   preferredConsultationTime: string;
//   preferredDate: string;
//   timeZone: string;
//   communicationPreference: "email" | "phone" | "video-call" | "text" | "";
//   urgencyLevel: "3-5-days" | "1-week" | "2-weeks" | "1-month" | "";

//   // Additional
//   additionalNotes: string;
//   howDidYouHear: string;
//   agreeToTerms: boolean;
//   agreeToMarketing: boolean;
// }

// // Enhanced Stripe Payment Component
// const PaymentStep: React.FC<{
//   totalAmount: number;
//   clientSecret?: string;
//   consultationId?: string;
//   onPaymentSuccess: () => void;
// }> = ({ totalAmount, clientSecret, consultationId, onPaymentSuccess }) => {
//   const [isLoading, setIsLoading] = useState(!clientSecret);
//   const [paymentError, setPaymentError] = useState<string | null>(null);

//   useEffect(() => {
//     if (clientSecret) {
//       setIsLoading(false);
//     }
//   }, [clientSecret]);

//   console.log("PaymentStep props:", {
//     totalAmount,
//     clientSecret: clientSecret ? "Present" : "Missing",
//     consultationId,
//     isLoading,
//   });

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
//             <span className="text-emerald-600">
//               ${(totalAmount || 0).toFixed(2)}
//             </span>
//           </div>
//         </div>

//         <div>
//           {clientSecret && !isLoading ? (
//             <Elements
//               stripe={stripePromise}
//               options={{
//                 clientSecret: clientSecret,
//                 appearance: { theme: "stripe" },
//               }}
//             >
//               <StripeCheckout
//                 amount={totalAmount}
//                 onPaymentSuccess={onPaymentSuccess}
//               />
//             </Elements>
//           ) : (
//             <div className="flex items-center justify-center py-8">
//               <div className="text-center">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
//                 <p className="text-gray-600">Preparing secure payment...</p>
//                 {isLoading && clientSecret && (
//                   <p className="text-xs text-gray-500 mt-1">
//                     Loading payment form...
//                   </p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
//           <Shield className="w-4 h-4" />
//           <span>Your payment information is secure and encrypted</span>
//         </div>
//       </div>

//       {paymentError && (
//         <div className="p-4 border border-red-200 bg-red-50 rounded-lg flex items-center gap-3">
//           <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
//           <span className="text-red-800">{paymentError}</span>
//         </div>
//       )}
//     </div>
//   );
// };

// const ConsultationForm = () => {
//   const scrollContainerRef = useRef<HTMLDivElement>(null);

//   const [isOpen, setIsOpen] = useState(false);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [submitError, setSubmitError] = useState<string | null>(null);
//   const [clientSecret, setClientSecret] = useState<string | null>(null);
//   const [consultationId, setConsultationId] = useState<string | null>(null);
//   const [paymentInitialized, setPaymentInitialized] = useState(false);
//   const totalSteps = 6;

//   // Service options
//   const serviceOptions = [
//     {
//       id: "consultation",
//       name: "Initial Consultation",
//       duration: "20 min",
//       price: 20,
//       description: "Comprehensive assessment of your needs and goals",
//       required: true,
//     },
//     {
//       id: "meal-plan",
//       name: "Custom Meal Plan",
//       duration: "7 days",
//       price: 35,
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

//   const urgencyOptions = [
//     {
//       value: "3-5-days",
//       label: "ASAP (3-5 days)",
//       desc: "Urgent - Need help immediately",
//     },
//     { value: "1-week", label: "Within 1 week", desc: "Soon - Ready to start" },
//     {
//       value: "2-weeks",
//       label: "Within 2 weeks",
//       desc: "Flexible - Planning ahead",
//     },
//     {
//       value: "1-month",
//       label: "Within 1 month",
//       desc: "No rush - Exploring options",
//     },
//   ];

//   // Step configuration with icons
//   const steps = [
//     { id: 1, title: "Personal Info", icon: User },
//     { id: 2, title: "Health Info", icon: Heart },
//     { id: 3, title: "Goals & Lifestyle", icon: Target },
//     { id: 4, title: "Services & Booking", icon: Calendar },
//     { id: 5, title: "Review & Terms", icon: FileText },
//     { id: 6, title: "Payment", icon: CreditCard },
//   ];

//   // Scroll to top when step changes
//   useEffect(() => {
//     if (scrollContainerRef.current) {
//       scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   }, [currentStep]);

//   const [formData, setFormData] = useState<ConsultationFormData>({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     age: 0,
//     gender: "",
//     occupation: "",
//     currentWeight: 150,
//     goalWeight: 140,
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
//     servicesInterested: ["consultation"], // Pre-select consultation as required
//     preferredConsultationTime: "",
//     preferredDate: "",
//     timeZone: "",
//     communicationPreference: "",
//     urgencyLevel: "1-week",
//     additionalNotes: "",
//     howDidYouHear: "",
//     agreeToTerms: false,
//     agreeToMarketing: false,
//   });

//   const calculateTotal = () => {
//     if (
//       !formData?.servicesInterested ||
//       formData.servicesInterested.length === 0
//     ) {
//       return 0;
//     }
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
//       // Don't allow removing required services
//       if (field === "servicesInterested" && value === "consultation") {
//         toast.error("Initial consultation is required and cannot be removed");
//         return;
//       }
//       updateField(
//         field,
//         currentArray.filter((item) => item !== value)
//       );
//     }
//   };

//   const validateStep = () => {
//     const newErrors: Record<string, string> = {};

//     if (currentStep === 1) {
//       if (!formData.firstName) {
//         newErrors.firstName = "First name is required";
//         toast.error("Please enter your first name");
//       }
//       if (!formData.lastName) {
//         newErrors.lastName = "Last name is required";
//         toast.error("Please enter your last name");
//       }
//       if (!formData.email) {
//         newErrors.email = "Email is required";
//         toast.error("Please enter your email address");
//       }
//       if (!formData.phone) {
//         newErrors.phone = "Phone number is required";
//         toast.error("Please enter your phone number");
//       }
//       if (!formData.age || formData.age < 13) {
//         newErrors.age = "Valid age is required";
//         toast.error("Please enter a valid age (13 or older)");
//       }
//       if (!formData.gender) {
//         newErrors.gender = "Please select your gender";
//         toast.error("Please select your gender");
//       }
//     } else if (currentStep === 2) {
//       if (!formData.currentWeight || formData.currentWeight < 50) {
//         newErrors.currentWeight = "Current weight must be at least 50 lbs";
//         toast.error("Please enter a valid current weight");
//       }
//       if (!formData.goalWeight || formData.goalWeight < 50) {
//         newErrors.goalWeight = "Goal weight must be at least 50 lbs";
//         toast.error("Please enter a valid goal weight");
//       }
//       if (!formData.height) {
//         newErrors.height = "Height is required";
//         toast.error("Please enter your height");
//       }
//       if (!formData.activityLevel) {
//         newErrors.activityLevel = "Please select your activity level";
//         toast.error("Please select your activity level");
//       }
//     } else if (currentStep === 3) {
//       if (formData.primaryGoals.length === 0) {
//         newErrors.primaryGoals = "Please select at least one goal";
//         toast.error("Please select at least one primary goal");
//       }
//       if (!formData.mealPrepExperience) {
//         newErrors.mealPrepExperience =
//           "Please select your meal prep experience";
//         toast.error("Please select your meal prep experience level");
//       }
//       if (!formData.cookingSkills) {
//         newErrors.cookingSkills = "Please select your cooking skill level";
//         toast.error("Please select your cooking skill level");
//       }
//       if (!formData.budgetRange) {
//         newErrors.budgetRange = "Please select your budget range";
//         toast.error("Please select your weekly food budget range");
//       }
//     } else if (currentStep === 4) {
//       if (formData.servicesInterested.length === 0) {
//         newErrors.servicesInterested = "Please select at least one service";
//         toast.error("Please select at least one service");
//       }
//       if (!formData.urgencyLevel) {
//         newErrors.urgencyLevel = "Please select your urgency level";
//         toast.error("Please select when you'd like to start");
//       }
//       if (!formData.preferredConsultationTime) {
//         newErrors.preferredConsultationTime =
//           "Please select your preferred time";
//         toast.error("Please select your preferred consultation time");
//       }
//       if (!formData.timeZone) {
//         newErrors.timeZone = "Please select your time zone";
//         toast.error("Please select your time zone");
//       }
//       if (!formData.communicationPreference) {
//         newErrors.communicationPreference =
//           "Please select your communication preference";
//         toast.error("Please select your preferred communication method");
//       }
//     } else if (currentStep === 5) {
//       if (!formData.agreeToTerms) {
//         newErrors.agreeToTerms = "You must agree to the terms and conditions";
//         toast.error("Please agree to the terms and conditions to continue");
//       }
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

//   const goToStep = (stepNumber: number) => {
//     // Don't lose payment data when navigating back from step 6
//     if (currentStep === 6 && stepNumber < 6 && paymentInitialized) {
//       console.log("Preserving payment state when navigating back");
//     }

//     // Allow navigation to previous steps or current step
//     if (stepNumber <= currentStep) {
//       setCurrentStep(stepNumber);
//     } else {
//       // For future steps, validate current step first
//       if (validateStep()) {
//         setCurrentStep(stepNumber);
//       }
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
//         preferredDate: new Date().toISOString().split("T")[0], // Set current date as default
//         timeZone: formData.timeZone,
//         communicationPreference: formData.communicationPreference as
//           | "email"
//           | "phone"
//           | "video-call"
//           | "text",
//         urgencyLevel: formData.urgencyLevel as
//           | "3-5-days"
//           | "1-week"
//           | "2-weeks"
//           | "1-month",

//         // Additional
//         additionalNotes: formData.additionalNotes,
//         howDidYouHear: formData.howDidYouHear,
//         agreeToTerms: formData.agreeToTerms,
//         agreeToMarketing: formData.agreeToMarketing,
//       };

//       console.log("📝 Submitting consultation form:", submissionData);

//       // Save to database - Real server action call
//       const result = await submitConsultationForm(submissionData);

//       if (result.success && result.clientSecret) {
//         console.log("✅ Consultation submitted successfully!");
//         setConsultationId(result.consultationId!);
//         setClientSecret(result.clientSecret);
//         setPaymentInitialized(true);
//         setCurrentStep(6); // Move to payment step
//       } else {
//         throw new Error(result.error || "Failed to submit consultation form");
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
//     setShowSuccess(true);
//     toast.success("Payment successful! Your consultation has been booked.");
//     setTimeout(() => {
//       window.location.href = "/consultation/success";
//     }, 2000);
//   };

//   // Step Indicator Component
//   const StepIndicator = () => (
//     <div className="flex items-center justify-center mb-6">
//       {steps.map((step, index) => (
//         <React.Fragment key={step.id}>
//           <div
//             className={`flex items-center cursor-pointer transition-all hover:scale-105 ${
//               step.id <= currentStep ? "text-orange-600" : "text-gray-400"
//             } ${step.id === currentStep ? "scale-110" : ""}`}
//             onClick={() => goToStep(step.id)}
//           >
//             <div
//               className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
//                 step.id === currentStep
//                   ? "border-orange-600 bg-orange-50 text-orange-600 shadow-lg"
//                   : step.id < currentStep
//                     ? "border-orange-600 bg-orange-600 text-white"
//                     : "border-gray-300 text-gray-400"
//               }`}
//             >
//               {step.id < currentStep ? (
//                 <CheckCircle className="h-5 w-5" />
//               ) : (
//                 <step.icon className="h-5 w-5" />
//               )}
//             </div>
//             <span
//               className={`ml-2 text-xs font-medium hidden sm:block transition-colors ${
//                 step.id <= currentStep ? "text-orange-600" : "text-gray-400"
//               }`}
//             >
//               {step.title}
//             </span>
//           </div>
//           {index < steps.length - 1 && (
//             <div
//               className={`w-6 h-0.5 mx-2 transition-colors duration-300 ${
//                 step.id < currentStep ? "bg-orange-600" : "bg-gray-300"
//               }`}
//             />
//           )}
//         </React.Fragment>
//       ))}
//     </div>
//   );

//   if (showSuccess) {
//     return (
//       <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
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
//     <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
//       {/* Desktop Layout */}
//       <div className="hidden lg:flex min-h-screen pt-16">
//         {/* Left Side - Marketing Content */}
//         <div className="w-2/5 flex flex-col justify-center px-12 relative">
//           {/* WhatsApp Support Badge */}
//           <div className="absolute top-8 right-8">
//             <a
//               href="https://wa.me/9735737764"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-200 hover:bg-white/90 transition-colors"
//             >
//               <Headphones className="w-4 h-4 text-orange-600" />
//               <span className="text-sm font-medium text-orange-800">
//                 Support
//               </span>
//             </a>
//           </div>

//           <div className="max-w-lg">
//             {/* Feature Card */}
//             <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-orange-200/50">
//               <div className="flex items-start gap-4 mb-6">
//                 <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
//                   <Sparkles className="w-6 h-6 text-white" />
//                 </div>
//                 <div className="flex-1">
//                   <h3 className="text-xl font-bold text-gray-900 mb-2">
//                     Transform Your Health Journey
//                   </h3>
//                   <p className="text-gray-600 mb-4">
//                     Get personalized nutrition plans with our certified experts.
//                     Transform your health naturally with proven results.
//                   </p>
//                   <div className="flex items-center gap-2 text-sm text-orange-600">
//                     <Star className="w-4 h-4 fill-current" />
//                     <span className="font-medium">
//                       4.9/5 from 2,500+ clients
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Mini Stats */}
//               <div className="flex items-center justify-between pt-4 border-t border-gray-100">
//                 <div className="text-center">
//                   <div className="text-lg font-bold text-gray-900 flex items-center gap-1">
//                     <TrendingUp className="w-4 h-4 text-emerald-600" />
//                     95%
//                   </div>
//                   <div className="text-xs text-gray-500">Success Rate</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-lg font-bold text-gray-900 flex items-center gap-1">
//                     <Users className="w-4 h-4 text-blue-600" />
//                     10K+
//                   </div>
//                   <div className="text-xs text-gray-500">Happy Clients</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-lg font-bold text-gray-900 flex items-center gap-1">
//                     <Zap className="w-4 h-4 text-purple-600" />
//                     24/7
//                   </div>
//                   <div className="text-xs text-gray-500">Support</div>
//                 </div>
//               </div>
//             </div>

//             {/* Main Heading */}
//             <div className="mb-8">
//               <h2 className="text-3xl font-bold text-gray-900 mb-4">
//                 Professional Nutrition Consultation
//               </h2>
//               <p className="text-gray-700 leading-relaxed">
//                 Our expert nutritionists will create a personalized plan
//                 tailored to your unique needs, lifestyle, and health goals.
//                 Experience the difference that professional guidance makes.
//               </p>
//             </div>

//             {/* Feature List */}
//             <div className="space-y-4">
//               {[
//                 {
//                   icon: <Users className="w-5 h-5 text-orange-600" />,
//                   title: "Expert Consultations",
//                   description: "1-on-1 sessions with certified nutritionists",
//                 },
//                 {
//                   icon: <Award className="w-5 h-5 text-orange-600" />,
//                   title: "Proven Results",
//                   description:
//                     "95% of clients reach their wellness goals within 30 days",
//                 },
//                 {
//                   icon: <Shield className="w-5 h-5 text-orange-600" />,
//                   title: "100% Natural Approach",
//                   description:
//                     "Holistic nutrition plans without harmful restrictions",
//                 },
//               ].map((feature, index) => (
//                 <div key={index} className="flex items-start gap-3">
//                   <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-orange-200">
//                     {feature.icon}
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-gray-900 mb-1">
//                       {feature.title}
//                     </h4>
//                     <p className="text-sm text-gray-600">
//                       {feature.description}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Decorative Elements */}
//           <div className="absolute bottom-8 right-8 opacity-20">
//             <div className="w-32 h-32 bg-gradient-to-br from-orange-300 to-amber-400 rounded-full blur-3xl"></div>
//           </div>
//           <div className="absolute top-1/4 right-1/4 opacity-10">
//             <div className="w-24 h-24 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full blur-2xl"></div>
//           </div>
//         </div>

//         {/* Right Side - Form Container for Desktop */}
//         <div className="w-3/5 flex items-center justify-center p-12">
//           <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-orange-200/50 overflow-hidden flex flex-col h-[85vh]">
//             {/* Fixed Header */}
//             <div className="flex-shrink-0 bg-white/95 backdrop-blur-xl p-6 border-b border-orange-200/50">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
//                   <Leaf className="w-5 h-5 text-white" />
//                 </div>
//                 <div>
//                   <h1 className="text-xl font-bold text-gray-900">
//                     Nutra-Vive
//                   </h1>
//                   <p className="text-sm text-gray-500">Natural Wellness</p>
//                 </div>
//               </div>

//               <div className="text-center mb-4">
//                 <h1 className="text-2xl font-bold text-gray-900 mb-2">
//                   Nutrition Consultation
//                 </h1>
//                 <p className="text-gray-600">
//                   Start your personalized wellness journey today
//                 </p>
//               </div>

//               {/* Progress Bar */}
//               <div className="mb-4">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-sm font-medium text-gray-600">
//                     Step {currentStep} of {totalSteps}
//                   </span>
//                   <span className="text-sm font-medium text-orange-600">
//                     {Math.round((currentStep / totalSteps) * 100)}% Complete
//                   </span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div
//                     className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
//                     style={{ width: `${(currentStep / totalSteps) * 100}%` }}
//                   />
//                 </div>
//               </div>

//               {/* Error Display */}
//               {(errors.general || submitError) && (
//                 <div className="mb-4 p-4 border border-red-200 bg-red-50 rounded-lg flex items-center gap-3">
//                   <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
//                   <span className="text-red-800">
//                     {errors.general || submitError}
//                   </span>
//                 </div>
//               )}

//               {/* Step Indicator */}
//               <StepIndicator />
//             </div>

//             {/* Scrollable Content */}
//             <div
//               ref={scrollContainerRef}
//               className="flex-1 overflow-y-auto p-6"
//             >
//               {/* Step Content */}
//               <div className="mb-8">
//                 {currentStep === 1 && (
//                   <div className="space-y-6">
//                     <div className="text-center mb-8">
//                       <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-4">
//                         <User className="w-8 h-8 text-white" />
//                       </div>
//                       <h2 className="text-2xl font-bold text-gray-800 mb-2">
//                         Personal Information
//                       </h2>
//                       <p className="text-gray-600">
//                         Let's start with some basic information about you
//                       </p>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           First Name *
//                         </label>
//                         <input
//                           type="text"
//                           value={formData.firstName}
//                           onChange={(e) =>
//                             updateField("firstName", e.target.value)
//                           }
//                           placeholder="Enter your first name"
//                           className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
//                         />
//                         {errors.firstName && (
//                           <p className="text-red-500 text-sm mt-1">
//                             {errors.firstName}
//                           </p>
//                         )}
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Last Name *
//                         </label>
//                         <input
//                           type="text"
//                           value={formData.lastName}
//                           onChange={(e) =>
//                             updateField("lastName", e.target.value)
//                           }
//                           placeholder="Enter your last name"
//                           className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
//                         />
//                         {errors.lastName && (
//                           <p className="text-red-500 text-sm mt-1">
//                             {errors.lastName}
//                           </p>
//                         )}
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Email Address *
//                         </label>
//                         <input
//                           type="email"
//                           value={formData.email}
//                           onChange={(e) => updateField("email", e.target.value)}
//                           placeholder="your.email@example.com"
//                           className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
//                         />
//                         {errors.email && (
//                           <p className="text-red-500 text-sm mt-1">
//                             {errors.email}
//                           </p>
//                         )}
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Phone Number *
//                         </label>
//                         <input
//                           type="tel"
//                           value={formData.phone}
//                           onChange={(e) => updateField("phone", e.target.value)}
//                           placeholder="(555) 123-4567"
//                           className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
//                         />
//                         {errors.phone && (
//                           <p className="text-red-500 text-sm mt-1">
//                             {errors.phone}
//                           </p>
//                         )}
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Age *
//                         </label>
//                         <input
//                           type="number"
//                           value={formData.age || ""}
//                           onChange={(e) =>
//                             updateField("age", parseInt(e.target.value) || 0)
//                           }
//                           placeholder="Enter your age"
//                           className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
//                         />
//                         {errors.age && (
//                           <p className="text-red-500 text-sm mt-1">
//                             {errors.age}
//                           </p>
//                         )}
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Gender *
//                         </label>
//                         <select
//                           value={formData.gender}
//                           onChange={(e) =>
//                             updateField("gender", e.target.value)
//                           }
//                           className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
//                         >
//                           <option value="">Select gender</option>
//                           <option value="male">Male</option>
//                           <option value="female">Female</option>
//                           <option value="other">Other</option>
//                           <option value="prefer-not-to-say">
//                             Prefer not to say
//                           </option>
//                         </select>
//                         {errors.gender && (
//                           <p className="text-red-500 text-sm mt-1">
//                             {errors.gender}
//                           </p>
//                         )}
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Occupation
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.occupation}
//                         onChange={(e) =>
//                           updateField("occupation", e.target.value)
//                         }
//                         placeholder="What do you do for work?"
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
//                       />
//                     </div>
//                   </div>
//                 )}

//                 {currentStep === 2 && (
//                   <div className="space-y-6">
//                     <div className="text-center mb-8">
//                       <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
//                         <Heart className="w-8 h-8 text-white" />
//                       </div>
//                       <h2 className="text-2xl font-bold text-gray-800 mb-2">
//                         Health Information
//                       </h2>
//                       <p className="text-gray-600">
//                         Help us understand your current health status
//                       </p>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Current Weight (lbs) *
//                         </label>
//                         <input
//                           type="number"
//                           value={formData.currentWeight || ""}
//                           onChange={(e) =>
//                             updateField(
//                               "currentWeight",
//                               parseInt(e.target.value) || 0
//                             )
//                           }
//                           placeholder="150"
//                           className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                         />
//                         {errors.currentWeight && (
//                           <p className="text-red-500 text-sm mt-1">
//                             {errors.currentWeight}
//                           </p>
//                         )}
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Goal Weight (lbs) *
//                         </label>
//                         <input
//                           type="number"
//                           value={formData.goalWeight || ""}
//                           onChange={(e) =>
//                             updateField(
//                               "goalWeight",
//                               parseInt(e.target.value) || 0
//                             )
//                           }
//                           placeholder="140"
//                           className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                         />
//                         {errors.goalWeight && (
//                           <p className="text-red-500 text-sm mt-1">
//                             {errors.goalWeight}
//                           </p>
//                         )}
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Height *
//                         </label>
//                         <input
//                           type="text"
//                           value={formData.height}
//                           onChange={(e) =>
//                             updateField("height", e.target.value)
//                           }
//                           placeholder={"5'6\" or 168cm"}
//                           className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                         />
//                         {errors.height && (
//                           <p className="text-red-500 text-sm mt-1">
//                             {errors.height}
//                           </p>
//                         )}
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-3">
//                         Activity Level *
//                       </label>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         {[
//                           {
//                             value: "sedentary",
//                             label: "Sedentary",
//                             desc: "Little to no exercise",
//                           },
//                           {
//                             value: "lightly-active",
//                             label: "Lightly Active",
//                             desc: "Light exercise 1-3 days/week",
//                           },
//                           {
//                             value: "moderately-active",
//                             label: "Moderately Active",
//                             desc: "Moderate exercise 3-5 days/week",
//                           },
//                           {
//                             value: "very-active",
//                             label: "Very Active",
//                             desc: "Hard exercise 6-7 days/week",
//                           },
//                           {
//                             value: "extremely-active",
//                             label: "Extremely Active",
//                             desc: "Very hard exercise, physical job",
//                           },
//                         ].map((option) => (
//                           <label
//                             key={option.value}
//                             className="relative cursor-pointer"
//                           >
//                             <input
//                               type="radio"
//                               name="activityLevel"
//                               value={option.value}
//                               checked={formData.activityLevel === option.value}
//                               onChange={(e) =>
//                                 updateField("activityLevel", e.target.value)
//                               }
//                               className="sr-only"
//                             />
//                             <div
//                               className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
//                                 formData.activityLevel === option.value
//                                   ? "border-emerald-500 bg-emerald-50"
//                                   : "border-gray-200 hover:border-emerald-300"
//                               }`}
//                             >
//                               <div className="font-medium text-gray-800">
//                                 {option.label}
//                               </div>
//                               <div className="text-sm text-gray-600">
//                                 {option.desc}
//                               </div>
//                             </div>
//                           </label>
//                         ))}
//                       </div>
//                       {errors.activityLevel && (
//                         <p className="text-red-500 text-sm mt-1">
//                           {errors.activityLevel}
//                         </p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-3">
//                         Dietary Restrictions/Preferences
//                       </label>
//                       <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                         {dietaryOptions.map((option) => (
//                           <label
//                             key={option}
//                             className="relative cursor-pointer"
//                           >
//                             <input
//                               type="checkbox"
//                               checked={formData.dietaryRestrictions.includes(
//                                 option
//                               )}
//                               onChange={(e) =>
//                                 handleArrayUpdate(
//                                   "dietaryRestrictions",
//                                   option,
//                                   e.target.checked
//                                 )
//                               }
//                               className="sr-only"
//                             />
//                             <div
//                               className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
//                                 formData.dietaryRestrictions.includes(option)
//                                   ? "border-emerald-500 bg-emerald-50 text-emerald-700"
//                                   : "border-gray-200 hover:border-emerald-300"
//                               }`}
//                             >
//                               <div className="text-sm font-medium">
//                                 {option}
//                               </div>
//                             </div>
//                           </label>
//                         ))}
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Food Allergies
//                         </label>
//                         <textarea
//                           value={formData.allergies}
//                           onChange={(e) =>
//                             updateField("allergies", e.target.value)
//                           }
//                           rows={3}
//                           placeholder="List any food allergies or intolerances..."
//                           className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Medical Conditions
//                         </label>
//                         <textarea
//                           value={formData.medicalConditions}
//                           onChange={(e) =>
//                             updateField("medicalConditions", e.target.value)
//                           }
//                           rows={3}
//                           placeholder="Any relevant medical conditions..."
//                           className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {currentStep === 3 && (
//                   <div className="space-y-6">
//                     <div className="text-center mb-8">
//                       <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
//                         <Target className="w-8 h-8 text-white" />
//                       </div>
//                       <h2 className="text-2xl font-bold text-gray-800 mb-2">
//                         Goals & Lifestyle
//                       </h2>
//                       <p className="text-gray-600">
//                         Tell us about your goals and current lifestyle
//                       </p>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-3">
//                         Primary Goals * (Select all that apply)
//                       </label>
//                       <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                         {goalOptions.map((option) => (
//                           <label
//                             key={option}
//                             className="relative cursor-pointer"
//                           >
//                             <input
//                               type="checkbox"
//                               checked={formData.primaryGoals.includes(option)}
//                               onChange={(e) =>
//                                 handleArrayUpdate(
//                                   "primaryGoals",
//                                   option,
//                                   e.target.checked
//                                 )
//                               }
//                               className="sr-only"
//                             />
//                             <div
//                               className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
//                                 formData.primaryGoals.includes(option)
//                                   ? "border-emerald-500 bg-emerald-50 text-emerald-700"
//                                   : "border-gray-200 hover:border-emerald-300"
//                               }`}
//                             >
//                               <div className="text-sm font-medium">
//                                 {option}
//                               </div>
//                             </div>
//                           </label>
//                         ))}
//                       </div>
//                       {errors.primaryGoals && (
//                         <p className="text-red-500 text-sm mt-1">
//                           {errors.primaryGoals}
//                         </p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-3">
//                         Motivation Level ({formData.motivationLevel}/10)
//                       </label>
//                       <div className="px-2">
//                         <input
//                           type="range"
//                           min="1"
//                           max="10"
//                           value={formData.motivationLevel}
//                           onChange={(e) =>
//                             updateField(
//                               "motivationLevel",
//                               parseInt(e.target.value)
//                             )
//                           }
//                           className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                         />
//                         <div className="flex justify-between text-xs text-gray-500 mt-1">
//                           <span>Low (1)</span>
//                           <span>Medium (5)</span>
//                           <span>High (10)</span>
//                         </div>
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-3">
//                         Biggest Challenges (Select all that apply)
//                       </label>
//                       <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                         {challengeOptions.map((option) => (
//                           <label
//                             key={option}
//                             className="relative cursor-pointer"
//                           >
//                             <input
//                               type="checkbox"
//                               checked={formData.biggestChallenges.includes(
//                                 option
//                               )}
//                               onChange={(e) =>
//                                 handleArrayUpdate(
//                                   "biggestChallenges",
//                                   option,
//                                   e.target.checked
//                                 )
//                               }
//                               className="sr-only"
//                             />
//                             <div
//                               className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
//                                 formData.biggestChallenges.includes(option)
//                                   ? "border-orange-500 bg-orange-50 text-orange-700"
//                                   : "border-gray-200 hover:border-orange-300"
//                               }`}
//                             >
//                               <div className="text-sm font-medium">
//                                 {option}
//                               </div>
//                             </div>
//                           </label>
//                         ))}
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Meal Prep Experience *
//                         </label>
//                         <select
//                           value={formData.mealPrepExperience}
//                           onChange={(e) =>
//                             updateField("mealPrepExperience", e.target.value)
//                           }
//                           className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                         >
//                           <option value="">Select experience level</option>
//                           <option value="none">
//                             None - Never done meal prep
//                           </option>
//                           <option value="beginner">
//                             Beginner - Just starting out
//                           </option>
//                           <option value="intermediate">
//                             Intermediate - Some experience
//                           </option>
//                           <option value="advanced">
//                             Advanced - Very experienced
//                           </option>
//                         </select>
//                         {errors.mealPrepExperience && (
//                           <p className="text-red-500 text-sm mt-1">
//                             {errors.mealPrepExperience}
//                           </p>
//                         )}
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Cooking Skills *
//                         </label>
//                         <select
//                           value={formData.cookingSkills}
//                           onChange={(e) =>
//                             updateField("cookingSkills", e.target.value)
//                           }
//                           className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                         >
//                           <option value="">Select skill level</option>
//                           <option value="none">None - Don't cook</option>
//                           <option value="basic">Basic - Simple meals</option>
//                           <option value="intermediate">
//                             Intermediate - Comfortable cooking
//                           </option>
//                           <option value="advanced">
//                             Advanced - Love to cook
//                           </option>
//                         </select>
//                         {errors.cookingSkills && (
//                           <p className="text-red-500 text-sm mt-1">
//                             {errors.cookingSkills}
//                           </p>
//                         )}
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Weekly Food Budget *
//                       </label>
//                       <select
//                         value={formData.budgetRange}
//                         onChange={(e) =>
//                           updateField("budgetRange", e.target.value)
//                         }
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                       >
//                         <option value="">Select budget range</option>
//                         <option value="under-50">Under $50</option>
//                         <option value="50-100">$50 - $100</option>
//                         <option value="100-150">$100 - $150</option>
//                         <option value="150-200">$150 - $200</option>
//                         <option value="over-200">Over $200</option>
//                       </select>
//                       {errors.budgetRange && (
//                         <p className="text-red-500 text-sm mt-1">
//                           {errors.budgetRange}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {currentStep === 4 && (
//                   <div className="space-y-6">
//                     <div className="text-center mb-8">
//                       <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
//                         <Calendar className="w-8 h-8 text-white" />
//                       </div>
//                       <h2 className="text-2xl font-bold text-gray-800 mb-2">
//                         Choose Your Services
//                       </h2>
//                       <p className="text-gray-600">
//                         Select the services you're interested in
//                       </p>
//                     </div>

//                     <div className="space-y-4">
//                       {serviceOptions.map((service) => (
//                         <div
//                           key={service.id}
//                           className={`cursor-pointer transition-all duration-200 p-6 border-2 rounded-xl ${
//                             formData.servicesInterested.includes(service.id)
//                               ? "border-emerald-500 bg-emerald-50"
//                               : "border-gray-200 hover:border-emerald-300 hover:shadow-md"
//                           } ${service.required ? "opacity-90" : ""}`}
//                           onClick={() => {
//                             if (service.required) return; // Don't allow clicking on required services
//                             const current = formData.servicesInterested;
//                             if (current.includes(service.id)) {
//                               updateField(
//                                 "servicesInterested",
//                                 current.filter((id) => id !== service.id)
//                               );
//                             } else {
//                               updateField("servicesInterested", [
//                                 ...current,
//                                 service.id,
//                               ]);
//                             }
//                           }}
//                         >
//                           <div className="flex items-center justify-between">
//                             <div className="flex-1">
//                               <div className="flex items-center gap-3 mb-2">
//                                 <input
//                                   type="checkbox"
//                                   checked={formData.servicesInterested.includes(
//                                     service.id
//                                   )}
//                                   disabled={service.required}
//                                   readOnly
//                                   className="w-4 h-4 text-emerald-600 rounded"
//                                 />
//                                 <h3 className="text-lg font-semibold">
//                                   {service.name}
//                                   {service.required && (
//                                     <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full ml-2">
//                                       Required
//                                     </span>
//                                   )}
//                                 </h3>
//                                 <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
//                                   {service.duration}
//                                 </span>
//                               </div>
//                               <p className="text-gray-600 ml-7">
//                                 {service.description}
//                               </p>
//                             </div>
//                             <div className="text-right">
//                               <div className="text-2xl font-bold text-emerald-600">
//                                 ${service.price}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>

//                     {errors.servicesInterested && (
//                       <p className="text-red-500 text-sm mt-1">
//                         {errors.servicesInterested}
//                       </p>
//                     )}

//                     {formData.servicesInterested.length > 0 && (
//                       <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl">
//                         <div className="flex justify-between items-center">
//                           <span className="text-lg font-semibold">
//                             Total Amount:
//                           </span>
//                           <span className="text-2xl font-bold text-emerald-600">
//                             ${(calculateTotal() || 0).toFixed(2)}
//                           </span>
//                         </div>
//                       </div>
//                     )}

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-3">
//                         When would you like to start? *
//                       </label>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         {urgencyOptions.map((option) => (
//                           <label
//                             key={option.value}
//                             className="relative cursor-pointer"
//                           >
//                             <input
//                               type="radio"
//                               name="urgencyLevel"
//                               value={option.value}
//                               checked={formData.urgencyLevel === option.value}
//                               onChange={(e) =>
//                                 updateField("urgencyLevel", e.target.value)
//                               }
//                               className="sr-only"
//                             />
//                             <div
//                               className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
//                                 formData.urgencyLevel === option.value
//                                   ? "border-emerald-500 bg-emerald-50"
//                                   : "border-gray-200 hover:border-emerald-300"
//                               }`}
//                             >
//                               <div className="font-medium text-gray-800 mb-1">
//                                 {option.label}
//                               </div>
//                               <div className="text-sm text-gray-600">
//                                 {option.desc}
//                               </div>
//                             </div>
//                           </label>
//                         ))}
//                       </div>
//                       {errors.urgencyLevel && (
//                         <p className="text-red-500 text-sm mt-1">
//                           {errors.urgencyLevel}
//                         </p>
//                       )}
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Preferred Time *
//                         </label>
//                         <select
//                           value={formData.preferredConsultationTime}
//                           onChange={(e) =>
//                             updateField(
//                               "preferredConsultationTime",
//                               e.target.value
//                             )
//                           }
//                           className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                         >
//                           <option value="">Select time</option>
//                           <option value="09:00">9:00 AM</option>
//                           <option value="10:00">10:00 AM</option>
//                           <option value="11:00">11:00 AM</option>
//                           <option value="12:00">12:00 PM</option>
//                           <option value="13:00">1:00 PM</option>
//                           <option value="14:00">2:00 PM</option>
//                           <option value="15:00">3:00 PM</option>
//                           <option value="16:00">4:00 PM</option>
//                           <option value="17:00">5:00 PM</option>
//                         </select>
//                         {errors.preferredConsultationTime && (
//                           <p className="text-red-500 text-sm mt-1">
//                             {errors.preferredConsultationTime}
//                           </p>
//                         )}
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Time Zone *
//                         </label>
//                         <select
//                           value={formData.timeZone}
//                           onChange={(e) =>
//                             updateField("timeZone", e.target.value)
//                           }
//                           className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                         >
//                           <option value="">Select time zone</option>
//                           <option value="EST">Eastern (EST)</option>
//                           <option value="CST">Central (CST)</option>
//                           <option value="MST">Mountain (MST)</option>
//                           <option value="PST">Pacific (PST)</option>
//                           <option value="OTHER">Other</option>
//                         </select>
//                         {errors.timeZone && (
//                           <p className="text-red-500 text-sm mt-1">
//                             {errors.timeZone}
//                           </p>
//                         )}
//                       </div>
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
//                 )}

//                 {currentStep === 5 && (
//                   <div className="space-y-6">
//                     <div className="text-center mb-8">
//                       <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
//                         <FileText className="w-8 h-8 text-white" />
//                       </div>
//                       <h2 className="text-2xl font-bold text-gray-800 mb-2">
//                         Final Details
//                       </h2>
//                       <p className="text-gray-600">
//                         Just a few more details and you're all set!
//                       </p>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         How did you hear about us?
//                       </label>
//                       <select
//                         value={formData.howDidYouHear}
//                         onChange={(e) =>
//                           updateField("howDidYouHear", e.target.value)
//                         }
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
//                       >
//                         <option value="">Select an option</option>
//                         <option value="social-media">Social Media</option>
//                         <option value="google-search">Google Search</option>
//                         <option value="friend-referral">
//                           Friend/Family Referral
//                         </option>
//                         <option value="online-ad">Online Advertisement</option>
//                         <option value="health-blog">Health Blog/Website</option>
//                         <option value="other">Other</option>
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Additional Notes or Questions
//                       </label>
//                       <textarea
//                         value={formData.additionalNotes}
//                         onChange={(e) =>
//                           updateField("additionalNotes", e.target.value)
//                         }
//                         rows={4}
//                         placeholder="Anything else you'd like us to know about your health journey, specific concerns, or questions you have..."
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
//                       />
//                     </div>

//                     <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
//                       <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                         <DollarSign className="w-5 h-5 text-emerald-600" />
//                         Consultation Fee
//                       </h3>
//                       <div className="space-y-3">
//                         <div className="flex justify-between items-center">
//                           <span className="text-gray-700">
//                             Selected Services
//                           </span>
//                           <div className="text-right">
//                             {formData.servicesInterested.map((serviceId) => {
//                               const service = serviceOptions.find(
//                                 (s) => s.id === serviceId
//                               );
//                               return service ? (
//                                 <div
//                                   key={serviceId}
//                                   className="text-sm text-gray-600"
//                                 >
//                                   {service.name}: ${service.price}
//                                 </div>
//                               ) : null;
//                             })}
//                           </div>
//                         </div>
//                         <div className="border-t border-emerald-200 pt-3">
//                           <div className="flex justify-between items-center text-lg font-semibold">
//                             <span className="text-gray-800">
//                               Total Due Today
//                             </span>
//                             <span className="text-emerald-600">
//                               ${calculateTotal()}.00
//                             </span>
//                           </div>
//                           <p className="text-sm text-gray-600 mt-2">
//                             Payment will be processed securely. Additional
//                             services will be discussed during your consultation.
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="space-y-4">
//                       <label className="flex items-start space-x-3 cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={formData.agreeToTerms}
//                           onChange={(e) =>
//                             updateField("agreeToTerms", e.target.checked)
//                           }
//                           className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
//                         />
//                         <div className="text-sm">
//                           <span className="text-gray-700">
//                             I agree to the{" "}
//                             <a
//                               href="#"
//                               className="text-emerald-600 hover:underline"
//                             >
//                               Terms and Conditions
//                             </a>{" "}
//                             and{" "}
//                             <a
//                               href="#"
//                               className="text-emerald-600 hover:underline"
//                             >
//                               Privacy Policy
//                             </a>
//                             . I understand that the consultation fee is $
//                             {(calculateTotal() || 0).toFixed(2)} and additional
//                             services are optional. *
//                           </span>
//                         </div>
//                       </label>
//                       {errors.agreeToTerms && (
//                         <p className="text-red-500 text-sm">
//                           {errors.agreeToTerms}
//                         </p>
//                       )}

//                       <label className="flex items-start space-x-3 cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={formData.agreeToMarketing}
//                           onChange={(e) =>
//                             updateField("agreeToMarketing", e.target.checked)
//                           }
//                           className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
//                         />
//                         <span className="text-sm text-gray-700">
//                           I would like to receive health tips, nutrition advice,
//                           and promotional offers via email. (Optional)
//                         </span>
//                       </label>
//                     </div>
//                   </div>
//                 )}

//                 {currentStep === 6 && (
//                   <div>
//                     <div className="text-center mb-8">
//                       <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
//                         <CreditCard className="w-8 h-8 text-white" />
//                       </div>
//                       <h2 className="text-2xl font-bold text-gray-800 mb-2">
//                         Complete Payment
//                       </h2>
//                       <p className="text-gray-600">
//                         Secure your consultation booking
//                       </p>
//                     </div>

//                     <PaymentStep
//                       totalAmount={calculateTotal()}
//                       clientSecret={clientSecret || undefined}
//                       consultationId={consultationId || undefined}
//                       onPaymentSuccess={handlePaymentSuccess}
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Fixed Footer */}
//             {currentStep !== 6 && (
//               <div className="flex-shrink-0 bg-white/95 backdrop-blur-xl p-6 border-t border-orange-200/50 flex gap-4">
//                 <button
//                   type="button"
//                   onClick={prevStep}
//                   disabled={currentStep === 1}
//                   className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
//                 >
//                   <ArrowLeft className="w-4 h-4" />
//                   Previous
//                 </button>

//                 <div className="flex-1" />

//                 <button
//                   type="button"
//                   onClick={currentStep === 5 ? handleSubmit : nextStep}
//                   disabled={isSubmitting}
//                   className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-2 disabled:opacity-50"
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

//       {/* Mobile Layout - Trigger Button */}
//       <div className="lg:hidden">
//         <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 pt-16">
//           <div className="flex flex-col items-center justify-center h-full p-4">
//             {/* Feature Card for Mobile */}
//             <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-orange-200/50 max-w-sm w-full">
//               <div className="text-center">
//                 <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4">
//                   <Sparkles className="w-6 h-6 text-white" />
//                 </div>
//                 <h3 className="text-xl font-bold text-gray-900 mb-2">
//                   Professional Nutrition Consultation
//                 </h3>
//                 <p className="text-gray-600 mb-4">
//                   Get personalized nutrition plans with our certified experts.
//                   Transform your health naturally.
//                 </p>
//                 <div className="flex items-center justify-center gap-2 text-sm text-orange-600 mb-6">
//                   <Star className="w-4 h-4 fill-current" />
//                   <span className="font-medium">4.9/5 from 2,500+ clients</span>
//                 </div>

//                 <button
//                   onClick={() => setIsOpen(true)}
//                   className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
//                 >
//                   <Plus className="w-5 h-5" />
//                   Start Consultation
//                 </button>
//               </div>
//             </div>

//             {/* Quick Stats */}
//             <div className="grid grid-cols-3 gap-4 max-w-sm w-full">
//               <div className="bg-white rounded-xl p-4 text-center border border-orange-200/50">
//                 <div className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1">
//                   <TrendingUp className="w-4 h-4 text-emerald-600" />
//                   95%
//                 </div>
//                 <div className="text-xs text-gray-500">Success Rate</div>
//               </div>
//               <div className="bg-white rounded-xl p-4 text-center border border-orange-200/50">
//                 <div className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1">
//                   <Users className="w-4 h-4 text-blue-600" />
//                   10K+
//                 </div>
//                 <div className="text-xs text-gray-500">Happy Clients</div>
//               </div>
//               <div className="bg-white rounded-xl p-4 text-center border border-orange-200/50">
//                 <div className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1">
//                   <Zap className="w-4 h-4 text-purple-600" />
//                   24/7
//                 </div>
//                 <div className="text-xs text-gray-500">Support</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Mobile Modal */}
//         {isOpen && (
//           <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
//             <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
//               {/* Fixed Header */}
//               <div className="flex-shrink-0 bg-white/95 backdrop-blur-xl p-4 border-b border-orange-200/50">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
//                       <Leaf className="w-4 h-4 text-white" />
//                     </div>
//                     <div>
//                       <h1 className="text-lg font-bold text-gray-900">
//                         Nutra-Vive
//                       </h1>
//                       <p className="text-xs text-gray-500">
//                         Step {currentStep} of {totalSteps}
//                       </p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => setIsOpen(false)}
//                     className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
//                   >
//                     <X className="h-6 w-6 text-gray-500" />
//                   </button>
//                 </div>

//                 {/* Progress Bar */}
//                 <div className="mb-4">
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div
//                       className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
//                       style={{ width: `${(currentStep / totalSteps) * 100}%` }}
//                     />
//                   </div>
//                 </div>

//                 {/* Error Display */}
//                 {(errors.general || submitError) && (
//                   <div className="mb-4 p-4 border border-red-200 bg-red-50 rounded-lg flex items-center gap-3">
//                     <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
//                     <span className="text-red-800">
//                       {errors.general || submitError}
//                     </span>
//                   </div>
//                 )}

//                 {/* Mobile Step Indicator */}
//                 <div className="flex items-center justify-center">
//                   {steps.map((step, index) => (
//                     <React.Fragment key={step.id}>
//                       <div
//                         className={`flex items-center cursor-pointer hover:scale-105 transition-all ${
//                           step.id <= currentStep
//                             ? "text-orange-600"
//                             : "text-gray-400"
//                         }`}
//                         onClick={() => goToStep(step.id)}
//                       >
//                         <div
//                           className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 ${
//                             step.id === currentStep
//                               ? "border-orange-600 bg-orange-50 text-orange-600"
//                               : step.id < currentStep
//                                 ? "border-orange-600 bg-orange-600 text-white"
//                                 : "border-gray-300 text-gray-400"
//                           }`}
//                         >
//                           {step.id < currentStep ? (
//                             <CheckCircle className="h-3 w-3" />
//                           ) : (
//                             <step.icon className="h-3 w-3" />
//                           )}
//                         </div>
//                       </div>
//                       {index < steps.length - 1 && (
//                         <div
//                           className={`w-4 h-0.5 mx-1 transition-colors duration-300 ${
//                             step.id < currentStep
//                               ? "bg-orange-600"
//                               : "bg-gray-300"
//                           }`}
//                         />
//                       )}
//                     </React.Fragment>
//                   ))}
//                 </div>
//               </div>

//               {/* Scrollable Content - Mobile steps would go here but abbreviated for space */}
//               <div
//                 ref={scrollContainerRef}
//                 className="flex-1 overflow-y-auto p-4"
//               >
//                 {/* Mobile content mirrors desktop but optimized for mobile screens */}
//                 <div className="text-center">
//                   <p className="text-gray-600 text-sm">
//                     Mobile form content for step {currentStep} would be
//                     displayed here...
//                   </p>
//                 </div>
//               </div>

//               {/* Fixed Footer */}
//               {currentStep !== 6 && (
//                 <div className="flex-shrink-0 bg-white/95 backdrop-blur-xl p-4 border-t border-orange-200/50 flex gap-3">
//                   {currentStep > 1 && (
//                     <button
//                       type="button"
//                       onClick={prevStep}
//                       className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
//                     >
//                       <ArrowLeft className="w-4 h-4" />
//                       Previous
//                     </button>
//                   )}

//                   <button
//                     type="button"
//                     onClick={currentStep === 5 ? handleSubmit : nextStep}
//                     disabled={isSubmitting}
//                     className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
//                   >
//                     {currentStep === 5 ? (
//                       isSubmitting ? (
//                         <>
//                           <Loader2 className="w-4 h-4 animate-spin" />
//                           Processing...
//                         </>
//                       ) : (
//                         <>
//                           Continue to Payment
//                           <ArrowRight className="w-4 h-4" />
//                         </>
//                       )
//                     ) : (
//                       <>
//                         Next
//                         <ArrowRight className="w-4 h-4" />
//                       </>
//                     )}
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ConsultationForm;
"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Leaf,
  X,
  Plus,
  Star,
  TrendingUp,
  Users,
  Zap,
  Sparkles,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { submitConsultationForm } from "@/lib/actions/consultation";
import { toast } from "sonner";

// Import refactored components
import { ConsultationFormData, serviceOptions, steps } from "./types";
import { useConsultationForm } from "./hooks/useConsultationForm";
import { StepIndicator } from "./components/StepIndicator";
import { DesktopLayout } from "./components/DesktopLayout";
import { MobileLayout } from "./components/MobileLayout";
import { SuccessModal } from "./components/SuccessModal";

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const ConsultationForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
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
    formData,
    updateField,
    handleArrayUpdate,
    validateStep,
    calculateTotal,
    totalSteps,
  } = useConsultationForm();

  const scrollContainerRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;

  // Scroll to top when step changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

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

  const goToStep = (stepNumber: number) => {
    // Don't lose payment data when navigating back from step 6
    if (currentStep === 6 && stepNumber < 6 && paymentInitialized) {
      console.log("Preserving payment state when navigating back");
    }

    // Allow navigation to previous steps or current step
    if (stepNumber <= currentStep) {
      setCurrentStep(stepNumber);
    } else {
      // For future steps, validate current step first
      if (validateStep()) {
        setCurrentStep(stepNumber);
      }
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
        preferredDate: new Date().toISOString().split("T")[0],
        timeZone: formData.timeZone,
        communicationPreference: formData.communicationPreference as
          | "email"
          | "phone"
          | "video-call"
          | "text",
        urgencyLevel: formData.urgencyLevel as
          | "3-5-days"
          | "1-week"
          | "2-weeks"
          | "1-month",

        // Additional
        additionalNotes: formData.additionalNotes,
        howDidYouHear: formData.howDidYouHear,
        agreeToTerms: formData.agreeToTerms,
        agreeToMarketing: formData.agreeToMarketing,
      };

      console.log("📝 Submitting consultation form:", submissionData);

      const result = await submitConsultationForm(submissionData);

      if (result.success && result.clientSecret) {
        console.log("✅ Consultation submitted successfully!");
        setConsultationId(result.consultationId!);
        setClientSecret(result.clientSecret);
        setPaymentInitialized(true);
        setCurrentStep(6); // Move to payment step
      } else {
        throw new Error(result.error || "Failed to submit consultation form");
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
    setShowSuccess(true);
    toast.success("Payment successful! Your consultation has been booked.");
    setTimeout(() => {
      window.location.href = "/consultation/success";
    }, 2000);
  };

  const navigationProps = {
    currentStep,
    totalSteps,
    prevStep,
    nextStep,
    handleSubmit,
    isSubmitting,
    goToStep,
  };

  const formProps = {
    formData,
    updateField,
    handleArrayUpdate,
    errors,
    calculateTotal,
    clientSecret,
    consultationId,
    handlePaymentSuccess,
  };

  const commonProps = {
    scrollContainerRef,
    submitError,
    ...formProps,
    ...navigationProps,
  };

  if (showSuccess) {
    return <SuccessModal />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Desktop Layout */}
      <DesktopLayout {...commonProps} />

      {/* Mobile Layout */}
      <MobileLayout {...commonProps} isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
};

export default ConsultationForm;
