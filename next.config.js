/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DJANGO_BACKEND_URL: process.env.DJANGO_BACKEND_URL || '',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `http://localhost:8000/api/:path*`,
      },
      {
        source: '/admin/:path*',
        destination: `http://localhost:8000/admin/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
