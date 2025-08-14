"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Menu,
  X,
  Leaf,
  Settings,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useCartStats,
  useCartDrawer,
  useUnifiedCartStore,
} from "@/store/unifiedCartStore";
import { useFavoritesStore, useThemeStore, useUIStore } from "@/store";
import { cn } from "@/lib/utils";

interface HeaderProps {
  variant?: "default" | "minimal" | "transparent";
  className?: string;
}

export function Header({ variant = "default", className }: HeaderProps) {
  const { user } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);

  // Use unified cart store hooks
  const stats = useCartStats();
  const { openCart } = useCartDrawer();
  const initializing = useUnifiedCartStore((state) => state.initializing);
  const isAuthenticated = !!user;

  // Check if user is admin
  const isAdmin = useMemo(() => {
    return user?.primaryEmailAddress?.emailAddress === "frankholmez@gmail.com";
  }, [user?.primaryEmailAddress?.emailAddress]);

  const favoriteCount = useFavoritesStore(
    (state: { items: string | any[] }) => state.items.length
  );

  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Define the type for navigation items
  type NavItem = {
    href: string;
    label: string;
    icon?: React.ElementType;
    isSpecial?: boolean;
  };

  // Dynamic navigation items based on authentication and admin status
  const navItems: NavItem[] = useMemo(() => {
    const baseItems: NavItem[] = [
      { href: "/", label: "Home" },
      { href: "/shop", label: "Shop" },
      { href: "/consultation", label: "Consultation" },
      { href: "/mobileapp", label: "Mobile App" },
    ];

    // Add conditional items based on user status
    if (isAuthenticated) {
      if (isAdmin) {
        baseItems.push({
          href: "/admin",
          label: "Dashboard",
          icon: Settings,
          isSpecial: true,
        });
      } else {
        baseItems.push({
          href: "/account",
          label: "My Account",
          icon: UserCog,
          isSpecial: true,
        });
      }
    }

    return baseItems;
  }, [isAuthenticated, isAdmin]);

  // Get header styles based on variant
  const getHeaderStyles = () => {
    const baseStyles =
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500";

    switch (variant) {
      case "transparent":
        return cn(
          baseStyles,
          isScrolled
            ? "bg-background/90 backdrop-blur-xl border-b shadow-lg"
            : "bg-transparent",
          className
        );

      case "minimal":
        return cn(baseStyles, "bg-background border-b shadow-sm", className);

      default:
        return cn(
          baseStyles,
          isScrolled
            ? "bg-background/90 backdrop-blur-xl shadow-lg"
            : "bg-background shadow-md",
          className
        );
    }
  };

  // Get container height based on variant
  const getContainerHeight = () => {
    switch (variant) {
      case "minimal":
        return "h-16";
      default:
        return "h-20";
    }
  };

  // Minimal variant - simplified header
  if (variant === "minimal") {
    return (
      <motion.header
        className={getHeaderStyles()}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-4">
          <div
            className={cn(
              "flex items-center justify-between",
              getContainerHeight()
            )}
          >
            {/* Logo - Simplified */}
            <Link
              href="/"
              className="flex items-center space-x-2 hover-lift group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 via-wellness-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-heading font-bold gradient-text">
                Nutra-Vive
              </span>
            </Link>

            {/* Minimal Actions */}
            <div className="flex items-center space-x-1">
              {/* Cart - Minimal with unified store */}
              <Button
                variant="ghost"
                size="icon"
                onClick={
                  isAuthenticated
                    ? openCart
                    : () => (window.location.href = "/sign-in")
                }
                className="relative h-9 w-9 rounded-lg hover:bg-muted/80 transition-all duration-300"
                title={isAuthenticated ? "View cart" : "Sign in to view cart"}
              >
                <ShoppingBag className="w-4 h-4" />
                {isAuthenticated && !initializing && stats.totalItems > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    key={stats.totalItems}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge
                      variant="destructive"
                      className="w-4 h-4 flex items-center justify-center text-xs p-0"
                    >
                      {stats.totalItems}
                    </Badge>
                  </motion.div>
                )}
              </Button>

              {/* User Menu - Minimal */}
              {user ? (
                <UserButton
                  afterSignOutUrl="/sign-in"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8 shadow-sm",
                      userButtonPopoverCard:
                        "bg-white/95 backdrop-blur-sm border border-gray-200/70 rounded-xl shadow-xl",
                    },
                  }}
                />
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="rounded-lg"
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.header>
    );
  }

  // Default and transparent variants - full header
  return (
    <motion.header
      className={getHeaderStyles()}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4">
        <div
          className={cn(
            "flex items-center justify-between",
            getContainerHeight()
          )}
        >
          {/* Logo - Enhanced */}
          <Link
            href="/"
            className="flex items-center space-x-3 hover-lift group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 via-wellness-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-2xl font-heading font-bold gradient-text">
                Nutra-Vive
              </span>
              <p className="text-xs text-black font-medium">
                Where Wellness Meets Flavor
              </p>
            </div>
          </Link>

          {/* Desktop Navigation - Enhanced */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 text-md font-bold transition-all duration-300 rounded-lg hover:bg-muted/50 group flex items-center gap-2",
                    item.isSpecial
                      ? "text-orange-600 hover:text-orange-700 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 hover:border-orange-300 shadow-sm hover:shadow-md"
                      : "text-black hover:text-primary"
                  )}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                  <span
                    className={cn(
                      "absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 transition-all duration-300 group-hover:w-full",
                      item.isSpecial
                        ? "bg-gradient-to-r from-orange-500 to-amber-500"
                        : "bg-gradient-to-r from-brand-500 to-wellness-500"
                    )}
                  ></span>
                </Link>
              );
            })}
          </nav>

          {/* Actions - Enhanced */}
          <div className="flex items-center space-x-1">
            {/* Favorites - Enhanced (Auth Only) */}
            <Button
              variant="ghost"
              size="icon"
              asChild={isAuthenticated ? true : false}
              onClick={
                isAuthenticated
                  ? undefined
                  : () => (window.location.href = "/sign-in")
              }
              className="h-10 w-10 rounded-xl hover:bg-muted/80 transition-all duration-300"
              title={
                isAuthenticated ? "View favorites" : "Sign in to view favorites"
              }
            >
              {isAuthenticated ? (
                <Link href="/favorites" className="relative">
                  <Heart className="w-5 h-5" />
                  {favoriteCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs p-0 animate-pulse"
                    >
                      {favoriteCount}
                    </Badge>
                  )}
                </Link>
              ) : (
                <div className="relative cursor-pointer">
                  <Heart className="w-5 h-5" />
                  {/* Small indicator for guests */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full opacity-60"></div>
                </div>
              )}
            </Button>

            {/* Cart - Unified with instant updates across all components */}
            <Button
              variant="ghost"
              size="icon"
              onClick={
                isAuthenticated
                  ? openCart
                  : () => (window.location.href = "/sign-in")
              }
              className="relative h-10 w-10 rounded-xl hover:bg-muted/80 transition-all duration-300 hover:scale-105"
              title={isAuthenticated ? "View cart" : "Sign in to view cart"}
            >
              <ShoppingBag className="w-5 h-5" />

              {/* Cart count with smooth animation - updates instantly across all components */}
              {isAuthenticated && stats.totalItems > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  key={stats.totalItems} // Key ensures re-animation on count change
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute -top-1 -right-1"
                >
                  <Badge
                    variant="destructive"
                    className="w-5 h-5 flex items-center justify-center text-xs p-0 font-bold shadow-md"
                  >
                    {stats.totalItems}
                  </Badge>
                </motion.div>
              )}

              {/* Loading indicator for cart initialization */}
              {/* {isAuthenticated && initializing && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse opacity-70"></div>
              )} */}

              {/* Small indicator for guests */}
              {!isAuthenticated && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full opacity-60"></div>
              )}
            </Button>

            {/* User Menu - Enhanced */}
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center gap-3">
                  {/* Admin Badge */}
                  {isAdmin && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="hidden lg:flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200 rounded-full"
                    >
                      <Settings className="w-3 h-3 text-orange-600" />
                      <span className="text-xs font-semibold text-orange-700">
                        Admin
                      </span>
                    </motion.div>
                  )}

                  <UserButton
                    afterSignOutUrl="/sign-in"
                    appearance={{
                      elements: {
                        userButtonAvatarBox: cn(
                          "w-9 h-9 shadow-sm transition-all duration-300",
                          isAdmin && "ring-2 ring-orange-300 ring-offset-1"
                        ),
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
                <div className="flex space-x-3 items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-1 rounded-xl"
                  >
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-1 hidden lg:block rounded-xl items-center"
                  >
                    <Link href="/sign-up">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="md:hidden h-10 w-10 rounded-xl hover:bg-muted/80 transition-all duration-300"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isMobileMenuOpen ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </motion.div>
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Enhanced */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-background/95 backdrop-blur-xl shadow-lg"
          >
            <div className="container mx-auto px-4 py-6">
              <nav className="flex flex-col space-y-2">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center justify-between p-3 text-sm font-semibold transition-all duration-300 rounded-xl hover:bg-muted/50 group",
                          item.isSpecial
                            ? "text-orange-600 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200"
                            : "text-muted-foreground hover:text-primary"
                        )}
                        onClick={() => toggleMobileMenu()}
                      >
                        <div className="flex items-center gap-2">
                          {Icon && <Icon className="w-4 h-4" />}
                          {item.label}
                          {item.isSpecial && (
                            <Badge
                              variant="secondary"
                              className="bg-orange-100 text-orange-700 text-xs"
                            >
                              Admin
                            </Badge>
                          )}
                        </div>
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                            item.isSpecial
                              ? "bg-gradient-to-r from-orange-500 to-amber-500"
                              : "bg-gradient-to-r from-brand-500 to-wellness-500"
                          )}
                        ></span>
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Mobile Cart & Favorites Section for authenticated users */}
                {isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="pt-4 border-t border-muted"
                  >
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          openCart();
                          toggleMobileMenu();
                        }}
                        disabled={initializing}
                        className="flex-1 rounded-xl flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Cart
                        {!initializing && stats.totalItems > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {stats.totalItems}
                          </Badge>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        asChild
                        onClick={() => toggleMobileMenu()}
                        className="flex-1 rounded-xl flex items-center justify-center gap-2"
                      >
                        <Link href="/favorites">
                          <Heart className="w-4 h-4" />
                          Favorites
                          {favoriteCount > 0 && (
                            <Badge variant="secondary" className="ml-1">
                              {favoriteCount}
                            </Badge>
                          )}
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                )}

                {!isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="flex space-x-3 pt-4 border-t border-muted"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1 rounded-xl"
                    >
                      <Link href="/sign-in">Sign In</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1 rounded-xl"
                    >
                      <Link href="/sign-up">Get Started</Link>
                    </Button>
                  </motion.div>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
