/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXT_PUBLIC_RELAY_SERVER_URL: process.env.NEXT_PUBLIC_RELAY_SERVER_URL,
    NEXT_PUBLIC_USE_AZURE: process.env.NEXT_PUBLIC_USE_AZURE,
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    NEXT_PUBLIC_AZURE_ENDPOINT: process.env.NEXT_PUBLIC_AZURE_ENDPOINT,
    NEXT_PUBLIC_AZURE_DEPLOYMENT: process.env.NEXT_PUBLIC_AZURE_DEPLOYMENT,
  },
  // Add any experimental features or other config options you need
  experimental: {
    // Remove serverActions line since it's enabled by default now
  }
}

export default nextConfig;
