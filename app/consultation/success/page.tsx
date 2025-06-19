"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  Calendar,
  Clock,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  ArrowRight,
  Download,
  Star,
  Heart,
  Sparkles,
  Gift,
} from "lucide-react";

interface ConsultationData {
  consultationNumber: string;
  customerName: string;
  email: string;
  services: string[];
  totalAmount: number;
  status: string;
  scheduledAt?: string;
  nextSteps: string[];
}

const ConsultationSuccessPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [consultation, setConsultation] = useState<ConsultationData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [showSurvey, setShowSurvey] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const consultationId = searchParams.get("id");

  useEffect(() => {
    const fetchConsultationData = async () => {
      if (!consultationId) {
        router.push("/");
        return;
      }

      // Simulate API call - replace with actual implementation
      setTimeout(() => {
        setConsultation({
          consultationNumber: "CONS-000001",
          customerName: "Emma Wilson",
          email: "emma.wilson@email.com",
          services: ["Initial Consultation", "Custom Meal Plan"],
          totalAmount: 40,
          status: "confirmed",
          scheduledAt: "2024-01-15T14:00:00Z",
          nextSteps: [
            "Check your email for confirmation details",
            "Complete the pre-consultation questionnaire we'll send you",
            "Prepare your health goals and questions",
            "Join your scheduled consultation session",
          ],
        });
        setLoading(false);
      }, 1000);
    };

    fetchConsultationData();
  }, [consultationId, router]);

  const handleFeedbackSubmit = async () => {
    // Submit feedback logic here
    console.log("Feedback submitted:", { rating, feedback });
    setShowSurvey(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your consultation details...</p>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Consultation Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the consultation you're looking for.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-6 relative">
            <CheckCircle className="w-12 h-12 text-white" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-yellow-800" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Consultation Booked Successfully! 🎉
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Thank you for choosing Nutra-Vive! Your journey to better health
            starts now.
          </p>
        </div>

        {/* Consultation Details Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-emerald-200/50 mb-8">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-8 text-white rounded-t-3xl">
            <h2 className="text-2xl font-bold mb-2">
              Your Consultation Details
            </h2>
            <p className="text-emerald-100">
              Confirmation Number: {consultation.consultationNumber}
            </p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Booking Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="text-gray-900 font-medium">
                      {consultation.customerName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-900">{consultation.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Paid:</span>
                    <span className="text-emerald-600 font-bold">
                      ${consultation.totalAmount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                      {consultation.status}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-600" />
                  Services Included
                </h3>
                <div className="space-y-2">
                  {consultation.services.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-900">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {consultation.scheduledAt && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Scheduled Session
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-900">
                      {new Date(consultation.scheduledAt).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-900">
                      {new Date(consultation.scheduledAt).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                          timeZoneName: "short",
                        }
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-orange-600" />
                What Happens Next?
              </h3>
              <div className="space-y-3">
                {consultation.nextSteps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                  >
                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-orange-900">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.print()}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Confirmation
              </button>
              <button
                onClick={() => setShowSurvey(true)}
                className="flex-1 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Star className="w-4 h-4" />
                Rate Your Experience
              </button>
              <button
                onClick={() => router.push("/shop")}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4" />
                Shop Our Products
              </button>
            </div>
          </div>
        </div>

        {/* Additional Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Contact Information */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-emerald-200/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Need Help?
            </h3>
            <p className="text-gray-600 mb-4">
              Our support team is here to help with any questions about your
              consultation.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">support@nutravive.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">(555) 123-4567</span>
              </div>
            </div>
          </div>

          {/* Preparation Tips */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-emerald-200/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Prepare for Success
            </h3>
            <p className="text-gray-600 mb-4">
              Make the most of your consultation by coming prepared.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• List your current health goals</li>
              <li>• Note any food allergies or restrictions</li>
              <li>• Prepare questions about nutrition</li>
              <li>• Have a quiet space for your call</li>
            </ul>
          </div>
        </div>

        {/* Survey Modal */}
        {showSurvey && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Rate Your Booking Experience
              </h3>

              <div className="mb-4">
                <p className="text-gray-600 mb-3">
                  How was your booking process?
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 transition-colors ${
                        star <= rating ? "text-yellow-500" : "text-gray-300"
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Comments (optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  placeholder="Tell us about your experience..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSurvey(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleFeedbackSubmit}
                  disabled={rating === 0}
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-8 border-t border-emerald-200">
          <p className="text-gray-600">
            Thank you for choosing Nutra-Vive. We're excited to support your
            wellness journey! 🌿
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsultationSuccessPage;
