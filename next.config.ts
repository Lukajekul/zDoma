import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components (and Partial Prefetching, which needs it) are off: they hang
  // on Cloudflare Workers with @opennextjs/cloudflare 1.20 (T-12). Turn them back
  // on when https://github.com/opennextjs/opennextjs-cloudflare/pull/1318 lands.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
