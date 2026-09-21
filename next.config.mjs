/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: '.'
  },
  async redirects() {
    // Di production (Vercel), root / diredirect ke /store
    if (process.env.VERCEL === '1') {
      return [
        {
          source: '/',
          destination: '/store',
          permanent: false,
        }
      ];
    }
    return [];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
