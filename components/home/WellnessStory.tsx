// "use client";

// import { motion, useInView } from "framer-motion";
// import { useRef } from "react";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { ArrowRight, Quote } from "lucide-react";
// import Link from "next/link";

// export function WellnessStory() {
//   const ref = useRef<HTMLDivElement>(null);
//   const isInView = useInView(ref, { once: true, amount: 0.3 });

//   return (
//     <section
//       ref={ref}
//       className="py-24 bg-gradient-to-b from-background to-muted/30"
//     >
//       <div className="container mx-auto px-4">
//         <div className="grid lg:grid-cols-2 gap-16 items-center">
//           {/* Content */}
//           <motion.div
//             initial={{ opacity: 0, x: -50 }}
//             animate={isInView ? { opacity: 1, x: 0 } : {}}
//             transition={{ duration: 0.8 }}
//           >
//             <div className="mb-8">
//               <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-100 to-wellness-100 px-4 py-2 rounded-full mb-6">
//                 <Quote className="w-4 h-4 text-brand-600" />
//                 <span className="text-sm font-semibold text-brand-700">
//                   Our Story
//                 </span>
//               </div>

//               <h2 className="text-4xl lg:text-5xl font-heading font-bold mb-6">
//                 My Journey to{" "}
//                 <span className="bg-gradient-to-r from-brand-500 to-wellness-500 bg-clip-text text-transparent">
//                   Natural Healing
//                 </span>
//               </h2>
//             </div>

//             <div className="space-y-6 mb-8">
//               <p className="text-lg text-muted-foreground leading-relaxed">
//                 Hi, I'm the founder of Nutra-Vive—and my journey into the world
//                 of natural wellness wasn't born in a lab or from a textbook. It
//                 started with <strong>me</strong>, dealing with seasonal
//                 allergies, sinus pressure, and digestive issues that disrupted
//                 my everyday life.
//               </p>

//               <p className="text-lg text-muted-foreground leading-relaxed">
//                 I was never a fan of over-the-counter meds and felt disconnected
//                 from conventional treatments that offered temporary relief with
//                 long-term side effects. So, I turned inward—and then, I turned
//                 to <strong className="text-brand-600">nature</strong>.
//               </p>

//               <p className="text-lg text-muted-foreground leading-relaxed">
//                 Through research, trial, and error, I began experimenting with
//                 herbal teas, natural juices, and anti-inflammatory ingredients.
//                 I started blending ginger, dandelion root, green tea, nettle,
//                 pineapple, and other healing plants—and slowly, I felt better.{" "}
//                 <strong className="text-brand-600">
//                   My digestion improved, my sinuses cleared
//                 </strong>
//                 , and for the first time in years, I felt more in control of my
//                 health.
//               </p>

//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={isInView ? { opacity: 1, y: 0 } : {}}
//                 transition={{ delay: 0.4 }}
//                 className="glass p-6 rounded-2xl border border-brand-200"
//               >
//                 <p className="text-brand-700 font-medium italic">
//                   "That's when Nutra-Vive was born—a reflection of my own
//                   transformation, and now, a mission to help others experience
//                   the same."
//                 </p>
//               </motion.div>
//             </div>

//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={isInView ? { opacity: 1, y: 0 } : {}}
//               transition={{ delay: 0.6 }}
//               className="flex flex-col sm:flex-row gap-4"
//             >
//               <Button size="lg" className="group" asChild>
//                 <Link href="/about">
//                   Learn More About Our Mission
//                   <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                 </Link>
//               </Button>

//               <Button variant="outline" size="lg" asChild>
//                 <Link href="/contact">Share Your Story</Link>
//               </Button>
//             </motion.div>

//             {/* Disclaimer */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={isInView ? { opacity: 1 } : {}}
//               transition={{ delay: 0.8 }}
//               className="mt-8 p-4 bg-muted/50 rounded-lg border-l-4 border-yellow-500"
//             >
//               <p className="text-sm text-muted-foreground">
//                 <strong>Disclaimer:</strong> I am not a medical professional.
//                 The information and products shared through Nutra-Vive are based
//                 on my personal experiences with natural wellness. Always consult
//                 with a qualified healthcare provider for medical concerns.
//               </p>
//             </motion.div>
//           </motion.div>

//           {/* Image */}
//           <motion.div
//             initial={{ opacity: 0, x: 50 }}
//             animate={isInView ? { opacity: 1, x: 0 } : {}}
//             transition={{ duration: 0.8, delay: 0.2 }}
//             className="relative"
//           >
//             <div className="relative">
//               {/* Main Image */}
//               <motion.div
//                 whileHover={{ scale: 1.02 }}
//                 transition={{ type: "spring", stiffness: 300 }}
//                 className="relative rounded-3xl overflow-hidden shadow-2xl"
//               >
//                 <Image
//                   src="https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=600&h=700&fit=crop"
//                   alt="Founder's wellness journey"
//                   width={600}
//                   height={700}
//                   className="object-cover"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
//               </motion.div>

//               {/* Floating Elements */}
//               <motion.div
//                 animate={{
//                   y: [0, -10, 0],
//                   rotate: [0, 2, 0],
//                 }}
//                 transition={{
//                   duration: 4,
//                   repeat: Infinity,
//                   ease: "easeInOut",
//                 }}
//                 className="absolute -top-8 -right-8 glass rounded-2xl p-4 shadow-lg border border-white/20"
//               >
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-brand-600">5+</div>
//                   <div className="text-xs text-muted-foreground">
//                     Years Natural
//                   </div>
//                 </div>
//               </motion.div>

