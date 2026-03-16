import { execSync } from 'child_process'

/** @type {import('next').NextConfig} */

/* Build-time git info — use Vercel env vars if available, fallback to local git */
let gitHash = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev'
let gitDate = new Date().toISOString()
if (gitHash === 'dev') {
  try {
    gitHash = execSync('git rev-parse --short HEAD').toString().trim()
    gitDate = execSync('git log -1 --format=%cI').toString().trim()
  } catch { /* fallback to defaults */ }
}

const cspHeader = `
  default-src 'self';
  img-src 'self' https://gateway.irys.xyz https://uploader.irys.xyz https://ipfs.io https://*.ipfs.dweb.link https://*.basemaps.cartocdn.com https://unavatar.io https://*.unavatar.io https://d163aeqznbc6js.cloudfront.net https://thj-assets.s3.us-west-2.amazonaws.com data: blob:;
  script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ''};
  style-src 'self' 'unsafe-inline';
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://rpc.berachain.com https://api-mainnet.magiceden.dev https://*.walletconnect.com wss://*.walletconnect.com https://*.walletconnect.org https://*.web3modal.org https://*.reown.com wss://*.reown.com https://*.basemaps.cartocdn.com;
  font-src 'self';
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
`

const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'pino-pretty': false,
      '@react-native-async-storage/async-storage': false,
    }
    return config
  },
  env: {
    NEXT_PUBLIC_GIT_HASH: gitHash,
    NEXT_PUBLIC_GIT_DATE: gitDate,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gateway.irys.xyz',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'uploader.irys.xyz',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.ipfs.dweb.link',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'unavatar.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'd163aeqznbc6js.cloudfront.net',
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
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
        ],
      },
    ]
  },
}

export default nextConfig
