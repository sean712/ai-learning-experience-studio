/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  reactStrictMode: true,
  // Disable experimental features that might cause issues
  experimental: {
    turbo: false,
    serverActions: true
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
