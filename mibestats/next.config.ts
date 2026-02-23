import type { NextConfig } from 'next'

const cspHeader = `
  default-src 'self';
  img-src 'self' https://mibera.fsn1.your-objectstorage.com data: blob:;
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://rpc.berachain.com https://api-mainnet.magiceden.dev https://*.walletconnect.com wss://*.walletconnect.com https://*.walletconnect.org;
  font-src 'self';
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
`

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mibera.fsn1.your-objectstorage.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
