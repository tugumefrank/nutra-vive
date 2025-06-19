// "use client";

// import { motion, useScroll, useTransform } from "framer-motion";
// import Link from "next/link";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { ArrowRight, Play, Sparkles, Leaf, Heart, Shield } from "lucide-react";
// import { useRef } from "react";

// export function HeroSection() {
//   const ref = useRef<HTMLDivElement>(null);
//   const { scrollYProgress } = useScroll({
//     target: ref,
//     offset: ["start start", "end start"],
//   });

//   const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
//   const textY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

//   return (
//     <section
//       ref={ref}
//       className="relative min-h-screen flex items-center justify-center overflow-hidden"
//     >
//       {/* Animated Background */}
//       <motion.div
//         style={{ y: backgroundY }}
//         className="absolute inset-0 bg-gradient-to-br from-brand-50 via-wellness-50 to-green-50"
//       />

//       {/* Floating Geometric Shapes */}
//       <div className="absolute inset-0 overflow-hidden">
//         <motion.div
//           animate={{
//             y: [0, -20, 0],
//             rotate: [0, 5, 0],
//             scale: [1, 1.1, 1],
//           }}
//           transition={{
//             duration: 8,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//           className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-wellness-200/40 to-brand-200/40 rounded-3xl opacity-60 backdrop-blur-sm"
//         />
//         <motion.div
//           animate={{
//             y: [0, 30, 0],
//             rotate: [0, -5, 0],
//             scale: [1, 0.9, 1],
//           }}
//           transition={{
//             duration: 10,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//           className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-brand-200/40 to-wellness-200/40 rounded-full opacity-50 backdrop-blur-sm"
//         />
//         <motion.div
//           animate={{
//             y: [0, -15, 0],
//             x: [0, 10, 0],
//             rotate: [0, 3, 0],
//           }}
//           transition={{
//             duration: 6,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//           className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-br from-green-200/40 to-emerald-200/40 rounded-2xl opacity-70 backdrop-blur-sm"
//         />

//         {/* Particle System */}
//         {Array.from({ length: 15 }).map((_, i) => (
//           <motion.div
//             key={i}
//             className="absolute w-1 h-1 bg-brand-400 rounded-full"
//             style={{
//               left: `${Math.random() * 100}%`,
//               top: `${Math.random() * 100}%`,
//             }}
//             animate={{
//               y: [0, -20, 0],
//               opacity: [0.3, 1, 0.3],
//             }}
//             transition={{
//               duration: 3 + Math.random() * 2,
//               repeat: Infinity,
//               delay: Math.random() * 2,
//             }}
//           />
//         ))}
//       </div>

//       <div className="container mx-auto px-4 relative z-10">
//         <div className="grid lg:grid-cols-2 gap-12 items-center">
//           {/* Left Content */}
//           <motion.div
//             style={{ y: textY }}
//             initial={{ opacity: 0, x: -50 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.8 }}
//             className="text-center lg:text-left"
//           >
//             {/* Premium Badge */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//               className="inline-flex items-center space-x-2 glass px-6 py-3 rounded-full mb-8 shadow-glow"
//             >
//               <Sparkles className="w-5 h-5 text-brand-500" />
//               <span className="text-sm font-semibold bg-gradient-to-r from-brand-600 to-wellness-600 bg-clip-text text-transparent">
//                 100% Organic & Premium Quality
//               </span>
//             </motion.div>

