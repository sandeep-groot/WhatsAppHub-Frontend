/**
 * next.config.ts - Next.js configuration
 * Add your proxy/redirects/headers here
 */

import type { NextConfig } from "next";

const API_PROXY_TARGET = (process.env.API_PROXY_TARGET ?? "http://localhost:5000").replace(
  /\/$/,
  "",
);

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/v1/:path*",
        destination: `${API_PROXY_TARGET}/v1/:path*`,
      },
    ];
  },
  reactStrictMode: true,
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
