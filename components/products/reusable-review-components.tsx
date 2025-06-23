// components/reviews/ReviewComponents.tsx
// This is your MAIN reusable file - use these components everywhere!

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Star,
  Plus,
  Send,
  Loader2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { createReview } from "@/lib/actions/reviewsServerActions";

// ============================================================================
// 1. RATING STARS COMPONENT (Display only - not interactive)
// ============================================================================
interface RatingDisplayProps {
  rating: number;
  size?: string;
  showNumber?: boolean;
  reviewCount?: number;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  size = "w-4 h-4",
  showNumber = false,
  reviewCount = 0,
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              size,
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            )}
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-sm text-gray-600">
          {rating > 0 ? `${rating.toFixed(1)}` : "0.0"}
          {reviewCount > 0 && ` (${reviewCount})`}
        </span>
      )}
    </div>
  );
};

// ============================================================================
// 2. INTERACTIVE RATING STARS (For forms - with validation)
// ============================================================================
interface InteractiveRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: string;
  showError?: boolean;
  required?: boolean;
}

export const InteractiveRating: React.FC<InteractiveRatingProps> = ({
  rating,
  onRatingChange,
  size = "w-6 h-6",
  showError = false,
  required = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              size,
              "cursor-pointer transition-all duration-200 hover:scale-110",
              star <= (hoverRating || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-200"
            )}
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          />
        ))}
        {rating > 0 && (
          <span className="text-sm text-gray-600 ml-2">
            {rating} star{rating > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {showError && required && rating === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-red-600 text-sm"
        >
          <AlertCircle className="w-4 h-4" />
          <span>Please select a rating</span>
        </motion.div>
      )}
    </div>
  );
};

