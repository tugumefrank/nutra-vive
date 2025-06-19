import { create } from "zustand";
import { Product, Category } from "@/lib/db/schema";
import { ProductFilters, SearchResult } from "@/types";

interface SearchStore {
  // Search state
  query: string;
  filters: ProductFilters;
  results: SearchResult | null;
  isSearching: boolean;
  recentSearches: string[];

  // Search actions
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<ProductFilters>) => void;
  clearFilters: () => void;
  setResults: (results: SearchResult) => void;
  setIsSearching: (isSearching: boolean) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  // Quick search
  quickSearchResults: Product[];
  setQuickSearchResults: (results: Product[]) => void;
  clearQuickSearch: () => void;
}

const useSearchStore = create<SearchStore>((set, get) => ({
  // Initial state
  query: "",
  filters: {},
  results: null,
  isSearching: false,
  recentSearches: [],
  quickSearchResults: [],

  // Search actions
  setQuery: (query: string) => {
    set({ query });
  },

  setFilters: (newFilters: Partial<ProductFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  setResults: (results: SearchResult) => {
    set({ results });
  },

  setIsSearching: (isSearching: boolean) => {
    set({ isSearching });
  },

  addRecentSearch: (query: string) => {
    if (!query.trim()) return;

    set((state) => {
      const trimmedQuery = query.trim();
      const filtered = state.recentSearches.filter(
        (search) => search !== trimmedQuery
      );
      return {
        recentSearches: [trimmedQuery, ...filtered].slice(0, 10), // Keep only last 10
      };
    });
  },

  clearRecentSearches: () => {
    set({ recentSearches: [] });
  },

  setQuickSearchResults: (results: Product[]) => {
    set({ quickSearchResults: results });
  },

  clearQuickSearch: () => {
    set({ quickSearchResults: [] });
  },
}));

export default useSearchStore;
