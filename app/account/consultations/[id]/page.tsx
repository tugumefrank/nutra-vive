import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import {
  Calendar,
  Clock,
  FileText,
  User,
  Phone,
  Video,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  MessageSquare,
  Download,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

// Import server actions
import { getConsultationById } from "@/lib/actions/consultation";
import ConsultationNotes from "../components/ConsultationNotes";
import MealPlanViewer from "../components/MealPlanViewer";
import { ConsultationTimeline } from "../components/ConsultationTimeline";
import { HealthMetrics } from "../components/HealthMetrics";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// ✅ SERIALIZATION HELPER FUNCTION
function serializeConsultation(consultation: any) {
  if (!consultation) return null;

  return {
    _id: consultation._id?.toString() || consultation._id,
    consultationNumber: consultation.consultationNumber || "",
    status: consultation.status || "pending",
    paymentStatus: consultation.paymentStatus || "pending",
    totalAmount: consultation.totalAmount || 0,
    currency: consultation.currency || "USD",

    // Serialize personal info
    personalInfo: {
      firstName: consultation.personalInfo?.firstName || "",
      lastName: consultation.personalInfo?.lastName || "",
      email: consultation.personalInfo?.email || "",
      phone: consultation.personalInfo?.phone || "",
      age: consultation.personalInfo?.age || 0,
      gender: consultation.personalInfo?.gender || "",
      occupation: consultation.personalInfo?.occupation || "",
    },

    // Serialize health info
    healthInfo: {
      currentWeight: consultation.healthInfo?.currentWeight || 0,
      goalWeight: consultation.healthInfo?.goalWeight || 0,
      height: consultation.healthInfo?.height || "",
      activityLevel: consultation.healthInfo?.activityLevel || "",
      dietaryRestrictions: consultation.healthInfo?.dietaryRestrictions || [],
      allergies: consultation.healthInfo?.allergies || "",
      medicalConditions: consultation.healthInfo?.medicalConditions || "",
      currentMedications: consultation.healthInfo?.currentMedications || "",
      previousDietExperience:
        consultation.healthInfo?.previousDietExperience || "",
    },

    // Serialize goals and lifestyle
    goalsAndLifestyle: {
      primaryGoals: consultation.goalsAndLifestyle?.primaryGoals || [],
      motivationLevel: consultation.goalsAndLifestyle?.motivationLevel || 5,
      biggestChallenges:
        consultation.goalsAndLifestyle?.biggestChallenges || [],
      currentEatingHabits:
        consultation.goalsAndLifestyle?.currentEatingHabits || "",
      mealPrepExperience:
        consultation.goalsAndLifestyle?.mealPrepExperience || "none",
      cookingSkills: consultation.goalsAndLifestyle?.cookingSkills || "basic",
      budgetRange: consultation.goalsAndLifestyle?.budgetRange || "under-50",
    },

    // Serialize service preferences
    servicePreferences: {
      servicesInterested:
        consultation.servicePreferences?.servicesInterested || [],
      preferredConsultationTime:
        consultation.servicePreferences?.preferredConsultationTime || "",
      preferredDate: consultation.servicePreferences?.preferredDate || "",
      timeZone: consultation.servicePreferences?.timeZone || "",
      communicationPreference:
        consultation.servicePreferences?.communicationPreference || "email",
      urgencyLevel: consultation.servicePreferences?.urgencyLevel || "1-week",
    },

    additionalNotes: consultation.additionalNotes || "",
    howDidYouHear: consultation.howDidYouHear || "",
    agreeToTerms: consultation.agreeToTerms || false,
    agreeToMarketing: consultation.agreeToMarketing || false,
    paymentIntentId: consultation.paymentIntentId || "",
    consultantNotes: consultation.consultantNotes || "",
    followUpRequired: consultation.followUpRequired || false,

    // Serialize dates as strings
    createdAt: consultation.createdAt?.toString
      ? consultation.createdAt.toString()
      : consultation.createdAt,
    updatedAt: consultation.updatedAt?.toString
      ? consultation.updatedAt.toString()
      : consultation.updatedAt,
    scheduledAt: consultation.scheduledAt?.toString
      ? consultation.scheduledAt.toString()
      : consultation.scheduledAt,
    completedAt: consultation.completedAt?.toString
      ? consultation.completedAt.toString()
      : consultation.completedAt,
    cancelledAt: consultation.cancelledAt?.toString
      ? consultation.cancelledAt.toString()
      : consultation.cancelledAt,
  };
}

async function ConsultationData({ id }: { id: string }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const rawConsultation = await getConsultationById(id);

  if (!rawConsultation) {
    notFound();
  }

  // ✅ SERIALIZE DATA BEFORE PASSING TO CLIENT COMPONENTS
  const consultation = serializeConsultation(rawConsultation);

  if (!consultation) {
    notFound();
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          color:
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          icon: CheckCircle,
          iconColor: "text-green-600",
        };
      case "confirmed":
        return {
          color:
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          icon: Clock,
          iconColor: "text-blue-600",
        };
      case "pending":
        return {
          color:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          icon: AlertCircle,
          iconColor: "text-yellow-600",
        };
      default:
        return {
          color:
            "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
          icon: Clock,
          iconColor: "text-gray-600",
        };
    }
  };

  const statusConfig = getStatusConfig(consultation.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="self-start">
          <Link href="/account/consultations">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Consultations
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Consultation #{consultation.consultationNumber}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {consultation.personalInfo.firstName}{" "}
              {consultation.personalInfo.lastName}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <Badge className={`${statusConfig.color} w-fit`}>
              <StatusIcon
                className={`w-4 h-4 mr-2 ${statusConfig.iconColor}`}
              />
              {consultation.status}
            </Badge>
            <span className="text-lg sm:text-sm font-medium text-gray-900 dark:text-white">
              ${consultation.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Status
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {consultation.status}
                </p>
              </div>
              <StatusIcon className={`w-8 h-8 ${statusConfig.iconColor}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Created
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Date(consultation.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Services
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {consultation.servicePreferences.servicesInterested.length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Consultation Notes */}
          <ConsultationNotes consultationId={consultation._id} />

          {/* Health Metrics */}
          <HealthMetrics consultation={consultation} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Meal Plan Files */}
          <MealPlanViewer consultationId={consultation._id} />

          {/* Consultation Timeline */}
          <ConsultationTimeline consultation={consultation} />
        </div>
      </div>

      {/* Full Width Content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Personal Information */}
        <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                  Name
                </p>
                <p className="text-gray-900 dark:text-white">
                  {consultation.personalInfo.firstName}{" "}
                  {consultation.personalInfo.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                  Email
                </p>
                <p className="text-gray-900 dark:text-white">
                  {consultation.personalInfo.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                  Phone
                </p>
                <p className="text-gray-900 dark:text-white">
                  {consultation.personalInfo.phone}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                  Age
                </p>
                <p className="text-gray-900 dark:text-white">
                  {consultation.personalInfo.age} years old
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                  Gender
                </p>
                <p className="text-gray-900 dark:text-white capitalize">
                  {consultation.personalInfo.gender}
                </p>
              </div>
              {consultation.personalInfo.occupation && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                    Occupation
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {consultation.personalInfo.occupation}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Services & Preferences */}
        <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Services & Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-3">
                  Services Requested
                </p>
                <div className="flex flex-wrap gap-2">
                  {consultation.servicePreferences.servicesInterested.map(
                    (service, index) => (
                      <Badge
                        key={`${service}-${index}`}
                        variant="outline"
                        className="text-sm"
                      >
                        {service
                          .replace("-", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Badge>
                    )
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                    Preferred Date
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(
                      consultation.servicePreferences.preferredDate
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                    Preferred Time
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {consultation.servicePreferences.preferredConsultationTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                    Communication
                  </p>
                  <p className="text-gray-900 dark:text-white capitalize">
                    {consultation.servicePreferences.communicationPreference.replace(
                      "-",
                      " "
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                    Urgency Level
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {consultation.servicePreferences.urgencyLevel.replace(
                      "-",
                      " "
                    )}
                  </p>
                </div>
                {consultation.servicePreferences.timeZone && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                      Time Zone
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {consultation.servicePreferences.timeZone}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
        <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
          <MessageSquare className="w-4 h-4 mr-2" />
          Contact Support
        </Button>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download Summary
        </Button>
        <Button variant="outline" asChild>
          <Link href="/consultation">
            <Calendar className="w-4 h-4 mr-2" />
            Book Another Consultation
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ConsultationDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-32" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>

      {/* Overview Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>

      {/* Full Width Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    </div>
  );
}

export default async function ConsultationDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<ConsultationDetailSkeleton />}>
      <ConsultationData id={id} />
    </Suspense>
  );
}

export const metadata = {
  title: "Consultation Details - Nutra-Vive",
  description:
    "View detailed information about your consultation including notes and meal plans.",
};
