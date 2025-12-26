// next.config.mjs
import path from "path";
import { fileURLToPath } from "url";
/** @type {import('next').NextConfig} */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  // Explicitly set Turbopack workspace root to the `web` folder to avoid
  // warnings when multiple lockfiles exist in the repository root.
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      // WP uploads (adjust host if yours differs)
      { protocol: "https", hostname: "cms.simple-deutsch.de", pathname: "/wp-content/uploads/**" },
    ],
  },
};

export default nextConfig;
