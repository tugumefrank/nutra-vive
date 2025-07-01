"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Target,
  Heart,
  Scale,
  Ruler,
  TrendingUp,
  AlertTriangle,
  Utensils,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface HealthMetricsProps {
  consultation: {
    healthInfo: {
      currentWeight: number;
      goalWeight: number;
      height: string;
      activityLevel: string;
      dietaryRestrictions: string[];
      allergies: string;
      medicalConditions: string;
      currentMedications: string;
      previousDietExperience: string;
    };
    goalsAndLifestyle: {
      primaryGoals: string[];
      motivationLevel: number;
      biggestChallenges: string[];
      currentEatingHabits: string;
      mealPrepExperience: string;
      cookingSkills: string;
      budgetRange: string;
    };
  };
}

export function HealthMetrics({ consultation }: HealthMetricsProps) {
  const { healthInfo, goalsAndLifestyle } = consultation;
  
  const weightGoalProgress = (() => {
    if (!healthInfo.currentWeight || !healthInfo.goalWeight) return 0;
    const difference = Math.abs(healthInfo.currentWeight - healthInfo.goalWeight);
    const progress = Math.min((1 - difference / healthInfo.currentWeight) * 100, 100);
    return Math.max(progress, 5); // Minimum 5% to show some progress
  })();

  const getActivityLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "sedentary":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "lightly-active":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "moderately-active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "very-active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getMotivationColor = (level: number) => {
    if (level >= 8) return "text-green-600";
    if (level >= 6) return "text-yellow-600";
    if (level >= 4) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Health & Wellness Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weight & Goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Weight Progress
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Current</span>
                <span className="font-medium">{healthInfo.currentWeight || 'N/A'} kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Goal</span>
                <span className="font-medium">{healthInfo.goalWeight || 'N/A'} kg</span>
              </div>
              <Progress value={weightGoalProgress} className="h-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {weightGoalProgress.toFixed(0)}% towards goal
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Physical Stats
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Height</span>
                <span className="font-medium">{healthInfo.height || 'Not specified'}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-600 dark:text-gray-400">Activity Level</span>
                <Badge className={`text-xs ${getActivityLevelColor(healthInfo.activityLevel)}`}>
                  {healthInfo.activityLevel?.replace('-', ' ') || 'Not specified'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Goals & Motivation */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Primary Goals
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {goalsAndLifestyle.primaryGoals?.length > 0 ? (
              goalsAndLifestyle.primaryGoals.map((goal, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {goal.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">No goals specified</span>
            )}
          </div>
        </div>

        {/* Motivation Level */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Motivation Level
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={(goalsAndLifestyle.motivationLevel || 0) * 10} className="flex-1 h-2" />
            <span className={`text-sm font-bold ${getMotivationColor(goalsAndLifestyle.motivationLevel || 0)}`}>
              {goalsAndLifestyle.motivationLevel || 0}/10
            </span>
          </div>
        </div>

        {/* Dietary Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Dietary Information
            </span>
          </div>
          <div className="space-y-2">
            {healthInfo.dietaryRestrictions?.length > 0 && (
              <div>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Restrictions:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {healthInfo.dietaryRestrictions.map((restriction, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-orange-50 text-orange-700">
                      {restriction}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {healthInfo.allergies && (
              <div>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Allergies:</span>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{healthInfo.allergies}</p>
              </div>
            )}

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Cooking Skills</span>
              <Badge variant="outline" className="text-xs">
                {goalsAndLifestyle.cookingSkills?.replace('-', ' ') || 'Not specified'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Meal Prep Experience</span>
              <Badge variant="outline" className="text-xs">
                {goalsAndLifestyle.mealPrepExperience?.replace('-', ' ') || 'Not specified'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        {(healthInfo.medicalConditions || healthInfo.currentMedications) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Medical Information
              </span>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg space-y-2">
              {healthInfo.medicalConditions && (
                <div>
                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">Conditions:</span>
                  <p className="text-sm text-red-700 dark:text-red-300">{healthInfo.medicalConditions}</p>
                </div>
              )}
              {healthInfo.currentMedications && (
                <div>
                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">Medications:</span>
                  <p className="text-sm text-red-700 dark:text-red-300">{healthInfo.currentMedications}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Challenges */}
        {goalsAndLifestyle.biggestChallenges?.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Biggest Challenges
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {goalsAndLifestyle.biggestChallenges.map((challenge, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                  {challenge.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}