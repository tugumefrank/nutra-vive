// // app/(account)/account/memberships/components/AvailableMemberships.tsx
// "use client";

// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Crown,
//   Star,
//   Gift,
//   Zap,
//   Check,
//   ArrowRight,
//   Sparkles,
//   Truck,
//   HeadphonesIcon,
//   Package,
// } from "lucide-react";
// import { toast } from "sonner";
// import { createUserMembership } from "@/lib/actions/membershipServerActions";
// import { useUser } from "@clerk/nextjs";

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

// interface AvailableMembershipsProps {
//   memberships: Membership[];
//   currentMembership?: any;
//   onSubscribe: () => void;
//   showUpgradeOnly: boolean;
// }

// const tierConfig = {
//   basic: {
//     icon: Gift,
//     color: "border-emerald-200 dark:border-emerald-800",
//     gradient: "from-emerald-500 to-emerald-600",
//     bgGradient:
//       "from-emerald-50/50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/20",
//     textColor: "text-emerald-600 dark:text-emerald-400",
//     order: 1,
//   },
//   premium: {
//     icon: Star,
//     color: "border-blue-200 dark:border-blue-800",
//     gradient: "from-blue-500 to-blue-600",
//     bgGradient:
//       "from-blue-50/50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20",
//     textColor: "text-blue-600 dark:text-blue-400",
//     order: 2,
//   },
//   vip: {
//     icon: Crown,
//     color: "border-purple-200 dark:border-purple-800",
//     gradient: "from-purple-500 to-purple-600",
//     bgGradient:
//       "from-purple-50/50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20",
//     textColor: "text-purple-600 dark:text-purple-400",
//     order: 3,
//   },
//   elite: {
//     icon: Zap,
//     color: "border-amber-200 dark:border-amber-800",
//     gradient: "from-amber-500 to-amber-600",
//     bgGradient:
//       "from-amber-50/50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/20",
//     textColor: "text-amber-600 dark:text-amber-400",
//     order: 4,
//   },
// };

// export function AvailableMemberships({
//   memberships,
//   currentMembership,
//   onSubscribe,
//   showUpgradeOnly,
// }: AvailableMembershipsProps) {
//   const [subscribingTo, setSubscribingTo] = useState<string | null>(null);
//   const { user } = useUser();

//   const sortedMemberships = [...memberships].sort((a, b) => {
//     const aConfig = tierConfig[a.tier as keyof typeof tierConfig];
//     const bConfig = tierConfig[b.tier as keyof typeof tierConfig];
//     return aConfig.order - bConfig.order;
//   });

//   const handleSubscribe = async (membershipId: string) => {
//     if (!user) {
//       toast.error("Please sign in to subscribe");
//       return;
//     }

//     try {
//       setSubscribingTo(membershipId);

//       // Here you would typically redirect to a payment flow
//       // For now, let's simulate the subscription creation
//       toast.success("Redirecting to payment...");

//       // This would be handled after successful payment
//       // const result = await createUserMembership(user.id, membershipId);
//       // if (result.success) {
//       //   toast.success('Membership activated successfully!');
//       //   onSubscribe();
//       // } else {
//       //   toast.error(result.error || 'Failed to activate membership');
//       // }
//     } catch (error) {
//       console.error("Subscription error:", error);
//       toast.error("Something went wrong. Please try again.");
//     } finally {
//       setSubscribingTo(null);
//     }
//   };

//   if (memberships.length === 0) {
//     return (
//       <Card className="glass-card border-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
//         <CardContent className="p-8 text-center">
//           <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
//           <h3 className="text-lg font-semibold mb-2">
//             No Memberships Available
//           </h3>
//           <p className="text-muted-foreground">
//             Check back later for new membership opportunities.
//           </p>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//       {sortedMemberships.map((membership) => {
//         const config = tierConfig[membership.tier as keyof typeof tierConfig];
//         const IconComponent = config.icon;
//         const isCurrentTier =
//           currentMembership?.membership.tier === membership.tier;
//         const isUpgrade =
//           currentMembership &&
//           tierConfig[membership.tier as keyof typeof tierConfig].order >
//             tierConfig[
//               currentMembership.membership.tier as keyof typeof tierConfig
//             ].order;

//         const totalProducts = membership.productAllocations.reduce(
//           (sum, alloc) => sum + alloc.quantity,
//           0
//         );

