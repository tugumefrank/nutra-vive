// components/products/nutrition-facts.tsx
"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface NutritionFactsProps {
  nutritionFacts?: {
    servingSize?: string;
    calories?: number;
    totalFat?: string;
    sodium?: string;
    totalCarbs?: string;
    sugars?: string;
    protein?: string;
    vitaminC?: string;
    [key: string]: string | number | undefined;
  };
}

const nutritionItems = [
  { key: "calories", label: "Calories", unit: "", highlight: true },
  { key: "totalFat", label: "Total Fat", unit: "g" },
  { key: "sodium", label: "Sodium", unit: "mg" },
  { key: "totalCarbs", label: "Total Carbohydrates", unit: "g" },
  { key: "sugars", label: "Sugars", unit: "g" },
  { key: "protein", label: "Protein", unit: "g", highlight: true },
  { key: "vitaminC", label: "Vitamin C", unit: "% DV" },
];

export default function NutritionFacts({
  nutritionFacts,
}: NutritionFactsProps) {
  if (!nutritionFacts) {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="text-6xl">🍃</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Nutrition Information Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            We're working on providing detailed nutritional information for this
            product.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Nutrition Facts
        </h3>
      </motion.div>

      <Card className="max-w-md mx-auto bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-gray-200">
        <div className="p-6">
          {/* Title */}
          <div className="text-center border-b-8 border-gray-900 dark:border-gray-200 pb-2 mb-4">
            <h4 className="text-2xl font-black text-gray-900 dark:text-white">
              Nutrition Facts
            </h4>
          </div>

          {/* Serving Size */}
          {nutritionFacts.servingSize && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Serving Size:{" "}
                <span className="font-bold">{nutritionFacts.servingSize}</span>
              </div>
            </motion.div>
          )}

          <Separator className="my-4 border-gray-400" />

          {/* Nutrition Items */}
          <div className="space-y-2">
            {nutritionItems.map((item, index) => {
              const value = nutritionFacts[item.key];
              if (!value) return null;

              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={cn(
                    "flex justify-between items-center py-1",
                    item.highlight &&
                      "bg-green-50 dark:bg-green-900/20 px-2 rounded",
                    index < nutritionItems.length - 1 &&
                      "border-b border-gray-200 dark:border-gray-600"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm",
                      item.highlight
                        ? "font-bold text-gray-900 dark:text-white"
                        : "font-medium text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "text-sm",
                      item.highlight
                        ? "font-bold text-gray-900 dark:text-white"
                        : "font-medium text-gray-900 dark:text-white"
                    )}
                  >
                    {typeof value === "number" ? value : value}
                    {item.unit}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Daily Value Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 pt-4 border-t border-gray-400"
          >
            <p className="text-xs text-gray-600 dark:text-gray-400">
              * Percent Daily Values are based on a 2,000 calorie diet.
            </p>
          </motion.div>

          {/* Decorative Elements */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-15 animate-pulse delay-1000"></div>
        </div>
      </Card>

      {/* Health Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
      >
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <div className="text-center">
            <div className="text-2xl mb-2">💪</div>
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">
              Energy Boost
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              Natural energy from wholesome ingredients
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <div className="text-center">
            <div className="text-2xl mb-2">🛡️</div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
              Antioxidants
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Rich in vitamins and minerals
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <div className="text-center">
            <div className="text-2xl mb-2">🌿</div>
            <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">
              All Natural
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              No artificial additives or preservatives
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
