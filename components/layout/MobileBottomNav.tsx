// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { motion } from "framer-motion";
// import { Home, Store, Heart, ShoppingBag, User } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { useCartStore, useFavoritesStore, useUIStore } from "@/store";
// import { cn } from "@/lib/utils";

// export function MobileBottomNav() {
//   const pathname = usePathname();
//   const cartItemCount = useCartStore((state) => state.getItemCount());
//   const favoriteCount = useFavoritesStore((state) => state.items.length);
//   const { openCart } = useUIStore();

//   const navItems = [
//     {
//       href: "/",
//       label: "Home",
//       icon: Home,
//       isActive: pathname === "/",
//     },
//     {
//       href: "/shop",
//       label: "Shop",
//       icon: Store,
//       isActive: pathname.startsWith("/shop"),
//     },
//     {
//       href: "/favorites",
//       label: "Favorites",
//       icon: Heart,
//       isActive: pathname === "/favorites",
//       badge: favoriteCount,
//     },
//     {
//       href: "#",
//       label: "Cart",
//       icon: ShoppingBag,
//       isActive: false,
//       badge: cartItemCount,
//       onClick: openCart,
//     },
//     // {
//     //   href: "/profile",
//     //   label: "Profile",
//     //   icon: User,
//     //   isActive: pathname.startsWith("/profile"),
//     // },
//   ];

//   return (
//     <motion.nav
//       initial={{ y: 100 }}
//       animate={{ y: 0 }}
//       className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-lg border-t safe-bottom"
//     >
//       <div className="flex items-center justify-around px-2 py-2">
//         {navItems.map((item) => {
//           const Icon = item.icon;
//           const isActive = item.isActive;

//           const NavItem = (
//             <motion.button
//               whileTap={{ scale: 0.95 }}
//               onClick={item.onClick}
//               className={cn(
//                 "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 relative",
//                 "text-xs font-medium transition-colors duration-200",
//                 isActive
//                   ? "text-primary"
//                   : "text-muted-foreground hover:text-foreground"
//               )}
//             >
//               <div className="relative">
//                 <Icon
//                   className={cn("w-5 h-5 mb-1", isActive && "text-primary")}
//                 />
//                 {item.badge && item.badge > 0 && (
//                   <Badge
//                     variant="destructive"
//                     className="absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center text-xs p-0"
//                   >
//                     {item.badge > 99 ? "99+" : item.badge}
//                   </Badge>
//                 )}
//               </div>
//               <span className="text-xs leading-tight">{item.label}</span>
//               {isActive && (
//                 <motion.div
//                   layoutId="activeTab"
//                   className="absolute -top-px left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
//                 />
//               )}
//             </motion.button>
//           );

//           return item.onClick ? (
//             <div key={item.label} className="flex-1">
//               {NavItem}
//             </div>
//           ) : (
//             <Link key={item.href} href={item.href} className="flex-1">
//               {NavItem}
//             </Link>
//           );
//         })}
//       </div>
//     </motion.nav>
//   );
// }
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Store, Heart, ShoppingBag, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCartSelectors } from "@/hooks/useCartSelectors";
import { useFavoritesStore } from "@/store";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useUser();

  // Use optimized selectors for better reactivity
  const { stats, openCart } = useCartSelectors();
  const isAuthenticated = !!user;
  const favoriteCount = useFavoritesStore(
    (state: { items: string | any[] }) => state.items.length
  );

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      href: "/shop",
      label: "Shop",
      icon: Store,
      isActive: pathname.startsWith("/shop"),
    },
    {
      href: "/favorites",
      label: "Favorites",
      icon: Heart,
      isActive: pathname === "/favorites",
      badge: isAuthenticated && favoriteCount > 0 ? favoriteCount : null, // Only show if > 0
      requiresAuth: true,
    },
    {
      href: "#",
      label: "Cart",
      icon: ShoppingBag,
      isActive: false,
      badge: isAuthenticated && stats.totalItems > 0 ? stats.totalItems : null, // Only show if > 0
      onClick: isAuthenticated
        ? openCart
        : () => (window.location.href = "/sign-in"),
      requiresAuth: true,
    },
    {
      href: "/consultation",
      label: "Book",
      icon: User,
      isActive: pathname.startsWith("/consultation"),
    },
  ];

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
    >
      {/* Backdrop blur with gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/90 to-background/70 backdrop-blur-xl border-t border-border/50" />

      {/* Content */}
      <div className="relative">
        {/* Safe area spacer */}
        <div className="h-safe-area-inset-bottom" />

        {/* Navigation items */}
        <div className="flex items-center justify-around px-2 py-4">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.isActive;

            const NavItem = (
              <motion.button
                whileTap={{
                  scale: 0.88,
                  transition: { duration: 0.1, ease: "easeOut" },
                }}
                onClick={item.onClick}
                className={cn(
                  "relative flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-3",
                  "text-xs font-medium transition-all duration-300 ease-out",
                  "rounded-2xl min-h-[60px] group",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active background with spring animation */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeBackground"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                        duration: 0.3,
                      }}
                      className="absolute inset-2 bg-primary/10 rounded-2xl"
                    />
                  )}
                </AnimatePresence>

                {/* Icon container with enhanced design */}
                <div className="relative mb-1">
                  {/* Icon glow effect for active state */}
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-md scale-150" />
                  )}

                  <motion.div
                    animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="relative"
                  >
                    <Icon
                      className={cn(
                        "w-6 h-6 transition-all duration-300",
                        isActive
                          ? "text-primary drop-shadow-sm"
                          : "text-muted-foreground group-hover:text-foreground group-hover:scale-105"
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />

                    {/* Premium badge with smooth animations */}
                    {item.badge && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        key={item.badge} // Re-animate when count changes
                        transition={{
                          type: "spring",
                          stiffness: 600,
                          damping: 25,
                          delay: 0.1,
                        }}
                        className="absolute -top-2 -right-2"
                      >
                        <Badge
                          variant="destructive"
                          className={cn(
                            "w-5 h-5 flex items-center justify-center text-xs p-0 font-bold rounded-full", // ✅ Perfect circle
                            "shadow-lg shadow-red-500/25 border-2 border-background",
                            "bg-gradient-to-r from-red-500 to-red-600"
                          )}
                        >
                          {item.badge > 99 ? "99+" : item.badge}
                        </Badge>
                      </motion.div>
                    )}

                    {/* Premium auth indicator for guests */}
                    {!isAuthenticated && item.requiresAuth && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full border-2 border-background shadow-sm"
                      />
                    )}
                  </motion.div>
                </div>

                {/* Label with better typography */}
                <motion.span
                  animate={isActive ? { fontWeight: 600 } : { fontWeight: 500 }}
                  className={cn(
                    "text-xs leading-tight tracking-wide transition-all duration-300",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {item.label}
                </motion.span>

                {/* Enhanced active indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/50"
                    />
                  )}
                </AnimatePresence>

                {/* Hover effect */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-2xl transition-all duration-300",
                    "group-hover:bg-muted/30 group-active:bg-muted/50",
                    isActive ? "bg-transparent" : ""
                  )}
                />
              </motion.button>
            );

            return item.onClick ? (
              <div key={item.label} className="flex-1">
                {NavItem}
              </div>
            ) : (
              <Link key={item.href} href={item.href} className="flex-1">
                {NavItem}
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
