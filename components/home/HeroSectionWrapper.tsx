import { Suspense } from "react";
import { getHeroProducts } from "@/lib/actions/heroProductsServerActions";
import ModernHeroSlider from "./HeroSection";

// Loading skeleton for hero section
function HeroSkeleton() {
  return (
    <section className="relative min-h-screen lg:min-h-[80vh] flex items-center justify-center overflow-hidden pt-20 lg:pt-0">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-600 to-green-700 animate-pulse" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8 animate-pulse">
              <div className="w-24 h-4 bg-white/40 rounded" />
            </div>
            <div className="mb-8">
              <div className="w-full h-12 bg-white/20 rounded mb-4 animate-pulse" />
              <div className="w-3/4 h-12 bg-white/20 rounded animate-pulse" />
            </div>
            <div className="w-full h-6 bg-white/20 rounded mb-8 animate-pulse" />
            <div className="flex gap-4 mb-8">
              <div className="w-20 h-8 bg-white/20 rounded-full animate-pulse" />
              <div className="w-24 h-8 bg-white/20 rounded-full animate-pulse" />
              <div className="w-16 h-8 bg-white/20 rounded-full animate-pulse" />
            </div>
            <div className="w-40 h-12 bg-white/20 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-12 shadow-2xl max-w-lg animate-pulse">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-xl mx-auto mb-8" />
                <div className="w-48 h-8 bg-gray-200 rounded mx-auto mb-4" />
                <div className="w-24 h-6 bg-gray-200 rounded mx-auto mb-6" />
                <div className="w-32 h-10 bg-gray-200 rounded mx-auto mb-8" />
                <div className="w-full h-12 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Server component that fetches products
async function HeroSectionServer() {
  const products = await getHeroProducts();
  return <ModernHeroSlider products={products} />;
}

// Main exported component with Suspense
export default function HeroSectionWrapper() {
  return (
    <Suspense fallback={<HeroSkeleton />}>
      <HeroSectionServer />
    </Suspense>
  );
}