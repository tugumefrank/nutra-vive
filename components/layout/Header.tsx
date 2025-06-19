// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { useUser } from "@clerk/nextjs";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Search,
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
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   useCartStore,
//   useFavoritesStore,
//   useThemeStore,
//   useUIStore,
// } from "@/store";
// import { SearchDialog } from "@/components/search/SearchDialog";
// import { cn } from "@/lib/utils";

// export function Header() {
//   const { user } = useUser();
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [isSearchOpen, setIsSearchOpen] = useState(false);

//   const cartItemCount = useCartStore((state) => state.getItemCount());
//   const favoriteCount = useFavoritesStore((state) => state.items.length);
//   const { theme, toggleTheme } = useThemeStore();
//   const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();
//   // Replace 'openCart' with the correct function from your cart store
//   const openCart = useCartStore((state) => state.openCart);

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
//     { href: "/contact", label: "Contact" },
//   ];

//   return (
//     <>
//       <motion.header
//         className={cn(
//           "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
//           isScrolled
//             ? "bg-background/80 backdrop-blur-lg border-b shadow-sm"
//             : "bg-transparent"
//         )}
//         initial={{ y: -100 }}
//         animate={{ y: 0 }}
//         transition={{ duration: 0.3 }}
//       >
//         <div className="container mx-auto px-4">
//           <div className="flex items-center justify-between h-16">
//             {/* Logo */}
//             <Link href="/" className="flex items-center space-x-2 hover-lift">
//               <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-wellness-500 rounded-lg flex items-center justify-center">
//                 <Leaf className="w-5 h-5 text-white" />
//               </div>
//               <span className="text-xl font-heading font-bold gradient-text hidden sm:block">
//                 Nutra-Vive
//               </span>
//             </Link>

//             {/* Desktop Navigation */}
//             <nav className="hidden md:flex items-center space-x-8">
//               {navItems.map((item) => (
//                 <Link
//                   key={item.href}
//                   href={item.href}
//                   className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
//                 >
//                   {item.label}
//                 </Link>
//               ))}
//             </nav>

//             {/* Search Bar (Desktop) */}
//             <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
//               <div className="relative w-full">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//                 <Input
//                   placeholder="Search products..."
//                   className="pl-10 bg-muted/50 border-none focus:bg-background transition-colors"
//                   onClick={() => setIsSearchOpen(true)}
//                   readOnly
//                 />
//               </div>
//             </div>

//             {/* Actions */}
//             <div className="flex items-center space-x-2">
//               {/* Search (Mobile) */}
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="md:hidden"
//                 onClick={() => setIsSearchOpen(true)}
//               >
//                 <Search className="w-5 h-5" />
//               </Button>

//               {/* Theme Toggle */}
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={toggleTheme}
//                 className="hidden sm:flex"
//               >
//                 {theme === "dark" ? (
//                   <Sun className="w-5 h-5" />
//                 ) : (
//                   <Moon className="w-5 h-5" />
//                 )}
//               </Button>

//               {/* Favorites */}
//               <Button variant="ghost" size="icon" asChild>
//                 <Link href="/favorites" className="relative">
//                   <Heart className="w-5 h-5" />
//                   {favoriteCount > 0 && (
//                     <Badge
//                       variant="destructive"
//                       className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs p-0"
//                     >
//                       {favoriteCount}
//                     </Badge>
//                   )}
//                 </Link>
//               </Button>

//               {/* Cart */}
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={openCart}
//                 className="relative"
//               >
//                 <ShoppingBag className="w-5 h-5" />
//                 {cartItemCount > 0 && (
//                   <Badge
//                     variant="destructive"
//                     className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs p-0"
//                   >
//                     {cartItemCount}
//                   </Badge>
//                 )}
//               </Button>

//               {/* User Menu */}
//               {user ? (
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button variant="ghost" size="icon">
//                       <User className="w-5 h-5" />
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent align="end" className="w-56">
//                     <DropdownMenuItem asChild>
//                       <Link href="/profile">Profile</Link>
//                     </DropdownMenuItem>
//                     <DropdownMenuItem asChild>
//                       <Link href="/orders">My Orders</Link>
//                     </DropdownMenuItem>
//                     <DropdownMenuItem asChild>
//                       <Link href="/favorites">Favorites</Link>
//                     </DropdownMenuItem>
//                     <DropdownMenuSeparator />
//                     {user.publicMetadata?.role === "admin" && (
//                       <>
//                         <DropdownMenuItem asChild>
//                           <Link href="/admin">Admin Dashboard</Link>
//                         </DropdownMenuItem>
//                         <DropdownMenuSeparator />
//                       </>
//                     )}
//                     <DropdownMenuItem>Sign Out</DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               ) : (
//                 <Button variant="outline" size="sm" asChild>
//                   <Link href="/sign-in">Sign In</Link>
//                 </Button>
//               )}

