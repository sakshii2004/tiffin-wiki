import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // 'unsafe-inline' is required for Next.js's injected hydration/bootstrap
      // scripts. This CSP INTENTIONALLY OMITS 'unsafe-eval' — Next.js 16 App
      // Router does not require it. If the build/runtime fails due to eval usage
      // in a dependency, identify and address the specific package rather than
      // re-adding 'unsafe-eval' (which would materially weaken XSS protection).
      // A future hardening pass can replace 'unsafe-inline' with a nonce-based
      // CSP (Next.js supports per-request nonces via middleware) — out of scope
      // for the MVP.
      //
      // 'unsafe-eval' is added in development ONLY: React's dev mode uses eval()
      // for debugging features (e.g. reconstructing callstacks). It is never
      // emitted in production builds, preserving XSS hardening.
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.tiffin.wiki https://lh3.googleusercontent.com https://*.r2.dev",
      `connect-src 'self' ws: wss: https://*.r2.cloudflarestorage.com${isDev ? " http: https:" : ""}`,
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.tiffin.wiki",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
        port: "",
        pathname: "/**",
      },
    ],
  },
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.*",
    "10.*",
    "172.16.*",
  ],
};

export default nextConfig;
