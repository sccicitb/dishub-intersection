/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://103.30.195.159:8080/api/:path*'
      }
    ]
  },
  webpack(config, { dev, isServer }) {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 500,
        aggregateTimeout: 200,
        ignored: ['**/node_modules', '**/.next', '**/public'],
      };
    }
    return config;
  },
}
export const experimental = {
  turbo: false, 
};

export default nextConfig
