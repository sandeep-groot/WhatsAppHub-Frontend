/**
 * next.config.ts - Next.js configuration
 * Add your proxy/redirects/headers here
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
