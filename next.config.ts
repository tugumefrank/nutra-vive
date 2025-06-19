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
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
