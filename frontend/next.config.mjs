/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_URL || 'http://localhost:9090';

const nextConfig = {
  reactStrictMode: false,
  devIndicators: false,
  async rewrites () {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      }
    ]
  },
}

export default nextConfig