// ============================================================================
// 3. REVIEW MODAL (The main reusable modal)
// ============================================================================
interface ReviewModalProps {
  productId: string;
  productName: string;
  productImage?: string;
  onReviewSubmitted?: () => void;
  children: React.ReactNode; // This is what triggers the modal
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  productId,
  productName,
  productImage = "/api/placeholder/60/60", // Default placeholder
  onReviewSubmitted,
  children,
}) => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    title: "",
    content: "",
  });

  const resetForm = () => {
    setFormData({ rating: 0, title: "", content: "" });
    setShowValidation(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to leave a review");
      return;
    }

    // Validation
    const errors = [];
    if (formData.rating === 0) errors.push("Please select a rating");
    if (!formData.content.trim()) errors.push("Please write a review");

    if (errors.length > 0) {
      setShowValidation(true);
      errors.forEach((error) => toast.error(error));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createReview({
        product: productId,
        rating: formData.rating,
        title: formData.title.trim() || undefined,
        content: formData.content.trim(),
      });

      if (result.success) {
        toast.success(
          "Thank you! Your review will be visible after admin approval.",
          {
            duration: 5000,
          }
        );
        resetForm();
        setIsOpen(false);
        onReviewSubmitted?.();
      } else {
        toast.error(result.error || "Failed to submit review");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user not signed in
  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
            <DialogDescription>
              Please sign in to leave a review
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-6">
            <MessageSquare className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Sign in to share your experience with {productName}
            </p>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Write Your Review</DialogTitle>
          <DialogDescription>
            Share your experience with {productName}
          </DialogDescription>
        </DialogHeader>

        {/* Product Info with Fixed Image */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <img
            src={productImage}
            alt={productName}
            className="w-12 h-12 rounded object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.src = "/api/placeholder/60/60";
            }}
          />
          <div>
            <h4 className="font-medium text-gray-900 line-clamp-1">
              {productName}
            </h4>
            <p className="text-sm text-gray-600">
              You're reviewing this product
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Rating */}
          <div>
            <Label className="text-base font-medium">
              Rating <span className="text-red-500">*</span>
            </Label>
            <div className="mt-2">
              <InteractiveRating
                rating={formData.rating}
                onRatingChange={(rating) => {
                  setFormData((prev) => ({ ...prev, rating }));
                  if (showValidation && rating > 0) setShowValidation(false);
                }}
                showError={showValidation}
                required={true}
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Review Title (Optional)</Label>
            <Input
              id="title"
              placeholder="Summarize your experience..."
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              maxLength={100}
              className="mt-1"
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.title.length}/100 characters
            </div>
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content" className="text-base font-medium">
              Your Review <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="Tell others about your experience with this product..."
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              rows={4}
              maxLength={1000}
              className={cn(
                "mt-1",
                showValidation &&
                  !formData.content.trim() &&
                  "border-red-500 focus:border-red-500"
              )}
            />
            <div className="flex items-center justify-between mt-1">
              <div className="text-xs text-gray-500">
                {formData.content.length}/1000 characters
              </div>
              {showValidation && !formData.content.trim() && (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>Review text is required</span>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// 4. PRE-BUILT REVIEW BUTTONS (Ready to use anywhere)
// ============================================================================

// Standard Review Button
export const ReviewButton: React.FC<{
  productId: string;
  productName: string;
  productImage?: string;
  onReviewSubmitted?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}> = ({
  productId,
  productName,
  productImage,
  onReviewSubmitted,
  variant = "default",
  size = "default",
  className = "",
}) => {
  const buttonClasses = {
    default: "h-10 px-4 text-sm",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-6 text-base",
  };

  const button =
    variant === "default" ? (
      <Button
        className={cn(
          buttonClasses[size],
          "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800",
          className
        )}
      >
        <Plus className="w-4 h-4 mr-2" />
        Write Review
      </Button>
    ) : (
      <Button
        variant={variant}
        size={size}
        className={cn(buttonClasses[size], className)}
      >
        <Star className="w-4 h-4 mr-2" />
        Review
      </Button>
    );

  return (
    <ReviewModal
      productId={productId}
      productName={productName}
      productImage={productImage}
      onReviewSubmitted={onReviewSubmitted}
    >
      {button}
    </ReviewModal>
  );
};

// Clickable Star Rating (click stars to open review modal)
export const ClickableStarRating: React.FC<{
  productId: string;
  productName: string;
  productImage?: string;
  currentRating: number;
  reviewCount: number;
  onReviewSubmitted?: () => void;
  size?: string;
}> = ({
  productId,
  productName,
  productImage,
  currentRating,
  reviewCount,
  onReviewSubmitted,
  size = "w-4 h-4",
}) => {
  return (
    <ReviewModal
      productId={productId}
      productName={productName}
      productImage={productImage}
      onReviewSubmitted={onReviewSubmitted}
    >
      <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
        <RatingDisplay rating={Math.round(currentRating)} size={size} />
        <span className="text-sm text-gray-600">
          {reviewCount > 0
            ? `${currentRating.toFixed(1)} (${reviewCount})`
            : "Be first to review"}
        </span>
      </div>
    </ReviewModal>
  );
};

// ============================================================================
// 5. USAGE EXAMPLES
// ============================================================================

export const ReviewComponentExamples = () => {
  const exampleProduct = {
    id: "123",
    name: "Green Detox Juice - Organic Blend",
    image: "/api/placeholder/300/300",
    rating: 4.5,
    reviewCount: 23,
  };

  const handleReviewSubmitted = () => {
    toast.success("Review submitted successfully!");
    // Refresh your data here
  };

  return (
    <div className="space-y-8 p-6 max-w-4xl">
      <h2 className="text-2xl font-bold">Review Components Usage Examples</h2>

      {/* 1. Display Stars (Non-interactive) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          1. Display Rating (Non-interactive)
        </h3>
        <div className="flex flex-wrap gap-4 items-center">
          <RatingDisplay rating={4} />
          <RatingDisplay rating={4.5} showNumber />
          <RatingDisplay rating={4.8} reviewCount={23} showNumber />
          <RatingDisplay rating={0} reviewCount={0} showNumber />
        </div>
      </div>

      {/* 2. Review Buttons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          2. Review Buttons (Different Styles)
        </h3>
        <div className="flex flex-wrap gap-4">
          <ReviewButton
            productId={exampleProduct.id}
            productName={exampleProduct.name}
            productImage={exampleProduct.image}
            onReviewSubmitted={handleReviewSubmitted}
          />
          <ReviewButton
            productId={exampleProduct.id}
            productName={exampleProduct.name}
            productImage={exampleProduct.image}
            variant="outline"
            onReviewSubmitted={handleReviewSubmitted}
          />
          <ReviewButton
            productId={exampleProduct.id}
            productName={exampleProduct.name}
            productImage={exampleProduct.image}
            variant="ghost"
            size="sm"
            onReviewSubmitted={handleReviewSubmitted}
          />
        </div>
      </div>

      {/* 3. Clickable Star Rating */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          3. Clickable Star Rating (Click to Review)
        </h3>
        <div className="space-y-2">
          <ClickableStarRating
            productId={exampleProduct.id}
            productName={exampleProduct.name}
            productImage={exampleProduct.image}
            currentRating={exampleProduct.rating}
            reviewCount={exampleProduct.reviewCount}
            onReviewSubmitted={handleReviewSubmitted}
          />
          <ClickableStarRating
            productId={exampleProduct.id}
            productName="New Product"
            currentRating={0}
            reviewCount={0}
            onReviewSubmitted={handleReviewSubmitted}
          />
        </div>
      </div>

      {/* 4. Custom Trigger */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          4. Custom Trigger (Any element can trigger review)
        </h3>
        <ReviewModal
          productId={exampleProduct.id}
          productName={exampleProduct.name}
          productImage={exampleProduct.image}
          onReviewSubmitted={handleReviewSubmitted}
        >
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm font-medium">Click anywhere here to review</p>
            <p className="text-xs text-gray-600">Custom trigger example</p>
          </div>
        </ReviewModal>
      </div>

      {/* Usage Guide */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          Quick Usage Guide:
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>RatingDisplay:</strong> Show ratings anywhere (product
            cards, lists)
          </p>
          <p>
            <strong>ReviewButton:</strong> Standard review button for any page
          </p>
          <p>
            <strong>ClickableStarRating:</strong> Click stars to review (product
            cards)
          </p>
          <p>
            <strong>ReviewModal:</strong> Wrap any element to make it open
            review modal
          </p>
          <p>
            <strong>InteractiveRating:</strong> For custom forms only
          </p>
        </div>
      </div>
    </div>
  );
};
