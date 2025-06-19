"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock search data
const trendingSearches = [
  "Green Detox",
  "Matcha Latte",
  "Herbal Tea",
  "Immune Support",
];
const recentSearches = ["Strawberry Hibiscus", "Cold Pressed", "Energy Boost"];

const mockResults = [
  {
    id: "1",
    name: "Green Detox Elixir",
    price: 12.99,
    image:
      "https://images.unsplash.com/photo-1556881286-fc6915169721?w=80&h=80&fit=crop",
    category: "Cold Pressed Juices",
  },
  {
    id: "2",
    name: "Strawberry Hibiscus Tea",
    price: 8.89,
    image:
      "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=80&h=80&fit=crop",
    category: "Herbal Teas",
  },
  {
    id: "3",
    name: "Matcha Zen Latte",
    price: 10.5,
    image:
      "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=80&h=80&fit=crop",
    category: "Specialty Drinks",
  },
];

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 2) {
      setIsSearching(true);
      // Simulate search delay
      const timer = setTimeout(() => {
        setSearchResults(
          mockResults.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-background/95 backdrop-blur-lg border border-white/10">
        <DialogHeader className="p-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search products, categories, or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 h-12 text-lg bg-muted/50 border-none focus:bg-background transition-colors"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto">
          <AnimatePresence mode="wait">
            {searchQuery.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 pt-0"
              >
                {/* Trending Searches */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-brand-500" />
                    <span className="text-sm font-medium">Trending</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((term) => (
                      <Badge
                        key={term}
                        variant="secondary"
                        className="cursor-pointer hover:bg-brand-100 transition-colors"
                        onClick={() => setSearchQuery(term)}
                      >
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Recent Searches */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Recent</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <Badge
                        key={term}
                        variant="outline"
                        className="cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => setSearchQuery(term)}
                      >
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : isSearching ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 pt-0 text-center"
              >
                <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">
                  Searching...
                </p>
              </motion.div>
            ) : searchResults.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 pt-0"
              >
                <div className="space-y-3">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/shop/${product.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      onClick={handleClose}
                      className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium group-hover:text-brand-600 transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {product.category}
                        </p>
                      </div>
                      <div className="text-lg font-bold text-brand-600">
                        ${product.price}
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleClose}
                  >
                    <Link
                      href={`/shop?search=${searchQuery}`}
                      className="w-full"
                    >
                      View all results for "{searchQuery}"
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ) : searchQuery.length > 2 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 pt-0 text-center"
              >
                <p className="text-muted-foreground">
                  No results found for "{searchQuery}"
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try searching for products, categories, or ingredients
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
