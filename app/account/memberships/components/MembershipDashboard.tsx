// // app/(account)/account/memberships/components/MembershipDashboard.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { toast } from "sonner";

// import {
//   getUserMemberships,
//   getMemberships,
// } from "@/lib/actions/membershipServerActions";
// import { MembershipLoadingSkeleton } from "../loading";
// import { CurrentMembershipCard } from "./CurrentMembershipCard";
// import { ProductAllocations } from "./ProductAllocations";
// import { AvailableMemberships } from "./AvailableMemberships";

// interface UserMembership {
//   _id: string;
//   membership: {
//     _id: string;
//     name: string;
//     tier: string;
//     price: number;
//     billingFrequency: string;
//     deliveryFrequency: string;
//     productAllocations: Array<{
//       categoryId: string;
//       categoryName: string;
//       quantity: number;
//     }>;
//     features: string[];
//     customBenefits: Array<{
//       title: string;
//       description: string;
//       type: string;
//     }>;
//   };
//   status: string;
//   startDate: string;
//   nextBillingDate?: string;
//   currentPeriodEnd: string;
//   productUsage: Array<{
//     categoryId: string;
//     categoryName: string;
//     allocatedQuantity: number;
//     usedQuantity: number;
//     availableQuantity: number;
//   }>;
//   autoRenewal: boolean;
// }

// interface Membership {
//   _id: string;
//   name: string;
//   description?: string;
//   tier: string;
//   price: number;
//   billingFrequency: string;
//   productAllocations: Array<{
//     categoryId: string;
//     categoryName: string;
//     quantity: number;
//   }>;
//   customBenefits: Array<{
//     title: string;
//     description: string;
//     type: string;
//   }>;
//   features: string[];
//   maxProductsPerMonth?: number;
//   deliveryFrequency: string;
//   freeDelivery: boolean;
//   prioritySupport: boolean;
//   isActive: boolean;
//   isPopular: boolean;
//   color?: string;
//   icon?: string;
// }

// interface MembershipDashboardProps {
//   userId: string;
// }

// export function MembershipDashboard({ userId }: MembershipDashboardProps) {
//   const [loading, setLoading] = useState(true);
//   const [userMemberships, setUserMemberships] = useState<UserMembership[]>([]);
//   const [availableMemberships, setAvailableMemberships] = useState<
//     Membership[]
//   >([]);
//   const [refreshKey, setRefreshKey] = useState(0);

//   const currentMembership = userMemberships.find((m) => m.status === "active");

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         setLoading(true);

//         // Get user's current memberships
//         const userMembershipResult = await getUserMemberships({
//           search: userId,
//           status: "active",
//           limit: 10,
//         });

//         if (userMembershipResult.error) {
//           toast.error("Failed to load your memberships");
//           return;
//         }

//         setUserMemberships(userMembershipResult.userMemberships || []);

//         // Get available memberships
//         const membershipResult = await getMemberships({
//           isActive: true,
//           sortBy: "tier",
//           sortOrder: "asc",
//           limit: 20,
//         });

//         if (membershipResult.error) {
//           toast.error("Failed to load available memberships");
//           return;
//         }

//         setAvailableMemberships(membershipResult.memberships || []);
//       } catch (error) {
//         console.error("Error fetching membership data:", error);
//         toast.error("Something went wrong loading memberships");
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchData();
//   }, [userId, refreshKey]);

//   const handleRefresh = () => {
//     setRefreshKey((prev) => prev + 1);
//   };

//   if (loading) {
//     return <MembershipLoadingSkeleton />;
//   }

//   return (
//     <div className="space-y-8">
//       {currentMembership ? (
//         <>
//           {/* Current Membership Status */}
//           <CurrentMembershipCard
//             membership={currentMembership}
//             onRefresh={handleRefresh}
//           />

//           {/* Product Allocations */}
//           <ProductAllocations
//             productUsage={currentMembership.productUsage}
//             membership={currentMembership.membership}
//           />

//           {/* Upgrade Options */}
//           <div className="space-y-6">
//             <div className="text-center">
//               <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
//                 Upgrade Your Experience
//               </h2>
//               <p className="text-muted-foreground">
//                 Unlock more benefits with our premium memberships
//               </p>
//             </div>

