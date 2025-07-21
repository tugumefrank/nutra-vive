// "use client";

// import Link from "next/link";
// import { motion } from "framer-motion";
// import {
//   Leaf,
//   Mail,
//   Phone,
//   MapPin,
//   Instagram,
//   Facebook,
//   Twitter,
//   Youtube,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";

// export function Footer() {
//   const footerLinks = {
//     company: [
//       { href: "/about", label: "About Us" },
//       { href: "/contact", label: "Contact" },
//       { href: "/careers", label: "Careers" },
//       { href: "/blog", label: "Blog" },
//       { href: "/press", label: "Press" },
//     ],
//     products: [
//       { href: "/shop?category=juices", label: "Cold-Pressed Juices" },
//       { href: "/shop?category=teas", label: "Herbal Teas" },
//       { href: "/shop?category=iced-teas", label: "Iced Teas" },
//       { href: "/shop?category=detox", label: "Detox Blends" },
//       { href: "/shop?category=tea-bags", label: "Tea Bags" },
//     ],
//     support: [
//       { href: "/help", label: "Help Center" },
//       { href: "/shipping", label: "Shipping Info" },
//       { href: "/returns", label: "Returns" },
//       { href: "/faq", label: "FAQ" },
//       { href: "/track-order", label: "Track Order" },
//     ],
//     legal: [
//       { href: "/privacy", label: "Privacy Policy" },
//       { href: "/terms", label: "Terms of Service" },
//       { href: "/cookies", label: "Cookie Policy" },
//       { href: "/accessibility", label: "Accessibility" },
//     ],
//   };

//   const socialLinks = [
//     {
//       href: "https://instagram.com/nutravive",
//       icon: Instagram,
//       label: "Instagram",
//     },
//     {
//       href: "https://facebook.com/nutravive",
//       icon: Facebook,
//       label: "Facebook",
//     },
//     { href: "https://twitter.com/nutravive", icon: Twitter, label: "Twitter" },
//     { href: "https://youtube.com/nutravive", icon: Youtube, label: "YouTube" },
//   ];

//   return (
//     <footer className="bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100  border-t">
//       <div className="container mx-auto px-4 py-12">
//         {/* Newsletter Section */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           className="mb-12 text-center"
//         >
//           <h3 className="text-2xl font-heading font-bold mb-4">
//             Stay Fresh with Nutra-Vive
//           </h3>
//           <p className="text-muted-foreground mb-6 max-w-md mx-auto">
//             Get the latest updates on new products, wellness tips, and exclusive
//             offers.
//           </p>
//           <div className="flex max-w-md mx-auto space-x-2">
//             <Input
//               type="email"
//               placeholder="Enter your email"
//               className="flex-1"
//             />
//             <Button>Subscribe</Button>
//           </div>
//         </motion.div>

//         <Separator className="mb-12" />

//         {/* Main Footer Content */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
//           {/* Brand Column */}
//           <div className="lg:col-span-1">
//             <div className="flex items-center space-x-2 mb-4">
//               <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-wellness-500 rounded-lg flex items-center justify-center">
//                 <Leaf className="w-5 h-5 text-white" />
//               </div>
//               <span className="text-xl font-heading font-bold gradient-text">
//                 Nutra-Vive
//               </span>
//             </div>
//             <p className="text-sm text-muted-foreground mb-4">
//               Where wellness meets flavor—naturally. Premium organic beverages
//               crafted for your health journey.
//             </p>
//             <div className="flex space-x-3">
//               {socialLinks.map((social) => {
//                 const Icon = social.icon;
//                 return (
//                   <Link
//                     key={social.label}
//                     href={social.href}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
//                   >
//                     <Icon className="w-4 h-4" />
//                   </Link>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Links Columns */}
//           <div>
//             <h4 className="font-semibold mb-4">Company</h4>
//             <ul className="space-y-2">
//               {footerLinks.company.map((link) => (
//                 <li key={link.href}>
//                   <Link
//                     href={link.href}
//                     className="text-sm text-muted-foreground hover:text-primary transition-colors"
//                   >
//                     {link.label}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <div>
//             <h4 className="font-semibold mb-4">Products</h4>
//             <ul className="space-y-2">
//               {footerLinks.products.map((link) => (
//                 <li key={link.href}>
//                   <Link
//                     href={link.href}
//                     className="text-sm text-muted-foreground hover:text-primary transition-colors"
//                   >
//                     {link.label}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <div>
//             <h4 className="font-semibold mb-4">Support</h4>
//             <ul className="space-y-2">
//               {footerLinks.support.map((link) => (
//                 <li key={link.href}>
//                   <Link
//                     href={link.href}
//                     className="text-sm text-muted-foreground hover:text-primary transition-colors"
//                   >
//                     {link.label}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <div>
//             <h4 className="font-semibold mb-4">Legal</h4>
//             <ul className="space-y-2 mb-6">
//               {footerLinks.legal.map((link) => (
//                 <li key={link.href}>
//                   <Link
//                     href={link.href}
//                     className="text-sm text-muted-foreground hover:text-primary transition-colors"
//                   >
//                     {link.label}
//                   </Link>
//                 </li>
//               ))}
//             </ul>

