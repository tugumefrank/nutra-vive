"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Yoga Instructor",
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b5e5?w=80&h=80&fit=crop&crop=face",
    rating: 5,
    content:
      "Nutra-Vive has completely transformed my morning routine. The Green Detox Elixir gives me sustained energy for my classes without any jitters. My students always comment on how radiant I look!",
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
      "As someone who sits at a desk all day, I needed something to boost my energy naturally. The Matcha Zen Latte is perfect - helps me focus during long coding sessions and I love the taste.",
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
      "I recommend Nutra-Vive to all my clients. The quality is exceptional, ingredients are truly organic, and the health benefits are real. The Strawberry Hibiscus Tea is my personal favorite!",
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
      "Recovery is crucial for my training, and the Berry Antioxidant Blend has become my go-to post-run drink. It tastes amazing and I can feel the difference in my recovery time.",
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
      "Between work and kids, I barely have time to eat healthy. Nutra-Vive makes it easy to get my nutrients on the go. My whole family loves them, even my picky 8-year-old!",
    product: "Watermelon Lemonade",
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full glass border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-glow">
        <CardContent className="p-8 h-full flex flex-col">
          {/* Quote Icon */}
          <Quote className="w-8 h-8 text-brand-500 mb-4 opacity-60" />

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-4">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>

          {/* Content */}
          <blockquote className="text-muted-foreground mb-6 flex-grow italic">
            "{testimonial.content}"
          </blockquote>

          {/* Product */}
          <div className="mb-4">
            <span className="text-xs font-medium text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
              {testimonial.product}
            </span>
          </div>

          {/* Author */}
          <div className="flex items-center space-x-4">
            <motion.div whileHover={{ scale: 1.1 }} className="relative">
              <Image
                src={testimonial.image}
                alt={testimonial.name}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
              {testimonial.verified && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-2 h-2 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </motion.div>
            <div>
              <h4 className="font-semibold">{testimonial.name}</h4>
              <p className="text-sm text-muted-foreground">
                {testimonial.role}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <section
      ref={ref}
      className="py-24 bg-gradient-to-b from-muted/30 to-background"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-6xl font-heading font-bold mb-6">
            What Our{" "}
            <span className="bg-gradient-to-r from-brand-500 to-wellness-500 bg-clip-text text-transparent">
              Community
            </span>{" "}
            Says
          </h2>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real stories from real people who've transformed their wellness
            journey with our premium organic beverages.
          </p>
        </motion.div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8 mb-12">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="lg:hidden mb-8">
          <div className="relative">
            <TestimonialCard
              testimonial={testimonials[currentIndex]}
              index={0}
            />

            {/* Navigation */}
            <div className="flex items-center justify-center space-x-4 mt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? "bg-brand-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Additional testimonials for desktop */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.slice(3, 5).map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index + 3}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
