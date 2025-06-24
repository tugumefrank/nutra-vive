// "use client";

// import React, { useState } from "react"; // ✅ Add this import
// import { motion } from "framer-motion";
// import {
//   Tag,
//   Percent,
//   Calendar,
//   Clock,
//   Gift,
//   TrendingUp,
//   Copy,
//   Check,
//   AlertCircle,
//   Zap,
//   Star,
//   ShoppingCart,
//   X,
//   DollarSign,
//   Users,
//   Timer,
// } from "lucide-react";
// import Link from "next/link";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";

// // Import server actions
// import {
//   validatePromotionCode,
//   applyPromotionToCart,
//   removePromotionFromCart,
// } from "@/lib/actions/promotionValidationServerAction";
// import { getCart } from "@/lib/actions/cartServerActions";
// import { toast } from "sonner";

// // Types
// interface Promotion {
//   _id: string;
//   name: string;
//   description?: string;
//   type: string;
//   discountType: string;
//   discountValue: number;
//   codes: {
//     code: string;
//     isPublic: boolean;
//     usageLimit?: number;
//     usedCount: number;
//     isActive: boolean;
//     createdAt: string;
//   }[];
//   applicabilityScope: string;
//   usageLimit?: number;
//   usageLimitPerCustomer?: number;
//   usedCount: number;
//   minimumPurchaseAmount?: number;
//   minimumQuantity?: number;
//   startsAt?: string;
//   endsAt?: string;
//   isActive: boolean;
//   isScheduled: boolean;
//   totalRedemptions: number;
//   totalRevenue: number;
//   tags: string[];
//   createdAt: string;
// }

// interface PromotionCardProps {
//   promotion: Promotion;
// }

// interface PromotionStatsProps {
//   total: number;
//   active: number;
//   expiringSoon: number;
// }

// interface EmptyStateProps {
//   title: string;
//   description: string;
//   actionLabel: string;
//   actionHref: string;
//   icon: string;
// }

// // PromotionCard Component
// export function PromotionCard({ promotion }: PromotionCardProps) {
//   const [copied, setCopied] = useState<string | null>(null);
//   const [isApplying, setIsApplying] = useState(false);

//   const getTypeConfig = (type: string) => {
//     switch (type) {
//       case "seasonal":
//         return {
//           color:
//             "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
//           icon: Calendar,
//           iconColor: "text-orange-600",
//         };
//       case "flash_sale":
//         return {
//           color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
//           icon: Zap,
//           iconColor: "text-red-600",
//         };
//       case "custom":
//         return {
//           color:
//             "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
//           icon: Star,
//           iconColor: "text-purple-600",
//         };
//       default:
//         return {
//           color:
//             "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
//           icon: Gift,
//           iconColor: "text-blue-600",
//         };
//     }
//   };

//   const getDiscountText = () => {
//     switch (promotion.discountType) {
//       case "percentage":
//         return `${promotion.discountValue}% OFF`;
//       case "fixed_amount":
//         return `$${promotion.discountValue} OFF`;
//       case "buy_x_get_y":
//         return "Buy X Get Y";
//       default:
//         return "DISCOUNT";
//     }
//   };

//   const getExpiryStatus = () => {
//     if (!promotion.endsAt) return null;

//     const endDate = new Date(promotion.endsAt);
//     const now = new Date();
//     const daysUntilExpiry = Math.ceil(
//       (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
//     );

//     if (daysUntilExpiry < 0)
//       return { status: "expired", text: "Expired", color: "text-red-600" };
//     if (daysUntilExpiry <= 3)
//       return {
//         status: "urgent",
//         text: `${daysUntilExpiry}d left`,
//         color: "text-red-600",
//       };
//     if (daysUntilExpiry <= 7)
//       return {
//         status: "soon",
//         text: `${daysUntilExpiry}d left`,
//         color: "text-yellow-600",
//       };
//     return {
//       status: "active",
//       text: `${daysUntilExpiry}d left`,
//       color: "text-green-600",
//     };
//   };

