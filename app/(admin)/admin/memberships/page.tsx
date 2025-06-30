// app/admin/memberships/page.tsx
import { Suspense } from "react";
import { Metadata } from "next";
import {
  getMemberships,
  getMembershipStats,
} from "@/lib/actions/membershipServerActions";
import { getCategories } from "@/lib/actions/productServerActions";
import MembershipsHeader from "./components/MembershipsHeader";
import MembershipsList from "./components/MembershipsList";
import MembershipsStats from "./components/MembershipsStats";
import MembershipDialog from "./components/MembershipDialog";
import { MembershipsProvider } from "./components/MembershipsProvider";
import { ca } from "date-fns/locale";

export const metadata: Metadata = {
  title: "Memberships | Admin Dashboard | Nutra-Vive",
  description: "Manage membership plans, subscriptions, and member benefits",
};

interface MembershipsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    tier?: string;
    billingFrequency?: string;
    status?: string;
    sort?: string;
    order?: string;
  }>;
}

export default async function MembershipsPage({
  searchParams,
}: MembershipsPageProps) {
  // Parse search parameters
  const page = parseInt((await searchParams).page || "1");
  const search = ((await searchParams).search || "") as string;
  const tier = (await searchParams).tier as
    | "basic"
    | "premium"
    | "vip"
    | "elite"
    | undefined;
  const billingFrequency = (await searchParams).billingFrequency as
    | "monthly"
    | "quarterly"
    | "yearly"
    | undefined;
  const isActive =
    (await searchParams).status === "active"
      ? true
      : (await searchParams).status === "inactive"
        ? false
        : undefined;
  const sortBy =
    ((await searchParams).sort as
      | "name"
      | "price"
      | "tier"
      | "totalSubscribers"
      | "createdAt") || "createdAt";
  const sortOrder = ((await searchParams).order as "asc" | "desc") || "desc";

  // Fetch data server-side
  const [membershipsData, statsData, categoriesData] = await Promise.all([
    getMemberships({
      page,
      search,
      tier,
      billingFrequency,
      isActive,
      sortBy,
      sortOrder,
      limit: 12,
    }),
    getMembershipStats(),
    getCategories(),
  ]);
  console.log(categoriesData);
  if (membershipsData.error) {
    throw new Error(membershipsData.error);
  }

  return (
    <MembershipsProvider categories={categoriesData}>
      <div className="flex flex-col h-full">
        {/* Header with stats */}
        <div className="flex-none">
          <MembershipsHeader />
          <MembershipsStats stats={statsData} />
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          <Suspense
            fallback={
              <div className="animate-pulse">Loading memberships...</div>
            }
          >
            <MembershipsList
              initialMemberships={membershipsData.memberships}
              initialPagination={membershipsData.pagination}
              searchParams={await searchParams}
            />
          </Suspense>
        </div>

        {/* Membership dialog for create/edit */}
        <MembershipDialog />
      </div>
    </MembershipsProvider>
  );
}
