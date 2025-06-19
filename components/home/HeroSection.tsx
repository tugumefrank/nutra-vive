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
