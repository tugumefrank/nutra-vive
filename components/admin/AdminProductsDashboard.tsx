"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Grid3x3,
  List,
  Package,
  TrendingUp,
  Star,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  DollarSign,
  Loader2,
  AlertCircle,
  CheckCircle,
  Calendar,
} from "lucide-react";

// Import real server actions

// Import ProductForm
import ProductForm from "./ProductForm";
import {
  getCategories,
  getProductStats,
  getProducts,
  deleteProduct,
  toggleProductStatus,
  toggleFeaturedStatus,
} from "@/lib/actions/productserverActions";

// Types
interface IProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku?: string;
  barcode?: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  inventory: number;
  description?: string;
  shortDescription?: string;
  images: string[];
  tags?: string[];
  features?: string[];
  ingredients?: string[];
  nutritionFacts?: {
    servingSize?: string;
    calories?: number;
    totalFat?: string;
    sodium?: string;
    totalCarbs?: string;
    sugars?: string;
    protein?: string;
    vitaminC?: string;
  };
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: "in" | "cm";
  };
  isActive: boolean;
  isFeatured: boolean;
  trackQuantity: boolean;
  allowBackorder: boolean;
  metaTitle?: string;
  metaDescription?: string;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

interface IProductStats {
  total: number;
  active: number;
  inactive: number;
  featured: number;
  lowStock: number;
  outOfStock: number;
  categories: number;
}

interface INotification {
  message: string;
  type: "success" | "error" | "info";
}

type ViewMode = "grid" | "list";

