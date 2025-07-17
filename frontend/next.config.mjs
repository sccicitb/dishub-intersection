/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  devIndicators: false,
  async rewrites () {
    return [
      {
        source: '/api/:path*',
        destination: 'http://103.30.195.159:8080/api/:path*'
      }
    ]
  },
}

export default nextConfig
