"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Star,
  MoreHorizontal,
  Eye,
  EyeOff,
  ShieldCheck,
  Shield,
  Trash2,
  Filter,
  Search,
  TrendingUp,
  MessageSquare,
  Users,
  Award,
  Calendar,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Import server actions
import {
  getReviews,
  getReviewStats,
  approveReview,
  rejectReview,
  toggleReviewVisibility,
  toggleReviewVerification,
  bulkApproveReviews,
  bulkUpdateReviews,
  bulkDeleteReviews,
  deleteReview,
} from "@/lib/actions/reviewsServerActions";

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
  product: {
    name: string;
    slug: string;
    images: string[];
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  visibleReviews: number;
  hiddenReviews: number;
  pendingReviews: number;
  verifiedReviews: number;
  unverifiedReviews: number;
  recentReviews: number;
  topRatedProducts: Array<{
    productName: string;
    averageRating: number;
    reviewCount: number;
  }>;
  recentReviewsList: Review[];
}

const ReviewsAdminDashboard = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    visibleReviews: 0,
    hiddenReviews: 0,
    pendingReviews: 0,
    verifiedReviews: 0,
    unverifiedReviews: 0,
    recentReviews: 0,
    topRatedProducts: [],
    recentReviewsList: [],
  });
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    rating: "all",
    visibility: "all",
    verification: "all",
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    total: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Animated counter hook
  const useAnimatedCounter = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let startTime: number;
      let animationId: number;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);

        setCount(Math.floor(progress * end));

        if (progress < 1) {
          animationId = requestAnimationFrame(animate);
        }
      };

      animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    }, [end, duration]);

    return count;
  };

  const animatedTotalReviews = useAnimatedCounter(stats.totalReviews);
  const animatedPendingReviews = useAnimatedCounter(stats.pendingReviews);
  const animatedAverageRating =
    useAnimatedCounter(stats.averageRating * 10) / 10;

  // Fetch data functions
  const fetchStats = async () => {
    try {
      const data = await getReviewStats();
      setStats(data);
    } catch (error) {
      toast.error("Failed to load review statistics");
    }
  };

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);

      const queryFilters: any = {
        page,
        limit: 10,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      if (filters.search) queryFilters.search = filters.search;
      if (filters.rating !== "all")
        queryFilters.rating = parseInt(filters.rating);
      if (filters.visibility !== "all")
        queryFilters.isVisible = filters.visibility === "visible";
      if (filters.verification !== "all")
        queryFilters.isVerified = filters.verification === "verified";

      const data = await getReviews(queryFilters);

      if (data.error) {
        toast.error(data.error);
      } else {
        setReviews(data.reviews);
        setPagination(data.pagination);
      }
    } catch (error) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchReviews(1);
    setSelectedReviews([]);
  }, [filters]);

  // Rating stars component
  const RatingStars = ({
    rating,
    size = "w-4 h-4",
  }: {
    rating: number;
    size?: string;
  }) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // Rating distribution chart
  const RatingChart = () => {
    const maxCount = Math.max(...Object.values(stats.ratingDistribution));

    return (
      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating];
          const percentage =
            stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={rating} className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 w-12">
                <span className="text-gray-600">{rating}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${barWidth}%`,
                    animation: "slideIn 1s ease-out",
                  }}
                />
              </div>
              <div className="w-16 text-right">
                <span className="text-gray-600">{count}</span>
                <span className="text-gray-400 ml-1">
                  ({percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Action handlers
  const handleApproveReview = async (reviewId: string) => {
    setActionLoading(reviewId);
    try {
      const result = await approveReview(reviewId);
      if (result.success) {
        toast.success("Review approved successfully");
        fetchReviews(pagination.currentPage);
        fetchStats();
      } else {
        toast.error(result.error || "Failed to approve review");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectReview = async (reviewId: string) => {
    setActionLoading(reviewId);
    try {
      const result = await rejectReview(reviewId);
      if (result.success) {
        toast.success("Review rejected successfully");
        fetchReviews(pagination.currentPage);
        fetchStats();
      } else {
        toast.error(result.error || "Failed to reject review");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReviews(reviews.map((review) => review._id));
    } else {
      setSelectedReviews([]);
    }
  };

  const handleSelectReview = (reviewId: string, checked: boolean) => {
    if (checked) {
      setSelectedReviews((prev) => [...prev, reviewId]);
    } else {
      setSelectedReviews((prev) => prev.filter((id) => id !== reviewId));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedReviews.length === 0) {
      toast.error("Please select reviews first");
      return;
    }

    setActionLoading("bulk");
    try {
      let result;
      switch (action) {
        case "approve":
          result = await bulkApproveReviews(selectedReviews);
          break;
        case "show":
          result = await bulkUpdateReviews(selectedReviews, {
            isVisible: true,
          });
          break;
        case "hide":
          result = await bulkUpdateReviews(selectedReviews, {
            isVisible: false,
          });
          break;
        case "verify":
          result = await bulkUpdateReviews(selectedReviews, {
            isVerified: true,
          });
          break;
        case "delete":
          result = await bulkDeleteReviews(selectedReviews);
          break;
        default:
          return;
      }

      if (result.success) {
        let processedCount = 0;
        if ("updated" in result && typeof result.updated === "number") {
          processedCount = result.updated;
        } else if ("deleted" in result && typeof result.deleted === "number") {
          processedCount = result.deleted;
        } else if (
          "approved" in result &&
          typeof result.approved === "number"
        ) {
          processedCount = result.approved;
        }
        toast.success(`Successfully processed ${processedCount} reviews`);
        fetchReviews(pagination.currentPage);
        fetchStats();
        setSelectedReviews([]);
      } else {
        toast.error(result.error || "Failed to process reviews");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVisibility = async (reviewId: string) => {
    setActionLoading(reviewId);
    try {
      const result = await toggleReviewVisibility(reviewId);
      if (result.success) {
        toast.success(
          `Review ${result.isVisible ? "shown" : "hidden"} successfully`
        );
        fetchReviews(pagination.currentPage);
        fetchStats();
      } else {
        toast.error(result.error || "Failed to update review");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVerification = async (reviewId: string) => {
    setActionLoading(reviewId);
    try {
      const result = await toggleReviewVerification(reviewId);
      if (result.success) {
        toast.success(
          `Review ${result.isVerified ? "verified" : "unverified"} successfully`
        );
        fetchReviews(pagination.currentPage);
        fetchStats();
      } else {
        toast.error(result.error || "Failed to update review");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    setActionLoading(reviewId);
    try {
      const result = await deleteReview(reviewId);
      if (result.success) {
        toast.success("Review deleted successfully");
        fetchReviews(pagination.currentPage);
        fetchStats();
      } else {
        toast.error(result.error || "Failed to delete review");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading reviews dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Customer Reviews
          </h1>
          <p className="text-gray-600 mt-1">
            Manage customer feedback and ratings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => fetchReviews(pagination.currentPage)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Total Reviews
                </p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  {animatedTotalReviews.toLocaleString()}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  +{stats.recentReviews} this week
                </p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <MessageSquare className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Reviews - Highlighted */}
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">
                  Pending Reviews
                </p>
                <p className="text-3xl font-bold text-orange-900 mt-2">
                  {animatedPendingReviews}
                </p>
                <p className="text-sm text-orange-600 mt-1">Need approval</p>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <Clock className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">
                  Average Rating
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-3xl font-bold text-yellow-900">
                    {animatedAverageRating.toFixed(1)}
                  </p>
                  <RatingStars rating={Math.round(stats.averageRating)} />
                </div>
                <p className="text-sm text-yellow-600 mt-1">Excellent rating</p>
              </div>
              <div className="p-3 bg-yellow-200 rounded-full">
                <Star className="w-6 h-6 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">
                  Verified Reviews
                </p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  {stats.verifiedReviews}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {stats.totalReviews > 0
                    ? (
                        (stats.verifiedReviews / stats.totalReviews) *
                        100
                      ).toFixed(1)
                    : 0}
                  % verified
                </p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <ShieldCheck className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">
                  Visible Reviews
                </p>
                <p className="text-3xl font-bold text-purple-900 mt-2">
                  {stats.visibleReviews}
                </p>
                <p className="text-sm text-purple-600 mt-1">
                  {stats.hiddenReviews} hidden
                </p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <Eye className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RatingChart />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Top Rated Products
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.topRatedProducts.length > 0 ? (
              stats.topRatedProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {product.productName}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <RatingStars
                        rating={product.averageRating}
                        size="w-3 h-3"
                      />
                      <span className="text-sm text-gray-600">
                        ({product.reviewCount})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {product.averageRating}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No top rated products yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              Reviews Management
            </CardTitle>
            {selectedReviews.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">
                  {selectedReviews.length} selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("approve")}
                  disabled={actionLoading === "bulk"}
                  className="bg-green-50 hover:bg-green-100 text-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("show")}
                  disabled={actionLoading === "bulk"}
                >
                  Show All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("hide")}
                  disabled={actionLoading === "bulk"}
                >
                  Hide All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("verify")}
                  disabled={actionLoading === "bulk"}
                >
                  Verify All
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction("delete")}
                  disabled={actionLoading === "bulk"}
                >
                  Delete All
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search reviews..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="pl-10"
              />
            </div>
            <Select
              value={filters.rating}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, rating: value }))
              }
            >
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.visibility}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, visibility: value }))
              }
            >
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="visible">Visible</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.verification}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, verification: value }))
              }
            >
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {/* Select All Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={
                    selectedReviews.length === reviews.length &&
                    reviews.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({reviews.length} reviews)
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Page {pagination.currentPage} of {pagination.totalPages} •{" "}
                {pagination.total} total
              </div>
            </div>

            {/* Review Cards */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <Card
                  key={review._id}
                  className={`border-0 shadow-md hover:shadow-lg transition-all duration-300 ${!review.isVisible ? "bg-gray-50 opacity-75" : "bg-white"}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedReviews.includes(review._id)}
                        onCheckedChange={(checked) =>
                          handleSelectReview(review._id, checked as boolean)
                        }
                      />

                      <Avatar className="w-12 h-12 border-2 border-gray-200">
                        <AvatarImage src={review.user.imageUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          {review.user.firstName[0]}
                          {review.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {review.user.firstName} {review.user.lastName}
                              </h3>
                              <RatingStars rating={review.rating} />
                              <div className="flex items-center gap-2">
                                {review.isVerified && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-green-100 text-green-700 border-green-200"
                                  >
                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                                {!review.isVisible && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-orange-100 text-orange-700 border-orange-200"
                                  >
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {review.title && (
                              <h4 className="font-medium text-gray-900 mb-2">
                                {review.title}
                              </h4>
                            )}

                            {review.content && (
                              <p className="text-gray-700 mb-3 leading-relaxed">
                                {review.content}
                              </p>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={review.product.images[0]}
                                    alt={review.product.name}
                                    className="w-8 h-8 rounded object-cover"
                                  />
                                  <span className="font-medium">
                                    {review.product.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(
                                    review.createdAt
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Quick Actions for Pending Reviews */}
                            {!review.isVisible && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleApproveReview(review._id)
                                  }
                                  disabled={actionLoading === review._id}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {actionLoading === review._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectReview(review._id)}
                                  disabled={actionLoading === review._id}
                                >
                                  {actionLoading === review._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <XCircle className="w-4 h-4" />
                                  )}
                                </Button>
                              </>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleToggleVisibility(review._id)
                                  }
                                >
                                  {review.isVisible ? (
                                    <>
                                      <EyeOff className="w-4 h-4 mr-2" />
                                      Hide Review
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-4 h-4 mr-2" />
                                      Show Review
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleToggleVerification(review._id)
                                  }
                                >
                                  {review.isVerified ? (
                                    <>
                                      <Shield className="w-4 h-4 mr-2" />
                                      Unverify
                                    </>
                                  ) : (
                                    <>
                                      <ShieldCheck className="w-4 h-4 mr-2" />
                                      Verify
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteReview(review._id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Review
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No reviews found
                </h3>
                <p className="text-gray-500">
                  No reviews match your current filters
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-gray-500">
                Showing {(pagination.currentPage - 1) * 10 + 1}-
                {Math.min(pagination.currentPage * 10, pagination.total)} of{" "}
                {pagination.total} reviews
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchReviews(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage || loading}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-600 px-3">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchReviews(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage || loading}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsAdminDashboard;