//               {/* Mobile Menu Toggle */}
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={toggleMobileMenu}
//                 className="md:hidden"
//               >
//                 {isMobileMenuOpen ? (
//                   <X className="w-5 h-5" />
//                 ) : (
//                   <Menu className="w-5 h-5" />
//                 )}
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Mobile Menu */}
//         <AnimatePresence>
//           {isMobileMenuOpen && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: "auto" }}
//               exit={{ opacity: 0, height: 0 }}
//               className="md:hidden border-t bg-background/95 backdrop-blur-lg"
//             >
//               <div className="container mx-auto px-4 py-4">
//                 <nav className="flex flex-col space-y-4">
//                   {navItems.map((item) => (
//                     <Link
//                       key={item.href}
//                       href={item.href}
//                       className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
//                       onClick={() => toggleMobileMenu()}
//                     >
//                       {item.label}
//                     </Link>
//                   ))}
//                   {!user && (
//                     <div className="flex space-x-2 pt-4 border-t">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         asChild
//                         className="flex-1"
//                       >
//                         <Link href="/sign-in">Sign In</Link>
//                       </Button>
//                       <Button size="sm" asChild className="flex-1">
//                         <Link href="/sign-up">Sign Up</Link>
//                       </Button>
//                     </div>
//                   )}
//                 </nav>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </motion.header>

//       {/* Search Dialog */}
//       <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
//     </>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCartStore,
  useFavoritesStore,
  useThemeStore,
  useUIStore,
} from "@/store";
import { cn } from "@/lib/utils";

export function Header() {
  const { user } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);

  const cartItemCount = useCartStore((state) => state.getItemCount());
  const favoriteCount = useFavoritesStore((state) => state.items.length);
  const { theme, toggleTheme } = useThemeStore();
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();
  const openCart = useCartStore((state) => state.openCart);

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
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
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
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="hidden sm:flex h-10 w-10 rounded-xl hover:bg-muted/80 transition-all duration-300"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>

              {/* Favorites - Enhanced */}
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="h-10 w-10 rounded-xl hover:bg-muted/80 transition-all duration-300"
              >
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
              </Button>

              {/* Cart - Enhanced */}
              <Button
                variant="ghost"
                size="icon"
                onClick={openCart}
                className="relative h-10 w-10 rounded-xl hover:bg-muted/80 transition-all duration-300 hover:scale-105"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs p-0 animate-bounce"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu - Enhanced */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl hover:bg-muted/80 transition-all duration-300"
                    >
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 p-2 shadow-xl border-0 bg-background/95 backdrop-blur-xl"
                  >
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-wellness-500 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.emailAddresses[0]?.emailAddress}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuItem asChild className="rounded-lg">
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg">
                      <Link
                        href="/orders"
                        className="flex items-center space-x-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>My Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg">
                      <Link
                        href="/favorites"
                        className="flex items-center space-x-2"
                      >
                        <Heart className="w-4 h-4" />
                        <span>Favorites</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    {user.publicMetadata?.role === "admin" && (
                      <>
                        <DropdownMenuItem asChild className="rounded-lg">
                          <Link
                            href="/admin"
                            className="flex items-center space-x-2"
                          >
                            <Leaf className="w-4 h-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-2" />
                      </>
                    )}
                    <DropdownMenuItem className="rounded-lg text-red-600 focus:text-red-600">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="hidden sm:flex"
                  >
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    className="bg-gradient-to-r from-brand-500 to-wellness-500 hover:from-brand-600 hover:to-wellness-600 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link href="/sign-up">Get Started</Link>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="md:hidden h-10 w-10 rounded-xl hover:bg-muted/80 transition-all duration-300"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
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
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between p-3 text-sm font-semibold text-muted-foreground hover:text-primary transition-all duration-300 rounded-xl hover:bg-muted/50"
                      onClick={() => toggleMobileMenu()}
                    >
                      {item.label}
                      <span className="w-2 h-2 bg-gradient-to-r from-brand-500 to-wellness-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    </Link>
                  ))}

                  {/* Mobile Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className="flex items-center justify-between p-3 text-sm font-semibold text-muted-foreground hover:text-primary transition-all duration-300 rounded-xl hover:bg-muted/50"
                  >
                    Theme
                    {theme === "dark" ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                  </button>

                  {!user && (
                    <div className="flex space-x-3 pt-4 border-t border-muted">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1 rounded-xl"
                      >
                        <Link href="/sign-in">Sign In</Link>
                      </Button>
                      <Button
                        size="sm"
                        asChild
                        className="flex-1 bg-gradient-to-r from-brand-500 to-wellness-500 hover:from-brand-600 hover:to-wellness-600 rounded-xl"
                      >
                        <Link href="/sign-up">Get Started</Link>
                      </Button>
                    </div>
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