const AdminProductsDashboard: React.FC = () => {
  // State management
  const [products, setProducts] = useState<IProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [stats, setStats] = useState<IProductStats>({
    total: 0,
    active: 0,
    inactive: 0,
    featured: 0,
    lowStock: 0,
    outOfStock: 0,
    categories: 0,
  });

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showAddProduct, setShowAddProduct] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [notification, setNotification] = useState<INotification | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const itemsPerPage = 20;

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Filter and load products when filters change
  useEffect(() => {
    loadProducts();
  }, [searchTerm, selectedCategory, sortBy, sortOrder, currentPage]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [categoriesResponse, statsResponse] = await Promise.all([
        getCategories(),
        getProductStats(),
      ]);

      setCategories(categoriesResponse);
      setStats(statsResponse);

      // Load products
      await loadProducts();
    } catch (error) {
      console.error("Error loading initial data:", error);
      showNotification(
        "Failed to load data. Please refresh the page.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    if (!isLoading) setIsRefreshing(true);

    try {
      const filters = {
        search: searchTerm,
        category: selectedCategory,
        sortBy: sortBy as "name" | "price" | "createdAt" | "updatedAt",
        sortOrder,
        page: currentPage,
        limit: itemsPerPage,
      };

      const response = await getProducts(filters);

      setProducts(response.products);
      setFilteredProducts(response.products);
      setTotalProducts(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
    } catch (error) {
      console.error("Error loading products:", error);
      showNotification("Failed to load products.", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Utility functions
  const showNotification = (
    message: string,
    type: INotification["type"] = "success"
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Server action handlers
  const handleDeleteProduct = async (productId: string): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const response = await deleteProduct(productId);

      if (response.success) {
        showNotification("Product deleted successfully!");
        await loadProducts();
        await refreshStats();
      } else {
        throw new Error(response.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      showNotification(
        error instanceof Error ? error.message : "Failed to delete product.",
        "error"
      );
    }
  };

  const handleToggleStatus = async (productId: string): Promise<void> => {
    try {
      const response = await toggleProductStatus(productId);

      if (response.success) {
        showNotification("Product status updated!");
        await loadProducts();
        await refreshStats();
      } else {
        throw new Error(response.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      showNotification(
        error instanceof Error ? error.message : "Failed to update status.",
        "error"
      );
    }
  };

  const handleToggleFeatured = async (productId: string): Promise<void> => {
    try {
      const response = await toggleFeaturedStatus(productId);

      if (response.success) {
        showNotification("Featured status updated!");
        await loadProducts();
        await refreshStats();
      } else {
        throw new Error(response.error || "Failed to update featured status");
      }
    } catch (error) {
      console.error("Error toggling featured:", error);
      showNotification(
        error instanceof Error
          ? error.message
          : "Failed to update featured status.",
        "error"
      );
    }
  };

  const refreshStats = async () => {
    try {
      const newStats = await getProductStats();
      setStats(newStats);
    } catch (error) {
      console.error("Error refreshing stats:", error);
    }
  };

  const handleProductSaved = async () => {
    setShowAddProduct(false);
    setEditingProduct(null);
    showNotification("Product saved successfully!");
    await loadProducts();
    await refreshStats();
  };

  // Component definitions
  const StatsCard: React.FC<{
    icon: React.ComponentType<any>;
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
    trend?: number;
  }> = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <div className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          {trend && (
            <div
              className={`flex items-center text-sm ${
                trend > 0 ? "text-emerald-600" : "text-red-500"
              }`}
            >
              <TrendingUp
                className={`h-4 w-4 mr-1 ${trend < 0 ? "rotate-180" : ""}`}
              />
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm font-medium text-gray-900">{title}</p>
          {subtitle && <p className="text-xs text-gray-600">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const ProductCard: React.FC<{ product: IProduct }> = ({ product }) => (
    <div className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Product Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.images[0] || "/placeholder-product.jpg"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {product.isFeatured && (
            <div className="px-2 py-1 bg-yellow-500/90 backdrop-blur-sm rounded-lg">
              <Star className="h-3 w-3 text-white" />
            </div>
          )}
          {!product.isActive && (
            <div className="px-2 py-1 bg-red-500/90 backdrop-blur-sm rounded-lg">
              <EyeOff className="h-3 w-3 text-white" />
            </div>
          )}
          {product.inventory === 0 && (
            <div className="px-2 py-1 bg-gray-500/90 backdrop-blur-sm rounded-lg text-xs text-white font-medium">
              Out of Stock
            </div>
          )}
          {product.inventory <= 10 && product.inventory > 0 && (
            <div className="px-2 py-1 bg-orange-500/90 backdrop-blur-sm rounded-lg text-xs text-white font-medium">
              Low Stock
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
          <button
            onClick={() => setEditingProduct(product)}
            className="p-2 bg-blue-500/90 backdrop-blur-sm rounded-lg text-white hover:bg-blue-600 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteProduct(product._id)}
            className="p-2 bg-red-500/90 backdrop-blur-sm rounded-lg text-white hover:bg-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>
          <div className="text-right">
            <p className="text-xl font-bold text-emerald-600">
              ${product.price}
            </p>
            {product.compareAtPrice && (
              <p className="text-sm text-gray-500 line-through">
                ${product.compareAtPrice}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium text-gray-700">
              {product.averageRating}
            </span>
            <span className="text-sm text-gray-500">
              ({product.reviewCount})
            </span>
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <span className="text-sm text-gray-600">
            {product.category?.name || "Uncategorized"}
          </span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-500" />
            <span
              className={`text-sm font-medium ${
                product.inventory === 0
                  ? "text-red-600"
                  : product.inventory <= 10
                    ? "text-orange-600"
                    : "text-emerald-600"
              }`}
            >
              {product.inventory} in stock
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => handleToggleStatus(product._id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              product.isActive
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            {product.isActive ? "Active" : "Inactive"}
          </button>
          <button
            onClick={() => handleToggleFeatured(product._id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              product.isFeatured
                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {product.isFeatured ? "Featured" : "Feature"}
          </button>
        </div>
      </div>
    </div>
  );

  const ProductListItem: React.FC<{ product: IProduct }> = ({ product }) => (
    <div className="group bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">
      <div className="p-6">
        <div className="flex items-center gap-6">
          {/* Product Image */}
          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
            <img
              src={product.images[0] || "/placeholder-product.jpg"}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {/* Status overlay */}
            {!product.isActive && (
              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                <EyeOff className="h-5 w-5 text-red-600" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-gray-600">
                    {product.category?.name || "Uncategorized"}
                  </span>
                  <span className="text-sm text-gray-400">
                    SKU: {product.sku || "N/A"}
                  </span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2 ml-4">
                {product.isFeatured && (
                  <div className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Featured
                  </div>
                )}
                <div
                  className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    product.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {product.isActive ? "Active" : "Inactive"}
                </div>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* Price */}
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-lg font-bold text-emerald-600">
                    ${product.price}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.compareAtPrice}
                    </span>
                  )}
                </div>

                {/* Stock */}
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span
                    className={`text-sm font-medium ${
                      product.inventory === 0
                        ? "text-red-600"
                        : product.inventory <= 10
                          ? "text-orange-600"
                          : "text-emerald-600"
                    }`}
                  >
                    {product.inventory} in stock
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-gray-700">
                    {product.averageRating}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({product.reviewCount})
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(product._id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    product.isActive
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  {product.isActive ? "Active" : "Inactive"}
                </button>
                <button
                  onClick={() => handleToggleFeatured(product._id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    product.isFeatured
                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {product.isFeatured ? "Featured" : "Feature"}
                </button>
                <button
                  onClick={() => setEditingProduct(product)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteProduct(product._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Dashboard...
          </h2>
          <p className="text-gray-600">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg backdrop-blur-xl border ${
            notification.type === "success"
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-800"
              : notification.type === "error"
                ? "bg-red-50/90 border-red-200 text-red-800"
                : "bg-blue-50/90 border-blue-200 text-blue-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            ) : notification.type === "error" ? (
              <AlertCircle className="h-5 w-5 text-red-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-blue-600" />
            )}
            {notification.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Product Management
              </h1>
              <p className="text-gray-600">
                Manage your organic juice and tea collection
              </p>
            </div>
            <div className="flex items-center gap-4">
              {isRefreshing && (
                <Loader2 className="h-5 w-5 text-emerald-600 animate-spin" />
              )}
              <button
                onClick={() => setShowAddProduct(true)}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all hover:scale-105 hover:shadow-lg flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Product
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatsCard
            icon={Package}
            title="Total Products"
            value={stats.total}
            color="from-blue-500 to-blue-600"
          />
          <StatsCard
            icon={Eye}
            title="Active"
            value={stats.active}
            color="from-emerald-500 to-emerald-600"
          />
          <StatsCard
            icon={Star}
            title="Featured"
            value={stats.featured}
            color="from-yellow-500 to-yellow-600"
          />
          <StatsCard
            icon={TrendingUp}
            title="Low Stock"
            value={stats.lowStock}
            color="from-orange-500 to-orange-600"
          />
          <StatsCard
            icon={EyeOff}
            title="Out of Stock"
            value={stats.outOfStock}
            color="from-red-500 to-red-600"
          />
          <StatsCard
            icon={DollarSign}
            title="Categories"
            value={stats.categories}
            color="from-purple-500 to-purple-600"
          />
        </div>

        {/* Controls */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 border rounded-xl transition-all flex items-center gap-2 ${
                  showFilters
                    ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                    : "border-gray-300 hover:border-emerald-400"
                }`}
              >
                <Filter className="h-5 w-5" />
                Filters
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === "grid"
                    ? "bg-emerald-100 text-emerald-600"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === "list"
                    ? "bg-emerald-100 text-emerald-600"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="updatedAt">Last Updated</option>
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "asc" | "desc")
                  }
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>

                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                    setSortBy("createdAt");
                    setSortOrder("desc");
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <ProductListItem key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalProducts)} of{" "}
              {totalProducts} products
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 && !isRefreshing && (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory
                ? "Try adjusting your filters or search terms"
                : "Get started by adding your first product"}
            </p>
            <button
              onClick={() => setShowAddProduct(true)}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Add Your First Product
            </button>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {(showAddProduct || editingProduct) && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setShowAddProduct(false);
            setEditingProduct(null);
          }}
          onSave={handleProductSaved}
        />
      )}
    </div>
  );
};

export default AdminProductsDashboard;