//   const typeConfig = getTypeConfig(promotion.type);
//   const TypeIcon = typeConfig.icon;
//   const expiryStatus = getExpiryStatus();
//   const publicCode = promotion.codes.find(
//     (code) => code.isPublic && code.isActive
//   );

//   const handleCopyCode = async (code: string) => {
//     try {
//       await navigator.clipboard.writeText(code);
//       setCopied(code);
//       toast("promotion code copied to clipboard");
//       setTimeout(() => setCopied(null), 2000);
//     } catch (error) {
//       toast("failed to copy code to clipboard");
//     }
//   };

//   const handleApplyCode = async (code: string) => {
//     setIsApplying(true);
//     try {
//       const result = await applyPromotionToCart(code);
//       if (result.success) {
//         toast("Promotion applied successfully!");
//       } else {
//         toast(
//           "Cannot apply promotion: " +
//             (result.error || "Failed to apply promotion")
//         );
//       }
//     } catch (error) {
//       if (error instanceof Error) {
//         if (error instanceof Error) {
//           toast("Error: " + error.message);
//         } else {
//           toast("An unknown error occurred");
//         }
//       } else {
//         toast("An unknown error occurred");
//       }
//     } finally {
//       setIsApplying(false);
//     }
//   };

//   return (
//     <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
//       <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all overflow-hidden">
//         <CardContent className="p-0">
//           {/* Header with gradient */}
//           <div
//             className={`bg-gradient-to-r ${typeConfig.color.includes("orange") ? "from-orange-500 to-red-500" : typeConfig.color.includes("red") ? "from-red-500 to-pink-500" : typeConfig.color.includes("purple") ? "from-purple-500 to-blue-500" : "from-blue-500 to-green-500"} p-6 text-white`}
//           >
//             <div className="flex items-start justify-between mb-4">
//               <div className="flex items-center space-x-3">
//                 <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
//                   <TypeIcon className="w-6 h-6 text-white" />
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-xl">{promotion.name}</h3>
//                   {promotion.description && (
//                     <p className="text-white/80 text-sm mt-1">
//                       {promotion.description}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div className="text-right">
//                 <div className="text-2xl font-black">{getDiscountText()}</div>
//                 {expiryStatus && (
//                   <div
//                     className={`text-sm ${expiryStatus.color} bg-white/20 px-2 py-1 rounded-full mt-1`}
//                   >
//                     <Timer className="w-3 h-3 inline mr-1" />
//                     {expiryStatus.text}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Tags */}
//             {promotion.tags.length > 0 && (
//               <div className="flex flex-wrap gap-2">
//                 {promotion.tags.map((tag, index) => (
//                   <Badge
//                     key={index}
//                     variant="secondary"
//                     className="bg-white/20 text-white text-xs"
//                   >
//                     {tag}
//                   </Badge>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Body */}
//           <div className="p-6">
//             {/* Requirements */}
//             <div className="space-y-3 mb-6">
//               {promotion.minimumPurchaseAmount && (
//                 <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
//                   <DollarSign className="w-4 h-4" />
//                   <span>
//                     Minimum purchase: ${promotion.minimumPurchaseAmount}
//                   </span>
//                 </div>
//               )}

//               {promotion.minimumQuantity && (
//                 <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
//                   <ShoppingCart className="w-4 h-4" />
//                   <span>Minimum {promotion.minimumQuantity} items</span>
//                 </div>
//               )}

//               <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
//                 <Users className="w-4 h-4" />
//                 <span>
//                   {promotion.usageLimit
//                     ? `${promotion.usageLimit - promotion.usedCount} uses left`
//                     : "Unlimited uses"}
//                 </span>
//               </div>

//               <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
//                 <Tag className="w-4 h-4" />
//                 <span>
//                   Applies to: {promotion.applicabilityScope.replace("_", " ")}
//                 </span>
//               </div>
//             </div>