//         return (
//           <Card
//             key={membership._id}
//             className={`glass-card border-2 bg-gradient-to-br ${config.bgGradient} backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative overflow-hidden ${config.color}`}
//           >
//             {membership.isPopular && (
//               <div className="absolute top-0 left-0 right-0">
//                 <div
//                   className={`bg-gradient-to-r ${config.gradient} text-white text-center py-2 text-sm font-medium`}
//                 >
//                   <Sparkles className="w-4 h-4 inline mr-1" />
//                   Most Popular
//                 </div>
//               </div>
//             )}

//             <CardHeader
//               className={`pb-4 ${membership.isPopular ? "pt-12" : ""}`}
//             >
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <div
//                     className={`p-3 rounded-xl bg-gradient-to-r ${config.gradient} text-white shadow-lg`}
//                   >
//                     <IconComponent className="w-6 h-6" />
//                   </div>
//                   <div>
//                     <CardTitle className="text-xl font-bold capitalize">
//                       {membership.name}
//                     </CardTitle>
//                     <Badge
//                       variant="outline"
//                       className={`capitalize ${config.textColor} border-current`}
//                     >
//                       {membership.tier}
//                     </Badge>
//                   </div>
//                 </div>
//               </div>

//               {membership.description && (
//                 <p className="text-sm text-muted-foreground mt-2">
//                   {membership.description}
//                 </p>
//               )}
//             </CardHeader>

//             <CardContent className="space-y-6">
//               {/* Pricing */}
//               <div className="text-center">
//                 <div className="text-3xl font-bold text-foreground">
//                   ${membership.price}
//                 </div>
//                 <div className="text-sm text-muted-foreground">
//                   per {membership.billingFrequency.replace("ly", "")}
//                 </div>
//               </div>

//               {/* Key Stats */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="text-center p-3 glass-card bg-white/50 dark:bg-gray-900/50 rounded-lg">
//                   <div className="text-lg font-bold text-foreground">
//                     {totalProducts}
//                   </div>
//                   <div className="text-xs text-muted-foreground">
//                     Free Products
//                   </div>
//                 </div>
//                 <div className="text-center p-3 glass-card bg-white/50 dark:bg-gray-900/50 rounded-lg">
//                   <div className="text-lg font-bold text-foreground capitalize">
//                     {membership.deliveryFrequency}
//                   </div>
//                   <div className="text-xs text-muted-foreground">Delivery</div>
//                 </div>
//               </div>

//               {/* Product Allocations */}
//               <div className="space-y-2">
//                 <h4 className="text-sm font-medium">Your Allocations</h4>
//                 <div className="space-y-1">
//                   {membership.productAllocations
//                     .slice(0, 3)
//                     .map((allocation, index) => (
//                       <div key={index} className="flex justify-between text-sm">
//                         <span className="text-muted-foreground">
//                           {allocation.categoryName}
//                         </span>
//                         <span className="font-medium">
//                           {allocation.quantity} items
//                         </span>
//                       </div>
//                     ))}
//                   {membership.productAllocations.length > 3 && (
//                     <div className="text-xs text-muted-foreground">
//                       +{membership.productAllocations.length - 3} more
//                       categories
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Key Features */}
//               <div className="space-y-3">
//                 <h4 className="text-sm font-medium">Features</h4>
//                 <div className="space-y-2">
//                   {membership.freeDelivery && (
//                     <div className="flex items-center gap-2 text-sm">
//                       <Truck className="w-4 h-4 text-emerald-500" />
//                       <span>Free Delivery</span>
//                     </div>
//                   )}
//                   {membership.prioritySupport && (
//                     <div className="flex items-center gap-2 text-sm">
//                       <HeadphonesIcon className="w-4 h-4 text-blue-500" />
//                       <span>Priority Support</span>
//                     </div>
//                   )}
//                   {membership.features.slice(0, 2).map((feature, index) => (
//                     <div
//                       key={index}
//                       className="flex items-center gap-2 text-sm"
//                     >
//                       <Check className="w-4 h-4 text-emerald-500" />
//                       <span className="text-muted-foreground">{feature}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Custom Benefits */}
//               {membership.customBenefits.length > 0 && (
//                 <div className="space-y-2">
//                   <h4 className="text-sm font-medium">Exclusive Benefits</h4>
//                   {membership.customBenefits
//                     .slice(0, 2)
//                     .map((benefit, index) => (
//                       <div
//                         key={index}
//                         className="flex items-start gap-2 text-sm"
//                       >
//                         <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
//                         <div>
//                           <div className="font-medium">{benefit.title}</div>
//                           <div className="text-xs text-muted-foreground">
//                             {benefit.description}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                 </div>
//               )}

