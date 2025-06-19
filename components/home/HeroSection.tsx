// "use client";

// import { motion, useScroll, useTransform } from "framer-motion";
// import Link from "next/link";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ArrowRight, Play, Star, Zap } from "lucide-react";
// import { useRef } from "react";

// export function HeroSection() {
//   const ref = useRef<HTMLDivElement>(null);
//   const { scrollYProgress } = useScroll({
//     target: ref,
//     offset: ["start start", "end start"],
//   });

//   const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
//   const textY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

//   return (
//     <section
//       ref={ref}
//       className="relative min-h-screen flex items-center justify-center overflow-hidden"
//     >
//       {/* Vibrant Gradient Background */}
//       <motion.div
//         style={{ y: backgroundY }}
//         className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600"
//       />

//       {/* Floating Fruit Icons */}
//       <div className="absolute inset-0 overflow-hidden">
//         {/* Pineapple */}
//         <motion.div
//           animate={{
//             y: [0, -20, 0],
//             rotate: [0, 10, 0],
//             scale: [1, 1.1, 1],
//           }}
//           transition={{
//             duration: 6,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//           className="absolute top-20 left-16 text-6xl"
//         >
//           🍍
//         </motion.div>

//         {/* Orange */}
//         <motion.div
//           animate={{
//             y: [0, 25, 0],
//             rotate: [0, -8, 0],
//             scale: [1, 0.9, 1],
//           }}
//           transition={{
//             duration: 8,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//           className="absolute top-32 right-24 text-5xl"
//         >
//           🍊
//         </motion.div>

//         {/* Lemon */}
//         <motion.div
//           animate={{
//             y: [0, -15, 0],
//             x: [0, 10, 0],
//             rotate: [0, 5, 0],
//           }}
//           transition={{
//             duration: 7,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//           className="absolute bottom-32 left-1/3 text-4xl"
//         >
//           🍋
//         </motion.div>

//         {/* Watermelon */}
//         <motion.div
//           animate={{
//             y: [0, 20, 0],
//             rotate: [0, -5, 0],
//           }}
//           transition={{
//             duration: 9,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//           className="absolute bottom-40 right-16 text-5xl"
//         >
//           🍉
//         </motion.div>

//         {/* Green Apple */}
//         <motion.div
//           animate={{
//             y: [0, -12, 0],
//             scale: [1, 1.05, 1],
//           }}
//           transition={{
//             duration: 5,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//           className="absolute top-64 left-1/2 text-4xl"
//         >
//           🍏
//         </motion.div>

//         {/* Strawberry */}
//         <motion.div
//           animate={{
//             y: [0, 18, 0],
//             rotate: [0, 8, 0],
//           }}
//           transition={{
//             duration: 6.5,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//           className="absolute top-96 right-1/3 text-4xl"
//         >
//           🍓
//         </motion.div>
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
//             {/* Discount Badge */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//               className="inline-flex items-center space-x-2 bg-orange-500 text-white px-6 py-3 rounded-full mb-8 shadow-xl font-bold text-lg"
//             >
//               <Zap className="w-6 h-6" />
//               <span>50% OFF</span>
//             </motion.div>

//             {/* Main Heading */}
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3 }}
//               className="mb-8"
//             >
//               <h1 className="text-2xl lg:text-3xl font-semibold text-white/90 mb-4">
//                 Organic Product
//               </h1>
//               <h2 className="text-6xl lg:text-8xl font-bold text-white leading-tight">
//                 Stay Home
//                 <br />
//                 <span className="text-yellow-300">Shop Online</span>
//               </h2>
//             </motion.div>

//             <motion.p
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4 }}
//               className="text-xl lg:text-2xl text-white/90 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
//             >
//               Get fresh, organic wellness beverages delivered to your door.
//               Premium cold-pressed juices and herbal teas crafted for your
//               health.
//             </motion.p>

//             {/* CTA Button */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.5 }}
//               className="mb-12"
//             >
//               <Button
//                 size="lg"
//                 className="bg-green-400 hover:bg-green-500 text-green-900 font-bold text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
//                 asChild
//               >
//                 <Link href="/shop">
//                   Discover Now
//                   <ArrowRight className="ml-2 w-6 h-6" />
//                 </Link>
//               </Button>
//             </motion.div>

