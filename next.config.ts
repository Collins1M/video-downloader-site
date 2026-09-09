import type { NextConfig } from "next";
import { buildSecurityHeaders } from "./security-headers";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    testProxy: true,
    exposeTestingApiInProductionBuild: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: buildSecurityHeaders(),
      },
    ];
  },
};

export default nextConfig;