//             {/* Main Heading with Gradient Animation */}
//             <motion.h1
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3 }}
//               className="text-5xl lg:text-8xl font-heading font-bold leading-[0.9] mb-8"
//             >
//               Where{" "}
//               <motion.span
//                 className="relative inline-block"
//                 whileHover={{ scale: 1.05 }}
//                 transition={{ type: "spring", stiffness: 300 }}
//               >
//                 <span className="bg-gradient-to-r from-brand-500 via-wellness-500 to-green-500 bg-clip-text text-transparent animate-gradient">
//                   Wellness
//                 </span>
//                 <motion.div
//                   className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-wellness-500 rounded-full"
//                   initial={{ scaleX: 0 }}
//                   animate={{ scaleX: 1 }}
//                   transition={{ delay: 0.8, duration: 0.6 }}
//                 />
//               </motion.span>
//               <br />
//               Meets{" "}
//               <motion.span
//                 className="relative inline-block"
//                 whileHover={{ scale: 1.05 }}
//                 transition={{ type: "spring", stiffness: 300 }}
//               >
//                 <span className="bg-gradient-to-r from-wellness-500 via-green-500 to-emerald-500 bg-clip-text text-transparent animate-gradient">
//                   Flavor
//                 </span>
//                 <motion.div
//                   className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-wellness-500 to-green-500 rounded-full"
//                   initial={{ scaleX: 0 }}
//                   animate={{ scaleX: 1 }}
//                   transition={{ delay: 1, duration: 0.6 }}
//                 />
//               </motion.span>
//             </motion.h1>

//             <motion.p
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4 }}
//               className="text-xl lg:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
//             >
//               Discover premium organic cold-pressed juices, herbal teas, and
//               wellness beverages crafted with nature's finest ingredients for
//               your{" "}
//               <span className="text-brand-600 font-semibold">
//                 transformative health journey.
//               </span>
//             </motion.p>

//             {/* Feature Icons */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.5 }}
//               className="flex flex-wrap justify-center lg:justify-start gap-6 mb-10"
//             >
//               {[
//                 { icon: Leaf, text: "100% Organic" },
//                 { icon: Heart, text: "Heart Healthy" },
//                 { icon: Shield, text: "Lab Tested" },
//               ].map((feature, index) => (
//                 <motion.div
//                   key={feature.text}
//                   whileHover={{ scale: 1.05, y: -2 }}
//                   className="flex items-center space-x-2 glass px-4 py-2 rounded-full"
//                 >
//                   <feature.icon className="w-5 h-5 text-brand-500" />
//                   <span className="text-sm font-medium">{feature.text}</span>
//                 </motion.div>
//               ))}
//             </motion.div>

//             {/* CTA Buttons */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.6 }}
//               className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
//             >
//               <Button
//                 size="lg"
//                 className="group relative overflow-hidden bg-gradient-to-r from-brand-500 to-wellness-500 hover:from-brand-600 hover:to-wellness-600"
//                 asChild
//               >
//                 <Link href="/shop">
//                   <span className="relative z-10">Shop Premium Collection</span>
//                   <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
//                   <motion.div
//                     className="absolute inset-0 bg-gradient-to-r from-wellness-500 to-brand-500"
//                     initial={{ x: "-100%" }}
//                     whileHover={{ x: "0%" }}
//                     transition={{ type: "tween", duration: 0.3 }}
//                   />
//                 </Link>
//               </Button>

//               <Button
//                 variant="outline"
//                 size="lg"
//                 className="group glass border-brand-200 hover:bg-brand-50"
//               >
//                 <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
//                 Watch Our Story
//               </Button>
//             </motion.div>

//             {/* Trust Indicators */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.7 }}
//               className="grid grid-cols-3 gap-8 pt-8 border-t border-brand-100"
//             >
//               {[
//                 { value: "10K+", label: "Happy Customers", icon: "😊" },
//                 { value: "50+", label: "Organic Products", icon: "🌱" },
//                 { value: "5★", label: "Average Rating", icon: "⭐" },
//               ].map((stat, index) => (
//                 <motion.div
//                   key={stat.label}
//                   whileHover={{ scale: 1.05 }}
//                   className="text-center lg:text-left"
//                 >
//                   <div className="text-3xl lg:text-4xl font-bold text-brand-600 mb-1">
//                     {stat.icon} {stat.value}
//                   </div>
//                   <div className="text-sm text-muted-foreground">
//                     {stat.label}
//                   </div>
//                 </motion.div>
//               ))}
//             </motion.div>
//           </motion.div>