//             {/* Trust Indicators */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.6 }}
//               className="flex flex-wrap justify-center lg:justify-start gap-6"
//             >
//               <div className="flex items-center space-x-2 text-white">
//                 <div className="flex">
//                   {[...Array(5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       className="w-5 h-5 fill-yellow-400 text-yellow-400"
//                     />
//                   ))}
//                 </div>
//                 <span className="font-semibold">5.0 Rating</span>
//               </div>
//               <div className="text-white font-semibold">
//                 🚚 Free Shipping $50+
//               </div>
//               <div className="text-white font-semibold">🌱 100% Organic</div>
//             </motion.div>
//           </motion.div>

//           {/* Right Content - People with Products */}
//           <motion.div
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//             className="relative"
//           >
//             <div className="relative w-full h-[600px] flex items-center justify-center">
//               {/* Main People Image */}
//               <motion.div
//                 animate={{
//                   y: [0, -10, 0],
//                 }}
//                 transition={{
//                   duration: 4,
//                   repeat: Infinity,
//                   ease: "easeInOut",
//                 }}
//                 className="relative z-10 rounded-3xl overflow-hidden shadow-2xl"
//               >
//                 <Image
//                   src="https://ypkhbi098h.ufs.sh/f/qs9WOJrHxTNMNtdub9Z7Q2FVobv4dk7aBrg5wcqTt6szxYuZ"
//                   alt="Happy customers with organic products"
//                   width={500}
//                   height={600}
//                   className="object-cover"
//                   priority
//                 />
//               </motion.div>

//               {/* Floating Product Cards */}
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.8, x: -50 }}
//                 animate={{ opacity: 1, scale: 1, x: 0 }}
//                 transition={{ delay: 1, type: "spring", stiffness: 100 }}
//                 whileHover={{ scale: 1.05, rotate: 2 }}
//                 className="absolute top-16 -left-16 bg-white rounded-3xl p-6 shadow-2xl max-w-xs border-4 border-white"
//               >
//                 <div className="text-center">
//                   <div className="text-4xl mb-3">🥤</div>
//                   <h4 className="font-bold text-lg mb-1 text-gray-800">
//                     Green Detox
//                   </h4>
//                   <p className="text-sm text-gray-600 mb-3">
//                     Kale • Spinach • Apple
//                   </p>
//                   <div className="text-2xl font-bold text-green-600">
//                     $12.99
//                   </div>
//                 </div>
//               </motion.div>

//               <motion.div
//                 initial={{ opacity: 0, scale: 0.8, x: 50 }}
//                 animate={{ opacity: 1, scale: 1, x: 0 }}
//                 transition={{ delay: 1.2, type: "spring", stiffness: 100 }}
//                 whileHover={{ scale: 1.05, rotate: -2 }}
//                 className="absolute bottom-16 -right-16 bg-white rounded-3xl p-6 shadow-2xl max-w-xs border-4 border-white"
//               >
//                 <div className="text-center">
//                   <div className="text-4xl mb-3">🫖</div>
//                   <h4 className="font-bold text-lg mb-1 text-gray-800">
//                     Herbal Blend
//                   </h4>
//                   <p className="text-sm text-gray-600 mb-3">
//                     Chamomile • Lavender
//                   </p>
//                   <div className="text-2xl font-bold text-purple-600">
//                     $8.99
//                   </div>
//                 </div>
//               </motion.div>
//             </div>
//           </motion.div>
//         </div>
//       </div>
//     </section>
//   );
// }
"use client";

import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Star,
  Zap,
  Leaf,
  Heart,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const slides = [
  {
    id: 1,
    title: "PURE WELLNESS,",
    subtitle: "DELIVERED FRESH",
    description:
      "Premium cold-pressed juices and herbal teas crafted for your optimal health and vitality.",
    cta: "Shop Juices",
    href: "/shop/juices",
    bgGradient: "from-emerald-500 via-teal-600 to-green-700",
    productImage: "🥤",
    productTitle: "Green Detox Blend",
    productPrice: "$12.99",
    badge: "BESTSELLER",
    features: ["100% Organic", "Cold-Pressed", "No Additives"],
  },
  {
    id: 2,
    title: "HERBAL BLISS,",
    subtitle: "NATURAL CALM",
    description:
      "Handcrafted herbal tea blends that soothe your mind, body and soul with every mindful sip.",
    cta: "Explore Teas",
    href: "/shop/teas",
    bgGradient: "from-purple-500 via-violet-600 to-indigo-700",
    productImage: "🫖",
    productTitle: "Chamomile Dreams",
    productPrice: "$8.99",
    badge: "CAFFEINE FREE",
    features: ["Stress Relief", "Sleep Support", "All Natural"],
  },
  {
    id: 3,
    title: "FRESH PRESSED,",
    subtitle: "MAXIMUM NUTRITION",
    description:
      "Raw, nutrient-dense juices packed with vitamins, minerals and antioxidants for peak performance.",
    cta: "Try Smoothies",
    href: "/shop/smoothies",
    bgGradient: "from-orange-500 via-amber-600 to-yellow-600",
    productImage: "🍓",
    productTitle: "Berry Antioxidant",
    productPrice: "$10.50",
    badge: "HIGH PROTEIN",
    features: ["Immune Boost", "Energy Plus", "Raw & Fresh"],
  },
];

