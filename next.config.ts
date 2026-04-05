import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Esto le dice a Vercel: "Ignorá los errores de ESLint al armar la radio"
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Esto le dice: "Ignorá los errores de tipos al armar"
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
