/** @type {import('next').NextConfig} */
import withPWA from "@ducanh2912/next-pwa";

/**
 * PWA: @ducanh2912/next-pwa
 * - Onderhouden fork, werkt met Next.js App Router en Workbox.
 * - Service worker alleen in production (disable in development).
 * - API routes: NetworkOnly (geen gevoelige data cachen).
 * - Pagina's: NetworkFirst (updates doorkomen).
 * - Static assets: CacheFirst.
 */
const pwa = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  extendDefaultRuntimeCaching: false,
  workboxOptions: {
    runtimeCaching: [
      // 1) API: no cache (privacy – geen responses/antwoorden cachen)
      {
        urlPattern: ({ sameOrigin, url }) => sameOrigin && url.pathname.startsWith("/api/"),
        handler: "NetworkOnly",
      },
      // 2) _next/static (JS, CSS chunks): cache-first
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static",
          expiration: { maxEntries: 64, maxAgeSeconds: 365 * 24 * 60 * 60 },
        },
      },
      // 3) Images & fonts: cache-first
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|ico|webp|gif|woff2?|ttf|eot|otf)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets",
          expiration: { maxEntries: 64, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
      // 4) RSC prefetch
      {
        urlPattern: ({ request, url, sameOrigin }) =>
          sameOrigin &&
          !url.pathname.startsWith("/api/") &&
          request.headers.get("RSC") === "1" &&
          request.headers.get("Next-Router-Prefetch") === "1",
        handler: "NetworkFirst",
        options: {
          cacheName: "pages-rsc-prefetch",
          expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
          networkTimeoutSeconds: 10,
        },
      },
      // 5) RSC (server components)
      {
        urlPattern: ({ request, url, sameOrigin }) =>
          sameOrigin && !url.pathname.startsWith("/api/") && request.headers.get("RSC") === "1",
        handler: "NetworkFirst",
        options: {
          cacheName: "pages-rsc",
          expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
          networkTimeoutSeconds: 10,
        },
      },
      // 6) Same-origin document/navigation (HTML): network-first
      {
        urlPattern: ({ url, sameOrigin }) => sameOrigin && !url.pathname.startsWith("/api/"),
        handler: "NetworkFirst",
        options: {
          cacheName: "pages",
          expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
          networkTimeoutSeconds: 10,
        },
      },
      // 7) Cross-origin (fonts, etc.)
      {
        urlPattern: ({ sameOrigin }) => !sameOrigin,
        handler: "NetworkFirst",
        options: {
          cacheName: "cross-origin",
          expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 },
          networkTimeoutSeconds: 10,
        },
      },
    ],
  },
});

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default pwa(nextConfig);