//               <motion.div
//                 animate={{
//                   y: [0, 15, 0],
//                   rotate: [0, -2, 0],
//                 }}
//                 transition={{
//                   duration: 5,
//                   repeat: Infinity,
//                   ease: "easeInOut",
//                 }}
//                 className="absolute -bottom-8 -left-8 glass rounded-2xl p-4 shadow-lg border border-white/20"
//               >
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-brand-600">100%</div>
//                   <div className="text-xs text-muted-foreground">Organic</div>
//                 </div>
//               </motion.div>

//               {/* Background Glow */}
//               <div className="absolute inset-0 bg-gradient-to-r from-brand-200/20 to-wellness-200/20 rounded-3xl blur-3xl transform scale-110 -z-10" />
//             </div>
//           </motion.div>
//         </div>
//       </div>
//     </section>
//   );
// }
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Sparkles, Leaf } from "lucide-react";
import Link from "next/link";

export function WellnessStory() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Vibrant Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400" />

      {/* Floating Wellness Icons */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-16 text-5xl opacity-30"
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
          className="absolute top-32 right-24 text-4xl opacity-20"
        >
          🧘‍♀️
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
          className="absolute bottom-32 left-1/4 text-4xl opacity-25"
        >
          💚
        </motion.div>

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
          className="absolute bottom-40 right-16 text-5xl opacity-30"
        >
          🌱
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              {/* Story Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full mb-8 shadow-xl"
              >
                <Heart className="w-5 h-5 text-pink-500" />
                <span className="text-sm font-bold text-gray-800">
                  My Wellness Journey
                </span>
              </motion.div>

              <h2 className="text-4xl lg:text-6xl font-heading font-bold mb-6 text-white leading-tight">
                From Health <span className="text-yellow-300">Struggles</span>
                <br />
                to Natural <span className="text-yellow-300">Healing</span>
              </h2>
            </div>

            <div className="space-y-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 }}
                className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl"
              >
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Hi, I'm the founder of Nutra-Vive—and my journey into the
                  world of natural wellness wasn't born in a lab or from a
                  textbook. It started with{" "}
                  <strong className="text-purple-600">me</strong>, dealing with
                  seasonal allergies, sinus pressure, and digestive issues that
                  disrupted my everyday life.
                </p>

                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  I was never a fan of over-the-counter meds and felt
                  disconnected from conventional treatments that offered
                  temporary relief with long-term side effects. So, I turned
                  inward—and then, I turned to{" "}
                  <strong className="text-green-600">nature</strong>.
                </p>

                <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6 border-l-4 border-green-500">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Through research, trial, and error, I began experimenting
                    with herbal teas, natural juices, and anti-inflammatory
                    ingredients. I started blending ginger, dandelion root,
                    green tea, nettle, pineapple, and other healing plants—and
                    slowly, I felt better.{" "}
                    <strong className="text-green-600">
                      My digestion improved, my sinuses cleared
                    </strong>
                    , and for the first time in years, I felt more in control of
                    my health.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-xl"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                  <span className="text-lg font-semibold">
                    The Transformation
                  </span>
                </div>
                <p className="text-xl font-medium italic">
                  "That's when Nutra-Vive was born—a reflection of my own
                  transformation, and now, a mission to help others experience
                  the same natural healing journey."
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 mb-8"
            >
              <Button
                size="lg"
                className="group bg-white text-purple-600 hover:bg-yellow-300 hover:text-purple-700 font-bold shadow-xl"
                asChild
              >
                <Link href="/about">
                  Read My Full Story
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="bg-white/20 border-white text-white hover:bg-white hover:text-purple-600 backdrop-blur-sm font-semibold"
                asChild
              >
                <Link href="/contact">Share Your Journey</Link>
              </Button>
            </motion.div>

            {/* Disclaimer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8 }}
              className="bg-yellow-400/90 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500"
            >
              <div className="flex items-start space-x-3">
                <div className="bg-yellow-600 rounded-full p-1 mt-1">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div>
                  <p className="text-sm text-yellow-900 font-medium">
                    <strong>Important Disclaimer:</strong> I am not a medical
                    professional. The information and products shared through
                    Nutra-Vive are based on my personal experiences with natural
                    wellness. Always consult with a qualified healthcare
                    provider for medical concerns.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Enhanced Image Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              {/* Main Image with Colorful Border */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white/50"
              >
                <Image
                  src="https://ypkhbi098h.ufs.sh/f/qs9WOJrHxTNMRBemcQFfGhB83ecWl4guOFCH9NsLJmVYQinS"
                  alt="Founder's wellness journey"
                  width={600}
                  height={700}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent" />
              </motion.div>

              {/* Colorful Floating Stats */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 2, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-8 -right-8 bg-gradient-to-br from-green-400 to-green-500 rounded-3xl p-6 shadow-xl text-white"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold">5+</div>
                  <div className="text-sm font-semibold">
                    Years of Natural Healing
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 15, 0],
                  rotate: [0, -2, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-8 -left-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl p-6 shadow-xl text-white"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold">100%</div>
                  <div className="text-sm font-semibold">Organic & Natural</div>
                </div>
              </motion.div>

              {/* Additional Floating Element */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  x: [0, 5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-1/2 -left-12 bg-gradient-to-br from-pink-400 to-pink-500 rounded-2xl p-4 shadow-xl text-white"
              >
                <div className="text-center">
                  <Leaf className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-xs font-semibold">Natural</div>
                </div>
              </motion.div>

              {/* Decorative Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 via-pink-300/20 to-purple-300/20 rounded-3xl blur-3xl transform scale-125 -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
