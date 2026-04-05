/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Esta línea es el secreto para que pase los 33 segundos:
  images: { unoptimized: true }
};

export default nextConfig;