//             {/* Promotion Code */}
//             {publicCode && (
//               <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
//                       Promotion Code
//                     </p>
//                     <code className="text-lg font-mono font-bold text-gray-900 dark:text-white">
//                       {publicCode.code}
//                     </code>
//                   </div>
//                   <div className="flex space-x-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => handleCopyCode(publicCode.code)}
//                       className="flex items-center space-x-1"
//                     >
//                       {copied === publicCode.code ? (
//                         <Check className="w-4 h-4" />
//                       ) : (
//                         <Copy className="w-4 h-4" />
//                       )}
//                       <span>
//                         {copied === publicCode.code ? "Copied" : "Copy"}
//                       </span>
//                     </Button>
//                     <Button
//                       size="sm"
//                       onClick={() => handleApplyCode(publicCode.code)}
//                       disabled={isApplying}
//                       className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
//                     >
//                       {isApplying ? "Applying..." : "Apply Now"}
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Stats */}
//             <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
//               <div className="text-center">
//                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {promotion.totalRedemptions}
//                 </p>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   Times Used
//                 </p>
//               </div>
//               <div className="text-center">
//                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
//                   ${promotion.totalRevenue.toFixed(0)}
//                 </p>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   Total Savings
//                 </p>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </motion.div>
//   );
// }

// // PromotionStats Component
// export function PromotionStats({
//   total,
//   active,
//   expiringSoon,
// }: PromotionStatsProps) {
//   const stats = [
//     {
//       title: "Available Offers",
//       value: total,
//       icon: Gift,
//       color: "from-blue-500 to-blue-600",
//       change: `${active} currently active`,
//     },
//     {
//       title: "Active Promotions",
//       value: active,
//       icon: Zap,
//       color: "from-green-500 to-emerald-500",
//       change: "Ready to use",
//     },
//     {
//       title: "Expiring Soon",
//       value: expiringSoon,
//       icon: Timer,
//       color: "from-yellow-500 to-orange-500",
//       change: expiringSoon > 0 ? "Act fast!" : "All good",
//     },
//   ];

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//       {stats.map((stat, index) => {
//         const IconComponent = stat.icon;
//         return (
//           <motion.div
//             key={stat.title}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: index * 0.1 }}
//             whileHover={{ y: -2 }}
//           >
//             <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all">
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div className="space-y-2">
//                     <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
//                       {stat.title}
//                     </p>
//                     <p className="text-3xl font-bold text-gray-900 dark:text-white">
//                       {stat.value}
//                     </p>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">
//                       {stat.change}
//                     </p>
//                   </div>
//                   <div
//                     className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}
//                   >
//                     <IconComponent className="w-7 h-7 text-white" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>
//         );
//       })}
//     </div>
//   );
// }

// // PromotionCodeInput Component
// export function PromotionCodeInput() {
//   const [code, setCode] = useState("");
//   const [isValidating, setIsValidating] = useState(false);

//   const handleApplyCode = async () => {
//     if (!code.trim()) {
//       toast("Please enter a promotion code");
//       return;
//     }

//     setIsValidating(true);
//     try {
//       const result = await applyPromotionToCart(code.trim());
//       if (result.success) {
//         toast("Promotion applied successfully!");

//         setCode("");
//       } else {
//         toast(
//           "Invalid code: " +
//             (result.error || "This promotion code is not valid")
//         );
//       }
//     } catch (error) {
//       if (error instanceof Error) {
//         toast("Error: " + error.message);
//       } else {
//         toast("An unknown error occurred");
//       }
//     } finally {
//       setIsValidating(false);
//     }
//   };

//   return (
//     <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200/50 dark:border-green-700/50">
//       <CardContent className="p-6">
//         <div className="flex items-center justify-between mb-4">
//           <div>
//             <h3 className="font-semibold text-green-900 dark:text-green-100">
//               Have a Promotion Code?
//             </h3>
//             <p className="text-green-700 dark:text-green-300 text-sm">
//               Enter your code to unlock exclusive discounts
//             </p>
//           </div>
//           <Tag className="w-8 h-8 text-green-600" />
//         </div>

