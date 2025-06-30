import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Package,
  Heart,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Stethoscope,
  Gift,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

// Import server actions
import { getCurrentUser } from "@/lib/actions/userServerActions";
import { getUserOrders } from "@/lib/actions/orderServerActions";
import { getUserConsultations } from "@/lib/actions/consultation";
import { getFavoriteStats } from "@/lib/actions/favouriteServerActions";
import {
  QuickActions,
  RecentConsultationsCard,
  RecentOrdersCard,
  StatCard,
} from "./components/DashboardComponets";

// ✅ SERIALIZATION HELPER FUNCTIONS
function serializeOrders(orders: any[]) {
  return orders.map((order) => ({
    _id: order._id?.toString() || order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    totalAmount: order.totalAmount || 0,
    subtotal: order.subtotal || 0,
    taxAmount: order.taxAmount || 0,
    shippingAmount: order.shippingAmount || 0,
    discountAmount: order.discountAmount || 0,
    currency: order.currency || "USD",
    email: order.email,

    // Remove or serialize ObjectIds from appliedPromotion
    appliedPromotion: order.appliedPromotion
      ? {
          promotionId: order.appliedPromotion.promotionId?.toString(),
          code: order.appliedPromotion.code,
          name: order.appliedPromotion.name,
          discountAmount: order.appliedPromotion.discountAmount || 0,
          discountType: order.appliedPromotion.discountType,
        }
      : undefined,

    // Serialize addresses
    shippingAddress: order.shippingAddress
      ? {
          firstName: order.shippingAddress.firstName || "",
          lastName: order.shippingAddress.lastName || "",
          company: order.shippingAddress.company,
          address1: order.shippingAddress.address1 || "",
          address2: order.shippingAddress.address2,
          city: order.shippingAddress.city || "",
          province: order.shippingAddress.province || "",
          country: order.shippingAddress.country || "",
          zip: order.shippingAddress.zip || "",
          phone: order.shippingAddress.phone,
        }
      : undefined,

    billingAddress: order.billingAddress
      ? {
          firstName: order.billingAddress.firstName || "",
          lastName: order.billingAddress.lastName || "",
          company: order.billingAddress.company,
          address1: order.billingAddress.address1 || "",
          address2: order.billingAddress.address2,
          city: order.billingAddress.city || "",
          province: order.billingAddress.province || "",
          country: order.billingAddress.country || "",
          zip: order.billingAddress.zip || "",
          phone: order.billingAddress.phone,
        }
      : undefined,

    // Serialize items array
    items: (order.items || []).map((item: any) => ({
      _id: item._id?.toString(),
      product: item.product?.toString ? item.product.toString() : item.product,
      productName: item.productName || "",
      productSlug: item.productSlug || "",
      productImage: item.productImage || "",
      quantity: item.quantity || 0,
      price: item.price || 0,
      originalPrice: item.originalPrice,
      totalPrice: item.totalPrice || 0,
      appliedDiscount: item.appliedDiscount,
    })),

    notes: order.notes,
    trackingNumber: order.trackingNumber,

    // Serialize dates - ensure they're strings
    createdAt: order.createdAt?.toString
      ? order.createdAt.toString()
      : order.createdAt,
    updatedAt: order.updatedAt?.toString
      ? order.updatedAt.toString()
      : order.updatedAt,
    shippedAt: order.shippedAt?.toString
      ? order.shippedAt.toString()
      : order.shippedAt,
    deliveredAt: order.deliveredAt?.toString
      ? order.deliveredAt.toString()
      : order.deliveredAt,
    cancelledAt: order.cancelledAt?.toString
      ? order.cancelledAt.toString()
      : order.cancelledAt,
  }));
}