//             {/* Contact Info */}
//             <div className="space-y-2">
//               <div className="flex items-center space-x-2 text-sm text-muted-foreground">
//                 <Mail className="w-4 h-4" />
//                 <span>hello@nutraviveholistic.com</span>
//               </div>
//               <div className="flex items-center space-x-2 text-sm text-muted-foreground">
//                 <Phone className="w-4 h-4" />
//                 <span>1-800-NUTRA-01</span>
//               </div>
//               <div className="flex items-center space-x-2 text-sm text-muted-foreground">
//                 <MapPin className="w-4 h-4" />
//                 <span>Wellness Valley, CA</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <Separator className="mb-8" />

//         {/* Bottom Footer */}
//         <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
//           <div className="mb-4 md:mb-0">
//             <p>&copy; 2024 Nutra-Vive. All rights reserved.</p>
//           </div>
//           <div className="flex items-center space-x-4">
//             <span>Made with ❤️ for your wellness journey</span>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Leaf,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterProps {
  variant?: "default" | "minimal";
  className?: string;
}

export function Footer({ variant = "default", className }: FooterProps) {
  const footerLinks = {
    company: [
      // Removed non-existent pages: About Us, Contact, Careers, Blog, Press
    ],
    products: [
      { href: "/shop?category=juices", label: "Cold-Pressed Juices" },
      { href: "/shop?category=teas", label: "Herbal Teas" },
      { href: "/shop?category=iced-teas", label: "Iced Teas" },
      { href: "/shop?category=detox", label: "Detox Blends" },
      { href: "/shop?category=tea-bags", label: "Tea Bags" },
    ],
    support: [
      { href: "/track", label: "Track Order" }, // Fixed: changed from /track-order to /track
      // Removed non-existent pages: Help Center, Shipping Info, Returns, FAQ
    ],
    legal: [
      // Removed non-existent pages: Privacy Policy, Terms of Service, Cookie Policy, Accessibility
    ],
  };

  const socialLinks = [
    {
      href: "https://instagram.com/nutravive",
      icon: Instagram,
      label: "Instagram",
    },
    {
      href: "https://facebook.com/nutravive",
      icon: Facebook,
      label: "Facebook",
    },
    { href: "https://twitter.com/nutravive", icon: Twitter, label: "Twitter" },
    { href: "https://youtube.com/nutravive", icon: Youtube, label: "YouTube" },
  ];

  // Minimal variant - simplified footer
  if (variant === "minimal") {
    return (
      <footer className={cn("bg-gray-50 border-t border-gray-200", className)}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-600">
                © 2024 Nutra-Vive. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <Link
                href="/track"
                className="hover:text-orange-600 transition-colors"
              >
                Track Order
              </Link>
              <Link
                href="/shop"
                className="hover:text-orange-600 transition-colors"
              >
                Shop
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Default variant - full footer
  return (
    <footer
      className={cn(
        "bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 border-t",
        className
      )}
    >
      <div className="container mx-auto px-4 py-12">
        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h3 className="text-2xl font-bold mb-4">
            Stay Fresh with Nutra-Vive
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Get the latest updates on new products, wellness tips, and exclusive
            offers.
          </p>
          <div className="flex max-w-md mx-auto space-x-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Subscribe
            </button>
          </div>
        </motion.div>

        <div className="border-t border-gray-200 mb-12"></div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Brand Column */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Nutra-Vive
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Where wellness meets flavor—naturally. Premium organic beverages
              crafted for your health journey.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-white/60 rounded-lg flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors shadow-sm"
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Products Column */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Products</h4>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Contact Column */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Support</h4>
            <ul className="space-y-2 mb-6">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact Info */}
            <h4 className="font-semibold mb-4 text-gray-900">Contact</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>support@nutraviveholistic.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>1-800-NUTRA-01</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Newark, NJ USA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mb-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          <div className="mb-4 md:mb-0">
            <p>&copy; 2024 Nutra-Vive. All rights reserved.</p>
          </div>
          <div className="flex items-center space-x-4">
            <span>Made with ❤️ for your wellness journey</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
