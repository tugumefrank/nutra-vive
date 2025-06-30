"use client";
import { useSidebar } from "@/app/contexts/SidebarContext";
import React, { useState } from "react";
import SidebarContent from "./SidebarContent";
import { usePathname } from "next/navigation";

export default function SharedSidebarContent() {
  const { isMobileOpen, isCollapsed, toggleCollapsed, closeMobile } =
    useSidebar();
  // const [currentPath, setCurrentPath] = useState("/admin");
  const currentPath = usePathname();

  const handleNavigation = (href: string) => {
    closeMobile(); // Close mobile sidebar on navigation
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-transparent opacity-100 z-40 lg:hidden"
          onClick={() => closeMobile()}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`
          lg:hidden fixed top-0 bottom-0 z-50 transition-transform duration-500 ease-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ left: 0, width: 280 }}
      >
        <div className="h-full bg-green-100 border-r border-green-100/80 flex flex-col shadow-2xl shadow-green-500/5 overflow-hidden">
          <SidebarContent
            isCollapsed={false}
            isMobile={true}
            currentPath={currentPath}
            onNavigate={handleNavigation}
            onClose={closeMobile}
          />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div
        className="hidden lg:block relative"
        style={{ width: isCollapsed ? 80 : 280 }}
      >
        <div className="h-full bg-green-50/80 border-r border-green-100 flex flex-col shadow-2xl shadow-green-500/5 overflow-hidden">
          <SidebarContent
            isCollapsed={isCollapsed}
            isMobile={false}
            currentPath={currentPath}
            onNavigate={handleNavigation}
            onToggleCollapse={toggleCollapsed}
          />
        </div>
      </div>
    </>
  );
}
