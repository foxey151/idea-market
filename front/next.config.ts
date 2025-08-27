import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons"],
  },
};

export default nextConfig;
