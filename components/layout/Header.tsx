// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { UserButton, useUser } from "@clerk/nextjs";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   ShoppingBag,
//   Heart,
//   User,
//   Menu,
//   X,
//   Sun,
//   Moon,
//   Leaf,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { useUnifiedCart } from "@/hooks/useUnifiedCart"; // Updated import
// import { useFavoritesStore, useThemeStore, useUIStore } from "@/store";
// import { cn } from "@/lib/utils";

// export function Header() {
//   const { user } = useUser();
//   const [isScrolled, setIsScrolled] = useState(false);

//   // Use unified cart hook for consistent state across all components
//   const { stats, openCart, isAuthenticated } = useUnifiedCart();

//   const favoriteCount = useFavoritesStore((state) => state.items.length);
//   const { theme, toggleTheme } = useThemeStore();
//   const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 20);
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const navItems = [
//     { href: "/", label: "Home" },
//     { href: "/shop", label: "Shop" },
//     { href: "/about", label: "About" },
//     { href: "/consultation", label: "Consultation" },
//   ];

//   return (
//     <>
//       <motion.header
//         className={cn(
//           "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ",
//           isScrolled
//             ? "bg-background/90 backdrop-blur-xl border-b shadow-lg"
//             : "bg-transparent"
//         )}
//         initial={{ y: -100 }}
//         animate={{ y: 0 }}
//         transition={{ duration: 0.3 }}
//       >
//         <div className="container mx-auto px-4">
//           <div className="flex items-center justify-between h-20">
//             {/* Logo - Enhanced */}
//             <Link
//               href="/"
//               className="flex items-center space-x-3 hover-lift group"
//             >
//               <div className="w-10 h-10 bg-gradient-to-br from-brand-500 via-wellness-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
//                 <Leaf className="w-6 h-6 text-white" />
//               </div>
//               <div className="hidden sm:block">
//                 <span className="text-2xl font-heading font-bold gradient-text">
//                   Nutra-Vive
//                 </span>
//                 <p className="text-xs text-black font-medium">
//                   Where Wellness Meets Flavor
//                 </p>
//               </div>
//             </Link>

//             {/* Desktop Navigation - Enhanced */}
//             <nav className="hidden md:flex items-center space-x-1">
//               {navItems.map((item) => (
//                 <Link
//                   key={item.href}
//                   href={item.href}
//                   className="relative px-4 py-2 text-md font-bold text-black hover:text-primary transition-all duration-300 rounded-lg hover:bg-muted/50 group"
//                 >
//                   {item.label}
//                   <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-brand-500 to-wellness-500 transition-all duration-300 group-hover:w-full"></span>
//                 </Link>
//               ))}
//             </nav>

//             {/* Actions - Enhanced */}
//             <div className="flex items-center space-x-1">
//               {/* Favorites - Enhanced (Auth Only) */}
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 asChild={isAuthenticated ? true : false}
//                 onClick={
//                   isAuthenticated
//                     ? undefined
//                     : () => (window.location.href = "/sign-in")
//                 }
//                 className="h-10 w-10 rounded-xl hover:bg-muted/80 transition-all duration-300"
//                 title={
//                   isAuthenticated
//                     ? "View favorites"
//                     : "Sign in to view favorites"
//                 }
//               >
//                 {isAuthenticated ? (
//                   <Link href="/favorites" className="relative">
//                     <Heart className="w-5 h-5" />
//                     {favoriteCount > 0 && (
//                       <Badge
//                         variant="destructive"
//                         className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs p-0 animate-pulse"
//                       >
//                         {favoriteCount}
//                       </Badge>
//                     )}
//                   </Link>
//                 ) : (
//                   <div className="relative cursor-pointer">
//                     <Heart className="w-5 h-5" />
//                     {/* Small indicator for guests */}
//                     <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full opacity-60"></div>
//                   </div>
//                 )}
//               </Button>

//               {/* Cart - Unified with instant updates across all components */}
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={
//                   isAuthenticated
//                     ? openCart
//                     : () => (window.location.href = "/sign-in")
//                 }
//                 className="relative h-10 w-10 rounded-xl hover:bg-muted/80 transition-all duration-300 hover:scale-105"
//                 title={isAuthenticated ? "View cart" : "Sign in to view cart"}
//               >
//                 <ShoppingBag className="w-5 h-5" />

//                 {/* Cart count with smooth animation - updates instantly across all components */}
//                 {isAuthenticated && stats.totalItems > 0 && (
//                   <motion.div
//                     initial={{ scale: 0 }}
//                     animate={{ scale: 1 }}
//                     exit={{ scale: 0 }}
//                     key={stats.totalItems} // Key ensures re-animation on count change
//                     transition={{ type: "spring", stiffness: 500, damping: 30 }}
//                     className="absolute -top-1 -right-1"
//                   >
//                     <Badge
//                       variant="destructive"
//                       className="w-5 h-5 flex items-center justify-center text-xs p-0 font-bold"
//                     >
//                       {stats.totalItems}
//                     </Badge>
//                   </motion.div>
//                 )}

//                 {/* Small indicator for guests */}
//                 {!isAuthenticated && (
//                   <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full opacity-60"></div>
//                 )}
//               </Button>

//               {/* User Menu - Enhanced */}
//               <div className="flex items-center">
//                 {user ? (
//                   <div className="flex items-center gap-3">
//                     <UserButton
//                       afterSignOutUrl="/sign-in"
//                       appearance={{
//                         elements: {
//                           userButtonAvatarBox: "w-9 h-9 shadow-sm",
//                           userButtonPopoverCard:
//                             "bg-white/95 backdrop-blur-sm border border-gray-200/70 text-gray-800 rounded-xl shadow-xl shadow-emerald-500/10",
//                           userButtonPopoverActions: "text-gray-800",
//                           userButtonPopoverActionButton:
//                             "text-gray-700 hover:bg-gray-50/80 hover:text-gray-900",
//                           userButtonPopoverActionButtonText: "text-gray-700",
//                         },
//                       }}
//                     />
//                   </div>
//                 ) : (
//                   <div className="flex space-x-3 items-center">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       asChild
//                       className="flex-1 rounded-xl"
//                     >
//                       <Link href="/sign-in">Sign In</Link>
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       asChild
//                       className="flex-1 hidden lg:block rounded-xl items-center"
//                     >
//                       <Link href="/sign-up">Get Started</Link>
//                     </Button>
//                   </div>
//                 )}
//               </div>

//               {/* Mobile Menu Toggle */}
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={toggleMobileMenu}
//                 className="md:hidden h-10 w-10 rounded-xl hover:bg-muted/80 transition-all duration-300"
//               >
//                 <AnimatePresence mode="wait" initial={false}>
//                   <motion.div
//                     key={isMobileMenuOpen ? "close" : "open"}
//                     initial={{ rotate: -90, opacity: 0 }}
//                     animate={{ rotate: 0, opacity: 1 }}
//                     exit={{ rotate: 90, opacity: 0 }}
//                     transition={{ duration: 0.2 }}
//                   >
//                     {isMobileMenuOpen ? (
//                       <X className="w-5 h-5" />
//                     ) : (
//                       <Menu className="w-5 h-5" />
//                     )}
//                   </motion.div>
//                 </AnimatePresence>
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Mobile Menu - Enhanced */}
//         <AnimatePresence>
//           {isMobileMenuOpen && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: "auto" }}
//               exit={{ opacity: 0, height: 0 }}
//               className="md:hidden border-t bg-background/95 backdrop-blur-xl shadow-lg"
//             >
//               <div className="container mx-auto px-4 py-6">
//                 <nav className="flex flex-col space-y-2">
//                   {navItems.map((item, index) => (
//                     <motion.div
//                       key={item.href}
//                       initial={{ opacity: 0, x: -20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ duration: 0.3, delay: index * 0.1 }}
//                     >
//                       <Link
//                         href={item.href}
//                         className="flex items-center justify-between p-3 text-sm font-semibold text-muted-foreground hover:text-primary transition-all duration-300 rounded-xl hover:bg-muted/50 group"
//                         onClick={() => toggleMobileMenu()}
//                       >
//                         {item.label}
//                         <span className="w-2 h-2 bg-gradient-to-r from-brand-500 to-wellness-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
//                       </Link>
//                     </motion.div>
//                   ))}

//                   {/* Mobile Cart & Favorites Section for authenticated users */}
//                   {isAuthenticated && (
//                     <motion.div
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ duration: 0.3, delay: 0.4 }}
//                       className="pt-4 border-t border-muted"
//                     >
//                       <div className="flex space-x-3">
//                         <Button
//                           variant="outline"
//                           onClick={() => {
//                             openCart();
//                             toggleMobileMenu();
//                           }}
//                           className="flex-1 rounded-xl flex items-center justify-center gap-2"
//                         >
//                           <ShoppingBag className="w-4 h-4" />
//                           Cart
//                           {stats.totalItems > 0 && (
//                             <Badge variant="secondary" className="ml-1">
//                               {stats.totalItems}
//                             </Badge>
//                           )}
//                         </Button>
//                         <Button
//                           variant="outline"
//                           asChild
//                           onClick={() => toggleMobileMenu()}
//                           className="flex-1 rounded-xl flex items-center justify-center gap-2"
//                         >
//                           <Link href="/favorites">
//                             <Heart className="w-4 h-4" />
//                             Favorites
//                             {favoriteCount > 0 && (
//                               <Badge variant="secondary" className="ml-1">
//                                 {favoriteCount}
//                               </Badge>
//                             )}
//                           </Link>
//                         </Button>
//                       </div>
//                     </motion.div>
//                   )}

