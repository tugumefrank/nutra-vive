// "use client";

// import { motion, useInView } from "framer-motion";
// import { useRef } from "react";
// import { Heart, Brain, Shield, Zap, Leaf, Sparkles } from "lucide-react";

// const benefits = [
//   {
//     icon: Heart,
//     title: "Heart Health",
//     description:
//       "Rich in antioxidants and nutrients that support cardiovascular wellness and healthy blood flow.",
//     color: "from-red-500 to-pink-500",
//     features: [
//       "Lower Blood Pressure",
//       "Improved Circulation",
//       "Cholesterol Support",
//     ],
//   },
//   {
//     icon: Brain,
//     title: "Mental Clarity",
//     description:
//       "Natural compounds that enhance cognitive function, focus, and mental energy throughout your day.",
//     color: "from-purple-500 to-indigo-500",
//     features: ["Enhanced Focus", "Memory Support", "Stress Relief"],
//   },
//   {
//     icon: Shield,
//     title: "Immune Boost",
//     description:
//       "Powerful vitamins and minerals that strengthen your natural defenses against illness.",
//     color: "from-green-500 to-emerald-500",
//     features: ["Vitamin C Rich", "Natural Defense", "Recovery Support"],
//   },
//   {
//     icon: Zap,
//     title: "Natural Energy",
//     description:
//       "Sustained energy from whole food sources without crashes or artificial stimulants.",
//     color: "from-yellow-500 to-orange-500",
//     features: ["No Crash", "Sustained Power", "Natural Caffeine"],
//   },
//   {
//     icon: Leaf,
//     title: "Detox Support",
//     description:
//       "Gentle cleansing ingredients that help your body eliminate toxins naturally.",
//     color: "from-teal-500 to-green-500",
//     features: ["Liver Support", "Natural Cleanse", "Gentle Detox"],
//   },
//   {
//     icon: Sparkles,
//     title: "Radiant Skin",
//     description:
//       "Beauty from within with nutrients that promote healthy, glowing skin and hair.",
//     color: "from-pink-500 to-rose-500",
//     features: ["Collagen Support", "Hydration", "Anti-Aging"],
//   },
// ];

// function BenefitCard({ benefit, index }: { benefit: any; index: number }) {
//   const Icon = benefit.icon;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 30 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true }}
//       transition={{ duration: 0.6, delay: index * 0.1 }}
//       whileHover={{ y: -5, scale: 1.02 }}
//       className="group"
//     >
//       <div className="relative h-full">
//         {/* Main Card */}
//         <div className="glass rounded-3xl p-8 h-full border border-white/10 hover:border-white/20 transition-all duration-300 relative overflow-hidden">
//           {/* Background Gradient */}
//           <div
//             className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${benefit.color} opacity-10 rounded-full blur-xl transform translate-x-8 -translate-y-8 group-hover:opacity-20 transition-opacity duration-300`}
//           />

//           {/* Icon */}
//           <motion.div
//             whileHover={{ rotate: 10, scale: 1.1 }}
//             className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-6 shadow-lg relative z-10`}
//           >
//             <Icon className="w-8 h-8 text-white" />
//           </motion.div>

//           {/* Content */}
//           <h3 className="text-xl font-bold mb-4 relative z-10">
//             {benefit.title}
//           </h3>
//           <p className="text-muted-foreground mb-6 relative z-10">
//             {benefit.description}
//           </p>

//           {/* Features */}
//           <div className="space-y-2 relative z-10">
//             {benefit.features.map((feature: string, i: number) => (
//               <motion.div
//                 key={feature}
//                 initial={{ opacity: 0, x: -10 }}
//                 whileInView={{ opacity: 1, x: 0 }}
//                 transition={{ delay: index * 0.1 + i * 0.1 }}
//                 className="flex items-center space-x-2"
//               >
//                 <div
//                   className={`w-2 h-2 rounded-full bg-gradient-to-r ${benefit.color}`}
//                 />
//                 <span className="text-sm text-muted-foreground">{feature}</span>
//               </motion.div>
//             ))}
//           </div>

//           {/* Hover Effect */}
//           <motion.div
//             className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//             initial={false}
//           />
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// export function BenefitsSection() {
//   const ref = useRef<HTMLDivElement>(null);
//   const isInView = useInView(ref, { once: true, amount: 0.2 });

//   return (
//     <section
//       ref={ref}
//       className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden"
//     >
//       {/* Background Pattern */}
//       <div className="absolute inset-0 bg-hero-pattern opacity-5" />

//       <div className="container mx-auto px-4 relative z-10">
//         {/* Section Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={isInView ? { opacity: 1, y: 0 } : {}}
//           transition={{ duration: 0.6 }}
//           className="text-center mb-16"
//         >
//           <h2 className="text-4xl lg:text-6xl font-heading font-bold mb-6">
//             Wellness{" "}
//             <span className="bg-gradient-to-r from-brand-500 to-wellness-500 bg-clip-text text-transparent">
//               Benefits
//             </span>{" "}
//             in Every Sip
//           </h2>

