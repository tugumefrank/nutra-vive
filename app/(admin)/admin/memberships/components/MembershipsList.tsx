// app/admin/memberships/components/MembershipsList.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Crown,
  Package,
  Star,
  Activity,
  Grid3X3,
  List,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { useMemberships } from "./MembershipsProvider";
import MembershipCard from "./MembershipCard";
import MembershipsPagination from "./MembershipsPagination";
import { useDebounce } from "@/hooks/useDebounce";

interface MembershipsListProps {
  initialMemberships: any[];
  initialPagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  searchParams: {
    page?: string;
    search?: string;
    tier?: string;
    billingFrequency?: string;
    status?: string;
    sort?: string;
    order?: string;
  };
}

const tierOptions = [
  { value: "basic", label: "Basic", icon: Package, color: "bg-blue-500" },
  { value: "premium", label: "Premium", icon: Star, color: "bg-purple-500" },
  { value: "vip", label: "VIP", icon: Crown, color: "bg-yellow-500" },
  { value: "elite", label: "Elite", icon: Activity, color: "bg-red-500" },
];

const billingFrequencyOptions = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

const sortOptions = [
  { value: "createdAt", label: "Created Date" },
  { value: "name", label: "Name" },
  { value: "price", label: "Price" },
  { value: "tier", label: "Tier" },
  { value: "totalSubscribers", label: "Subscribers" },
];