//           {/* Right Content - 3D Product Showcase */}
//           <motion.div
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//             className="relative"
//           >
//             <div className="relative w-full h-[700px] flex items-center justify-center">
//               {/* Main Product with 3D Effect */}
//               <motion.div
//                 animate={{
//                   y: [0, -15, 0],
//                   rotateY: [0, 5, 0],
//                 }}
//                 transition={{
//                   duration: 4,
//                   repeat: Infinity,
//                   ease: "easeInOut",
//                 }}
//                 className="relative z-20 transform-gpu"
//                 style={{
//                   transformStyle: "preserve-3d",
//                 }}
//               >
//                 <div className="relative">
//                   <Image
//                     src="https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=600&fit=crop"
//                     alt="Premium Organic Juice"
//                     width={350}
//                     height={500}
//                     className="drop-shadow-2xl rounded-2xl"
//                     priority
//                   />
//                   {/* Glow Effect */}
//                   <div className="absolute inset-0 bg-gradient-to-t from-brand-500/20 to-transparent rounded-2xl" />
//                 </div>
//               </motion.div>

//               {/* Floating Product Cards */}
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.8, x: -50 }}
//                 animate={{ opacity: 1, scale: 1, x: 0 }}
//                 transition={{ delay: 1, type: "spring", stiffness: 100 }}
//                 whileHover={{ scale: 1.05, rotate: 2 }}
//                 className="absolute top-16 -left-16 glass rounded-3xl p-6 shadow-glow max-w-xs backdrop-blur-xl border border-white/20"
//               >
//                 <div className="flex items-center space-x-4">
//                   <div className="w-16 h-16 bg-gradient-to-br from-brand-100 to-wellness-100 rounded-2xl flex items-center justify-center text-3xl">
//                     🥬
//                   </div>
//                   <div>
//                     <h4 className="font-bold text-lg mb-1">Green Detox</h4>
//                     <p className="text-sm text-muted-foreground">
//                       Kale • Spinach • Apple
//                     </p>
//                     <div className="flex items-center mt-2">
//                       <span className="text-brand-600 font-bold">$8.99</span>
//                       <div className="ml-2 flex">
//                         {[...Array(5)].map((_, i) => (
//                           <span key={i} className="text-yellow-400 text-xs">
//                             ⭐
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>

//               <motion.div
//                 initial={{ opacity: 0, scale: 0.8, x: 50 }}
//                 animate={{ opacity: 1, scale: 1, x: 0 }}
//                 transition={{ delay: 1.2, type: "spring", stiffness: 100 }}
//                 whileHover={{ scale: 1.05, rotate: -2 }}
//                 className="absolute bottom-16 -right-16 glass rounded-3xl p-6 shadow-glow max-w-xs backdrop-blur-xl border border-white/20"
//               >
//                 <div className="flex items-center space-x-4">
//                   <div className="w-16 h-16 bg-gradient-to-br from-wellness-100 to-green-100 rounded-2xl flex items-center justify-center text-3xl">
//                     🫖
//                   </div>
//                   <div>
//                     <h4 className="font-bold text-lg mb-1">Herbal Blend</h4>
//                     <p className="text-sm text-muted-foreground">
//                       Chamomile • Lavender
//                     </p>
//                     <div className="flex items-center mt-2">
//                       <span className="text-brand-600 font-bold">$7.99</span>
//                       <div className="ml-2 flex">
//                         {[...Array(5)].map((_, i) => (
//                           <span key={i} className="text-yellow-400 text-xs">
//                             ⭐
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Background Glow */}
//               <div className="absolute inset-0 bg-gradient-radial from-brand-200/30 via-wellness-200/20 to-transparent rounded-full blur-3xl transform scale-150" />

//               {/* Orbiting Elements */}
//               <motion.div
//                 animate={{ rotate: 360 }}
//                 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//                 className="absolute inset-0"
//               >
//                 <div className="absolute top-1/4 left-0 w-3 h-3 bg-brand-400 rounded-full opacity-60" />
//                 <div className="absolute bottom-1/4 right-0 w-2 h-2 bg-wellness-400 rounded-full opacity-40" />
//                 <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-green-400 rounded-full opacity-50" />
//               </motion.div>
//             </div>
//           </motion.div>
//         </div>
//       </div>

