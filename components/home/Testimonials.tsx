"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { Star, Verified } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Yoga Instructor",
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b5e5?w=80&h=80&fit=crop&crop=face",
    rating: 5,
    content:
      "Nutra-Vive transformed my morning routine. The Green Detox gives me sustained energy without jitters!",
    product: "Green Detox Elixir",
    verified: true,
  },
  {
    id: 2,
    name: "Marcus Johnson",
    role: "Software Engineer",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    rating: 5,
    content:
      "Perfect for long coding sessions. The Matcha Zen Latte helps me focus and tastes incredible.",
    product: "Matcha Zen Latte",
    verified: true,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Nutritionist",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    rating: 5,
    content:
      "I recommend Nutra-Vive to all clients. Exceptional quality and real health benefits!",
    product: "Strawberry Hibiscus Tea",
    verified: true,
  },
  {
    id: 4,
    name: "David Kim",
    role: "Marathon Runner",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    rating: 5,
    content:
      "Berry Antioxidant Blend is my go-to post-run drink. Amazing taste and faster recovery!",
    product: "Berry Antioxidant Blend",
    verified: true,
  },
  {
    id: 5,
    name: "Lisa Thompson",
    role: "Busy Mom",
    image:
      "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=80&h=80&fit=crop&crop=face",
    rating: 5,
    content:
      "Easy nutrition on the go. My whole family loves them, even my picky 8-year-old!",
    product: "Watermelon Lemonade",
    verified: true,
  },
  {
    id: 6,
    name: "Alex Rivera",
    role: "Fitness Coach",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    rating: 5,
    content:
      "These drinks fuel my workouts perfectly. Clean energy that lasts throughout my training sessions.",
    product: "Green Iced Tea",
    verified: true,
  },
];

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: any;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateY: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.8,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{
        y: -8,
        rotateY: 5,
        scale: 1.02,
        transition: { duration: 0.3 },
      }}
      className="group"
    >
      <div className="relative h-full">
        {/* Glowing Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 via-blue-500/30 to-purple-600/30 dark:from-cyan-400/20 dark:via-blue-500/20 dark:to-purple-600/20 rounded-2xl blur-xl group-hover:blur-lg transition-all duration-500 opacity-0 group-hover:opacity-100" />

        {/* Main Card */}
        <div className="relative bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 rounded-2xl p-6 h-full shadow-2xl group-hover:border-gray-300/70 dark:group-hover:border-white/40 transition-all duration-500">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent rounded-2xl" />

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-300/50 dark:ring-white/30 shadow-lg"
                  >
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </motion.div>
                  {testimonial.verified && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                      className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Verified className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white text-sm leading-tight">
                    {testimonial.name}
                  </h4>
                  <p className="text-gray-600 dark:text-white/70 text-xs">
                    {testimonial.role}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex space-x-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + i * 0.1 + 0.3 }}
                  >
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500 dark:fill-yellow-400 dark:text-yellow-400" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quote */}
            <blockquote className="text-gray-700 dark:text-white/90 text-sm leading-relaxed mb-4 font-medium">
              "{testimonial.content}"
            </blockquote>

            {/* Product Tag */}
            <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-yellow-400  to-amber-500 dark:from-emerald-500/20 dark:to-cyan-500/20 backdrop-blur-sm border border-orange-400/40 dark:border-emerald-400/30 rounded-full">
              <span className="text-black dark:text-emerald-300 text-xs font-semibold">
                {testimonial.product}
              </span>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-white/30 to-transparent dark:from-white/10 dark:to-transparent rounded-full" />
          <div className="absolute bottom-2 left-2 w-6 h-6 bg-gradient-to-tr from-cyan-400/30 to-transparent dark:from-cyan-400/20 dark:to-transparent rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}

export function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
      {/* Futuristic Background - Light Mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-400/20 dark:bg-cyan-400/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-500/15 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.08)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 dark:from-cyan-500/20 dark:to-blue-500/20 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-cyan-400/40 dark:border-cyan-400/30">
            <div className="w-2 h-2 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-cyan-700 dark:text-cyan-300 font-semibold text-sm">
              Customer Stories
            </span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-bold mb-6 text-gray-800 dark:text-white">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-700 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-600 bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>

          <p className="text-xl text-gray-600 dark:text-white/70 max-w-3xl mx-auto leading-relaxed">
            Real transformations from our community of wellness enthusiasts
            who've discovered the power of organic nutrition.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-6">
              <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">
                10,000+
              </div>
              <div className="text-gray-600 dark:text-white/70 text-sm">
                Happy Customers
              </div>
            </div>
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-6">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                4.9★
              </div>
              <div className="text-gray-600 dark:text-white/70 text-sm">
                Average Rating
              </div>
            </div>
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-6">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                95%
              </div>
              <div className="text-gray-600 dark:text-white/70 text-sm">
                Would Recommend
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