//               {/* Action Button */}
//               <div className="pt-4">
//                 {isCurrentTier ? (
//                   <Button className="w-full" variant="outline" disabled>
//                     <Check className="w-4 h-4 mr-2" />
//                     Current Plan
//                   </Button>
//                 ) : (
//                   <Button
//                     className={`w-full gap-2 bg-gradient-to-r ${config.gradient} hover:shadow-lg transition-all duration-300 text-white border-0`}
//                     onClick={() => handleSubscribe(membership._id)}
//                     disabled={subscribingTo === membership._id}
//                   >
//                     {subscribingTo === membership._id ? (
//                       "Processing..."
//                     ) : (
//                       <>
//                         {showUpgradeOnly && isUpgrade ? (
//                           <>
//                             <Crown className="w-4 h-4" />
//                             Upgrade Now
//                           </>
//                         ) : (
//                           <>
//                             <Gift className="w-4 h-4" />
//                             Get Started
//                           </>
//                         )}
//                         <ArrowRight className="w-4 h-4" />
//                       </>
//                     )}
//                   </Button>
//                 )}
//               </div>

//               {/* Upgrade Incentive */}
//               {showUpgradeOnly && isUpgrade && (
//                 <div className="text-center text-xs text-muted-foreground">
//                   Upgrade to unlock{" "}
//                   {totalProducts -
//                     (currentMembership?.membership.productAllocations.reduce(
//                       (sum: number, alloc: any) => sum + alloc.quantity,
//                       0
//                     ) || 0)}{" "}
//                   more free products
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         );
//       })}
//     </div>
//   );
// }
// app/(account)/account/memberships/components/AvailableMemberships.tsx (Updated)
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Star,
  Gift,
  Zap,
  Check,
  ArrowRight,
  Sparkles,
  Truck,
  HeadphonesIcon,
  Package,
} from "lucide-react";
import { MembershipPaymentModal } from "./MembershipPaymentModal";

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

interface AvailableMembershipsProps {
  memberships: Membership[];
  currentMembership?: any;
  onSubscribe: () => void;
  showUpgradeOnly: boolean;
}

const tierConfig = {
  basic: {
    icon: Gift,
    color: "border-emerald-200 dark:border-emerald-800",
    gradient: "from-emerald-500 to-emerald-600",
    bgGradient:
      "from-emerald-50/50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/20",
    textColor: "text-emerald-600 dark:text-emerald-400",
    order: 1,
  },
  premium: {
    icon: Star,
    color: "border-blue-200 dark:border-blue-800",
    gradient: "from-blue-500 to-blue-600",
    bgGradient:
      "from-blue-50/50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20",
    textColor: "text-blue-600 dark:text-blue-400",
    order: 2,
  },
  vip: {
    icon: Crown,
    color: "border-purple-200 dark:border-purple-800",
    gradient: "from-purple-500 to-purple-600",
    bgGradient:
      "from-purple-50/50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20",
    textColor: "text-purple-600 dark:text-purple-400",
    order: 3,
  },
  elite: {
    icon: Zap,
    color: "border-amber-200 dark:border-amber-800",
    gradient: "from-amber-500 to-amber-600",
    bgGradient:
      "from-amber-50/50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/20",
    textColor: "text-amber-600 dark:text-amber-400",
    order: 4,
  },
};

