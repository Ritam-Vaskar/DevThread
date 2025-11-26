/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'avatars.githubusercontent.com'],
  },
  env: {
    NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8080/graphql',
    NEXT_PUBLIC_GRAPHQL_WS_URL: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || 'ws://localhost:8080/graphql',
  },
}

module.exports = nextConfig
