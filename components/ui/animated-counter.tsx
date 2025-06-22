"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  format?: "number" | "currency" | "percentage";
  prefix?: string;
  suffix?: string;
}

export default function AnimatedCounter({
  value,
  duration = 2,
  delay = 0,
  format = "number",
  prefix = "",
  suffix = "",
}: AnimatedCounterProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    if (format === "currency") {
      return `${prefix}$${Math.round(latest).toLocaleString()}${suffix}`;
    }
    if (format === "percentage") {
      return `${prefix}${Math.round(latest)}%${suffix}`;
    }
    return `${prefix}${Math.round(latest).toLocaleString()}${suffix}`;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const controls = animate(count, value, { duration });
      return controls.stop;
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [count, value, duration, delay]);

  return <motion.span>{rounded}</motion.span>;
}