export function AvailableMemberships({
  memberships,
  currentMembership,
  onSubscribe,
  showUpgradeOnly,
}: AvailableMembershipsProps) {
  const [selectedMembership, setSelectedMembership] =
    useState<Membership | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const sortedMemberships = [...memberships].sort((a, b) => {
    const aConfig = tierConfig[a.tier as keyof typeof tierConfig];
    const bConfig = tierConfig[b.tier as keyof typeof tierConfig];
    return aConfig.order - bConfig.order;
  });

  const handleSubscribe = (membership: Membership) => {
    setSelectedMembership(membership);
    setShowPaymentModal(true);
  };

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
    setSelectedMembership(null);
  };

  const handlePaymentSuccess = () => {
    onSubscribe(); // Refresh memberships data
  };

  if (memberships.length === 0) {
    return (
      <Card className="glass-card border-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
        <CardContent className="p-8 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No Memberships Available
          </h3>
          <p className="text-muted-foreground">
            Check back later for new membership opportunities.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedMemberships.map((membership) => {
          const config = tierConfig[membership.tier as keyof typeof tierConfig];
          const IconComponent = config.icon;
          const isCurrentTier =
            currentMembership?.membership.tier === membership.tier;
          const isUpgrade =
            currentMembership &&
            tierConfig[membership.tier as keyof typeof tierConfig].order >
              tierConfig[
                currentMembership.membership.tier as keyof typeof tierConfig
              ].order;

          const totalProducts = membership.productAllocations.reduce(
            (sum, alloc) => sum + alloc.quantity,
            0
          );

          return (
            <Card
              key={membership._id}
              className={`glass-card border-2 bg-gradient-to-br ${config.bgGradient} backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative overflow-hidden ${config.color}`}
            >
              {membership.isPopular && (
                <div className="absolute top-0 left-0 right-0">
                  <div
                    className={`bg-gradient-to-r ${config.gradient} text-white text-center py-2 text-sm font-medium`}
                  >
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader
                className={`pb-4 ${membership.isPopular ? "pt-12" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-r ${config.gradient} text-white shadow-lg`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold capitalize">
                        {membership.name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={`capitalize ${config.textColor} border-current`}
                      >
                        {membership.tier}
                      </Badge>
                    </div>
                  </div>
                </div>

                {membership.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {membership.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Pricing */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    ${membership.price}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    per {membership.billingFrequency.replace("ly", "")}
                  </div>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 glass-card bg-white/50 dark:bg-gray-900/50 rounded-lg">
                    <div className="text-lg font-bold text-foreground">
                      {totalProducts}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Free Products
                    </div>
                  </div>
                  <div className="text-center p-3 glass-card bg-white/50 dark:bg-gray-900/50 rounded-lg">
                    <div className="text-lg font-bold text-foreground capitalize">
                      {membership.deliveryFrequency}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Delivery
                    </div>
                  </div>
                </div>

                {/* Product Allocations */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Your Allocations</h4>
                  <div className="space-y-1">
                    {membership.productAllocations
                      .slice(0, 3)
                      .map((allocation, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {allocation.categoryName}
                          </span>
                          <span className="font-medium">
                            {allocation.quantity} items
                          </span>
                        </div>
                      ))}
                    {membership.productAllocations.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{membership.productAllocations.length - 3} more
                        categories
                      </div>
                    )}
                  </div>
                </div>

                {/* Key Features */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Features</h4>
                  <div className="space-y-2">
                    {membership.freeDelivery && (
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="w-4 h-4 text-emerald-500" />
                        <span>Free Delivery</span>
                      </div>
                    )}
                    {membership.prioritySupport && (
                      <div className="flex items-center gap-2 text-sm">
                        <HeadphonesIcon className="w-4 h-4 text-blue-500" />
                        <span>Priority Support</span>
                      </div>
                    )}
                    {membership.features.slice(0, 2).map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Benefits */}
                {membership.customBenefits.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Exclusive Benefits</h4>
                    {membership.customBenefits
                      .slice(0, 2)
                      .map((benefit, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium">{benefit.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {benefit.description}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-4">
                  {isCurrentTier ? (
                    <Button className="w-full" variant="outline" disabled>
                      <Check className="w-4 h-4 mr-2" />
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className={`w-full gap-2 bg-gradient-to-r ${config.gradient} hover:shadow-lg transition-all duration-300 text-white border-0`}
                      onClick={() => handleSubscribe(membership)}
                    >
                      {showUpgradeOnly && isUpgrade ? (
                        <>
                          <Crown className="w-4 h-4" />
                          Upgrade Now
                        </>
                      ) : (
                        <>
                          <Gift className="w-4 h-4" />
                          Get Started
                        </>
                      )}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Upgrade Incentive */}
                {showUpgradeOnly && isUpgrade && (
                  <div className="text-center text-xs text-muted-foreground">
                    Upgrade to unlock{" "}
                    {totalProducts -
                      (currentMembership?.membership.productAllocations.reduce(
                        (sum: number, alloc: any) => sum + alloc.quantity,
                        0
                      ) || 0)}{" "}
                    more free products
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Modal */}
      <MembershipPaymentModal
        isOpen={showPaymentModal}
        onClose={handlePaymentModalClose}
        membership={selectedMembership}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}
