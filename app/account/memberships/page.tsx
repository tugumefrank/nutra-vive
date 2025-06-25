// app/(account)/account/memberships/page.tsx
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MembershipLoadingSkeleton } from "./loading";
import { MembershipDashboard } from "./components/MembershipDashboard";

export default async function MembershipsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950 dark:via-gray-900 dark:to-teal-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Your Memberships
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your subscription and explore premium benefits
          </p>
        </div>

        <Suspense fallback={<MembershipLoadingSkeleton />}>
          <MembershipDashboard />
        </Suspense>
      </div>
    </div>
  );
}
