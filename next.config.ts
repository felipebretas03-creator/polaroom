import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore - Next.js config might not have the type updated yet
  allowedDevOrigins: ["172.22.80.1"],
};

export default nextConfig;
