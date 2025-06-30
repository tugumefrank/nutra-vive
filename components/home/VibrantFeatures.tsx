"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Truck, Headphones, RotateCcw, CreditCard } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "free shipping on all us order or order above $200",
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    icon: Headphones,
    title: "Support 24/7",
    description: "contact us 24 hours a day, 7 days a week",
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    icon: RotateCcw,
    title: "07 Days Return",
    description: "simply return it within 30 days for an exchange",
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    icon: CreditCard,
    title: "100% Payment Secure",
    description: "we ensure secure payment with paypal an card",
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
];

export function VibrantFeatures() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-20 h-20 mx-auto mb-6 rounded-full ${feature.bgColor} flex items-center justify-center group-hover:shadow-lg transition-all duration-300`}
                >
                  <Icon className={`w-10 h-10 ${feature.color}`} />
                </motion.div>

                <h3 className="text-xl font-bold mb-3 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
