// components/products/product-gallery.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

export default function ProductGallery({
  images,
  productName,
  className,
}: ProductGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [rotation, setRotation] = useState(0);
  const imageRef = useRef<HTMLDivElement>(null);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
    setRotation(0);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setRotation(0);
  };

  const rotateImage = () => {
    setRotation((prev) => prev + 90);
  };

  // Fallback image if no images provided
  const displayImages =
    images.length > 0 ? images : ["/placeholder-product.jpg"];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Image */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-green-100 dark:border-green-800">
        <div
          ref={imageRef}
          className="relative aspect-square group cursor-pointer"
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
              animate={{
                opacity: 1,
                scale: isZoomed ? 1.5 : 1,
                rotateY: 0,
                rotate: rotation,
              }}
              exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.6,
              }}
              className="absolute inset-0"
            >
              <Image
                src={displayImages[currentImageIndex]}
                alt={`${productName} - Image ${currentImageIndex + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={currentImageIndex === 0}
              />
            </motion.div>
          </AnimatePresence>

          {/* Image Controls */}
          <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="secondary"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                rotateImage();
              }}
              className="bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(!isZoomed);
              }}
              className="bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation Arrows */}
          {displayImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {currentImageIndex + 1} / {displayImages.length}
            </div>
          )}
        </div>
      </Card>

      {/* Thumbnail Strip */}
      {displayImages.length > 1 && (
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-300",
                index === currentImageIndex
                  ? "border-green-500 shadow-lg shadow-green-500/25"
                  : "border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-400"
              )}
              onClick={() => setCurrentImageIndex(index)}
            >
              <Image
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
              {index === currentImageIndex && (
                <motion.div
                  layoutId="activeThumb"
                  className="absolute inset-0 bg-green-500/20 border-2 border-green-500 rounded-lg"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* 3D Floating Effect */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotateX: [0, 5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-20 pointer-events-none"
      />
      <motion.div
        animate={{
          y: [0, 15, 0],
          rotateY: [0, 180, 360],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-15 pointer-events-none"
      />
    </div>
  );
}
