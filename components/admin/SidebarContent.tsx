"use client";
import Link from "next/link";
import React from "react";

interface SidebarContentProps {
  isCollapsed: boolean;
  isMobile: boolean;
  onNavigate: (href: string) => void;
  onClose?: () => void;
  onToggleCollapse?: () => void;
  currentPath: string;
}

export default function SidebarContent({
  isCollapsed,
  isMobile,
  onNavigate,
  onClose,
  onToggleCollapse,
  currentPath,
}: SidebarContentProps) {
  const menuItems = [
    // Main Dashboard
    {
      name: "Dashboard",
      href: "/admin",
      icon: "📊",
      section: "main",
      description: "Overview & Analytics",
    },
    // ... rest of your menuItems (copy from SharedSidebarContent)
    {
      name: "Products",
      href: "/admin/products",
      icon: "☕",
      section: "products",
      description: "Juices & Teas",
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: "📋",
      section: "products",
      description: "Product Categories",
    },
    {
      name: "Inventory",
      href: "/admin/inventory",
      icon: "📦",
      section: "products",
      description: "Stock Management",
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: "🛒",
      section: "sales",
      description: "Order Management",
    },
    {
      name: "Shipping",
      href: "/admin/shipping",
      icon: "🚚",
      section: "sales",
      description: "Delivery Tracking",
    },
    {
      name: "Revenue",
      href: "/admin/revenue",
      icon: "💰",
      section: "sales",
      description: "Financial Reports",
    },
    {
      name: "Customers",
      href: "/admin/customers",
      icon: "👥",
      section: "customers",
      description: "Customer Database",
    },
    {
      name: "Consultations",
      href: "/admin/consultations",
      icon: "💚",
      section: "customers",
      description: "Health Consultations",
    },
    {
      name: "Reviews",
      href: "/admin/reviews",
      icon: "⭐",
      section: "customers",
      description: "Customer Feedback",
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: "📈",
      section: "growth",
      description: "Performance Metrics",
    },
    {
      name: "Promotions",
      href: "/admin/promotions",
      icon: "🎯",
      section: "growth",
      description: "Discounts & Offers",
    },
    {
      name: "Reports",
      href: "/admin/reports",
      icon: "📄",
      section: "growth",
      description: "Business Reports",
    },
  ];

  const menuSections = {
    main: menuItems.filter((item) => item.section === "main"),
    products: menuItems.filter((item) => item.section === "products"),
    sales: menuItems.filter((item) => item.section === "sales"),
    customers: menuItems.filter((item) => item.section === "customers"),
    growth: menuItems.filter((item) => item.section === "growth"),
  };

  const sectionConfig = {
    main: { title: "", icon: "", color: "" },
    products: {
      title: "Product Management",
      icon: "☕",
      color: "text-emerald-600",
    },
    sales: {
      title: "Sales & Orders",
      icon: "🛒",
      color: "text-orange-600",
    },
    customers: {
      title: "Customer Care",
      icon: "👥",
      color: "text-blue-600",
    },
    growth: {
      title: "Analytics & Growth",
      icon: "📈",
      color: "text-purple-600",
    },
  };

  const renderMenuItem = (item: any) => {
    const isActive =
      currentPath === item.href ||
      (item.href !== "/admin" && currentPath.startsWith(item.href));

    return (
      <li key={item.name}>
        <Link
          href={item.href}
          onClick={() => {
            if (isMobile && onClose) {
              onClose(); // Close mobile sidebar
            }
          }}
          className={`group w-full flex items-center px-4 py-3 rounded-2xl transition-all duration-300 ${
            isActive
              ? "bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-700 shadow-lg shadow-emerald-500/10 border border-emerald-200/50"
              : "text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 hover:text-gray-800 hover:shadow-md hover:border hover:border-gray-200/50"
          }`}
        >
          <div
            className={`flex-shrink-0 p-2 rounded-xl transition-all duration-300 text-lg ${
              isActive
                ? "bg-emerald-500/10 text-emerald-600 shadow-sm"
                : "bg-gray-100/80 text-gray-500 group-hover:bg-gray-200/80 group-hover:text-gray-700"
            }`}
          >
            {item.icon}
          </div>
          {!isCollapsed && (
            <div className="ml-4 flex flex-col text-left">
              <span className="font-semibold text-sm leading-tight">
                {item.name}
              </span>
              <span
                className={`text-xs opacity-70 ${
                  isActive ? "text-emerald-600" : "text-gray-500"
                }`}
              >
                {item.description}
              </span>
            </div>
          )}
          {isActive && !isCollapsed && (
            <div className="ml-auto w-1 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full shadow-lg" />
          )}
        </Link>
      </li>
    );
  };

  const renderSection = (sectionKey: keyof typeof menuSections) => {
    const items = menuSections[sectionKey];
    const config = sectionConfig[sectionKey];

    if (items.length === 0) return null;

    return (
      <div key={sectionKey} className="mb-8">
        {config.title && !isCollapsed && (
          <div className="px-4 mb-4">
            <div className="flex items-center gap-2 pb-2">
              <span className="text-sm">{config.icon}</span>
              <h3
                className={`text-xs font-bold uppercase tracking-wider ${config.color}`}
              >
                {config.title}
              </h3>
            </div>
            <div className="h-px bg-gradient-to-r from-gray-200 via-gray-300 to-transparent"></div>
          </div>
        )}
        <ul className="space-y-2">{items.map(renderMenuItem)}</ul>
      </div>
    );
  };

  return (
    <>
      {/* Logo and Toggle Button */}
      <div className="h-20 flex items-center px-6 border-b border-green-100/50 bg-gradient-to-r from-emerald-50/50 to-green-50/50">
        <div className="flex items-center space-x-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30">
            <div className="absolute inset-0 flex items-center justify-center text-white text-xl">
              🌿
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20"></div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 text-xl leading-tight">
                Nutra-Vive
              </span>
              <span className="font-medium text-emerald-600 text-sm leading-tight -mt-0.5">
                Admin Dashboard
              </span>
            </div>
          )}
        </div>
        <div className="ml-auto flex items-center">
          {/* Desktop collapse button */}
          {/* {!isMobile && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`p-2 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-300 shadow-sm hover:shadow-md ${
                isCollapsed ? "rotate-180" : ""
              }`}
            >
              ←
            </button>
          )} */}
          {!isMobile && onToggleCollapse && (
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-[60]">
              <button
                onClick={onToggleCollapse}
                className={`
        relative group overflow-hidden
        w-8 h-16 rounded-r-2xl 
        bg-white/90 backdrop-blur-xl
        border-r border-t border-b border-emerald-200/50
        shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-emerald-500/25
        transition-all duration-500 ease-out
        hover:bg-emerald-50/90 active:scale-95
        hover:w-9
      `}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 to-emerald-500/0 group-hover:from-emerald-400/10 group-hover:to-emerald-500/20 transition-all duration-500 rounded-r-2xl" />

                {/* Arrow with smooth rotation */}
                <div
                  className={`
        relative z-10 flex items-center justify-center h-full
        transition-transform duration-700 ease-out
        ${isCollapsed ? "rotate-180" : "rotate-0"}
      `}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-gray-500 group-hover:text-emerald-600 transition-all duration-300"
                  >
                    <path
                      d="M15 18l-6-6 6-6"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Side accent line */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-emerald-500/30 group-hover:bg-emerald-500/60 transition-all duration-300" />
              </button>
            </div>
          )}

          {/* Mobile close button */}
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-6 px-2 custom-scrollbar">
        {renderSection("main")}
        {renderSection("products")}
        {renderSection("sales")}
        {renderSection("customers")}
        {renderSection("growth")}
      </div>

      {/* Footer */}

      {/* Quick Stats Card */}
      {!isCollapsed && (
        <div className="mx-4 mb-4 p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-200 text-lg">⚡</span>
            <span className="text-xs font-medium text-emerald-100">Today</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-emerald-100">Sales</span>
              <span className="font-bold">$1,247</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-emerald-100">Orders</span>
              <span className="font-bold">23</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
