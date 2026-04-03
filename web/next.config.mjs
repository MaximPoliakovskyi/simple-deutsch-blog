const DEV_WATCH_IGNORED = [
  "**/.next/**",
  "**/.tmp/**",
  "**/tsconfig.tsbuildinfo",
  "**/devserver.log",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow cross-origin HMR/dev requests from local network devices (e.g. phone on same Wi-Fi).
  // This is development-only — has no effect in production builds.
  allowedDevOrigins: ["192.168.0.0/16", "10.0.0.0/8", "172.16.0.0/12"],
  // Harden HTTP fingerprint
  poweredByHeader: false,
  reactStrictMode: true,
  // Enable streaming and concurrent features for better performance
  experimental: {
    // Inline per-page CSS into the HTML response to eliminate the render-blocking
    // stylesheet request. Saves ~130 ms on the critical path (LCP / FCP).
    inlineCss: true,
    // Tree-shake re-exported symbols from these packages to avoid pulling
    // in full modules when only a few named exports are used.
    optimizePackageImports: [
      "@vercel/analytics",
      "@vercel/speed-insights",
      "next/dist/client/components/error-boundary",
    ],
  },
  images: {
    remotePatterns: [
      // WP uploads (adjust host if yours differs)
      { protocol: "https", hostname: "cms.simple-deutsch.de", pathname: "/wp-content/uploads/**" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    // Responsive image optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Larger cache for optimized images
    dangerouslyAllowSVG: false,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  // Enable response compression
  compress: true,
  // Optimize bundle analysis
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 1 minute
    pagesBufferLength: 5,
  },
  webpack: (config, { dev }) => {
    if (!dev) return config;

    config.watchOptions = {
      ...(config.watchOptions ?? {}),
      ignored: DEV_WATCH_IGNORED,
      // Optional fallback for unstable file events on some Windows setups.
      ...(process.env.NEXT_WATCH_POLLING === "1"
        ? { poll: Number(process.env.NEXT_WATCH_POLL_INTERVAL ?? 1000), aggregateTimeout: 300 }
        : {}),
    };

    return config;
  },
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://va.vercel-scripts.com https://vercel.live https://cms.simple-deutsch.de; frame-src https://vercel.live; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, stale-while-revalidate=3600",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
