"use client";

import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileBottomNav } from "./MobileBottomNav";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { useEffect } from "react";

import { motion } from "framer-motion";
import { useThemeStore } from "@/store";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { setTheme } = useThemeStore();

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 pb-20 md:pb-0"
      >
        {children}
      </motion.main>
      <Footer />
      <MobileBottomNav />
      <CartDrawer />
      <ScrollToTop />
    </div>
  );
}
