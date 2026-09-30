import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Custom domain (theworldnews.app) serves from root, no basePath needed
};

export default nextConfig;
