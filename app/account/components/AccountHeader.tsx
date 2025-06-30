// "use client";

// import { usePathname } from "next/navigation";
// import { ChevronRight, Bell, Search, Menu } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// const pathNames: Record<string, string> = {
//   "/account": "Dashboard",
//   "/account/consultations": "Consultations",
//   "/account/orders": "Orders",
//   "/account/tracking": "Order Tracking",
//   "/account/favorites": "Favorites",
//   "/account/reviews": "Reviews",
//   "/account/promotions": "Promotions",
//   "/account/notifications": "Notifications",
//   "/account/profile": "Profile",
// };

// export function AccountHeader() {
//   const pathname = usePathname();

//   const breadcrumbs = pathname.split("/").filter(Boolean);
//   const currentPage = pathNames[pathname] || "Account";

//   return (
//     <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-green-200/50 dark:border-gray-700/50">
//       <div className="px-4 md:px-6 py-4">
//         <div className="flex items-center justify-between">
//           {/* Mobile Menu Button */}
//           <div className="md:hidden">
//             <Button variant="ghost" size="sm">
//               <Menu className="h-5 w-5" />
//             </Button>
//           </div>

//           {/* Breadcrumbs */}
//           <div className="flex items-center space-x-2 text-sm">
//             <span className="text-gray-500 dark:text-gray-400">Account</span>
//             {breadcrumbs.length > 1 && (
//               <>
//                 <ChevronRight className="h-4 w-4 text-gray-400" />
//                 <span className="font-medium text-gray-900 dark:text-white">
//                   {currentPage}
//                 </span>
//               </>
//             )}
//           </div>

//           {/* Search & Actions */}
//           <div className="flex items-center space-x-4">
//             {/* Search (hidden on mobile) */}
//             <div className="hidden md:block relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <Input
//                 type="search"
//                 placeholder="Search orders, products..."
//                 className="pl-10 w-64 bg-white/50 dark:bg-gray-800/50 border-green-200/50 dark:border-gray-600/50"
//               />
//             </div>

//             {/* Notifications */}
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" size="sm" className="relative">
//                   <Bell className="h-5 w-5" />
//                   <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500">
//                     3
//                   </Badge>
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end" className="w-80">
//                 <div className="p-4 border-b border-gray-200 dark:border-gray-700">
//                   <h3 className="font-semibold text-gray-900 dark:text-white">
//                     Notifications
//                   </h3>
//                 </div>
//                 <div className="p-2 space-y-2">
//                   <DropdownMenuItem className="p-3 cursor-pointer">
//                     <div>
//                       <p className="font-medium text-sm">Order Shipped</p>
//                       <p className="text-xs text-gray-500">
//                         Your order #NV-000123 has been shipped
//                       </p>
//                     </div>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem className="p-3 cursor-pointer">
//                     <div>
//                       <p className="font-medium text-sm">
//                         Consultation Reminder
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         Your consultation is tomorrow at 2 PM
//                       </p>
//                     </div>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem className="p-3 cursor-pointer">
//                     <div>
//                       <p className="font-medium text-sm">New Promotion</p>
//                       <p className="text-xs text-gray-500">
//                         15% off on all herbal teas this week
//                       </p>
//                     </div>
//                   </DropdownMenuItem>
//                 </div>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>

//         {/* Page Title */}
//         <div className="mt-4 md:mt-6">
//           <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
//             {currentPage}
//           </h1>
//           {pathname === "/account" && (
//             <p className="text-gray-600 dark:text-gray-400 mt-2">
//               Welcome back! Here's what's happening with your wellness journey.
//             </p>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// }
"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, Bell, Menu, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

const pathNames: Record<string, string> = {
  "/account": "Dashboard",
  "/account/consultations": "Consultations",
  "/account/orders": "Orders",
  "/account/tracking": "Order Tracking",
  "/account/favorites": "Favorites",
  "/account/reviews": "Reviews",
  "/account/promotions": "Promotions",
  "/account/notifications": "Notifications",
  "/account/profile": "Profile",
};

export function AccountHeader() {
  const pathname = usePathname();

  const breadcrumbs = pathname.split("/").filter(Boolean);
  const currentPage = pathNames[pathname] || "Account";

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-green-200/50 dark:border-gray-700/50">
      <div className="px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Account</span>
            {breadcrumbs.length > 1 && (
              <>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {currentPage}
                </span>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Globe Icon - Go to Website */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/">
                      <Globe className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Go to website</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                </div>
                <div className="p-2 space-y-2">
                  <DropdownMenuItem className="p-3 cursor-pointer">
                    <div>
                      <p className="font-medium text-sm">Order Shipped</p>
                      <p className="text-xs text-gray-500">
                        Your order #NV-000123 has been shipped
                      </p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3 cursor-pointer">
                    <div>
                      <p className="font-medium text-sm">
                        Consultation Reminder
                      </p>
                      <p className="text-xs text-gray-500">
                        Your consultation is tomorrow at 2 PM
                      </p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3 cursor-pointer">
                    <div>
                      <p className="font-medium text-sm">New Promotion</p>
                      <p className="text-xs text-gray-500">
                        15% off on all herbal teas this week
                      </p>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clerk User Profile */}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                  userButtonPopoverCard:
                    "bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm",
                  userButtonPopoverActions: "bg-white/50 dark:bg-gray-700/50",
                },
              }}
              afterSignOutUrl="/"
            />
          </div>
        </div>

        {/* Page Title */}
        <div className="mt-4 md:mt-6">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            {currentPage}
          </h1>
          {pathname === "/account" && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Welcome back! Here's what's happening with your wellness journey.
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
