import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // GitHub Pages deploys under /mor-pdf/ path
  basePath: process.env.GITHUB_PAGES === 'true' ? '/mor-pdf' : '',
  assetPrefix: process.env.GITHUB_PAGES === 'true' ? '/mor-pdf/' : '',
};

export default nextConfig;
