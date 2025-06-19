"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Heart, Brain, Shield, Zap, Leaf, Sparkles } from "lucide-react";

const benefits = [
  {
    icon: Heart,
    title: "Heart Support",
    description:
      "Antioxidant-rich ingredients like hibiscus and pomegranate help maintain healthy blood pressure and support cardiovascular function.",
    color: "from-red-400 via-pink-500 to-rose-500",
    features: [
      "Blood Pressure Support",
      "Circulation Boost",
      "Cholesterol Balance",
    ],
    emoji: "❤️",
  },
  {
    icon: Brain,
    title: "Liver Cleanse",
    description:
      "Dandelion root and green tea compounds assist your liver's natural detoxification processes and support optimal liver function.",
    color: "from-green-400 via-emerald-500 to-teal-500",
    features: ["Natural Detox", "Liver Function", "Toxin Elimination"],
    emoji: "🫁",
  },
  {
    icon: Shield,
    title: "Kidney Health",
    description:
      "Hydrating ingredients and natural diuretics like nettle help support kidney function and maintain healthy fluid balance.",
    color: "from-blue-400 via-cyan-500 to-teal-500",
    features: ["Fluid Balance", "Natural Cleansing", "Kidney Function"],
    emoji: "🔵",
  },
  {
    icon: Zap,
    title: "Brain Power",
    description:
      "Antioxidants from berries and green tea support cognitive function, memory, and mental clarity throughout your day.",
    color: "from-purple-400 via-indigo-500 to-blue-500",
    features: ["Memory Support", "Mental Clarity", "Focus Enhancement"],
    emoji: "🧠",
  },
  {
    icon: Leaf,
    title: "Lung Health",
    description:
      "Anti-inflammatory compounds in ginger and turmeric help support respiratory health and maintain clear breathing.",
    color: "from-cyan-400 via-blue-500 to-indigo-500",
    features: ["Respiratory Support", "Anti-Inflammatory", "Breathing Ease"],
    emoji: "🫁",
  },
  {
    icon: Sparkles,
    title: "Digestive Wellness",
    description:
      "Digestive-supporting herbs like ginger and chamomile promote healthy gut function and comfortable digestion.",
    color: "from-yellow-400 via-orange-500 to-amber-500",
    features: ["Gut Health", "Digestive Comfort", "Nutrient Absorption"],
    emoji: "🌿",
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
            <span className="font-bold">Vital Organ Support</span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-heading font-bold mb-6 text-gray-800">
            Nourish Your{" "}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Body's
            </span>{" "}
            Essential Systems
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our organic beverages are formulated with specific nutrients and
            herbs that support your body's vital organs, helping them function
            optimally for complete wellness.
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
              Ready to Transform Your Health Journey?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Want to improve your health with a personalized approach? Our
              expert consultations will help you discover the perfect organic
              blends tailored to your unique wellness goals.
            </p>
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                onClick={() => (window.location.href = "/consultation")}
              >
                Get Your Personal Health Consultation
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