//         <div className="flex space-x-2">
//           <Input
//             value={code}
//             onChange={(e) => setCode(e.target.value.toUpperCase())}
//             placeholder="Enter promotion code"
//             className="bg-white/50 dark:bg-gray-700/50 border-green-200 dark:border-green-700"
//             onKeyPress={(e) => e.key === "Enter" && handleApplyCode()}
//           />
//           <Button
//             onClick={handleApplyCode}
//             disabled={isValidating || !code.trim()}
//             className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
//           >
//             {isValidating ? "Validating..." : "Apply"}
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// // ActivePromotions Component
// export function ActivePromotions() {
//   const [cart, setCart] = useState<any>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   React.useEffect(() => {
//     const fetchCart = async () => {
//       try {
//         const result = await getCart();
//         if (result.success) {
//           setCart(result.cart);
//         }
//       } catch (error) {
//         console.error("Failed to fetch cart:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchCart();
//   }, []);

//   const handleRemovePromotion = async () => {
//     try {
//       const result = await removePromotionFromCart();
//       if (result.success) {
//         setCart(result.cart);
//         toast("Promotion removed successfully!");
//       }
//     } catch (error) {
//       toast(
//         "Error: " +
//           (error instanceof Error
//             ? error.message
//             : "Failed to remove promotion")
//       );
//     }
//   };

//   if (isLoading) {
//     return null;
//   }

//   if (!cart?.hasPromotionApplied) {
//     return null;
//   }

//   return (
//     <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/50 dark:border-purple-700/50">
//       <CardContent className="p-6">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
//               <Check className="w-5 h-5 text-purple-600" />
//             </div>
//             <div>
//               <h3 className="font-semibold text-purple-900 dark:text-purple-100">
//                 Active Promotion: {cart.promotionName}
//               </h3>
//               <p className="text-purple-700 dark:text-purple-300 text-sm">
//                 Code: {cart.promotionCode} • Saving: $
//                 {cart.promotionDiscount.toFixed(2)}
//               </p>
//             </div>
//           </div>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={handleRemovePromotion}
//             className="border-purple-300 text-purple-700 hover:bg-purple-100"
//           >
//             <X className="w-4 h-4 mr-1" />
//             Remove
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// // EmptyState Component
// export function EmptyState({
//   title,
//   description,
//   actionLabel,
//   actionHref,
//   icon,
// }: EmptyStateProps) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.9 }}
//       animate={{ opacity: 1, scale: 1 }}
//       className="text-center py-12"
//     >
//       <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
//         {icon}
//       </div>
//       <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//         {title}
//       </h3>
//       <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
//         {description}
//       </p>
//       <Button
//         asChild
//         className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
//       >
//         <Link href={actionHref}>{actionLabel}</Link>
//       </Button>
//     </motion.div>
//   );
// }
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Tag,
  Percent,
  Calendar,
  Clock,
  Gift,
  TrendingUp,
  Copy,
  Check,
  AlertCircle,
  Zap,
  Star,
  ShoppingCart,
  X,
  DollarSign,
  Users,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Types
interface Promotion {
  _id: string;
  name: string;
  description?: string;
  type: string;
  discountType: string;
  discountValue: number;
  codes: {
    code: string;
    isPublic: boolean;
    usageLimit?: number;
    usedCount: number;
    isActive: boolean;
    createdAt: string;
  }[];
  applicabilityScope: string;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  usedCount: number;
  minimumPurchaseAmount?: number;
  minimumQuantity?: number;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
  isScheduled: boolean;
  totalRedemptions: number;
  totalRevenue: number;
  tags: string[];
  createdAt: string;
}

interface PromotionCardProps {
  promotion: Promotion;
}

interface PromotionStatsProps {
  total: number;
  active: number;
  expiringSoon: number;
}

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  icon: string;
}

