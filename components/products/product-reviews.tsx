// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useUser } from "@clerk/nextjs";
// import { toast } from "sonner";
// import {
//   Star,
//   ThumbsUp,
//   MessageCircle,
//   Filter,
//   Plus,
//   X,
//   Send,
//   Loader2,
//   Shield,
//   Calendar,
// } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Separator } from "@/components/ui/separator";
// import { Textarea } from "@/components/ui/textarea";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { cn } from "@/lib/utils";
// import {
//   createReview,
//   getProductReviews,
// } from "@/lib/actions/reviewsServerActions";

// interface Review {
//   _id: string;
//   title?: string;
//   content?: string;
//   rating: number;
//   isVisible: boolean;
//   isVerified: boolean;
//   createdAt: string;
//   user: {
//     firstName: string;
//     lastName: string;
//     imageUrl?: string;
//   };
// }

// interface ProductReviewsProps {
//   productId: string;
// }

// interface ReviewStats {
//   averageRating: number;
//   total: number;
//   ratingDistribution: { [key: number]: number };
// }

// const RatingStars = ({
//   rating,
//   onRatingChange,
//   interactive = false,
//   size = "w-5 h-5",
// }: {
//   rating: number;
//   onRatingChange?: (rating: number) => void;
//   interactive?: boolean;
//   size?: string;
// }) => {
//   const [hoverRating, setHoverRating] = useState(0);

//   return (
//     <div className="flex items-center gap-1">
//       {[1, 2, 3, 4, 5].map((star) => (
//         <Star
//           key={star}
//           className={cn(
//             size,
//             "transition-colors cursor-pointer",
//             interactive && "hover:scale-110 transition-transform",
//             star <= (interactive ? hoverRating || rating : rating)
//               ? "fill-yellow-400 text-yellow-400"
//               : "text-gray-300 hover:text-yellow-200"
//           )}
//           onClick={() => interactive && onRatingChange?.(star)}
//           onMouseEnter={() => interactive && setHoverRating(star)}
//           onMouseLeave={() => interactive && setHoverRating(0)}
//         />
//       ))}
//     </div>
//   );
// };

// const ReviewForm = ({
//   productId,
//   onReviewSubmitted,
// }: {
//   productId: string;
//   onReviewSubmitted: () => void;
// }) => {
//   const { user } = useUser();
//   const [isOpen, setIsOpen] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [formData, setFormData] = useState({
//     rating: 0,
//     title: "",
//     content: "",
//   });

//   const handleSubmit = async () => {
//     if (!user) {
//       toast.error("Please sign in to leave a review");
//       return;
//     }

//     if (formData.rating === 0) {
//       toast.error("Please select a rating");
//       return;
//     }

//     if (!formData.content.trim()) {
//       toast.error("Please write a review");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const result = await createReview({
//         product: productId,
//         rating: formData.rating,
//         title: formData.title.trim() || undefined,
//         content: formData.content.trim(),
//       });

//       if (result.success) {
//         toast.success(
//           "Thank you for your review! It will be visible after admin approval.",
//           {
//             duration: 5000,
//           }
//         );
//         setFormData({ rating: 0, title: "", content: "" });
//         setIsOpen(false);
//         onReviewSubmitted();
//       } else {
//         toast.error(result.error || "Failed to submit review");
//       }
//     } catch (error) {
//       toast.error("An error occurred. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!user) {
//     return (
//       <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
//         <h3 className="text-lg font-semibold mb-2">Want to leave a review?</h3>
//         <p className="text-gray-600 dark:text-gray-400 mb-4">
//           Sign in to share your experience with this product
//         </p>
//         <Button variant="outline">Sign In to Review</Button>
//       </Card>
//     );
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       <DialogTrigger asChild>
//         <Button
//           size="lg"
//           className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
//         >
//           <Plus className="w-4 h-4 mr-2" />
//           Write a Review
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>Write Your Review</DialogTitle>
//           <DialogDescription>
//             Share your experience with other customers
//           </DialogDescription>
//         </DialogHeader>
//         <div className="space-y-4">
//           <div>
//             <Label htmlFor="rating">Rating *</Label>
//             <div className="flex items-center gap-2 mt-1">
//               <RatingStars
//                 rating={formData.rating}
//                 onRatingChange={(rating) =>
//                   setFormData((prev) => ({ ...prev, rating }))
//                 }
//                 interactive={true}
//                 size="w-6 h-6"
//               />
//               <span className="text-sm text-gray-600">
//                 {formData.rating > 0 &&
//                   `${formData.rating} star${formData.rating > 1 ? "s" : ""}`}
//               </span>
//             </div>
//           </div>

