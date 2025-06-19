"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Heart,
  Target,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit3,
  MessageSquare,
  Filter,
  Search,
  Download,
  Plus,
  FileText,
  Settings,
  Loader2,
  TrendingUp,
  Users,
  RefreshCw,
} from "lucide-react";
import {
  getConsultations,
  updateConsultationStatus,
  getConsultationStats,
  addConsultationNote,
} from "@/lib/actions/consultation";

interface Consultation {
  _id: string;
  consultationNumber: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    age: number;
    gender: string;
    occupation?: string;
  };
  healthInfo: {
    currentWeight: number;
    goalWeight: number;
    height: string;
    activityLevel: string;
    dietaryRestrictions: string[];
    allergies?: string;
    medicalConditions?: string;
  };
  goalsAndLifestyle: {
    primaryGoals: string[];
    motivationLevel: number;
    budgetRange: string;
    biggestChallenges?: string[];
    currentEatingHabits?: string;
    mealPrepExperience?: string;
    cookingSkills?: string;
  };
  servicePreferences: {
    servicesInterested: string[];
    preferredDate: string;
    preferredConsultationTime: string;
    communicationPreference: string;
    urgencyLevel: string;
    timeZone?: string;
  };
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  totalAmount: number;
  scheduledAt?: string;
  createdAt: string;
  additionalNotes?: string;
  consultantNotes?: string;
  howDidYouHear?: string;
}

interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  revenue: number;
  recentConsultations: number;
}

