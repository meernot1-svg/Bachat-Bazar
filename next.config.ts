import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel handles output automatically — no standalone needed */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "static.markaz.app" },
      { protocol: "https", hostname: "content.public.markaz.app" },
      { protocol: "https", hostname: "admin.yourmart.pk" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "sfile.chatglm.cn" },
    ],
  },
};

export default nextConfig;
