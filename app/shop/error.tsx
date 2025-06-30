// app/shop/error.tsx
"use client";

import { useEffect } from "react";
import { LandingLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Shop page error:", error);
  }, [error]);

  return (
    <LandingLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center px-4 py-16">
          <div className="max-w-md mx-auto">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 p-4 rounded-full">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Oops! Something went wrong
            </h1>

            <p className="text-gray-600 mb-2">
              We encountered an issue while loading the shop.
            </p>

            {process.env.NODE_ENV === "development" && (
              <details className="mt-4 mb-6">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs text-left bg-gray-100 p-3 rounded-lg overflow-auto max-h-32">
                  {error.message}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Button
                onClick={reset}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="border-green-600 text-green-600 hover:bg-green-50 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                Go Home
              </Button>
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                If this problem persists, please{" "}
                <a
                  href="/contact"
                  className="text-green-600 hover:text-green-700 underline"
                >
                  contact our support team
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
