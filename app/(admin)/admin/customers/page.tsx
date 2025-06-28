import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/db/models";
import CustomersPageClient from "./components/CustomersPageClient";
import { getCustomersWithAnalytics } from "@/lib/actions/customerServerActions";

async function checkAdminAuth() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  await connectToDatabase();
  const user = await User.findOne({ clerkId: userId });

  if (!user || user.role !== "admin") {
    redirect("/admin");
  }
}

export default async function CustomersPage() {
  await checkAdminAuth();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
          <p className="text-muted-foreground">
            Manage customers, segments, and communication campaigns
          </p>
        </div>
      </div>

      <Suspense fallback={<CustomersSkeleton />}>
        <CustomersPageClient />
      </Suspense>
    </div>
  );
}

function CustomersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
    </div>
  );
}