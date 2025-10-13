// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // WP uploads (adjust host if yours differs)
      { protocol: "https", hostname: "cms.simple-deutsch.de", pathname: "/wp-content/uploads/**" },
    ],
  },
};
export default nextConfig;
