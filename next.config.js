/** @type {import('next').NextConfig} */
const backendHost = process.env.BACKEND_HOST || 'http://127.0.0.1:8001'

const nextConfig = {
  env: {
    DJANGO_BACKEND_URL: process.env.DJANGO_BACKEND_URL || '',
  },
  async rewrites() {
    return [
      {
        source: '/admin/:path*',
        destination: `${backendHost}/admin/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