// Simplified promotion application (using native fetch to avoid potential React loops)
async function applyPromotion(
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Import the action dynamically to avoid any circular import issues
    const { applyPromotionToCart } = await import(
      "@/lib/actions/promotionValidationServerAction"
    );
    const result = await applyPromotionToCart(code);
    return result;
  } catch (error) {
    console.error("Error applying promotion:", error);
    return { success: false, error: "Failed to apply promotion" };
  }
}

// PromotionCard Component
export function PromotionCard({ promotion }: PromotionCardProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState<string | null>(null);

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "seasonal":
        return {
          color:
            "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
          icon: Calendar,
          iconColor: "text-orange-600",
        };
      case "flash_sale":
        return {
          color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          icon: Zap,
          iconColor: "text-red-600",
        };
      case "custom":
        return {
          color:
            "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
          icon: Star,
          iconColor: "text-purple-600",
        };
      default:
        return {
          color:
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          icon: Gift,
          iconColor: "text-blue-600",
        };
    }
  };

  const getDiscountText = () => {
    switch (promotion.discountType) {
      case "percentage":
        return `${promotion.discountValue}% OFF`;
      case "fixed_amount":
        return `$${promotion.discountValue} OFF`;
      case "buy_x_get_y":
        return "Buy X Get Y";
      default:
        return "DISCOUNT";
    }
  };

  const getExpiryStatus = () => {
    if (!promotion.endsAt) return null;

    const endDate = new Date(promotion.endsAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0)
      return { status: "expired", text: "Expired", color: "text-red-600" };
    if (daysUntilExpiry <= 3)
      return {
        status: "urgent",
        text: `${daysUntilExpiry}d left`,
        color: "text-red-600",
      };
    if (daysUntilExpiry <= 7)
      return {
        status: "soon",
        text: `${daysUntilExpiry}d left`,
        color: "text-yellow-600",
      };
    return {
      status: "active",
      text: `${daysUntilExpiry}d left`,
      color: "text-green-600",
    };
  };

  const typeConfig = getTypeConfig(promotion.type);
  const TypeIcon = typeConfig.icon;
  const expiryStatus = getExpiryStatus();
  const publicCode = promotion.codes.find(
    (code) => code.isPublic && code.isActive
  );

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast.error("Could not copy code to clipboard");
    }
  };

  const handleApplyCode = async (code: string) => {
    if (isApplying) return; // Prevent multiple applications

    setIsApplying(code);

    try {
      const result = await applyPromotion(code);
      if (result.success) {
        toast.success(`${promotion.name} has been applied to your cart!`);

        // Use window.location instead of router to ensure clean page reload
        setTimeout(() => {
          window.location.href = "/cart";
        }, 1500);
      } else {
        toast.error(result.error || "Failed to apply promotion");
      }
    } catch (error) {
      toast.error("Failed to apply promotion");
    } finally {
      setIsApplying(null);
    }
  };

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all overflow-hidden">
        <CardContent className="p-0">
          {/* Header with gradient */}
          <div
            className={`bg-gradient-to-r ${typeConfig.color.includes("orange") ? "from-orange-500 to-red-500" : typeConfig.color.includes("red") ? "from-red-500 to-pink-500" : typeConfig.color.includes("purple") ? "from-purple-500 to-blue-500" : "from-blue-500 to-green-500"} p-6 text-white`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <TypeIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">{promotion.name}</h3>
                  {promotion.description && (
                    <p className="text-white/80 text-sm mt-1">
                      {promotion.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black">{getDiscountText()}</div>
                {expiryStatus && (
                  <div
                    className={`text-sm ${expiryStatus.color} bg-white/20 px-2 py-1 rounded-full mt-1`}
                  >
                    <Timer className="w-3 h-3 inline mr-1" />
                    {expiryStatus.text}
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {promotion.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {promotion.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-white/20 text-white text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Requirements */}
            <div className="space-y-3 mb-6">
              {promotion.minimumPurchaseAmount && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <DollarSign className="w-4 h-4" />
                  <span>
                    Minimum purchase: ${promotion.minimumPurchaseAmount}
                  </span>
                </div>
              )}

              {promotion.minimumQuantity && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Minimum {promotion.minimumQuantity} items</span>
                </div>
              )}

              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>
                  {promotion.usageLimit
                    ? `${promotion.usageLimit - promotion.usedCount} uses left`
                    : "Unlimited uses"}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Tag className="w-4 h-4" />
                <span>
                  Applies to: {promotion.applicabilityScope.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Promotion Code */}
            {publicCode && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Promotion Code
                    </p>
                    <code className="text-lg font-mono font-bold text-gray-900 dark:text-white">
                      {publicCode.code}
                    </code>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyCode(publicCode.code)}
                      className="flex items-center space-x-1"
                    >
                      {copied === publicCode.code ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>
                        {copied === publicCode.code ? "Copied" : "Copy"}
                      </span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApplyCode(publicCode.code)}
                      disabled={isApplying === publicCode.code}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                    >
                      {isApplying === publicCode.code
                        ? "Applying..."
                        : "Apply Now"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {promotion.totalRedemptions}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Times Used
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${promotion.totalRevenue.toFixed(0)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Savings
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// PromotionStats Component
export function PromotionStats({
  total,
  active,
  expiringSoon,
}: PromotionStatsProps) {
  const stats = [
    {
      title: "Available Offers",
      value: total,
      icon: Gift,
      color: "from-blue-500 to-blue-600",
      change: `${active} currently active`,
    },
    {
      title: "Active Promotions",
      value: active,
      icon: Zap,
      color: "from-green-500 to-emerald-500",
      change: "Ready to use",
    },
    {
      title: "Expiring Soon",
      value: expiringSoon,
      icon: Timer,
      color: "from-yellow-500 to-orange-500",
      change: expiringSoon > 0 ? "Act fast!" : "All good",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
          >
            <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stat.change}
                    </p>
                  </div>
                  <div
                    className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}
                  >
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

// Simplified PromotionCodeInput Component
export function PromotionCodeInput() {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const handleApplyCode = async () => {
    if (!code.trim() || isValidating) return;

    setIsValidating(true);

    try {
      const result = await applyPromotion(code.trim());
      if (result.success) {
        toast.success("Your discount has been applied to the cart!");
        setCode("");
        // Navigate to cart page
        setTimeout(() => {
          window.location.href = "/cart";
        }, 1500);
      } else {
        toast.error(result.error || "This promotion code is not valid");
      }
    } catch (error) {
      toast.error("Failed to apply promotion code");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200/50 dark:border-green-700/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              Have a Promotion Code?
            </h3>
            <p className="text-green-700 dark:text-green-300 text-sm">
              Enter your code to unlock exclusive discounts
            </p>
          </div>
          <Tag className="w-8 h-8 text-green-600" />
        </div>

        <div className="flex space-x-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter promotion code"
            className="bg-white/50 dark:bg-gray-700/50 border-green-200 dark:border-green-700"
            onKeyPress={(e) => e.key === "Enter" && handleApplyCode()}
            disabled={isValidating}
          />
          <Button
            onClick={handleApplyCode}
            disabled={isValidating || !code.trim()}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            {isValidating ? "Applying..." : "Apply"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Simplified ActivePromotions Component - removed automatic cart fetching to prevent loops
export function ActivePromotions() {
  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/50 dark:border-purple-700/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                🎉 Promotions Applied Successfully!
              </h3>
              <p className="text-purple-700 dark:text-purple-300 text-sm">
                Check your cart to see the applied discounts
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-purple-300 text-purple-700 hover:bg-purple-100"
            asChild
          >
            <Link href="/cart">
              <ShoppingCart className="w-4 h-4 mr-1" />
              View Cart
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// EmptyState Component
export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {description}
      </p>
      <Button
        asChild
        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
      >
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </motion.div>
  );
}
