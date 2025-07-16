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
  const [isHovered, setIsHovered] = useState(false);
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
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
              animate={{
                opacity: 1,
                scale: isZoomed ? 1.5 : isHovered ? 1.08 : 1,
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
                className="object-contain transition-all duration-700 p-4"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={currentImageIndex === 0}
              />
            </motion.div>
          </AnimatePresence>

          {/* Hover Overlay for Better UX */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 pointer-events-none"
          />

          {/* Image Controls */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : -10,
            }}
            transition={{ duration: 0.3 }}
            className="absolute top-4 right-4 flex space-x-2"
          >
            <Button
              variant="secondary"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                rotateImage();
              }}
              className="bg-white/90 backdrop-blur-md border-white/30 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300"
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
              className="bg-white/90 backdrop-blur-md border-white/30 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Enhanced Navigation Arrows with Slide Preview */}
          {displayImages.length > 1 && (
            <>
              {/* Left Arrow with Slide Preview */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  x: isHovered ? 0 : -20,
                }}
                transition={{ duration: 0.3 }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center space-x-2"
                onMouseEnter={() => {
                  // Show preview of previous image
                }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevImage}
                  className="bg-white/90 backdrop-blur-md border-white/30 hover:bg-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                {/* Previous Image Preview */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: -10 }}
                  whileHover={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="hidden md:block w-16 h-16 rounded-lg overflow-hidden border-2 border-white shadow-lg"
                >
                  <Image
                    src={
                      displayImages[
                        (currentImageIndex - 1 + displayImages.length) %
                          displayImages.length
                      ]
                    }
                    alt="Previous image preview"
                    width={64}
                    height={64}
                    className="object-contain w-full h-full p-1"
                  />
                </motion.div>
              </motion.div>

              {/* Right Arrow with Slide Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  x: isHovered ? 0 : 20,
                }}
                transition={{ duration: 0.3 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2"
              >
                {/* Next Image Preview */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 10 }}
                  whileHover={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="hidden md:block w-16 h-16 rounded-lg overflow-hidden border-2 border-white shadow-lg"
                >
                  <Image
                    src={
                      displayImages[
                        (currentImageIndex + 1) % displayImages.length
                      ]
                    }
                    alt="Next image preview"
                    width={64}
                    height={64}
                    className="object-contain w-full h-full p-1"
                  />
                </motion.div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextImage}
                  className="bg-white/90 backdrop-blur-md border-white/30 hover:bg-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </motion.div>
            </>
          )}

          {/* Image Counter */}
          {displayImages.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: isHovered ? 1 : 0.7,
                y: 0,
              }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm border border-white/20"
            >
              {currentImageIndex + 1} / {displayImages.length}
            </motion.div>
          )}

          {/* Zoom Indicator */}
          {isZoomed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm"
            >
              Zoomed
            </motion.div>
          )}
        </div>
      </Card>

      {/* Enhanced Thumbnail Strip */}
      {displayImages.length > 1 && (
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
          {displayImages.map((image, index) => (
            <motion.div
              key={index}
              whileHover={{
                scale: 1.15,
                y: -5,
                rotateY: 10,
              }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              className={cn(
                "relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-300 shadow-md hover:shadow-xl",
                index === currentImageIndex
                  ? "border-green-500 shadow-lg shadow-green-500/25 ring-2 ring-green-200 dark:ring-green-800"
                  : "border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-400"
              )}
              onClick={() => setCurrentImageIndex(index)}
            >
              <Image
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                className="object-contain transition-transform duration-300 hover:scale-110 p-1"
                sizes="80px"
              />
              {index === currentImageIndex && (
                <motion.div
                  layoutId="activeThumb"
                  className="absolute inset-0 bg-green-500/20 border-2 border-green-500 rounded-xl"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              {/* Thumbnail Hover Effect */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
              />
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
