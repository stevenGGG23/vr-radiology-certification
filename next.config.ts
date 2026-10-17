import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // The dev-only route badge overlapped the "Draft preview" pill and the Studio save bar.
  // Compile/runtime errors still appear in the dev overlay.
  devIndicators: false,
  partialPrefetching: true,
  // Two domains, one project: sonosusvr.org is the education site, and the
  // home page of sonosusvr.com shows the Virtual Response On Call landing page.
  async rewrites() {
    return {
      beforeFiles: ["sonosusvr.com", "www.sonosusvr.com"].map((host) => ({
        source: "/",
        has: [{ type: "host" as const, value: host }],
        destination: "/on-call",
      })),
    };
  },
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
