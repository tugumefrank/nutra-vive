"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Smartphone,
  Apple,
  Download,
  Leaf,
  ShoppingCart,
  Truck,
  Star,
} from "lucide-react";
import Link from "next/link";

export default function NutraViveLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 hover-lift group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 via-wellness-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-heading font-bold gradient-text">
              Nutra-Vive
            </span>
          </Link>
          <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
            Download App
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                🌱 All Natural Wellness
              </Badge>
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                Your Wellness Journey
                <span className="block bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                  Starts Here
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Discover premium natural juices, detox teas, and wellness
                beverages. Order fresh, healthy drinks delivered straight to
                your door with our mobile app.
              </p>
            </div>

            {/* Download Buttons */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 text-lg"
                >
                  <Smartphone className="w-6 h-6 mr-3" />
                  Download for Android
                  <Download className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-gray-300 text-gray-500 px-8 py-4 text-lg cursor-not-allowed bg-transparent"
                  disabled
                >
                  <Apple className="w-6 h-6 mr-3" />
                  iOS Coming Soon
                </Button>
              </div>
              <p className="text-sm text-gray-500 flex items-center">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                Join thousands of satisfied customers
              </p>
            </div>
          </div>

          {/* App Screenshots */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-2xl p-2 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-07-19%20at%2010.30.40%20AM-i0JmVK3x1tmSXg4U9cGSLTbnuSQ6jW.jpeg"
                    alt="NutraVive App - Product Search"
                    className="w-full rounded-xl"
                  />
                </div>
                <div className="bg-white rounded-2xl shadow-2xl p-2 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-07-19%20at%2010.30.41%20AM-6lTb1nvoKe11cYBPBG3pXj1Rv3rzCv.jpeg"
                    alt="NutraVive App - Categories"
                    className="w-full rounded-xl"
                  />
                </div>
              </div>
              <div className="mt-8">
                <div className="bg-white rounded-2xl shadow-2xl p-2 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-07-19%20at%208.40.30%20PM-invqbW1XwIEzDidXENE5cqVi09DGBh.jpeg"
                    alt="NutraVive App - Products"
                    className="w-full rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose NutraVive?
            </h2>
            <p className="text-xl text-gray-600">
              Experience the best in natural wellness beverages
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  100% Natural
                </h3>
                <p className="text-gray-600">
                  All our juices and teas are made from premium natural
                  ingredients with no artificial additives or preservatives.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Easy Ordering
                </h3>
                <p className="text-gray-600">
                  Browse our full catalog, customize your orders, and checkout
                  seamlessly with our intuitive mobile app.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Fast Delivery
                </h3>
                <p className="text-gray-600">
                  Get your fresh juices and wellness beverages delivered quickly
                  to your doorstep across multiple countries.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-16 bg-gradient-to-r from-orange-50 to-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Product Categories
            </h2>
            <p className="text-xl text-gray-600">
              Discover our range of wellness beverages
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8 text-center text-white">
                <h3 className="text-2xl font-bold mb-4">DETOX TEA</h3>
                <p className="text-green-100 mb-6">
                  Cleanse and rejuvenate with our premium herbal detox tea
                  blends
                </p>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🍵</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8 text-center text-white">
                <h3 className="text-2xl font-bold mb-4">ICED TEA</h3>
                <p className="text-blue-100 mb-6">
                  Refreshing iced teas perfect for any time of day
                </p>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🧊</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-red-500 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8 text-center text-white">
                <h3 className="text-2xl font-bold mb-4">FRESH JUICES</h3>
                <p className="text-orange-100 mb-6">
                  Cold-pressed juices packed with vitamins and natural goodness
                </p>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🥤</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-600 to-green-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Your Wellness Journey Today
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Download the NutraVive app and discover a world of natural, healthy
            beverages delivered fresh to your door.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            >
              <Smartphone className="w-6 h-6 mr-3" />
              Download for Android
              <Download className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold cursor-not-allowed bg-transparent"
              disabled
            >
              <Apple className="w-6 h-6 mr-3" />
              iOS Coming Soon
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">NutraVive</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">
                © 2024 NutraVive. All rights reserved.
              </p>
              <p className="text-gray-400">Your wellness, our priority.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
