// components/animations/floating-elements.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

export default function FloatingElements() {
  const [elements, setElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    // Generate random floating elements
    const generateElements = () => {
      const colors = [
        "from-green-400/20 to-green-600/20",
        "from-blue-400/20 to-blue-600/20",
        "from-purple-400/20 to-purple-600/20",
        "from-pink-400/20 to-pink-600/20",
        "from-yellow-400/20 to-yellow-600/20",
        "from-indigo-400/20 to-indigo-600/20",
      ];

      const newElements: FloatingElement[] = [];

      for (let i = 0; i < 12; i++) {
        newElements.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 80 + 20, // 20-100px
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 2,
          duration: Math.random() * 10 + 8, // 8-18 seconds
        });
      }

      setElements(newElements);
    };

    generateElements();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className={`absolute rounded-full bg-gradient-to-br ${element.color} blur-sm`}
          style={{
            width: element.size,
            height: element.size,
            left: `${element.x}%`,
            top: `${element.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, -15, 0],
            scale: [1, 1.2, 0.8, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Additional geometric shapes */}
      <motion.div
        className="absolute top-20 right-20 w-16 h-16 border-2 border-green-300/30 rotate-45"
        animate={{
          rotate: [45, 225, 45],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-40 left-20 w-12 h-12 rounded-full border-2 border-blue-300/30"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-1/3 left-1/4 w-8 h-8 bg-gradient-to-r from-purple-400/20 to-pink-400/20 transform rotate-45"
        animate={{
          rotate: [45, 405, 45],
          y: [0, 25, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Organic blob shapes */}
      <motion.div
        className="absolute top-1/2 right-1/3 w-24 h-16 bg-gradient-to-br from-green-300/10 to-blue-300/10 rounded-full"
        style={{
          clipPath: "polygon(30% 40%, 70% 30%, 100% 70%, 60% 100%, 10% 80%)",
        }}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-gradient-to-br from-yellow-300/10 to-orange-300/10 rounded-full"
        style={{
          clipPath: "polygon(25% 0%, 100% 38%, 82% 100%, 3% 85%)",
        }}
        animate={{
          rotate: [0, -360],
          y: [0, -15, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Sparkling particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
