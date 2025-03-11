/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV !== 'production',
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
