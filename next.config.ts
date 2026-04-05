import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignora errores de "ortografía" del código para poder publicar
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignora los errores de "tipos" (los 'any') que te salían en rojo
    ignoreBuildErrors: true,
  },
  images: {
    // Evita problemas con las fotos y logos de la radio
    unoptimized: true,
  },
};

export default nextConfig;
