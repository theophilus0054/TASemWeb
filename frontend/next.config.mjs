/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Proxy API requests to Express backend during development */
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL && process.env.BACKEND_URL !== 'undefined' 
      ? process.env.BACKEND_URL 
      : 'http://localhost:5000';

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
