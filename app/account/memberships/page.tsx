// app/(account)/account/memberships/page.tsx
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MembershipLoadingSkeleton } from "./loading";
import { MembershipDashboard } from "./components/MembershipDashboard";
import { CheckoutSuccessHandler } from "./components/CheckoutSuccessHandler";

export default async function MembershipsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Handle checkout success */}
      <CheckoutSuccessHandler />
      
      {/* Page Header */}
      <div className="relative bg-gradient-to-br from-slate-50/90 to-slate-100/90 backdrop-blur-md border-b border-slate-200/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
              Your Memberships
            </h1>
            <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto">
              Manage your subscription and wellness benefits
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Suspense fallback={<MembershipLoadingSkeleton />}>
          <MembershipDashboard />
        </Suspense>
      </div>
    </div>
  );
}
