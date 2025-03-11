/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone output for better performance
  output: 'standalone',
  
  // Image optimization settings
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Disable ESLint during build process for deployment
  eslint: {
    // Only run ESLint in development, not during builds
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript checking during build process for deployment
  typescript: {
    // Only run TypeScript checks in development, not during builds
    ignoreBuildErrors: true,
  },
  
  // Ensure proper handling of API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
