import type { NextConfig } from "next";

if (
  process.env.NODE_ENV === "production" &&
  !process.env.NEXT_PUBLIC_API_URL
) {
  throw new Error("NEXT_PUBLIC_API_URL must be set in production builds");
}

/**
 * Hosts allowed through the Next.js image optimizer.
 *
 * A wildcard host turns the optimizer into an open image proxy: anyone can pass
 * `/_next/image?url=https://any-host/...` and have this server fetch, resize and
 * serve it. Keep this to hosts we actually serve images from.
 */
const imageHosts: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  // Product images live in the public GCS bucket.
  {
    protocol: "https",
    hostname: "storage.googleapis.com",
    pathname: "/nova-thera-product-images/**",
  },
  // Dashboard template assets.
  { protocol: "https", hostname: "cdn.shadcnstudio.com" },
];

if (process.env.NODE_ENV !== "production") {
  imageHosts.push(
    { protocol: "http", hostname: "localhost" },
    { protocol: "http", hostname: "127.0.0.1" },
    { protocol: "https", hostname: "loremflickr.com" },
    { protocol: "https", hostname: "picsum.photos" },
  );
}

const nextConfig: NextConfig = {
  // Standalone is for Docker/Cloud Run. Netlify's Next.js runtime cannot use it.
  ...(process.env.NETLIFY ? {} : { output: "standalone" as const }),
  poweredByHeader: false,
  images: {
    remotePatterns: imageHosts,
  },
};

export default nextConfig;
