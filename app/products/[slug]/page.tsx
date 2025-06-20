// app/products/[slug]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/products/product-gallery";

import AddToCartButton from "@/components/products/add-to-cart-button";
import NutritionFacts from "@/components/products/nutrition-facts";
import ProductReviews from "@/components/products/product-reviews";
import RelatedProducts from "@/components/products/related-products";
import FloatingElements from "@/components/animations/floating-elements";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Star, Shield, Truck, RefreshCw, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getProductBySlug,
  getProducts,
} from "@/lib/actions/productserverActions";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} | Nutra-Vive`,
    description:
      product.metaDescription ||
      product.shortDescription ||
      product.description,
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description,
      images: product.images.map((img) => ({ url: img })),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Get related products (same category, excluding current product)
  const relatedProductsData = await getProducts({
    category: product.category?._id,
    isActive: true,
    limit: 4,
  });
  const relatedProducts = relatedProductsData.products
    .filter((p) => p._id !== product._id)
    .map((p) => ({
      ...p,
      category:
        p.category && typeof p.category !== "string"
          ? { name: p.category.name, slug: p.category.slug }
          : undefined,
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Floating 3D Elements */}
      <FloatingElements />

      <div className="container mx-auto px-4 py-8 lg:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <a href="/" className="hover:text-primary transition-colors">
            Home
          </a>
          <span>/</span>
          <a href="/products" className="hover:text-primary transition-colors">
            Products
          </a>
          <span>/</span>
          {product.category && typeof product.category !== "string" && (
            <>
              <span className="text-primary">{product.category.name}</span>
              <span>/</span>
            </>
          )}
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
          {/* Product Gallery */}
          <div className="space-y-4">
            <ProductGallery
              images={product.images}
              productName={product.name}
              className="lg:sticky lg:top-8"
            />
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Category & Tags */}
            <div className="flex flex-wrap gap-2">
              {product.category && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                >
                  {product.category.name}
                </Badge>
              )}
              {product.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="border-green-200 text-green-700 dark:border-green-700 dark:text-green-300"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Product Title */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h1>
              {product.shortDescription && (
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {product.shortDescription}
                </p>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-5 w-5",
                      i < Math.floor(product.averageRating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {product.averageRating.toFixed(1)} ({product.reviewCount}{" "}
                reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice &&
                product.compareAtPrice > product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    ${product.compareAtPrice.toFixed(2)}
                  </span>
                )}
            </div>

            {/* Add to Cart */}
            <div className="space-y-4">
              <AddToCartButton
                productId={product._id}
                className="w-full h-14 text-lg font-semibold"
              />

              {/* Quick Actions */}
              <div className="flex space-x-4">
                <button className="flex-1 flex items-center justify-center space-x-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors">
                  <Heart className="h-5 w-5" />
                  <span>Add to Favorites</span>
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center text-center space-y-2">
                <Shield className="h-8 w-8 text-green-600" />
                <span className="text-sm font-medium">100% Natural</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <Truck className="h-8 w-8 text-blue-600" />
                <span className="text-sm font-medium">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <RefreshCw className="h-8 w-8 text-purple-600" />
                <span className="text-sm font-medium">30-Day Return</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <Star className="h-8 w-8 text-yellow-600" />
                <span className="text-sm font-medium">Premium Quality</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-green-200 dark:border-green-700 mb-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="description" className="mt-0">
                <div className="prose prose-green max-w-none dark:prose-invert">
                  <p className="text-lg leading-relaxed">
                    {product.description}
                  </p>

                  {product.features && product.features.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold mb-4">
                        Key Features
                      </h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {product.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="ingredients" className="mt-0">
                <div>
                  <h3 className="text-xl font-semibold mb-6">Ingredients</h3>
                  {product.ingredients && product.ingredients.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.ingredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                        >
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-gray-900 dark:text-gray-100 font-medium">
                            {ingredient}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">
                      Ingredient information will be updated soon.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="nutrition" className="mt-0">
                <NutritionFacts nutritionFacts={product.nutritionFacts} />
              </TabsContent>

              <TabsContent value="reviews" className="mt-0">
                <ProductReviews productId={product._id} />
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              You Might Also Like
            </h2>
            <RelatedProducts products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  );
}