const ConsultationCard: React.FC<{
  consultation: Consultation;
  onView: (consultation: Consultation) => void;
  onUpdateStatus: (id: string, status: string) => void;
  isUpdating: boolean;
}> = ({ consultation, onView, onUpdateStatus, isUpdating }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "rescheduled":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "refunded":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "border-l-red-500 bg-red-50";
      case "medium":
        return "border-l-amber-500 bg-amber-50";
      case "low":
        return "border-l-emerald-500 bg-emerald-50";
      default:
        return "border-l-gray-300 bg-white";
    }
  };

  const formatServiceName = (service: string) => {
    const serviceMap: { [key: string]: string } = {
      consultation: "Initial Consultation",
      "meal-plan": "Custom Meal Plan",
      coaching: "Ongoing Coaching",
    };
    return serviceMap[service] || service;
  };

  return (
    <div
      className={`rounded-2xl shadow-sm border-l-4 ${getUrgencyColor(
        consultation.servicePreferences.urgencyLevel
      )} p-6 hover:shadow-lg transition-all duration-200 border border-gray-100`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {consultation.personalInfo.firstName}{" "}
            {consultation.personalInfo.lastName}
          </h3>
          <p className="text-sm text-gray-500 font-mono">
            #{consultation.consultationNumber}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
              consultation.status
            )}`}
          >
            {consultation.status.charAt(0).toUpperCase() +
              consultation.status.slice(1)}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(
              consultation.paymentStatus
            )}`}
          >
            {consultation.paymentStatus.charAt(0).toUpperCase() +
              consultation.paymentStatus.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{consultation.personalInfo.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <span>{consultation.personalInfo.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>
            {new Date(
              consultation.servicePreferences.preferredDate
            ).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold text-emerald-600">
            ${consultation.totalAmount}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-1 mb-3">
          {consultation.servicePreferences.servicesInterested.map(
            (service, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-md font-medium"
              >
                {formatServiceName(service)}
              </span>
            )
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {consultation.goalsAndLifestyle.primaryGoals
            .slice(0, 3)
            .map((goal, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
              >
                {goal}
              </span>
            ))}
          {consultation.goalsAndLifestyle.primaryGoals.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
              +{consultation.goalsAndLifestyle.primaryGoals.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          <div>{new Date(consultation.createdAt).toLocaleDateString()}</div>
          <div className="font-medium text-gray-600">
            {consultation.servicePreferences.urgencyLevel
              .charAt(0)
              .toUpperCase() +
              consultation.servicePreferences.urgencyLevel.slice(1)}{" "}
            Priority
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onView(consultation)}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors flex items-center gap-1 font-medium"
          >
            <Eye className="w-3 h-3" />
            View
          </button>
          <select
            value={consultation.status}
            onChange={(e) => onUpdateStatus(consultation._id, e.target.value)}
            disabled={isUpdating}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none disabled:opacity-50"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rescheduled">Rescheduled</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const ConsultationDetailModal: React.FC<{
  consultation: Consultation | null;
  onClose: () => void;
  onAddNote: (consultationId: string, note: string) => void;
}> = ({ consultation, onClose, onAddNote }) => {
  const [newNote, setNewNote] = useState("");
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);

  if (!consultation) return null;

  const handleAddNote = async () => {
    if (newNote.trim()) {
      setIsAddingNote(true);
      await onAddNote(consultation._id, newNote);
      setNewNote("");
      setShowNoteForm(false);
      setIsAddingNote(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Consultation Details
              </h2>
              <p className="text-gray-600 font-mono">
                #{consultation.consultationNumber}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          <div className="p-6 space-y-8">
            {/* Personal Information */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-orange-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Full Name
                  </label>
                  <p className="text-gray-900 font-medium">
                    {consultation.personalInfo.firstName}{" "}
                    {consultation.personalInfo.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Age
                  </label>
                  <p className="text-gray-900">
                    {consultation.personalInfo.age} years old
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <p className="text-gray-900">
                    {consultation.personalInfo.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Phone
                  </label>
                  <p className="text-gray-900">
                    {consultation.personalInfo.phone}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Gender
                  </label>
                  <p className="text-gray-900 capitalize">
                    {consultation.personalInfo.gender}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Occupation
                  </label>
                  <p className="text-gray-900">
                    {consultation.personalInfo.occupation || "Not specified"}
                  </p>
                </div>
              </div>
            </section>

            {/* Health Information */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Health Information
              </h3>
              <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <label className="text-sm font-medium text-gray-600">
                      Current Weight
                    </label>
                    <p className="text-2xl font-bold text-gray-900">
                      {consultation.healthInfo.currentWeight}
                    </p>
                    <p className="text-xs text-gray-500">lbs</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <label className="text-sm font-medium text-gray-600">
                      Goal Weight
                    </label>
                    <p className="text-2xl font-bold text-emerald-600">
                      {consultation.healthInfo.goalWeight}
                    </p>
                    <p className="text-xs text-gray-500">lbs</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <label className="text-sm font-medium text-gray-600">
                      Height
                    </label>
                    <p className="text-2xl font-bold text-gray-900">
                      {consultation.healthInfo.height}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Activity Level
                  </label>
                  <p className="text-gray-900 capitalize font-medium">
                    {consultation.healthInfo.activityLevel.replace("-", " ")}
                  </p>
                </div>

                {consultation.healthInfo.dietaryRestrictions.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Dietary Restrictions
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {consultation.healthInfo.dietaryRestrictions.map(
                        (restriction, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium"
                          >
                            {restriction}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {consultation.healthInfo.allergies && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Allergies
                    </label>
                    <p className="text-gray-900 bg-white p-3 rounded-lg">
                      {consultation.healthInfo.allergies}
                    </p>
                  </div>
                )}

                {consultation.healthInfo.medicalConditions && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Medical Conditions
                    </label>
                    <p className="text-gray-900 bg-white p-3 rounded-lg">
                      {consultation.healthInfo.medicalConditions}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Goals & Lifestyle */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" />
                Goals & Lifestyle
              </h3>
              <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Primary Goals
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {consultation.goalsAndLifestyle.primaryGoals.map(
                      (goal, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium"
                        >
                          {goal}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-600">
                      Motivation Level
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full"
                          style={{
                            width: `${
                              consultation.goalsAndLifestyle.motivationLevel *
                              10
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {consultation.goalsAndLifestyle.motivationLevel}/10
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-600">
                      Budget Range
                    </label>
                    <p className="text-gray-900 font-medium">
                      $
                      {consultation.goalsAndLifestyle.budgetRange.replace(
                        "-",
                        " - "
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Service Preferences */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Service Preferences
              </h3>
              <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Services Interested
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {consultation.servicePreferences.servicesInterested.map(
                      (service, index) => (
                        <span
                          key={index}
                          className="px-3 py-2 bg-orange-100 text-orange-700 text-sm rounded-lg font-medium"
                        >
                          {service === "consultation"
                            ? "Initial Consultation"
                            : service === "meal-plan"
                              ? "Custom Meal Plan"
                              : service === "coaching"
                                ? "Ongoing Coaching"
                                : service}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-600">
                      Preferred Date
                    </label>
                    <p className="text-gray-900 font-medium">
                      {new Date(
                        consultation.servicePreferences.preferredDate
                      ).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-600">
                      Preferred Time
                    </label>
                    <p className="text-gray-900 font-medium">
                      {
                        consultation.servicePreferences
                          .preferredConsultationTime
                      }
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-600">
                      Communication
                    </label>
                    <p className="text-gray-900 font-medium capitalize">
                      {consultation.servicePreferences.communicationPreference.replace(
                        "-",
                        " "
                      )}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-600">
                      Urgency Level
                    </label>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        consultation.servicePreferences.urgencyLevel === "high"
                          ? "bg-red-100 text-red-800"
                          : consultation.servicePreferences.urgencyLevel ===
                              "medium"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {consultation.servicePreferences.urgencyLevel
                        .charAt(0)
                        .toUpperCase() +
                        consultation.servicePreferences.urgencyLevel.slice(
                          1
                        )}{" "}
                      Priority
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Additional Information */}
            {(consultation.additionalNotes || consultation.howDidYouHear) && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-500" />
                  Additional Information
                </h3>
                <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                  {consultation.additionalNotes && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Additional Notes
                      </label>
                      <p className="text-gray-900 bg-white p-4 rounded-lg">
                        {consultation.additionalNotes}
                      </p>
                    </div>
                  )}
                  {consultation.howDidYouHear && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        How did they hear about us?
                      </label>
                      <p className="text-gray-900 font-medium">
                        {consultation.howDidYouHear}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Consultant Notes Section */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-orange-500" />
                  Consultant Notes
                </h3>
                <button
                  onClick={() => setShowNoteForm(!showNoteForm)}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm transition-colors flex items-center gap-2 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Note
                </button>
              </div>

              {showNoteForm && (
                <div className="mb-6 p-6 border border-gray-200 rounded-xl bg-white">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add your consultation notes here..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleAddNote}
                      disabled={isAddingNote || !newNote.trim()}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isAddingNote ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      {isAddingNote ? "Saving..." : "Save Note"}
                    </button>
                    <button
                      onClick={() => setShowNoteForm(false)}
                      className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {consultation.consultantNotes && (
                <div className="p-6 bg-orange-50 border border-orange-200 rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-orange-800">
                      Consultant Note
                    </span>
                    <span className="text-xs text-orange-600">
                      {new Date(consultation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-orange-900">
                    {consultation.consultantNotes}
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminConsultationDashboard: React.FC = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] =
    useState<Consultation | null>(null);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    revenue: 0,
    recentConsultations: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
    urgency: "",
    search: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      console.log("📊 Fetching consultation data...");

      const [consultationsData, statsData] = await Promise.all([
        getConsultations(filters),
        getConsultationStats(),
      ]);

      setConsultations(
        consultationsData.map((c: any) => ({
          ...c,
          scheduledAt:
            c.scheduledAt instanceof Date
              ? c.scheduledAt.toISOString()
              : c.scheduledAt,
        }))
      );
      setStats(statsData);

      console.log(`✅ Loaded ${consultationsData.length} consultations`);
    } catch (error) {
      console.error("❌ Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const filteredConsultations = consultations.filter((consultation) => {
    const matchesStatus =
      !filters.status || consultation.status === filters.status;
    const matchesPaymentStatus =
      !filters.paymentStatus ||
      consultation.paymentStatus === filters.paymentStatus;
    const matchesUrgency =
      !filters.urgency ||
      consultation.servicePreferences.urgencyLevel === filters.urgency;
    const matchesSearch =
      !filters.search ||
      consultation.personalInfo.firstName
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      consultation.personalInfo.lastName
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      consultation.personalInfo.email
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      consultation.consultationNumber
        .toLowerCase()
        .includes(filters.search.toLowerCase());

    return (
      matchesStatus && matchesPaymentStatus && matchesUrgency && matchesSearch
    );
  });

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      setUpdating(id);
      console.log(`🔄 Updating consultation ${id} status to ${status}`);

      const result = await updateConsultationStatus(id, status as any);

      if (result.success) {
        setConsultations((prev) =>
          prev.map((consultation) =>
            consultation._id === id
              ? { ...consultation, status: status as any }
              : consultation
          )
        );
        console.log("✅ Status updated successfully");
      } else {
        console.error("❌ Failed to update status:", result.error);
      }
    } catch (error) {
      console.error("❌ Error updating status:", error);
    } finally {
      setUpdating(null);
    }
  };

  const handleAddNote = async (consultationId: string, note: string) => {
    try {
      console.log(`📝 Adding note to consultation ${consultationId}`);

      const result = await addConsultationNote(consultationId, "admin", note);

      if (result.success) {
        // Update local state
        setConsultations((prev) =>
          prev.map((consultation) =>
            consultation._id === consultationId
              ? { ...consultation, consultantNotes: note }
              : consultation
          )
        );

        // Update selected consultation if it's the same one
        if (selectedConsultation?._id === consultationId) {
          setSelectedConsultation((prev) =>
            prev ? { ...prev, consultantNotes: note } : null
          );
        }

        console.log("✅ Note added successfully");
      } else {
        console.error("❌ Failed to add note:", result.error);
      }
    } catch (error) {
      console.error("❌ Error adding note:", error);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading consultations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Consultation Management
              </h1>
              <p className="text-gray-600">
                Manage and track all nutrition consultations
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-amber-600">
                  {stats.pending}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.confirmed}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {stats.completed}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${stats.revenue}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.recentConsultations}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search consultations..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>

            <select
              value={filters.paymentStatus}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  paymentStatus: e.target.value,
                }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            >
              <option value="">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            <select
              value={filters.urgency}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, urgency: e.target.value }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            >
              <option value="">All Urgency</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Consultations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredConsultations.map((consultation) => (
            <ConsultationCard
              key={consultation._id}
              consultation={consultation}
              onView={setSelectedConsultation}
              onUpdateStatus={handleUpdateStatus}
              isUpdating={updating === consultation._id}
            />
          ))}
        </div>

        {filteredConsultations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No consultations found
            </h3>
            <p className="text-gray-600">
              {consultations.length === 0
                ? "No consultations have been submitted yet."
                : "Try adjusting your search criteria or filters."}
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <ConsultationDetailModal
        consultation={selectedConsultation}
        onClose={() => setSelectedConsultation(null)}
        onAddNote={handleAddNote}
      />
    </div>
  );
};

export default AdminConsultationDashboard;
