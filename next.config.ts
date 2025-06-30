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
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
