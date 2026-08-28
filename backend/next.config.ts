import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["@novathera/shared"],
  // Lets Expo web / Cloudflare tunnels load /_next assets while talking to :3000.
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.1.9",
    "against-beginning-only-shoes.trycloudflare.com",
    "disciplines-systematic-involving-machinery.trycloudflare.com",
    "folders-drop-lou-largest.trycloudflare.com",
    "deutsch-disciplinary-downloadable-transaction.trycloudflare.com",
    "static-coding-guidelines-general.trycloudflare.com",
  ],
  headers: async () => [
    {
      source: "/api/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Cache-Control", value: "no-store" },
      ],
    },
  ],
};

export default nextConfig;