export default function ModernHeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Dynamic Gradient Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{ y: backgroundY }}
          className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.bgGradient}`}
        />
      </AnimatePresence>

      {/* Abstract Background Patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1200 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            animate={{
              d: [
                "M0,400 Q300,200 600,400 T1200,400 L1200,800 L0,800 Z",
                "M0,400 Q300,600 600,400 T1200,400 L1200,800 L0,800 Z",
                "M0,400 Q300,200 600,400 T1200,400 L1200,800 L0,800 Z",
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            fill="rgba(255,255,255,0.05)"
          />
          <motion.path
            animate={{
              d: [
                "M0,300 Q400,100 800,300 T1200,300 L1200,0 L0,0 Z",
                "M0,300 Q400,500 800,300 T1200,300 L1200,0 L0,0 Z",
                "M0,300 Q400,100 800,300 T1200,300 L1200,0 L0,0 Z",
              ],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            fill="rgba(255,255,255,0.03)"
          />
        </svg>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
          className="absolute top-20 left-16 text-4xl opacity-60"
        >
          🌿
        </motion.div>

        <motion.div
          animate={{
            y: [0, 25, 0],
            rotate: [0, -8, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-32 right-24 text-3xl opacity-50"
        >
          ✨
        </motion.div>

        <motion.div
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-32 left-1/4 text-5xl opacity-40"
        >
          🍃
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div style={{ y: textY }} className="text-center lg:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.6 }}
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full mb-8 shadow-xl font-bold text-sm border border-white/30"
                >
                  <Leaf className="w-4 h-4" />
                  <span>{currentSlideData.badge}</span>
                </motion.div>

                {/* Main Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-8"
                >
                  <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight tracking-tight">
                    {currentSlideData.title}
                    <br />
                    <span className="text-white/90">
                      {currentSlideData.subtitle}
                    </span>
                  </h1>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg lg:text-xl text-white/90 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                >
                  {currentSlideData.description}
                </motion.p>

                {/* Features */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8"
                >
                  {currentSlideData.features.map((feature, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2 text-sm font-semibold"
                    >
                      {feature}
                    </Badge>
                  ))}
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mb-8"
                >
                  <Button
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-white/90 font-bold text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    asChild
                  >
                    <Link href={currentSlideData.href}>
                      {currentSlideData.cta}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm"
                >
                  <div className="flex items-center space-x-2 text-white/90">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <span className="font-semibold">5.0 Rating</span>
                  </div>
                  <div className="text-white/90 font-semibold">
                    🚚 Free Shipping $50+
                  </div>
                  <div className="text-white/90 font-semibold">
                    🌱 100% Organic
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Right Content - Product Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                {/* Product Card */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotateY: [0, 5, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-sm border border-white/50"
                >
                  <div className="text-center">
                    <div className="text-8xl mb-6">
                      {currentSlideData.productImage}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {currentSlideData.productTitle}
                    </h3>
                    <p className="text-gray-600 mb-4">Premium Quality</p>
                    <div className="text-3xl font-black text-emerald-600 mb-6">
                      {currentSlideData.productPrice}
                    </div>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl">
                      Add to Cart
                    </Button>
                  </div>
                </motion.div>

                {/* Floating Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute -top-4 -right-4 bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg"
                >
                  New!
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-6">
        {/* Slide Indicators */}
        <div className="flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white scale-125"
                  : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        {/* Previous/Next Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={prevSlide}
            className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all duration-200 border border-white/30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all duration-200 border border-white/30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Auto-play Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <motion.div
          key={currentSlide}
          initial={{ width: "0%" }}
          animate={{ width: isAutoPlaying ? "100%" : "0%" }}
          transition={{ duration: 5, ease: "linear" }}
          className="h-full bg-white"
        />
      </div>
    </section>
  );
}
