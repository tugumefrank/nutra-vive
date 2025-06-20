// components/products/product-reviews.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Filter,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  user: {
    name: string;
    avatar?: string;
    verified: boolean;
  };
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
  images?: string[];
}

interface ProductReviewsProps {
  productId: string;
}

// Mock reviews data (in real app, this would come from API)
const mockReviews: Review[] = [
  {
    id: "1",
    user: {
      name: "Sarah Johnson",
      avatar: "/avatars/sarah.jpg",
      verified: true,
    },
    rating: 5,
    title: "Amazing taste and quality!",
    content:
      "This juice has completely transformed my morning routine. The taste is incredible and I can feel the natural energy boost. Highly recommend to anyone looking for a healthy start to their day.",
    date: "2024-06-15",
    helpful: 12,
    images: ["/reviews/review1.jpg", "/reviews/review2.jpg"],
  },
  {
    id: "2",
    user: {
      name: "Mike Chen",
      verified: true,
    },
    rating: 4,
    title: "Great product, fast shipping",
    content:
      "Really impressed with the quality. The packaging was excellent and it arrived quickly. The only reason I'm not giving 5 stars is the price point, but the quality justifies it.",
    date: "2024-06-10",
    helpful: 8,
  },
  {
    id: "3",
    user: {
      name: "Emily Rodriguez",
      verified: false,
    },
    rating: 5,
    title: "Perfect for my wellness journey",
    content:
      "I've been drinking this for 3 weeks now and I can definitely notice improvements in my energy levels and digestion. Will definitely be ordering more!",
    date: "2024-06-08",
    helpful: 15,
  },
  {
    id: "4",
    user: {
      name: "David Park",
      verified: true,
    },
    rating: 3,
    title: "Good but could be better",
    content:
      "The taste is good and I like the natural ingredients, but I was expecting a stronger flavor based on the description. Still a decent product overall.",
    date: "2024-06-05",
    helpful: 3,
  },
];

const filterOptions = [
  { label: "All Reviews", value: "all" },
  { label: "5 Stars", value: "5" },
  { label: "4 Stars", value: "4" },
  { label: "3 Stars", value: "3" },
  { label: "2 Stars", value: "2" },
  { label: "1 Star", value: "1" },
  { label: "Verified Only", value: "verified" },
];

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Filter reviews based on selected filter
  const filteredReviews = mockReviews.filter((review) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "verified") return review.user.verified;
    return review.rating.toString() === selectedFilter;
  });

  // Show only first 3 reviews initially
  const displayedReviews = showAllReviews
    ? filteredReviews
    : filteredReviews.slice(0, 3);

  // Calculate review statistics
  const totalReviews = mockReviews.length;
  const averageRating =
    mockReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: mockReviews.filter((review) => review.rating === rating).length,
    percentage:
      (mockReviews.filter((review) => review.rating === rating).length /
        totalReviews) *
      100,
  }));

  return (
    <div className="space-y-8">
      {/* Review Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Average Rating */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-800 dark:text-green-200 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-6 w-6",
                    i < Math.floor(averageRating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              Based on {totalReviews} reviews
            </p>
          </div>
        </Card>

        {/* Rating Distribution */}
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Rating Distribution</h4>
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-3">
                <span className="text-sm font-medium w-8">{rating}★</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: rating * 0.1, duration: 0.5 }}
                    className="bg-green-500 h-2 rounded-full"
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Filter and Sort */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap items-center gap-2"
      >
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={selectedFilter === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter(option.value)}
            className={cn(
              "text-xs",
              selectedFilter === option.value
                ? "bg-green-600 hover:bg-green-700"
                : "hover:bg-green-50 dark:hover:bg-green-900/20"
            )}
          >
            {option.label}
          </Button>
        ))}
      </motion.div>

      {/* Reviews List */}
      <div className="space-y-6">
        <AnimatePresence>
          {displayedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="space-y-4">
                  {/* Review Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={review.user.avatar} />
                        <AvatarFallback>
                          {review.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {review.user.name}
                          </span>
                          {review.user.verified && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            >
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i < review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                          <span className="text-sm text-gray-500 ml-2">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div>
                    <h5 className="font-semibold mb-2">{review.title}</h5>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {review.content}
                    </p>
                  </div>

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex space-x-2">
                      {review.images.map((image, i) => (
                        <div
                          key={i}
                          className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
                        >
                          <img
                            src={image}
                            alt={`Review image ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Review Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                        <ThumbsUp className="h-4 w-4" />
                        <span>Helpful ({review.helpful})</span>
                      </button>
                      <button className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load More Button */}
      {filteredReviews.length > 3 && !showAllReviews && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Button
            variant="outline"
            onClick={() => setShowAllReviews(true)}
            className="hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            Load More Reviews ({filteredReviews.length - 3} remaining)
          </Button>
        </motion.div>
      )}

      {/* Write Review Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center pt-8 border-t border-gray-200 dark:border-gray-700"
      >
        <Button
          size="lg"
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
        >
          Write a Review
        </Button>
      </motion.div>
    </div>
  );
}