//           <div>
//             <Label htmlFor="title">Review Title (Optional)</Label>
//             <Input
//               id="title"
//               placeholder="Summarize your experience..."
//               value={formData.title}
//               onChange={(e) =>
//                 setFormData((prev) => ({ ...prev, title: e.target.value }))
//               }
//               maxLength={100}
//             />
//           </div>

//           <div>
//             <Label htmlFor="content">Your Review *</Label>
//             <Textarea
//               id="content"
//               placeholder="Tell others about your experience with this product..."
//               value={formData.content}
//               onChange={(e) =>
//                 setFormData((prev) => ({ ...prev, content: e.target.value }))
//               }
//               rows={4}
//               maxLength={1000}
//               required
//             />
//             <div className="text-xs text-gray-500 mt-1">
//               {formData.content.length}/1000 characters
//             </div>
//           </div>

//           <div className="flex gap-3 pt-4">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => setIsOpen(false)}
//               className="flex-1"
//             >
//               Cancel
//             </Button>
//             <Button
//               type="button"
//               onClick={handleSubmit}
//               disabled={isSubmitting || formData.rating === 0}
//               className="flex-1"
//             >
//               {isSubmitting ? (
//                 <>
//                   <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                   Submitting...
//                 </>
//               ) : (
//                 <>
//                   <Send className="w-4 h-4 mr-2" />
//                   Submit Review
//                 </>
//               )}
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// const filterOptions = [
//   { label: "All Reviews", value: "all" },
//   { label: "5 Stars", value: "5" },
//   { label: "4 Stars", value: "4" },
//   { label: "3 Stars", value: "3" },
//   { label: "2 Stars", value: "2" },
//   { label: "1 Star", value: "1" },
// ];

// export default function ProductReviews({ productId }: ProductReviewsProps) {
//   const [reviews, setReviews] = useState<Review[]>([]);
//   const [stats, setStats] = useState<ReviewStats>({
//     averageRating: 0,
//     total: 0,
//     ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
//   });
//   const [selectedFilter, setSelectedFilter] = useState("all");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [hasMore, setHasMore] = useState(true);

//   const REVIEWS_PER_PAGE = 5;

//   const fetchReviews = async (page = 1, reset = false) => {
//     try {
//       if (page === 1) setLoading(true);
//       else setLoadingMore(true);

//       const data = await getProductReviews(productId, page, REVIEWS_PER_PAGE);

//       if (data) {
//         setStats({
//           averageRating: data.averageRating,
//           total: data.total,
//           ratingDistribution: data.ratingDistribution,
//         });

//         if (reset || page === 1) {
//           setReviews(data.reviews);
//         } else {
//           setReviews((prev) => [...prev, ...data.reviews]);
//         }

//         setHasMore(data.reviews.length === REVIEWS_PER_PAGE);
//         setCurrentPage(page);
//       }
//     } catch (error) {
//       toast.error("Failed to load reviews");
//     } finally {
//       setLoading(false);
//       setLoadingMore(false);
//     }
//   };

//   useEffect(() => {
//     fetchReviews(1, true);
//   }, [productId]);

//   const handleLoadMore = () => {
//     if (!loadingMore && hasMore) {
//       fetchReviews(currentPage + 1);
//     }
//   };

//   const handleReviewSubmitted = () => {
//     // Refresh reviews after new submission
//     fetchReviews(1, true);
//   };

//   // Filter reviews based on selected filter
//   const filteredReviews = reviews.filter((review) => {
//     if (selectedFilter === "all") return true;
//     return review.rating.toString() === selectedFilter;
//   });

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <Loader2 className="w-8 h-8 animate-spin text-green-600" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8">
//       {/* Review Overview */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="grid grid-cols-1 lg:grid-cols-2 gap-8"
//       >
//         {/* Average Rating */}
//         <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
//           <div className="text-center">
//             <div className="text-4xl font-bold text-green-800 dark:text-green-200 mb-2">
//               {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "0.0"}
//             </div>
//             <div className="flex justify-center mb-2">
//               <RatingStars
//                 rating={Math.round(stats.averageRating)}
//                 size="w-6 h-6"
//               />
//             </div>
//             <p className="text-sm text-green-700 dark:text-green-300">
//               Based on {stats.total} review{stats.total !== 1 ? "s" : ""}
//             </p>
//           </div>
//         </Card>

//         {/* Rating Distribution */}
//         <Card className="p-6">
//           <h4 className="font-semibold mb-4">Rating Distribution</h4>
//           <div className="space-y-2">
//             {[5, 4, 3, 2, 1].map((rating) => {
//               const count = stats.ratingDistribution[rating] || 0;
//               const percentage =
//                 stats.total > 0 ? (count / stats.total) * 100 : 0;

