import type { NextConfig } from "next";

const nextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "uploadthing.com",
      "utfs.io",
      "cdn.shopify.com",
      "via.placeholder.com",
      "localhost",
      "utfs.io",
      "ypkhbi098h.ufs.sh",
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors fix.
    ignoreDuringBuilds: true,
  },
  // Disable React StrictMode to prevent double rendering in development
  reactStrictMode: false,
  
  // Configure experimental features for dev tunnels
  experimental: {
    // Allow server actions to work with dev tunnels
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.devtunnels.ms"],
    },
  },
};

module.exports = nextConfig;
