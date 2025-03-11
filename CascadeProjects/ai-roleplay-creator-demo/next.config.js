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
