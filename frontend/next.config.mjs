/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://103.30.195.159:8080/api/:path*' // target backend kamu
      }
    ]
  },
  devIndicators: false
}

export default nextConfig
