"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  Truck,
  User,
  Stethoscope,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mobileNavigation = [
  {
    name: "Dashboard",
    href: "/account",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Orders",
    href: "/account/orders",
    icon: ShoppingBag,
    badge: null,
  },
  {
    name: "Consultations",
    href: "/account/consultations",
    icon: Stethoscope,
    badge: null,
  },
  {
    name: "Favorites",
    href: "/account/favorites",
    icon: Heart,
    badge: null,
  },
  {
    name: "memberships",
    href: "/account/memberships",
    icon: User,
    badge: null,
  },
];

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-green-200/50 dark:border-gray-700/50">
        <div className="grid grid-cols-5 h-16">
          {mobileNavigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/account" && pathname.startsWith(item.href));

            return (
              <Link key={item.name} href={item.href} className="relative">
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={`
                    flex flex-col items-center justify-center h-full space-y-1 transition-colors duration-200
                    ${
                      isActive
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  `}
                >
                  <div className="relative">
                    <item.icon
                      className={`
                      h-5 w-5 transition-all duration-200
                      ${isActive ? "scale-110" : ""}
                    `}
                    />

                    {item.badge && (
                      <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500">
                        {item.badge}
                      </Badge>
                    )}
                  </div>

                  <span
                    className={`
                    text-xs font-medium transition-all duration-200
                    ${isActive ? "scale-95" : ""}
                  `}
                  >
                    {item.name}
                  </span>

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveIndicator"
                      className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-b-full"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
