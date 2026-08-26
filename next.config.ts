import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: true,
});

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Sentry CSP violation reporting endpoint
// Source: sentry.io → Settings → Security Headers
const SENTRY_CSP_REPORT_URI =
  "https://o4518243603087836.ingest.de.sentry.io/api/4518243670845456/security/?sentry_key=27a7b957764600f09945cc2f6e6b2ea7";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      process.env.NODE_ENV === "development"
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        // TODO: Implement nonce-based CSP via middleware to remove 'unsafe-inline'.
        // Next.js generates non-deterministic inline scripts for chunk loading,
        // requiring 'unsafe-inline' unless a nonce is passed to all <Script> tags.
        // Yandex.Metrica and Baidu Tongji scripts are loaded via the admin Plugins
        // system (position=HEAD) — their domains are allowlisted here but the
        // scripts themselves are never hard-coded in source.
        : "script-src 'self' 'unsafe-inline' https://mc.yandex.ru https://mc.yandex.com https://hm.baidu.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://*.supabase.co https://img.youtube.com https://i.ytimg.com https://drive.google.com https://lh3.googleusercontent.com",
      "media-src 'self' blob: https://res.cloudinary.com https://www.youtube.com",
      "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com https://drive.google.com https://www.facebook.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co https://api.resend.com https://api.cloudinary.com https://*.upstash.io https://ip-api.com https://*.sentry.io https://o*.ingest.sentry.io https://js-de.sentry-cdn.com https://mc.yandex.ru https://mc.yandex.com https://hm.baidu.com https://sp1.baidu.com",
      "worker-src blob:",
      "form-action 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      // CSP violation reporting to Sentry
      `report-uri ${SENTRY_CSP_REPORT_URI}`,
    ].join("; "),
  },
  // Structured CSP reporting (Reporting API v1)
  {
    key: "Report-To",
    value: JSON.stringify({
      group: "csp-endpoint",
      max_age: 86400,
      endpoints: [{ url: SENTRY_CSP_REPORT_URI }],
    }),
  },
];

const nextConfig: NextConfig = {
  experimental: {
    cpus: 2,
  },
  images: {
    localPatterns: [
      { pathname: '/certificates/**' },
      { pathname: '/images/**' },
    ],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin/login",
        permanent: false,
      },
    ];
  },

  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default withSentryConfig(withBundleAnalyzer(withNextIntl(nextConfig)), {
  // Sentry organization and project
  org: "calendula-herbs-spices-for-exp",
  project: "calendula-herbs",

  // Upload source maps for readable stack traces
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Silent mode to avoid noisy build logs
  silent: !process.env.CI,

  // Disable Sentry SDK tree-shaking telemetry
  telemetry: false,

  // Auto-instrument Next.js routes and API handlers
  autoInstrumentServerFunctions: true,
  autoInstrumentMiddleware: true,
  autoInstrumentAppDirectory: true,
});
