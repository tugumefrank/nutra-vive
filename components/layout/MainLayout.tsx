// "use client";

// import { Header } from "./Header";
// import { Footer } from "./Footer";
// import { MobileBottomNav } from "./MobileBottomNav";
// import { CartDrawer } from "@/components/cart/CartDrawer";
// import { ScrollToTop } from "@/components/common/ScrollToTop";
// import { useEffect } from "react";

// import { motion } from "framer-motion";
// import { useThemeStore } from "@/store";

// interface MainLayoutProps {
//   children: React.ReactNode;
// }

// export function MainLayout({ children }: MainLayoutProps) {
//   const { setTheme } = useThemeStore();

//   useEffect(() => {
//     // Initialize theme on mount
//     const savedTheme = localStorage.getItem("nutra-vive-theme");
//     if (savedTheme) {
//       try {
//         const parsed = JSON.parse(savedTheme);
//         setTheme(parsed.state?.theme || "system");
//       } catch (error) {
//         console.error("Error parsing saved theme:", error);
//       }
//     }
//   }, [setTheme]);

//   return (
//     <div className="min-h-screen bg-background">
//       <Header />
//       <motion.main
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.3 }}
//         className="flex-1 pb-20 md:pb-0"
//       >
//         {children}
//       </motion.main>
//       <Footer />
//       <MobileBottomNav />
//       <CartDrawer />
//       <ScrollToTop />
//     </div>
//   );
// }
"use client";

import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileBottomNav } from "./MobileBottomNav";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useThemeStore } from "@/store";

interface LayoutConfig {
  showHeader?: boolean;
  showFooter?: boolean;
  showMobileNav?: boolean;
  showCartDrawer?: boolean;
  showScrollToTop?: boolean;
  headerVariant?: "default" | "minimal" | "transparent";
  footerVariant?: "default" | "minimal";
}

interface MainLayoutProps {
  children: React.ReactNode;
  config?: LayoutConfig;
  className?: string;
}

// Default configuration
const defaultConfig: LayoutConfig = {
  showHeader: true,
  showFooter: true,
  showMobileNav: true,
  showCartDrawer: true,
  showScrollToTop: true,
  headerVariant: "default",
  footerVariant: "default",
};

// Predefined layout presets for common use cases
export const layoutPresets = {
  // Full layout - all components visible (default)
  full: {
    showHeader: true,
    showFooter: true,
    showMobileNav: true,
    showCartDrawer: true,
    showScrollToTop: true,
  },

  // Header only - no footer, mobile nav, etc.
  headerOnly: {
    showHeader: true,
    showFooter: false,
    showMobileNav: false,
    showCartDrawer: true,
    showScrollToTop: true,
  },

  // Minimal - just content with cart and scroll
  minimal: {
    showHeader: false,
    showFooter: false,
    showMobileNav: false,
    showCartDrawer: true,
    showScrollToTop: true,
  },

  // Auth pages - header only with minimal styling
  auth: {
    showHeader: true,
    showFooter: false,
    showMobileNav: false,
    showCartDrawer: false,
    showScrollToTop: false,
    headerVariant: "minimal" as const,
  },

  // Checkout - minimal header, no distractions
  checkout: {
    showHeader: true,
    showFooter: false,
    showMobileNav: false,
    showCartDrawer: false,
    showScrollToTop: true,
    headerVariant: "minimal" as const,
  },

  // Landing page - full with transparent header
  landing: {
    showHeader: true,
    showFooter: true,
    showMobileNav: true,
    showCartDrawer: true,
    showScrollToTop: true,
    headerVariant: "transparent" as const,
  },

  // Admin/Dashboard - no public footer/mobile nav
  admin: {
    showHeader: true,
    showFooter: false,
    showMobileNav: false,
    showCartDrawer: false,
    showScrollToTop: true,
    headerVariant: "minimal" as const,
  },
} as const;

export function MainLayout({
  children,
  config = {},
  className = "",
}: MainLayoutProps) {
  const { setTheme } = useThemeStore();

  // Merge provided config with defaults
  const layoutConfig = { ...defaultConfig, ...config };

  useEffect(() => {
    // Initialize theme on mount
    const savedTheme = localStorage.getItem("nutra-vive-theme");
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        setTheme(parsed.state?.theme || "system");
      } catch (error) {
        console.error("Error parsing saved theme:", error);
      }
    }
  }, [setTheme]);

  // Calculate bottom padding based on mobile nav visibility
  const bottomPadding = layoutConfig.showMobileNav ? "pb-20 md:pb-0" : "pb-0";

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Conditional Header */}
      {layoutConfig.showHeader && (
        <Header variant={layoutConfig.headerVariant} />
      )}

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`flex-1 ${bottomPadding}`}
      >
        {children}
      </motion.main>

      {/* Conditional Footer */}
      {layoutConfig.showFooter && (
        <Footer variant={layoutConfig.footerVariant} />
      )}

      {/* Conditional Mobile Bottom Navigation */}
      {layoutConfig.showMobileNav && <MobileBottomNav />}

      {/* Conditional Cart Drawer */}
      {layoutConfig.showCartDrawer && <CartDrawer />}

      {/* Conditional Scroll to Top */}
      {layoutConfig.showScrollToTop && <ScrollToTop />}
    </div>
  );
}

// Convenience wrapper components for common layouts
export function FullLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <MainLayout config={layoutPresets.full} className={className}>
      {children}
    </MainLayout>
  );
}

export function HeaderOnlyLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <MainLayout config={layoutPresets.headerOnly} className={className}>
      {children}
    </MainLayout>
  );
}

export function MinimalLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <MainLayout config={layoutPresets.minimal} className={className}>
      {children}
    </MainLayout>
  );
}

export function AuthLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <MainLayout config={layoutPresets.auth} className={className}>
      {children}
    </MainLayout>
  );
}

export function CheckoutLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <MainLayout config={layoutPresets.checkout} className={className}>
      {children}
    </MainLayout>
  );
}

export function LandingLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <MainLayout config={layoutPresets.landing} className={className}>
      {children}
    </MainLayout>
  );
}

export function AdminLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <MainLayout config={layoutPresets.admin} className={className}>
      {children}
    </MainLayout>
  );
}
