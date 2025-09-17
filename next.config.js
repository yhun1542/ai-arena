// next.config.js
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "img-src 'self' data: https:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Next.js 인라인 스크립트 지원
      "style-src 'self' 'unsafe-inline'",  // CSS-in-JS 지원
      "connect-src 'self' https: wss:",  // API 및 웹소켓
      "font-src 'self' data:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; '),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 이미지 최적화 설정 (BP 점수 향상)
  images: {
    domains: ['ai-arena.vercel.app', 'jasoneye.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // 보안 헤더 적용
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  
  // 도메인 전환 대비 리다이렉트 준비
  async redirects() {
    const isProduction = process.env.NODE_ENV === 'production';
    const domain = process.env.NEXT_PUBLIC_DOMAIN || 'ai-arena.vercel.app';
    
    // T-011 도메인 전환 시 활성화
    if (isProduction && domain === 'jasoneye.com') {
      return [
        {
          source: '/:path*',
          has: [{ type: 'host', value: 'www.jasoneye.com' }],
          destination: 'https://jasoneye.com/:path*',
          permanent: true,
        },
      ];
    }
    
    return [];
  },
  
  // 빌드 최적화
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },  
};

module.exports = nextConfig;
