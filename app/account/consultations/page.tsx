import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Calendar,
  Clock,
  FileText,
  User,
  Phone,
  Video,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

// Import server actions
import { getUserConsultations } from "@/lib/actions/consultation";
import {
  ConsultationCard,
  ConsultationStats,
  EmptyState,
} from "../components/Consultationscomponents";

// ✅ SERIALIZATION HELPER FUNCTION
function serializeConsultations(consultations: any[]) {
  return consultations.map((consultation) => ({
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
  }));
}

async function ConsultationsData() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const rawConsultations = await getUserConsultations(userId);

  // ✅ SERIALIZE DATA BEFORE PASSING TO CLIENT COMPONENTS
  const consultations = serializeConsultations(rawConsultations);

  // Calculate stats using serialized data
  const totalConsultations = consultations.length;
  const pendingConsultations = consultations.filter(
    (c) => c.status === "pending" || c.status === "confirmed"
  ).length;
  const completedConsultations = consultations.filter(
    (c) => c.status === "completed"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Consultations
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your wellness consultations and view progress
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            asChild
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            <Link href="/consultation">
              <Plus className="w-4 h-4 mr-2" />
              Book New Consultation
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <ConsultationStats
        total={totalConsultations}
        pending={pendingConsultations}
        completed={completedConsultations}
      />

      {/* Filters */}
      <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search consultations..."
                  className="pl-10 bg-white/50 dark:bg-gray-700/50"
                />
              </div>
            </div>

            <Select>
              <SelectTrigger className="w-full md:w-40 bg-white/50 dark:bg-gray-700/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-full md:w-40 bg-white/50 dark:bg-gray-700/50">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Consultations List */}
      {consultations.length === 0 ? (
        <EmptyState
          title="No consultations yet"
          description="Book your first consultation to start your wellness journey"
          actionLabel="Book Consultation"
          actionHref="/consultation"
          icon="🩺"
        />
      ) : (
        <div className="space-y-4">
          {consultations.map((consultation, index) => (
            // ✅ Remove motion.div from server component
            <div key={consultation._id}>
              <ConsultationCard consultation={consultation} />
            </div>
          ))}
        </div>
      )}

      {/* Help Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200/50 dark:border-blue-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Need Help with Your Consultation?
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Our wellness team is here to support you every step of the way.
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Support
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Video className="w-4 h-4 mr-2" />
                Live Chat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ConsultationsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      {/* Filters Skeleton */}
      <Skeleton className="h-16 rounded-lg" />

      {/* List Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function ConsultationsPage() {
  return (
    <Suspense fallback={<ConsultationsSkeleton />}>
      <ConsultationsData />
    </Suspense>
  );
}
