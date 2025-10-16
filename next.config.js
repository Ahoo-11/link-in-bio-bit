/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'linkchain.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
