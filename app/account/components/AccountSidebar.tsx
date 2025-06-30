"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  ShoppingBag,
  Heart,
  Star,
  Truck,
  Gift,
  Bell,
  Settings,
  LayoutDashboard,
  Stethoscope,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useClerk } from "@clerk/nextjs";

const navigation = [
  {
    name: "Dashboard",
    href: "/account",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Consultations",
    href: "/account/consultations",
    icon: Stethoscope,
    badge: null,
  },
  {
    name: "Orders",
    href: "/account/orders",
    icon: ShoppingBag,
    badge: null,
  },
  {
    name: "Order Tracking",
    href: "/account/tracking",
    icon: Truck,
    badge: null,
  },
  {
    name: "Favorites",
    href: "/account/favorites",
    icon: Heart,
    badge: null,
  },

  {
    name: "Promotions",
    href: "/account/promotions",
    icon: Gift,
    badge: "New",
  },

  {
    name: "Memberships",
    href: "/account/memberships",
    icon: User,
    badge: null,
  },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-green-200/50 dark:border-gray-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              My Account
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Wellness Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/account" && pathname.startsWith(item.href));

          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  group relative flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                  ${
                    isActive
                      ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg shadow-green-500/25"
                      : "text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-800/50 hover:text-green-700 dark:hover:text-green-400"
                  }
                `}
              >
                <item.icon
                  className={`
                  mr-3 h-5 w-5 transition-colors duration-200
                  ${isActive ? "text-white" : "text-gray-400 group-hover:text-green-500"}
                `}
                />

                <span className="flex-1">{item.name}</span>

                {item.badge && (
                  <Badge
                    variant={isActive ? "secondary" : "default"}
                    className={`
                      ml-2 px-2 py-0.5 text-xs
                      ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      }
                    `}
                  >
                    {item.badge}
                  </Badge>
                )}

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl"
                    style={{ zIndex: -1 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-green-200/50 dark:border-gray-700/50">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={() => signOut()}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