//           <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
//             Experience the transformative power of nature's finest ingredients,
//             carefully selected to support your health goals and enhance your
//             wellbeing.
//           </p>
//         </motion.div>

//         {/* Benefits Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {benefits.map((benefit, index) => (
//             <BenefitCard key={benefit.title} benefit={benefit} index={index} />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Heart, Brain, Shield, Zap, Leaf, Sparkles } from "lucide-react";

const benefits = [
  {
    icon: Heart,
    title: "Heart Health",
    description:
      "Rich in antioxidants and nutrients that support cardiovascular wellness and healthy blood flow.",
    color: "from-red-400 via-pink-500 to-rose-500",
    features: [
      "Lower Blood Pressure",
      "Improved Circulation",
      "Cholesterol Support",
    ],
    emoji: "❤️",
  },
  {
    icon: Brain,
    title: "Mental Clarity",
    description:
      "Natural compounds that enhance cognitive function, focus, and mental energy throughout your day.",
    color: "from-purple-400 via-indigo-500 to-blue-500",
    features: ["Enhanced Focus", "Memory Support", "Stress Relief"],
    emoji: "🧠",
  },
  {
    icon: Shield,
    title: "Immune Boost",
    description:
      "Powerful vitamins and minerals that strengthen your natural defenses against illness.",
    color: "from-green-400 via-emerald-500 to-teal-500",
    features: ["Vitamin C Rich", "Natural Defense", "Recovery Support"],
    emoji: "🛡️",
  },
  {
    icon: Zap,
    title: "Natural Energy",
    description:
      "Sustained energy from whole food sources without crashes or artificial stimulants.",
    color: "from-yellow-400 via-orange-500 to-red-500",
    features: ["No Crash", "Sustained Power", "Natural Caffeine"],
    emoji: "⚡",
  },
  {
    icon: Leaf,
    title: "Detox Support",
    description:
      "Gentle cleansing ingredients that help your body eliminate toxins naturally.",
    color: "from-teal-400 via-green-500 to-lime-500",
    features: ["Liver Support", "Natural Cleanse", "Gentle Detox"],
    emoji: "🌿",
  },
  {
    icon: Sparkles,
    title: "Radiant Skin",
    description:
      "Beauty from within with nutrients that promote healthy, glowing skin and hair.",
    color: "from-pink-400 via-rose-500 to-purple-500",
    features: ["Collagen Support", "Hydration", "Anti-Aging"],
    emoji: "✨",
  },
];

function BenefitCard({ benefit, index }: { benefit: any; index: number }) {
  const Icon = benefit.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -10, scale: 1.03 }}
      className="group"
    >
      <div
        className={`relative h-full bg-gradient-to-br ${benefit.color} rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden`}
      >
        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm"></div>
        <div className="absolute top-8 right-8 w-8 h-8 bg-white/20 rounded-full"></div>
        <div className="absolute bottom-8 left-4 w-12 h-12 bg-white/15 rounded-full backdrop-blur-sm"></div>

        {/* Content */}
        <div className="relative z-10 p-8 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border border-white/30"
            >
              <Icon className="w-8 h-8 text-white" />
            </motion.div>

            <div className="text-4xl">{benefit.emoji}</div>
          </div>

          {/* Title & Description */}
          <div className="mb-6 flex-grow">
            <h3 className="text-2xl font-bold text-white mb-4">
              {benefit.title}
            </h3>
            <p className="text-white/90 leading-relaxed">
              {benefit.description}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {benefit.features.map((feature: string, i: number) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + i * 0.1 }}
                className="flex items-center space-x-3"
              >
                <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-white/90 font-medium">{feature}</span>
              </motion.div>
            ))}
          </div>

          {/* Hover Glow Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent rounded-3xl"
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function BenefitsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Vibrant Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100" />

      {/* Floating Health Icons */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-16 text-5xl opacity-20"
        >
          🍎
        </motion.div>

        <motion.div
          animate={{
            y: [0, 25, 0],
            rotate: [0, -8, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-32 right-24 text-4xl opacity-15"
        >
          🥗
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
          💪
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
          className="absolute bottom-40 right-16 text-5xl opacity-20"
        >
          🌱
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-400 to-teal-400 text-white px-6 py-3 rounded-full mb-8 shadow-xl">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">Health Benefits</span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-heading font-bold mb-6 text-gray-800">
            Transform Your{" "}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Wellness
            </span>{" "}
            Journey
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience the transformative power of nature's finest ingredients,
            carefully selected to support your health goals and enhance your
            wellbeing with every sip.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <BenefitCard key={benefit.title} benefit={benefit} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Ready to Experience These Benefits?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of customers who have transformed their health with
              our premium organic beverages.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Shop Now & Save 15%
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white border-2 border-gray-300 text-gray-700 font-bold px-8 py-4 rounded-2xl hover:border-green-400 transition-all duration-300"
              >
                Learn More
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
