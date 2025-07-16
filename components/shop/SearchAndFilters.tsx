// components/shop/SearchAndFilters.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface SearchAndFiltersProps {
  categories: Category[];
  initialSearch: string;
  initialCategory: string;
  initialSortBy: string;
}

export function SearchAndFilters({
  categories,
  initialSearch,
  initialCategory,
  initialSortBy,
}: SearchAndFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const updateURL = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "All" && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset page when filters change
    params.delete("page");

    startTransition(() => {
      router.push(`/shop?${params.toString()}`, { scroll: false });
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    updateURL({ search: value, category: selectedCategory, sortBy });
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    updateURL({ search: searchTerm, category: value, sortBy });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    updateURL({
      search: searchTerm,
      category: selectedCategory,
      sortBy: value,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSortBy("name");
    updateURL({ search: "", category: "All", sortBy: "name" });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedCategory && selectedCategory !== "All") count++;
    if (sortBy && sortBy !== "name") count++;
    return count;
  };

  const getCategoryName = (slug: string) => {
    if (slug === "All") return "All Categories";
    const category = categories.find(cat => cat.slug === slug);
    return category ? category.name : slug;
  };

  const getSortName = (value: string) => {
    const sortOptions: Record<string, string> = {
      name: "Name",
      price: "Price", 
      createdAt: "Newest",
      updatedAt: "Recently Updated"
    };
    return sortOptions[value] || value;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div
      className={`bg-white/70 backdrop-blur-md rounded-3xl p-4 lg:p-6 mb-8 border border-orange-200/50 transition-opacity duration-200 ${isPending ? "opacity-50" : ""}`}
    >
      {/* Main search and filter toggle row */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Search - always visible */}
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
          />
        </div>

        {/* Desktop filters - hidden on mobile */}
        <div className="hidden lg:flex gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-4 py-3 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none min-w-[160px]"
          >
            <option value="All">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-3 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none min-w-[160px]"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="createdAt">Sort by Newest</option>
            <option value="updatedAt">Sort by Recently Updated</option>
          </select>
        </div>

        {/* Mobile filter button - only visible on mobile */}
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors min-w-[120px] justify-center"
        >
          <Filter size={18} />
          <span className="text-sm font-medium">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
          {isFiltersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Mobile filters dropdown */}
      {isFiltersOpen && (
        <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-4 py-3 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-3 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="createdAt">Sort by Newest</option>
              <option value="updatedAt">Sort by Recently Updated</option>
            </select>
          </div>
        </div>
      )}

      {/* Active filters chips */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 font-medium">Active filters:</span>
            
            {searchTerm && (
              <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                <span>Search: "{searchTerm}"</span>
                <button
                  onClick={() => handleSearchChange("")}
                  className="hover:bg-green-200 rounded-full p-1"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedCategory && selectedCategory !== "All" && (
              <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                <span>Category: {getCategoryName(selectedCategory)}</span>
                <button
                  onClick={() => handleCategoryChange("All")}
                  className="hover:bg-blue-200 rounded-full p-1"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {sortBy && sortBy !== "name" && (
              <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                <span>Sort: {getSortName(sortBy)}</span>
                <button
                  onClick={() => handleSortChange("name")}
                  className="hover:bg-purple-200 rounded-full p-1"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {activeFiltersCount > 1 && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1 hover:bg-red-50 rounded-full transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
