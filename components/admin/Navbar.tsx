"use client";

import React, { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  Bell,
  Search,
  Settings,
  Menu,
  ChevronDown,
  LayoutDashboard,
  ShoppingCart,
  Package,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/app/contexts/SidebarContext";

export default function NutraViveNavbar() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const { user, isLoaded } = useUser();
  const { toggleMobile } = useSidebar();

  const toggleMobileSidebar = () => {
    console.log("Navbar toggle clicked"); // Debug log
    toggleMobile();
  };

  // Sample notifications for organic juice business
  const notifications = [
    {
      id: 1,
      type: "order",
      title: "New order received",
      message: "Order #NV-1001 for Berry Day Juice and Green Tea",
      time: "2 minutes ago",
      icon: <ShoppingCart className="h-4 w-4 text-emerald-500" />,
      bgColor: "bg-emerald-500/20",
    },
    {
      id: 2,
      type: "inventory",
      title: "Low stock alert",
      message: "Strawberry Hibiscus Tea - Only 5 units remaining",
      time: "1 hour ago",
      icon: <AlertCircle className="h-4 w-4 text-orange-500" />,
      bgColor: "bg-orange-500/20",
    },
    {
      id: 3,
      type: "consultation",
      title: "Consultation scheduled",
      message: "Health consultation with Emma Wilson confirmed for tomorrow",
      time: "3 hours ago",
      icon: <CheckCircle className="h-4 w-4 text-blue-500" />,
      bgColor: "bg-blue-500/20",
    },
  ];

  return (
    <div className="relative z-30">
      <header className="h-16 flex items-center justify-between px-6 border-b border-emerald-100/50 bg-white/95 backdrop-blur-sm shadow-sm">
        {/* Left Section - Branding & Title */}
        <div className="flex items-center">
          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 mr-3 rounded-xl text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center">
            {/* Logo */}
            <div className="h-9 w-9 rounded-xl  lg:hidden bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-500/30">
              🌿
            </div>

            {/* Brand Name - Hidden on mobile */}
            <div className="ml-3 hidden sm:block">
              <h1 className="font-bold text-gray-800 text-lg leading-tight">
                Nutra-Vive Admin Panel
              </h1>
              <p className="text-xs text-emerald-600 -mt-1 font-medium">
                manage all business operations
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Controls & User */}
        <div className="flex items-center space-x-3">
          {/* Search Bar */}
          <div
            className={`relative transition-all duration-300 ${
              isSearchExpanded ? "w-60" : "w-9"
            }`}
          >
            <div className="absolute inset-y-0 left-0 flex items-center pl-2">
              <Search
                className={`h-4 w-4 cursor-pointer transition-colors ${
                  isSearchExpanded
                    ? "text-gray-400"
                    : "text-gray-600 hover:text-emerald-600"
                }`}
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              />
            </div>
            <input
              type="text"
              placeholder="Search products, orders..."
              className={`w-full bg-gray-50/80 border border-gray-200/60 rounded-full py-1.5 pl-8 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 transition-all ${
                isSearchExpanded
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
              onBlur={(event) => {
                if (event.currentTarget && !event.currentTarget.value) {
                  setIsSearchExpanded(false);
                }
              }}
            />
            {!isSearchExpanded && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute inset-0 hover:bg-emerald-50 rounded-full"
                onClick={() => setIsSearchExpanded(true)}
              >
                <span className="sr-only">Search</span>
              </Button>
            )}
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all duration-200"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                  {notifications.length}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 bg-white/95 backdrop-blur-sm border border-gray-200/70 text-gray-800 rounded-xl shadow-xl shadow-emerald-500/10">
              <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
                <span className="font-semibold text-gray-800">
                  Notifications
                </span>
                <span className="text-xs bg-emerald-500/20 text-emerald-600 px-2 py-1 rounded-full font-medium">
                  {notifications.length} new
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200/70" />

              {/* Notification Items */}
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="py-3 px-4 hover:bg-gray-50/80 cursor-pointer border-none focus:bg-gray-50/80"
                  >
                    <div className="flex items-start w-full">
                      <div
                        className={`${notification.bgColor} p-2 rounded-xl mr-3 flex-shrink-0`}
                      >
                        {notification.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>

              <DropdownMenuSeparator className="bg-gray-200/70" />
              <div className="p-2">
                <Button
                  variant="ghost"
                  className="w-full justify-center text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-medium"
                >
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all duration-200"
            asChild
          >
            <Link href="/dashboard/settings">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200/70"></div>

          {/* User Profile */}
          <div className="flex items-center">
            {isLoaded ? (
              <div className="flex items-center gap-3">
                <div className="hidden lg:block text-right">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.fullName || user?.username || "Admin User"}
                  </p>
                  <p className="text-xs text-emerald-600 font-medium">
                    Administrator
                  </p>
                </div>

                <UserButton
                  afterSignOutUrl="/sign-in"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-9 h-9 shadow-sm",
                      userButtonPopoverCard:
                        "bg-white/95 backdrop-blur-sm border border-gray-200/70 text-gray-800 rounded-xl shadow-xl shadow-emerald-500/10",
                      userButtonPopoverActions: "text-gray-800",
                      userButtonPopoverActionButton:
                        "text-gray-700 hover:bg-gray-50/80 hover:text-gray-900",
                      userButtonPopoverActionButtonText: "text-gray-700",
                    },
                  }}
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse"></div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