function serializeConsultations(consultations: any[]) {
  return consultations.map((consultation) => ({
    _id: consultation._id?.toString() || consultation._id,
    consultationNumber: consultation.consultationNumber,
    status: consultation.status,
    paymentStatus: consultation.paymentStatus,
    totalAmount: consultation.totalAmount || 0,
    currency: consultation.currency || "USD",

    // Serialize personal info
    personalInfo: consultation.personalInfo
      ? {
          firstName: consultation.personalInfo.firstName || "",
          lastName: consultation.personalInfo.lastName || "",
          email: consultation.personalInfo.email || "",
          phone: consultation.personalInfo.phone,
          age: consultation.personalInfo.age,
          gender: consultation.personalInfo.gender,
          occupation: consultation.personalInfo.occupation,
        }
      : {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          age: 0,
          gender: "",
          occupation: "",
        },

    // Serialize health info
    healthInfo: consultation.healthInfo
      ? {
          currentWeight: consultation.healthInfo.currentWeight,
          goalWeight: consultation.healthInfo.goalWeight,
          height: consultation.healthInfo.height,
          activityLevel: consultation.healthInfo.activityLevel,
          dietaryRestrictions:
            consultation.healthInfo.dietaryRestrictions || [],
          allergies: consultation.healthInfo.allergies,
          medicalConditions: consultation.healthInfo.medicalConditions,
          currentMedications: consultation.healthInfo.currentMedications,
          previousDietExperience:
            consultation.healthInfo.previousDietExperience,
        }
      : {},

    // Serialize goals and lifestyle
    goalsAndLifestyle: consultation.goalsAndLifestyle
      ? {
          primaryGoals: consultation.goalsAndLifestyle.primaryGoals || [],
          motivationLevel: consultation.goalsAndLifestyle.motivationLevel,
          biggestChallenges:
            consultation.goalsAndLifestyle.biggestChallenges || [],
          currentEatingHabits:
            consultation.goalsAndLifestyle.currentEatingHabits,
          mealPrepExperience: consultation.goalsAndLifestyle.mealPrepExperience,
          cookingSkills: consultation.goalsAndLifestyle.cookingSkills,
          budgetRange: consultation.goalsAndLifestyle.budgetRange,
        }
      : {},

    // Serialize service preferences
    servicePreferences: consultation.servicePreferences
      ? {
          servicesInterested:
            consultation.servicePreferences.servicesInterested || [],
          preferredConsultationTime:
            consultation.servicePreferences.preferredConsultationTime,
          preferredDate: consultation.servicePreferences.preferredDate,
          timeZone: consultation.servicePreferences.timeZone,
          communicationPreference:
            consultation.servicePreferences.communicationPreference,
          urgencyLevel: consultation.servicePreferences.urgencyLevel,
        }
      : {},

    additionalNotes: consultation.additionalNotes,
    howDidYouHear: consultation.howDidYouHear,
    agreeToTerms: consultation.agreeToTerms || false,
    agreeToMarketing: consultation.agreeToMarketing || false,
    paymentIntentId: consultation.paymentIntentId,
    consultantNotes: consultation.consultantNotes,

    // Serialize dates - ensure they're strings
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

async function DashboardData() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch all required data
  const [user, ordersResult, consultations, favoriteStats] = await Promise.all([
    getCurrentUser(),
    getUserOrders(),
    getUserConsultations(userId),
    getFavoriteStats(),
  ]);

  const orders = ordersResult?.orders || [];

  // ✅ SERIALIZE DATA BEFORE PASSING TO CLIENT COMPONENTS
  const serializedOrders = serializeOrders(orders);
  const recentOrders = serializedOrders.slice(0, 3);

  const serializedConsultations = serializeConsultations(consultations);
  const recentConsultations = serializedConsultations.slice(0, 3);

  // Calculate stats using original data
  const totalOrders = orders.length;
  const completedOrders = orders.filter(
    (order) => order.status === "delivered"
  ).length;
  const totalSpent = orders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  const pendingConsultations = consultations.filter(
    (consultation) =>
      consultation.status === "pending" || consultation.status === "confirmed"
  ).length;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {user?.firstName || "Wellness Warrior"}! 👋
            </h2>
            <p className="text-green-100">
              Your wellness journey continues. Here's your latest update.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Stethoscope className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon="Package"
          change="+2 this month"
          trend="up"
        />
        <StatCard
          title="Completed Orders"
          value={completedOrders}
          icon="CheckCircle"
          change={`${completedOrders}/${totalOrders} delivered`}
          trend="neutral"
        />
        <StatCard
          title="Total Spent"
          value={`$${totalSpent.toFixed(2)}`}
          icon="TrendingUp"
          change="+12% this month"
          trend="up"
        />
        <StatCard
          title="Favorites"
          value={favoriteStats.total}
          icon="Heart"
          change={`+${favoriteStats.recent} recent`}
          trend="up"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Orders - ✅ Now using serialized data */}
        <RecentOrdersCard orders={recentOrders} />

        {/* Recent Consultations - ✅ Now using serialized data */}
        <RecentConsultationsCard consultations={recentConsultations} />
      </div>

      {/* Activity Feed */}
      <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-green-600" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {serializedOrders.slice(0, 5).map((order, index) => (
              <div
                key={order._id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-700/50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">
                      Order {order.orderNumber} {order.status}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  ${order.totalAmount.toFixed(2)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health Metrics */}
      {consultations.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/50 dark:border-purple-700/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span>Wellness Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <h3 className="font-semibold text-lg">
                  {consultations.length}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Consultations
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <h3 className="font-semibold text-lg">
                  {pendingConsultations}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Active Sessions
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <h3 className="font-semibold text-lg">
                  {Math.round(
                    (completedOrders / Math.max(totalOrders, 1)) * 100
                  )}
                  %
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Goal Completion
                </p>
              </div>
            </div>

            {pendingConsultations > 0 && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">
                      You have {pendingConsultations} active consultation
                      {pendingConsultations > 1 ? "s" : ""}
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Check your consultation updates and meal plans
                    </p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Link href="/account/consultations">
                      View Details
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Welcome Skeleton */}
      <Skeleton className="h-32 w-full rounded-2xl" />

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      {/* Cards Skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData />
    </Suspense>
  );
}
