import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/db"],
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
  },
  turbopack: {},
};

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default bundleAnalyzer(nextConfig);
