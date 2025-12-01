import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone', // important for serverless deploys like Vercel
  eslint: {
    ignoreDuringBuilds: true, // avoids build errors from linting
  },
  experimental: {
    typedRoutes: true, // optional, useful if you want typed route paths
  },
}

export default nextConfig
