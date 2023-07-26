/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  reactStrictMode: true,
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'avatar.tobi.sh',
      'cloudflare-ipfs.com',
      'loremflickr.com',
      'lh3.googleusercontent.com'
    ]
  },
  experimental: {
    legacyBrowsers: false,
    browsersListForSwc: true
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
