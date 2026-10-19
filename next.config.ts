import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // The dev-only route badge overlapped the "Draft preview" pill and the Studio save bar.
  // Compile/runtime errors still appear in the dev overlay.
  devIndicators: false,
  partialPrefetching: true,
  poweredByHeader: false,
  // Baseline security headers on every response. Vercel adds HSTS itself. A full
  // Content-Security-Policy needs per-request nonces, so it lands with the Stripe
  // and video integrations (see README, "Production checklist").
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Payment stays available to Stripe's frames for Apple Pay and Google Pay.
          { key: "Permissions-Policy", value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com")' },
        ],
      },
    ];
  },
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
