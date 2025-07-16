// components/shop/SearchAndFilters.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

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

  return (
    <div
      className={`bg-white/70 backdrop-blur-md rounded-3xl p-6 mb-8 border border-orange-200/50 transition-opacity duration-200 ${isPending ? "opacity-50" : ""}`}
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
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
            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="px-4 py-3 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
        >
          <option value="All">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="px-4 py-3 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
        >
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="createdAt">Sort by Newest</option>
          <option value="updatedAt">Sort by Recently Updated</option>
        </select>
      </div>
    </div>
  );
}
