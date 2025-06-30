import { Suspense } from "react";
import { Metadata } from "next";
import OrderTrackingPage from "@/components/tracking/OrderTrackingPage";

type Props = {
  searchParams: Promise<{
    order?: string;
    email?: string;
    tracking?: string;
  }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await searchParams;
  const orderNumber = params.order || params.tracking;

  return {
    title: orderNumber
      ? `Track Order ${orderNumber} | Nutra-Vive`
      : "Track Your Order | Nutra-Vive",
    description: orderNumber
      ? `Track the status and delivery progress of your Nutra-Vive order ${orderNumber}`
      : "Track your Nutra-Vive order status and delivery progress with real-time updates",
    keywords: "order tracking, delivery status, shipping updates, Nutra-Vive",
    openGraph: {
      title: orderNumber ? `Track Order ${orderNumber}` : "Track Your Order",
      description:
        "Get real-time updates on your organic juice and tea delivery",
      type: "website",
      siteName: "Nutra-Vive",
    },
  };
}

// Loading component for better UX
function TrackingPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900/20">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Form Card Skeleton */}
          <div className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl mx-auto mb-4 animate-pulse"></div>
              <div className="w-48 h-8 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2 animate-pulse"></div>
              <div className="w-80 h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse"></div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="w-40 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Server Component for handling search params
async function TrackingPageContent({ searchParams }: Props) {
  const params = await searchParams;
  const initialOrderNumber = params.order || params.tracking;
  const initialEmail = params.email;
  return (
    <OrderTrackingPage
      initialOrderNumber={initialOrderNumber}
      initialEmail={initialEmail}
    />
  );
}

// Main Page Component
export default function TrackPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<TrackingPageSkeleton />}>
      <TrackingPageContent searchParams={searchParams} />
    </Suspense>
  );
}

// Export revalidate for ISR (optional)
export const revalidate = 60; // Revalidate every minute for tracking updates
