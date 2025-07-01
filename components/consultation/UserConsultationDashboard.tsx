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
  FileText,
  Download,
  Eye,
  MessageSquare,
  AlertCircle,
  Loader2,
  Bell,
  BellOff,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import {
  getUserConsultations,
  getUserConsultationNotes,
  markConsultationNoteAsRead,
  getUserMealPlanFiles,
  downloadMealPlanFile,
} from "@/lib/actions/consultation";
import { toast } from "sonner";

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

interface UserConsultationNote {
  _id: string;
  consultation: string;
  consultant: {
    firstName: string;
    lastName: string;
  };
  title: string;
  content: string;
  noteType: "nutrition" | "progress" | "recommendation" | "general";
  isVisible: boolean;
  readByUser: boolean;
  sentAt: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface MealPlanFile {
  _id: string;
  consultation: {
    consultationNumber: string;
  };
  uploadedBy: {
    firstName: string;
    lastName: string;
  };
  fileName: string;
  fileUrl: string;
  fileKey: string;
  fileSize: number;
  fileType: string;
  title: string;
  description?: string;
  nutritionNotes?: string;
  downloadCount: number;
  isActive: boolean;
  expiresAt?: string;
  uploadedAt: string;
  lastDownloadedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const ConsultationCard: React.FC<{
  consultation: Consultation;
  onView: (consultation: Consultation) => void;
  unreadNotesCount: number;
  mealPlanFilesCount: number;
}> = ({ consultation, onView, unreadNotesCount, mealPlanFilesCount }) => {
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

  const formatServiceName = (service: string) => {
    const serviceMap: { [key: string]: string } = {
      consultation: "Initial Consultation",
      "meal-plan": "Custom Meal Plan",
      coaching: "Ongoing Coaching",
    };
    return serviceMap[service] || service;
  };

  return (
    <div className="rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 bg-white relative">
      {/* Notification badges */}
      {(unreadNotesCount > 0 || mealPlanFilesCount > 0) && (
        <div className="absolute -top-2 -right-2 flex gap-2">
          {unreadNotesCount > 0 && (
            <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Bell className="w-3 h-3" />
              {unreadNotesCount} note{unreadNotesCount > 1 ? "s" : ""}
            </div>
          )}
          {mealPlanFilesCount > 0 && (
            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {mealPlanFilesCount} file{mealPlanFilesCount > 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Consultation #{consultation.consultationNumber}
          </h3>
          <p className="text-sm text-gray-500">
            {new Date(consultation.createdAt).toLocaleDateString()}
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
          <div className="font-medium text-gray-600">
            {consultation.servicePreferences.urgencyLevel
              .charAt(0)
              .toUpperCase() +
              consultation.servicePreferences.urgencyLevel.slice(1)}{" "}
            Priority
          </div>
        </div>
        <button
          onClick={() => onView(consultation)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm transition-colors flex items-center gap-2 font-medium"
        >
          <Eye className="w-3 h-3" />
          View Details
        </button>
      </div>
    </div>
  );
};

const ConsultationDetailModal: React.FC<{
  consultation: Consultation | null;
  onClose: () => void;
  userId: string;
}> = ({ consultation, onClose, userId }) => {
  const [userNotes, setUserNotes] = useState<UserConsultationNote[]>([]);
  const [mealPlanFiles, setMealPlanFiles] = useState<MealPlanFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Load user notes and meal plan files when consultation changes
  React.useEffect(() => {
    if (consultation?._id) {
      loadUserNotesAndFiles();
    }
  }, [consultation?._id]);

  const loadUserNotesAndFiles = async () => {
    if (!consultation?._id) return;

    setLoading(true);
    try {
      const [notes, files] = await Promise.all([
        getUserConsultationNotes(consultation._id, userId),
        getUserMealPlanFiles(userId, consultation._id),
      ]);

      setUserNotes(
        (notes as any[]).map((note) => ({
          ...note,
          consultant:
            typeof note.consultant === "string"
              ? { firstName: note.consultant, lastName: "" }
              : note.consultant,
        }))
      );
      setMealPlanFiles(
        (files as any[]).map((file) => ({
          ...file,
          consultation:
            typeof file.consultation === "string"
              ? { consultationNumber: file.consultation }
              : file.consultation,
        }))
      );
    } catch (error) {
      console.error("Error loading user notes and files:", error);
      toast.error("Failed to load consultation data");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (noteId: string) => {
    setMarkingAsRead(noteId);
    try {
      const result = await markConsultationNoteAsRead(noteId, userId);
      if (result.success) {
        setUserNotes((prev) =>
          prev.map((note) =>
            note._id === noteId
              ? { ...note, readByUser: true, readAt: new Date().toISOString() }
              : note
          )
        );
        toast.success("Note marked as read");
      } else {
        toast.error(result.error || "Failed to mark note as read");
      }
    } catch (error) {
      console.error("Error marking note as read:", error);
      toast.error("Failed to mark note as read");
    } finally {
      setMarkingAsRead(null);
    }
  };

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    setDownloading(fileId);
    try {
      const result = await downloadMealPlanFile(fileId, userId);
      if (result.success && result.fileUrl) {
        // Create a temporary link and trigger download
        const link = document.createElement("a");
        link.href = result.fileUrl;
        link.download = fileName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Update download count in local state
        setMealPlanFiles((prev) =>
          prev.map((file) =>
            file._id === fileId
              ? {
                  ...file,
                  downloadCount: file.downloadCount + 1,
                  lastDownloadedAt: new Date().toISOString(),
                }
              : file
          )
        );

        toast.success("File download started");
      } else {
        toast.error(result.error || "Failed to download file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    } finally {
      setDownloading(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("excel") || fileType.includes("spreadsheet"))
      return "📊";
    return "📁";
  };

  const getNoteTypeColor = (noteType: string) => {
    switch (noteType) {
      case "nutrition":
        return "bg-green-100 text-green-800 border-green-200";
      case "progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "recommendation":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!consultation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
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
              <AlertCircle className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          <div className="p-6 space-y-8">
            {/* Quick Status Overview */}
            <section>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">
                    {consultation.status}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <DollarSign className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Payment</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">
                    {consultation.paymentStatus}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">
                    Preferred Date
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(
                      consultation.servicePreferences.preferredDate
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </section>

            {/* Notes from Consultant */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Messages from Your Consultant
                {userNotes.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {userNotes.length}
                  </span>
                )}
              </h3>

              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">Loading messages...</p>
                </div>
              ) : userNotes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No messages from your consultant yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userNotes.map((note) => (
                    <div
                      key={note._id}
                      className={`p-6 rounded-xl border-l-4 ${
                        note.readByUser
                          ? "bg-white border-gray-200 border-l-gray-300"
                          : "bg-blue-50 border-blue-200 border-l-blue-500"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">
                            {note.title}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getNoteTypeColor(
                              note.noteType
                            )}`}
                          >
                            {note.noteType}
                          </span>
                          {!note.readByUser && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                              New
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-xs text-gray-500">
                              {new Date(note.sentAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400">
                              From: {note.consultant.firstName}{" "}
                              {note.consultant.lastName}
                            </div>
                          </div>
                          {!note.readByUser && (
                            <button
                              onClick={() => handleMarkAsRead(note._id)}
                              disabled={markingAsRead === note._id}
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                            >
                              {markingAsRead === note._id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Mark as Read"
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {note.content}
                      </p>
                      {note.readAt && (
                        <div className="text-xs text-green-600 mt-2">
                          Read on: {new Date(note.readAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Meal Plan Files */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-500" />
                Your Meal Plans
                {mealPlanFiles.length > 0 && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {mealPlanFiles.length}
                  </span>
                )}
              </h3>

              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">Loading meal plans...</p>
                </div>
              ) : mealPlanFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No meal plans available yet</p>
                  <p className="text-sm">
                    Your consultant will upload personalized meal plans here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mealPlanFiles.map((file) => (
                    <div
                      key={file._id}
                      className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">
                            {getFileIcon(file.fileType)}
                          </span>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {file.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {file.fileName} • {formatFileSize(file.fileSize)}
                            </p>
                            {file.description && (
                              <p className="text-sm text-gray-700 mt-1">
                                {file.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleDownloadFile(file._id, file.fileName)
                          }
                          disabled={downloading === file._id}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {downloading === file._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          {downloading === file._id
                            ? "Downloading..."
                            : "Download"}
                        </button>
                      </div>

                      {file.nutritionNotes && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <span className="text-sm font-medium text-green-800">
                            Special Notes:
                          </span>
                          <p className="text-sm text-green-700 mt-1 whitespace-pre-wrap">
                            {file.nutritionNotes}
                          </p>
                        </div>
                      )}

                      <div className="mt-3 text-xs text-gray-500">
                        Uploaded:{" "}
                        {new Date(file.uploadedAt).toLocaleDateString()} by{" "}
                        {file.uploadedBy.firstName} {file.uploadedBy.lastName}
                        {file.downloadCount > 0 && (
                          <span className="ml-3">
                            Downloaded: {file.downloadCount} time
                            {file.downloadCount > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserConsultationDashboard: React.FC = () => {
  const { userId } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] =
    useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [notesCount, setNotesCount] = useState<Record<string, number>>({});
  const [filesCount, setFilesCount] = useState<Record<string, number>>({});

  useEffect(() => {
    if (userId) {
      loadConsultations();
    }
  }, [userId]);

  const loadConsultations = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const consultationsData = await getUserConsultations(userId);
      setConsultations(
        (consultationsData as any[]).map((consultation) => ({
          ...consultation,
          scheduledAt:
            consultation.scheduledAt instanceof Date
              ? consultation.scheduledAt.toISOString()
              : consultation.scheduledAt,
        }))
      );

      // Load notes and files count for each consultation
      const notesCountMap: Record<string, number> = {};
      const filesCountMap: Record<string, number> = {};

      await Promise.all(
        consultationsData.map(async (consultation) => {
          try {
            const [notes, files] = await Promise.all([
              getUserConsultationNotes(consultation._id, userId),
              getUserMealPlanFiles(userId, consultation._id),
            ]);

            notesCountMap[consultation._id] = (notes as any[])
              .map((note) => ({
                ...note,
                consultant:
                  typeof note.consultant === "string"
                    ? { firstName: note.consultant, lastName: "" }
                    : note.consultant,
              }))
              .filter((note) => !note.readByUser).length;
            filesCountMap[consultation._id] = (files as any[]).map((file) => ({
              ...file,
              consultation:
                typeof file.consultation === "string"
                  ? { consultationNumber: file.consultation }
                  : file.consultation,
            })).length;
          } catch (error) {
            console.error(
              `Error loading data for consultation ${consultation._id}:`,
              error
            );
          }
        })
      );

      setNotesCount(notesCountMap);
      setFilesCount(filesCountMap);
    } catch (error) {
      console.error("Error loading consultations:", error);
      toast.error("Failed to load consultations");
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Please Sign In
          </h2>
          <p className="text-gray-600">
            You need to be signed in to view your consultations.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your consultations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Consultations
          </h1>
          <p className="text-gray-600">
            Track your nutrition consultations, view notes from your consultant,
            and download meal plans
          </p>
        </div>

        {/* Consultations Grid */}
        {consultations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Consultations Yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't booked any consultations yet. Start your health
              journey today!
            </p>
            <a
              href="/consultation"
              className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              Book Your First Consultation
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {consultations.map((consultation) => (
              <ConsultationCard
                key={consultation._id}
                consultation={consultation}
                onView={setSelectedConsultation}
                unreadNotesCount={notesCount[consultation._id] || 0}
                mealPlanFilesCount={filesCount[consultation._id] || 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <ConsultationDetailModal
        consultation={selectedConsultation}
        onClose={() => setSelectedConsultation(null)}
        userId={userId || ""}
      />
    </div>
  );
};

export default UserConsultationDashboard;
