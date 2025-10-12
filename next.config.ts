import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  // Enable SWC minification for better performance
  swcMinify: true,
  // Optimize production builds
  productionBrowserSourceMaps: false,
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Compress responses
  compress: true,
  // Ignore ESLint errors during build (warnings only)
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Ignore TypeScript errors during build for now
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
