// next.config.mjs
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const DEV_WATCH_IGNORED = [
  "**/.next/**",
  "**/.tmp/**",
  "**/tsconfig.tsbuildinfo",
  "**/devserver.log",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable streaming and concurrent features for better performance
  experimental: {
    optimizePackageImports: ["@vercel/analytics", "@vercel/speed-insights"],
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
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
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
export default withBundleAnalyzer(nextConfig);
