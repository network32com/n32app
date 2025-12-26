import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase body size limit for server actions (for image uploads)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qdvbnuczkvigadvvjxbs.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Optimize production builds
  productionBrowserSourceMaps: false,
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Compress responses
  compress: true,
  // Ignore ESLint during builds (we run it separately in CI)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // TypeScript type checking
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
