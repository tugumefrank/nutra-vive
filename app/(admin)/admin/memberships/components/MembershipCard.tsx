// app/admin/memberships/components/MembershipCard.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Crown,
  Package,
  Star,
  Activity,
  Users,
  DollarSign,
  Calendar,
  Gift,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  CheckCircle,
  Truck,
  Headphones,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMemberships } from "./MembershipsProvider";
import {
  deleteMembership,
  toggleMembershipStatus,
} from "@/lib/actions/membershipServerActions";

interface MembershipCardProps {
  membership: any;
  viewMode: "grid" | "list";
}

export default function MembershipCard({
  membership,
  viewMode,
}: MembershipCardProps) {
  const { setSelectedMembership, setIsEditDialogOpen, refreshMemberships } =
    useMemberships();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "basic":
        return Package;
      case "premium":
        return Star;
      case "vip":
        return Crown;
      case "elite":
        return Activity;
      default:
        return Package;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "basic":
        return "from-blue-500 to-blue-600";
      case "premium":
        return "from-purple-500 to-purple-600";
      case "vip":
        return "from-yellow-500 to-yellow-600";
      case "elite":
        return "from-red-500 to-red-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case "basic":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "premium":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "vip":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "elite":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatBillingFrequency = (frequency: string) => {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

  const handleEdit = () => {
    setSelectedMembership(membership);
    setIsEditDialogOpen(true);
  };

  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      const result = await toggleMembershipStatus(membership._id);
      if (result.success) {
        toast.success(
          `Membership ${result.isActive ? "activated" : "deactivated"} successfully`
        );
        refreshMemberships();
      } else {
        toast.error(result.error || "Failed to toggle membership status");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteMembership(membership._id);
      if (result.success) {
        toast.success("Membership deleted successfully");
        refreshMemberships();
        setShowDeleteDialog(false);
      } else {
        toast.error(result.error || "Failed to delete membership");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const TierIcon = getTierIcon(membership.tier);

  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border border-border/50">
        <CardContent className="p-4 md:p-6">
          {/* Mobile Layout */}
          <div className="block lg:hidden space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={`p-2 rounded-lg bg-gradient-to-br ${getTierColor(membership.tier)} text-white flex-shrink-0`}
                >
                  <TierIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate text-base">
                    {membership.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    <Badge
                      className={`${getTierBadgeColor(membership.tier)} text-xs`}
                    >
                      {membership.tier.toUpperCase()}
                    </Badge>
                    {membership.isPopular && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                    {!membership.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex-shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleToggleStatus}
                    disabled={isToggling}
                  >
                    {membership.isActive ? (
                      <ToggleLeft className="mr-2 h-4 w-4" />
                    ) : (
                      <ToggleRight className="mr-2 h-4 w-4" />
                    )}
                    {membership.isActive ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Description */}
            {membership.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {membership.description}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-lg font-bold">
                  {formatCurrency(membership.price)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatBillingFrequency(membership.billingFrequency)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-semibold">
                  {membership.totalSubscribers}
                </div>
                <div className="text-xs text-muted-foreground">Subscribers</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-semibold">
                  {membership.productAllocations?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Categories</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleStatus}
                disabled={isToggling}
                className="px-3"
              >
                {membership.isActive ? (
                  <ToggleLeft className="h-4 w-4" />
                ) : (
                  <ToggleRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between">
            {/* Left section */}
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-lg bg-gradient-to-br ${getTierColor(membership.tier)} text-white`}
              >
                <TierIcon className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{membership.name}</h3>
                  <Badge className={getTierBadgeColor(membership.tier)}>
                    {membership.tier.toUpperCase()}
                  </Badge>
                  {membership.isPopular && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  {!membership.isActive && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {membership.description || "No description provided"}
                </p>
              </div>
            </div>

            {/* Middle section */}
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatCurrency(membership.price)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatBillingFrequency(membership.billingFrequency)}
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-semibold">
                  {membership.totalSubscribers}
                </div>
                <div className="text-xs text-muted-foreground">Subscribers</div>
              </div>

              <div className="text-center">
                <div className="text-lg font-semibold">
                  {membership.productAllocations?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Categories</div>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleToggleStatus}
                    disabled={isToggling}
                  >
                    {membership.isActive ? (
                      <ToggleLeft className="mr-2 h-4 w-4" />
                    ) : (
                      <ToggleRight className="mr-2 h-4 w-4" />
                    )}
                    {membership.isActive ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-500 border border-border/50 hover:border-primary/20">
        {/* Background gradient overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${getTierColor(membership.tier)} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
        />

        {/* Popular badge */}
        {membership.isPopular && (
          <motion.div
            initial={{ scale: 0, rotate: -12 }}
            animate={{ scale: 1, rotate: -12 }}
            className="absolute -top-2 -right-2 z-10"
          >
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Popular
            </Badge>
          </motion.div>
        )}

        <CardHeader className="relative pb-3 md:pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 md:space-y-3 flex-1 min-w-0">
              {/* Tier icon and badge */}
              <div className="flex items-center gap-2 md:gap-3">
                <div
                  className={`p-1.5 md:p-2 rounded-lg bg-gradient-to-br ${getTierColor(membership.tier)} text-white shadow-lg`}
                >
                  <TierIcon className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <Badge
                  className={`${getTierBadgeColor(membership.tier)} text-xs`}
                >
                  {membership.tier.toUpperCase()}
                </Badge>
              </div>

              {/* Title */}
              <h3 className="text-lg md:text-xl font-bold group-hover:text-primary transition-colors leading-tight">
                {membership.name}
              </h3>
            </div>

            {/* Actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleToggleStatus}
                  disabled={isToggling}
                >
                  {membership.isActive ? (
                    <ToggleLeft className="mr-2 h-4 w-4" />
                  ) : (
                    <ToggleRight className="mr-2 h-4 w-4" />
                  )}
                  {membership.isActive ? "Deactivate" : "Activate"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4 md:space-y-6 p-4 md:p-6">
          {/* Description */}
          {membership.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {membership.description}
            </p>
          )}

          {/* Pricing */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-bold">
              {formatCurrency(membership.price)}
            </span>
            <span className="text-sm text-muted-foreground">
              / {formatBillingFrequency(membership.billingFrequency)}
            </span>
          </div>

          {/* Product Allocations */}
          {membership.productAllocations?.length > 0 && (
            <div className="space-y-2 md:space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Product Allocations
              </h4>
              <div className="space-y-2">
                {membership.productAllocations
                  ?.slice(0, 3)
                  .map((allocation: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground truncate flex-1 mr-2">
                        {allocation.categoryName}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs flex-shrink-0"
                      >
                        {allocation.quantity}
                      </Badge>
                    </div>
                  ))}
                {membership.productAllocations?.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{membership.productAllocations.length - 3} more categories
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Features preview */}
          <div className="space-y-2 md:space-y-3">
            <h4 className="text-sm font-semibold">Features</h4>
            <div className="space-y-2">
              {membership.freeDelivery && (
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="h-3 w-3 text-green-600 flex-shrink-0" />
                  <span>Free delivery</span>
                </div>
              )}
              {membership.prioritySupport && (
                <div className="flex items-center gap-2 text-sm">
                  <Headphones className="h-3 w-3 text-blue-600 flex-shrink-0" />
                  <span>Priority support</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-3 w-3 text-purple-600 flex-shrink-0" />
                <span>
                  {formatBillingFrequency(membership.deliveryFrequency)}{" "}
                  delivery
                </span>
              </div>
              {membership.features
                ?.slice(0, 2)
                .map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                    <span className="truncate">{feature}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Stats */}
          <div className="pt-3 md:pt-4 border-t space-y-2 md:space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subscribers</span>
                <span className="font-medium">
                  {membership.totalSubscribers}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-medium">
                  {formatCurrency(membership.totalRevenue || 0)}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge
                variant={membership.isActive ? "default" : "secondary"}
                className="text-xs"
              >
                {membership.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleEdit}
              className="flex-1 group-hover:shadow-md transition-shadow"
              size="sm"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleStatus}
              disabled={isToggling}
              className="px-3"
            >
              {membership.isActive ? (
                <ToggleLeft className="h-4 w-4" />
              ) : (
                <ToggleRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="mx-4 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Membership</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{membership.name}"? This action
              cannot be undone.
              {membership.totalSubscribers > 0 && (
                <span className="text-red-600 font-medium">
                  <br />
                  Warning: This membership has {
                    membership.totalSubscribers
                  }{" "}
                  active subscribers.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
