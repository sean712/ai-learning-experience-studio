import type { NextConfig } from "next";

// Next.js 15+ configuration
const nextConfig: NextConfig = {
  // Configure output for better compatibility with hosting platforms like Replit
  output: 'standalone',
  
  // Ensure trailing slashes for consistent routing
  trailingSlash: true,
  
  // Properly handle images and assets
  images: {
    unoptimized: true,
  },
  
  // Enable strict mode for better development experience
  reactStrictMode: true,
};

export default nextConfig;
