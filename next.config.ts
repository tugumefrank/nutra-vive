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
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
