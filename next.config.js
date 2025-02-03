/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  images: {
    domains: [
      'images.unsplash.com',
      'lh3.googleusercontent.com', // For Google OAuth profile images
      'avatars.githubusercontent.com', // For GitHub profile images
    ],
  },
}

module.exports = nextConfig 