//       {/* Scroll Indicator */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 1.5 }}
//         className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
//       >
//         <motion.div
//           animate={{ y: [0, 10, 0] }}
//           transition={{ duration: 2, repeat: Infinity }}
//           className="w-6 h-10 border-2 border-brand-300 rounded-full flex justify-center cursor-pointer hover:border-brand-500 transition-colors"
//         >
//           <motion.div
//             animate={{ y: [0, 12, 0] }}
//             transition={{ duration: 2, repeat: Infinity }}
//             className="w-1 h-3 bg-brand-500 rounded-full mt-2"
//           />
//         </motion.div>
//         <p className="text-xs text-muted-foreground mt-2 text-center">
//           Scroll to explore
//         </p>
//       </motion.div>
//     </section>
//   );
// }
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Star, Zap } from "lucide-react";
import { useRef } from "react";

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Vibrant Gradient Background */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600"
      />

      {/* Floating Fruit Icons */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Pineapple */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-16 text-6xl"
        >
          🍍
        </motion.div>

        {/* Orange */}
        <motion.div
          animate={{
            y: [0, 25, 0],
            rotate: [0, -8, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-32 right-24 text-5xl"
        >
          🍊
        </motion.div>

        {/* Lemon */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-32 left-1/3 text-4xl"
        >
          🍋
        </motion.div>

        {/* Watermelon */}
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-40 right-16 text-5xl"
        >
          🍉
        </motion.div>

        {/* Green Apple */}
        <motion.div
          animate={{
            y: [0, -12, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-64 left-1/2 text-4xl"
        >
          🍏
        </motion.div>

        {/* Strawberry */}
        <motion.div
          animate={{
            y: [0, 18, 0],
            rotate: [0, 8, 0],
          }}
          transition={{
            duration: 6.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-96 right-1/3 text-4xl"
        >
          🍓
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            style={{ y: textY }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Discount Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-orange-500 text-white px-6 py-3 rounded-full mb-8 shadow-xl font-bold text-lg"
            >
              <Zap className="w-6 h-6" />
              <span>50% OFF</span>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <h1 className="text-2xl lg:text-3xl font-semibold text-white/90 mb-4">
                Organic Product
              </h1>
              <h2 className="text-6xl lg:text-8xl font-bold text-white leading-tight">
                Stay Home
                <br />
                <span className="text-yellow-300">Shop Online</span>
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl lg:text-2xl text-white/90 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Get fresh, organic wellness beverages delivered to your door.
              Premium cold-pressed juices and herbal teas crafted for your
              health.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-12"
            >
              <Button
                size="lg"
                className="bg-green-400 hover:bg-green-500 text-green-900 font-bold text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                asChild
              >
                <Link href="/shop">
                  Discover Now
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Link>
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center lg:justify-start gap-6"
            >
              <div className="flex items-center space-x-2 text-white">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="font-semibold">5.0 Rating</span>
              </div>
              <div className="text-white font-semibold">
                🚚 Free Shipping $50+
              </div>
              <div className="text-white font-semibold">🌱 100% Organic</div>
            </motion.div>
          </motion.div>

          {/* Right Content - People with Products */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full h-[600px] flex items-center justify-center">
              {/* Main People Image */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative z-10 rounded-3xl overflow-hidden shadow-2xl"
              >
                <Image
                  src="https://ypkhbi098h.ufs.sh/f/qs9WOJrHxTNMNtdub9Z7Q2FVobv4dk7aBrg5wcqTt6szxYuZ"
                  alt="Happy customers with organic products"
                  width={500}
                  height={600}
                  className="object-cover"
                  priority
                />
              </motion.div>

              {/* Floating Product Cards */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 1, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="absolute top-16 -left-16 bg-white rounded-3xl p-6 shadow-2xl max-w-xs border-4 border-white"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">🥤</div>
                  <h4 className="font-bold text-lg mb-1 text-gray-800">
                    Green Detox
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Kale • Spinach • Apple
                  </p>
                  <div className="text-2xl font-bold text-green-600">
                    $12.99
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.05, rotate: -2 }}
                className="absolute bottom-16 -right-16 bg-white rounded-3xl p-6 shadow-2xl max-w-xs border-4 border-white"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">🫖</div>
                  <h4 className="font-bold text-lg mb-1 text-gray-800">
                    Herbal Blend
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Chamomile • Lavender
                  </p>
                  <div className="text-2xl font-bold text-purple-600">
                    $8.99
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