export default function MembershipsList({
  initialMemberships,
  initialPagination,
  searchParams,
}: MembershipsListProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const { refreshTrigger } = useMemberships();

  const [memberships, setMemberships] = useState(initialMemberships);
  const [pagination, setPagination] = useState(initialPagination);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter states - using "all" instead of empty string
  const [searchQuery, setSearchQuery] = useState(searchParams.search || "");
  const [selectedTier, setSelectedTier] = useState(searchParams.tier || "all");
  const [selectedBilling, setSelectedBilling] = useState(
    searchParams.billingFrequency || "all"
  );
  const [selectedStatus, setSelectedStatus] = useState(
    searchParams.status || "all"
  );
  const [sortBy, setSortBy] = useState(searchParams.sort || "createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.order as "asc" | "desc") || "desc"
  );

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Update URL when filters change
  const updateURL = useMemo(() => {
    return (newParams: Record<string, string | undefined>) => {
      const params = new URLSearchParams(urlSearchParams);

      Object.entries(newParams).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset to page 1 when filters change
      if (Object.keys(newParams).some((key) => key !== "page")) {
        params.delete("page");
      }

      router.push(`?${params.toString()}`, { scroll: false });
    };
  }, [urlSearchParams, router]);

  // Update URL when search changes
  useEffect(() => {
    updateURL({ search: debouncedSearch || undefined });
  }, [debouncedSearch, updateURL]);

  // Handle filter changes
  const handleTierChange = (tier: string) => {
    setSelectedTier(tier);
    updateURL({ tier: tier === "all" ? undefined : tier });
  };

  const handleBillingChange = (billing: string) => {
    setSelectedBilling(billing);
    updateURL({ billingFrequency: billing === "all" ? undefined : billing });
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    updateURL({ status: status === "all" ? undefined : status });
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    updateURL({ sort });
  };

  const handleSortOrderToggle = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
    updateURL({ order: newOrder });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTier("all");
    setSelectedBilling("all");
    setSelectedStatus("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    router.push("/admin/memberships");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedTier !== "all" ||
    selectedBilling !== "all" ||
    selectedStatus !== "all";

  const FiltersContent = () => (
    <div className="space-y-4">
      {/* Tier Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Tier</label>
        <Select value={selectedTier} onValueChange={handleTierChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            {tierOptions.map((tier) => (
              <SelectItem key={tier.value} value={tier.value}>
                <div className="flex items-center gap-2">
                  <tier.icon className="h-4 w-4" />
                  {tier.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Billing Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Billing Frequency</label>
        <Select value={selectedBilling} onValueChange={handleBillingChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select billing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Billing</SelectItem>
            {billingFrequencyOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Status</label>
        <Select value={selectedStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Sort By</label>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort Order */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Order</label>
        <Button
          variant="outline"
          onClick={handleSortOrderToggle}
          className="w-full justify-start"
        >
          {sortOrder === "asc" ? (
            <>
              <SortAsc className="mr-2 h-4 w-4" />
              Ascending
            </>
          ) : (
            <>
              <SortDesc className="mr-2 h-4 w-4" />
              Descending
            </>
          )}
        </Button>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Filters Header */}
      <div className="flex-none border-b bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-6 py-4">
          {/* Mobile Header */}
          <div className="block md:hidden space-y-4">
            {/* Search and Filter Button */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search memberships..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Sheet
                open={showMobileFilters}
                onOpenChange={setShowMobileFilters}
              >
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Filter and sort memberships
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FiltersContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* View Mode and Sort */}
            <div className="flex items-center justify-between">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                {memberships.length} of {pagination.total}
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Left side - Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search memberships..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Tier Filter */}
              <Select value={selectedTier} onValueChange={handleTierChange}>
                <SelectTrigger className="w-32 bg-background/50">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  {tierOptions.map((tier) => (
                    <SelectItem key={tier.value} value={tier.value}>
                      <div className="flex items-center gap-2">
                        <tier.icon className="h-4 w-4" />
                        {tier.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Billing Filter */}
              <Select
                value={selectedBilling}
                onValueChange={handleBillingChange}
              >
                <SelectTrigger className="w-36 bg-background/50">
                  <SelectValue placeholder="Billing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Billing</SelectItem>
                  {billingFrequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-28 bg-background/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Right side - Sort and View */}
            <div className="flex items-center gap-3">
              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-background/50"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Sort by </span>
                    {sortOptions.find((s) => s.value === sortBy)?.label}
                    {sortOrder === "asc" ? (
                      <SortAsc className="ml-2 h-4 w-4" />
                    ) : (
                      <SortDesc className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {sortOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem onClick={handleSortOrderToggle}>
                    {sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Mode */}
              <div className="flex items-center border rounded-lg bg-background/50">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchQuery && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  Search: {searchQuery}
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 hover:bg-background/50 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedTier !== "all" && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  Tier:{" "}
                  {tierOptions.find((t) => t.value === selectedTier)?.label}
                  <button
                    onClick={() => handleTierChange("all")}
                    className="ml-1 hover:bg-background/50 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedBilling !== "all" && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  Billing:{" "}
                  {
                    billingFrequencyOptions.find(
                      (b) => b.value === selectedBilling
                    )?.label
                  }
                  <button
                    onClick={() => handleBillingChange("all")}
                    className="ml-1 hover:bg-background/50 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedStatus !== "all" && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  Status: {selectedStatus === "active" ? "Active" : "Inactive"}
                  <button
                    onClick={() => handleStatusChange("all")}
                    className="ml-1 hover:bg-background/50 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 md:px-6 py-6 md:py-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-12"
            >
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                <p className="text-muted-foreground">Loading memberships...</p>
              </div>
            </motion.div>
          ) : memberships.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No memberships found
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {hasActiveFilters
                  ? "Try adjusting your filters to find what you're looking for."
                  : "Get started by creating your first membership plan."}
              </p>
              {!hasActiveFilters && (
                <Button
                  onClick={() => router.push("/admin/memberships?create=true")}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Create Membership
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Results Header - Desktop Only */}
              <div className="hidden md:flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {memberships.length} of {pagination.total} memberships
                </p>
              </div>

              {/* Memberships Grid/List */}
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6"
                    : "space-y-4"
                }
              >
                {memberships.map((membership, index) => (
                  <motion.div
                    key={membership._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <MembershipCard
                      membership={membership}
                      viewMode={viewMode}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <MembershipsPagination
                  pagination={pagination}
                  searchParams={searchParams}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