//                   {!isAuthenticated && (
//                     <motion.div
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ duration: 0.3, delay: 0.4 }}
//                       className="flex space-x-3 pt-4 border-t border-muted"
//                     >
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         asChild
//                         className="flex-1 rounded-xl"
//                       >
//                         <Link href="/sign-in">Sign In</Link>
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         asChild
//                         className="flex-1 rounded-xl"
//                       >
//                         <Link href="/sign-up">Get Started</Link>
//                       </Button>
//                     </motion.div>
//                   )}
//                 </nav>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </motion.header>
//     </>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Sun,
  Moon,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartSelectors } from "@/hooks/useCartSelectors"; // Updated import
import { useFavoritesStore, useThemeStore, useUIStore } from "@/store";
import { cn } from "@/lib/utils";

export function Header() {
  const { user } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);

  // Use optimized selectors for better reactivity
  const { stats, openCart } = useCartSelectors();
  const isAuthenticated = !!user;

  const favoriteCount = useFavoritesStore((state) => state.items.length);
  const { theme, toggleTheme } = useThemeStore();
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "About" },
    { href: "/consultation", label: "Consultation" },
  ];

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ",
          isScrolled
            ? "bg-background/90 backdrop-blur-xl border-b shadow-lg"
            : "bg-transparent"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
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
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-4 py-2 text-md font-bold text-black hover:text-primary transition-all duration-300 rounded-lg hover:bg-muted/50 group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-brand-500 to-wellness-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
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
                  isAuthenticated
                    ? "View favorites"
                    : "Sign in to view favorites"
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
                      className="w-5 h-5 flex items-center justify-center text-xs p-0 font-bold"
                    >
                      {stats.totalItems}
                    </Badge>
                  </motion.div>
                )}

                {/* Small indicator for guests */}
                {!isAuthenticated && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full opacity-60"></div>
                )}
              </Button>

              {/* User Menu - Enhanced */}
              <div className="flex items-center">
                {user ? (
                  <div className="flex items-center gap-3">
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
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center justify-between p-3 text-sm font-semibold text-muted-foreground hover:text-primary transition-all duration-300 rounded-xl hover:bg-muted/50 group"
                        onClick={() => toggleMobileMenu()}
                      >
                        {item.label}
                        <span className="w-2 h-2 bg-gradient-to-r from-brand-500 to-wellness-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      </Link>
                    </motion.div>
                  ))}

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
                          className="flex-1 rounded-xl flex items-center justify-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Cart
                          {stats.totalItems > 0 && (
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
    </>
  );
}
