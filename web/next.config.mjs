const IS_PRODUCTION = process.env.NODE_ENV === "production";

function buildCsp() {
  const scriptSrc = ["'self'", "'unsafe-inline'"];
  if (!IS_PRODUCTION) {
    scriptSrc.push("'unsafe-eval'");
  }

  const styleSrc = ["'self'", "'unsafe-inline'"];
  const imgSrc = ["'self'", "data:", "https:"];
  const fontSrc = ["'self'", "data:"];
  const connectSrc = ["'self'", "https://cms.simple-deutsch.de"];
  const frameSrc = ["'self'"];

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    `script-src-elem ${scriptSrc.join(" ")}`,
    `style-src ${styleSrc.join(" ")}`,
    `img-src ${imgSrc.join(" ")}`,
    `font-src ${fontSrc.join(" ")}`,
    `connect-src ${connectSrc.join(" ")}`,
    `frame-src ${frameSrc.join(" ")}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

const CONTENT_SECURITY_POLICY = buildCsp();

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Enable streaming and concurrent features for better performance
  experimental: {
    // Inline per-page CSS into the HTML response to eliminate the render-blocking
    // stylesheet request. Saves ~130 ms on the critical path (LCP / FCP).
    inlineCss: true,
    // Tree-shake re-exported symbols from these packages to avoid pulling
    // in full modules when only a few named exports are used.
    optimizePackageImports: ["next/dist/client/components/error-boundary"],
    // Prevent Next.js from injecting legacy polyfills for modern baseline APIs
    // that are already covered by the browserslist targets (Chrome 93+, Safari 15.4+)
    legacyBrowsersSupport: false,
  },
  images: {
    remotePatterns: [
      // WP uploads (adjust host if yours differs)
      { protocol: "https", hostname: "cms.simple-deutsch.de", pathname: "/wp-content/uploads/**" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 year
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
  webpack: (config, { dev }) => {
    // Tell Webpack the target environment supports modern JS natively
    // so it skips polyfills for Array.at, Object.fromEntries, etc.
    if (!dev) {
      config.output = {
        ...config.output,
        environment: {
          arrowFunction: true,
          bigIntLiteral: true,
          const: true,
          destructuring: true,
          dynamicImport: true,
          forOf: true,
          module: true,
          optionalChaining: true,
          templateLiteral: true,
        },
      };
    }
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
            value: CONTENT_SECURITY_POLICY,
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