//             <AvailableMemberships
//               memberships={availableMemberships.filter(
//                 (m) => m.tier !== currentMembership.membership.tier
//               )}
//               currentMembership={currentMembership}
//               onSubscribe={handleRefresh}
//               showUpgradeOnly={true}
//             />
//           </div>
//         </>
//       ) : (
//         <>
//           {/* Welcome Section */}
//           <div className="text-center py-12 glass-card border-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl rounded-2xl">
//             <div className="max-w-2xl mx-auto">
//               <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
//                 Choose Your Perfect Membership
//               </h2>
//               <p className="text-lg text-muted-foreground mb-6">
//                 Unlock exclusive benefits, free products, and premium perks with
//                 our membership plans
//               </p>
//               <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
//                 <div className="flex items-center gap-2">
//                   <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
//                   Free Monthly Products
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
//                   Priority Support
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                   Exclusive Content
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Available Memberships */}
//           <AvailableMemberships
//             memberships={availableMemberships}
//             onSubscribe={handleRefresh}
//             showUpgradeOnly={false}
//           />
//         </>
//       )}
//     </div>
//   );
// }
// app/(account)/account/memberships/components/MembershipDashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getCurrentUserMemberships, // New function we'll create
  getMemberships,
} from "@/lib/actions/membershipServerActions";
import { MembershipLoadingSkeleton } from "../loading";
import { CurrentMembershipCard } from "./CurrentMembershipCard";
import { ProductAllocations } from "./ProductAllocations";
import { AvailableMemberships } from "./AvailableMemberships";

interface UserMembership {
  _id: string;
  membership: {
    _id: string;
    name: string;
    tier: string;
    price: number;
    billingFrequency: string;
    deliveryFrequency: string;
    productAllocations: Array<{
      categoryId: string;
      categoryName: string;
      quantity: number;
    }>;
    features: string[];
    customBenefits: Array<{
      title: string;
      description: string;
      type: string;
    }>;
  };
  status: string;
  startDate: string;
  nextBillingDate?: string;
  currentPeriodEnd: string;
  productUsage: Array<{
    categoryId: string;
    categoryName: string;
    allocatedQuantity: number;
    usedQuantity: number;
    availableQuantity: number;
  }>;
  autoRenewal: boolean;
}

interface Membership {
  _id: string;
  name: string;
  description?: string;
  tier: string;
  price: number;
  billingFrequency: string;
  productAllocations: Array<{
    categoryId: string;
    categoryName: string;
    quantity: number;
  }>;
  customBenefits: Array<{
    title: string;
    description: string;
    type: string;
  }>;
  features: string[];
  maxProductsPerMonth?: number;
  deliveryFrequency: string;
  freeDelivery: boolean;
  prioritySupport: boolean;
  isActive: boolean;
  isPopular: boolean;
  color?: string;
  icon?: string;
}

export function MembershipDashboard() {
  const [loading, setLoading] = useState(true);
  const [userMemberships, setUserMemberships] = useState<UserMembership[]>([]);
  const [availableMemberships, setAvailableMemberships] = useState<
    Membership[]
  >([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const currentMembership = userMemberships.find((m) => m.status === "active");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Get current user's memberships - using new function
        const userMembershipResult = await getCurrentUserMemberships();

        if (userMembershipResult.error) {
          toast.error("Failed to load your memberships");
          return;
        }

        setUserMemberships(userMembershipResult.userMemberships || []);

        // Get available memberships
        const membershipResult = await getMemberships({
          isActive: true,
          sortBy: "tier",
          sortOrder: "asc",
          limit: 20,
        });

        if (membershipResult.error) {
          toast.error("Failed to load available memberships");
          return;
        }

        setAvailableMemberships(membershipResult.memberships || []);
      } catch (error) {
        console.error("Error fetching membership data:", error);
        toast.error("Something went wrong loading memberships");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return <MembershipLoadingSkeleton />;
  }

  return (
    <div className="space-y-8">
      {currentMembership ? (
        <>
          {/* Current Membership Status */}
          <CurrentMembershipCard
            membership={currentMembership}
            onRefresh={handleRefresh}
          />

          {/* Product Allocations */}
          <ProductAllocations
            productUsage={currentMembership.productUsage}
            membership={currentMembership.membership}
          />

          {/* Upgrade Options */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Upgrade Your Experience
              </h2>
              <p className="text-muted-foreground">
                Unlock more benefits with our premium memberships
              </p>
            </div>

            <AvailableMemberships
              memberships={availableMemberships.filter(
                (m) => m.tier !== currentMembership.membership.tier
              )}
              currentMembership={currentMembership}
              onSubscribe={handleRefresh}
              showUpgradeOnly={true}
            />
          </div>
        </>
      ) : (
        <>
          {/* Welcome Section */}
          <div className="text-center py-12 glass-card border-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl rounded-2xl">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                Choose Your Perfect Membership
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Unlock exclusive benefits, free products, and premium perks with
                our membership plans
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Free Monthly Products
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  Priority Support
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Exclusive Content
                </div>
              </div>
            </div>
          </div>

          {/* Available Memberships */}
          <AvailableMemberships
            memberships={availableMemberships}
            onSubscribe={handleRefresh}
            showUpgradeOnly={false}
          />
        </>
      )}
    </div>
  );
}