//               return (
//                 <div key={rating} className="flex items-center space-x-3">
//                   <span className="text-sm font-medium w-8">{rating}★</span>
//                   <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                     <motion.div
//                       initial={{ width: 0 }}
//                       animate={{ width: `${percentage}%` }}
//                       transition={{ delay: (6 - rating) * 0.1, duration: 0.5 }}
//                       className="bg-green-500 h-2 rounded-full"
//                     />
//                   </div>
//                   <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
//                     {count}
//                   </span>
//                 </div>
//               );
//             })}
//           </div>
//         </Card>
//       </motion.div>

//       {/* Filter Options */}
//       {stats.total > 0 && (
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="flex flex-wrap items-center gap-2"
//         >
//           <div className="flex items-center space-x-2">
//             <Filter className="h-4 w-4 text-gray-500" />
//             <span className="text-sm font-medium">Filter:</span>
//           </div>
//           {filterOptions.map((option) => (
//             <Button
//               key={option.value}
//               variant={selectedFilter === option.value ? "default" : "outline"}
//               size="sm"
//               onClick={() => setSelectedFilter(option.value)}
//               className={cn(
//                 "text-xs",
//                 selectedFilter === option.value
//                   ? "bg-green-600 hover:bg-green-700"
//                   : "hover:bg-green-50 dark:hover:bg-green-900/20"
//               )}
//             >
//               {option.label}
//             </Button>
//           ))}
//         </motion.div>
//       )}

//       {/* Reviews List */}
//       {filteredReviews.length > 0 ? (
//         <div className="space-y-6">
//           <AnimatePresence>
//             {filteredReviews.map((review, index) => (
//               <motion.div
//                 key={review._id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -20 }}
//                 transition={{ delay: index * 0.1 }}
//               >
//                 <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
//                   <div className="space-y-4">
//                     {/* Review Header */}
//                     <div className="flex items-start justify-between">
//                       <div className="flex items-center space-x-3">
//                         <Avatar>
//                           <AvatarImage src={review.user.imageUrl} />
//                           <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
//                             {review.user.firstName[0]}
//                             {review.user.lastName[0]}
//                           </AvatarFallback>
//                         </Avatar>
//                         <div>
//                           <div className="flex items-center space-x-2">
//                             <span className="font-medium">
//                               {review.user.firstName} {review.user.lastName}
//                             </span>
//                             {review.isVerified && (
//                               <Badge
//                                 variant="secondary"
//                                 className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
//                               >
//                                 <Shield className="w-3 h-3 mr-1" />
//                                 Verified
//                               </Badge>
//                             )}
//                           </div>
//                           <div className="flex items-center space-x-2 mt-1">
//                             <RatingStars
//                               rating={review.rating}
//                               size="w-4 h-4"
//                             />
//                             <span className="text-sm text-gray-500 flex items-center gap-1">
//                               <Calendar className="w-3 h-3" />
//                               {new Date(review.createdAt).toLocaleDateString()}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Review Content */}
//                     <div>
//                       {review.title && (
//                         <h5 className="font-semibold mb-2">{review.title}</h5>
//                       )}
//                       {review.content && (
//                         <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
//                           {review.content}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </Card>
//               </motion.div>
//             ))}
//           </AnimatePresence>
//         </div>
//       ) : (
//         <div className="text-center py-12">
//           <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//           <h3 className="text-lg font-semibold text-gray-600 mb-2">
//             {stats.total === 0
//               ? "No reviews yet"
//               : "No reviews match your filter"}
//           </h3>
//           <p className="text-gray-500">
//             {stats.total === 0
//               ? "Be the first to share your experience!"
//               : "Try adjusting your filter to see more reviews"}
//           </p>
//         </div>
//       )}

//       {/* Load More Button */}
//       {hasMore && filteredReviews.length > 0 && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.5 }}
//           className="text-center"
//         >
//           <Button
//             variant="outline"
//             onClick={handleLoadMore}
//             disabled={loadingMore}
//             className="hover:bg-green-50 dark:hover:bg-green-900/20"
//           >
//             {loadingMore ? (
//               <>
//                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                 Loading...
//               </>
//             ) : (
//               "Load More Reviews"
//             )}
//           </Button>
//         </motion.div>
//       )}

