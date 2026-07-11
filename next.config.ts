import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* Vercel handles output automatically — no standalone needed */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "static.markaz.app" },
      { protocol: "https", hostname: "content.public.markaz.app" },
      { protocol: "https", hostname: "admin.yourmart.pk" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "sfile.chatglm.cn" },
      { protocol: "https", hostname: "bachatbazar.pk" },
    ],
  },
};

export default nextConfig;
