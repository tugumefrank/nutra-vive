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
import { motion } from "framer-motion";
import { Home, Store, Heart, ShoppingBag, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCartSelectors } from "@/hooks/useCartSelectors"; // Updated import
import { useFavoritesStore } from "@/store";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useUser();

  // Use optimized selectors for better reactivity
  const { stats, openCart } = useCartSelectors();
  const isAuthenticated = !!user;
  const favoriteCount = useFavoritesStore((state) => state.items.length);

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
      badge: isAuthenticated ? favoriteCount : 0,
      requiresAuth: true,
    },
    {
      href: "#",
      label: "Cart",
      icon: ShoppingBag,
      isActive: false,
      badge: isAuthenticated ? stats.totalItems : 0,
      onClick: isAuthenticated
        ? openCart
        : () => (window.location.href = "/sign-in"),
      requiresAuth: true,
    },
    {
      href: isAuthenticated ? "/profile" : "/sign-in",
      label: isAuthenticated ? "Profile" : "Sign In",
      icon: User,
      isActive: pathname.startsWith("/profile"),
    },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-lg border-t safe-bottom"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;

          const NavItem = (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={item.onClick}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 relative",
                "text-xs font-medium transition-colors duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn("w-5 h-5 mb-1", isActive && "text-primary")}
                />
                {/* Show badge with smooth animation */}
                {item.badge && item.badge > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={item.badge} // Re-animate when count changes
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center text-xs p-0"
                    >
                      {item.badge > 99 ? "99+" : item.badge}
                    </Badge>
                  </motion.div>
                )}

                {/* Show auth indicator for guests on auth-required items */}
                {!isAuthenticated && item.requiresAuth && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full opacity-60"></div>
                )}
              </div>
              <span className="text-xs leading-tight">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-px left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                />
              )}
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
    </motion.nav>
  );
}