//       {/* Write Review Section */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.6 }}
//         className="text-center pt-8 border-t border-gray-200 dark:border-gray-700"
//       >
//         <ReviewForm
//           productId={productId}
//           onReviewSubmitted={handleReviewSubmitted}
//         />
//       </motion.div>
//     </div>
//   );
// }
// components/reviews/ProductReviews.tsx
// This is your MAIN component for product detail pages

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { MessageCircle, Filter, Calendar, Shield, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getProductReviews } from "@/lib/actions/reviewsServerActions";
import { RatingDisplay, ReviewButton } from "./reusable-review-components";

interface Review {
  _id: string;
  title?: string;
  content?: string;
  rating: number;
  isVisible: boolean;
  isVerified: boolean;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    imageUrl?: string;
  };
}

interface ProductReviewsProps {
  productId: string;
  productName?: string;
  productImages?: string[];
}

interface ReviewStats {
  averageRating: number;
  total: number;
  ratingDistribution: { [key: number]: number };
}

const filterOptions = [
  { label: "All Reviews", value: "all" },
  { label: "5 Stars", value: "5" },
  { label: "4 Stars", value: "4" },
  { label: "3 Stars", value: "3" },
  { label: "2 Stars", value: "2" },
  { label: "1 Star", value: "1" },
];

export default function ProductReviews({
  productId,
  productName = "this product",
  productImages = ["/api/placeholder/60/60"],
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    total: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const REVIEWS_PER_PAGE = 5;

  const fetchReviews = async (page = 1, reset = false) => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      const data = await getProductReviews(productId, page, REVIEWS_PER_PAGE);

      if (data) {
        setStats({
          averageRating: data.averageRating,
          total: data.total,
          ratingDistribution: data.ratingDistribution,
        });

        if (reset || page === 1) {
          setReviews(data.reviews);
        } else {
          setReviews((prev) => [...prev, ...data.reviews]);
        }

        setHasMore(data.reviews.length === REVIEWS_PER_PAGE);
        setCurrentPage(page);
      }
    } catch (error) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchReviews(1, true);
  }, [productId]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchReviews(currentPage + 1);
    }
  };

  const handleReviewSubmitted = () => {
    // Refresh reviews after new submission
    fetchReviews(1, true);
    toast.success("Review submitted! Check back soon to see it published.", {
      duration: 4000,
    });
  };

  // Filter reviews based on selected filter
  const filteredReviews = reviews.filter((review) => {
    if (selectedFilter === "all") return true;
    return review.rating.toString() === selectedFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

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
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "0.0"}
            </div>
            <div className="flex justify-center mb-2">
              <RatingDisplay
                rating={Math.round(stats.averageRating)}
                size="w-6 h-6"
              />
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              Based on {stats.total} review{stats.total !== 1 ? "s" : ""}
            </p>
          </div>
        </Card>

        {/* Rating Distribution */}
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Rating Distribution</h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating] || 0;
              const percentage =
                stats.total > 0 ? (count / stats.total) * 100 : 0;

              return (
                <div key={rating} className="flex items-center space-x-3">
                  <span className="text-sm font-medium w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: (6 - rating) * 0.1, duration: 0.5 }}
                      className="bg-green-500 h-2 rounded-full"
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Write Review Button - Prominent */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <ReviewButton
          productId={productId}
          productName={productName}
          productImage={productImages[0]}
          size="lg"
          onReviewSubmitted={handleReviewSubmitted}
          className="px-8 py-4"
        />
        <p className="text-sm text-gray-600 mt-2">
          Share your experience with {productName}
        </p>
      </motion.div>

      {/* Filter Options */}
      {stats.total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
      )}

      {/* Reviews List */}
      {filteredReviews.length > 0 ? (
        <div className="space-y-6">
          <AnimatePresence>
            {filteredReviews.map((review, index) => (
              <motion.div
                key={review._id}
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
                          <AvatarImage src={review.user.imageUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {review.user.firstName[0]}
                            {review.user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {review.user.firstName} {review.user.lastName}
                            </span>
                            {review.isVerified && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              >
                                <Shield className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <RatingDisplay
                              rating={review.rating}
                              size="w-4 h-4"
                            />
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div>
                      {review.title && (
                        <h5 className="font-semibold mb-2">{review.title}</h5>
                      )}
                      {review.content && (
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {review.content}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {stats.total === 0
              ? "No reviews yet"
              : "No reviews match your filter"}
          </h3>
          <p className="text-gray-500 mb-6">
            {stats.total === 0
              ? "Be the first to share your experience!"
              : "Try adjusting your filter to see more reviews"}
          </p>
          {stats.total === 0 && (
            <ReviewButton
              productId={productId}
              productName={productName}
              productImage={productImages[0]}
              variant="outline"
              onReviewSubmitted={handleReviewSubmitted}
            />
          )}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && filteredReviews.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Reviews"
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
