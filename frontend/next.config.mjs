/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
      return [
        {
          source: '/',          // The source path
          destination: '/home', // The destination path
          permanent: true,      // Use 'true' for a permanent redirect (308) or 'false' for a temporary redirect (307)
        },
      ];
    },

    async rewrites() {
      return [
        {
          source: '/images/:path*',
          destination: 'http://localhost:5037/images/:path*', // Địa chỉ của backend phục vụ hình ảnh
        },
      ];
    },
  };
  
  export default nextConfig;
  