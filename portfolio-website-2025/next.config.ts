import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/images/:path*",
        destination:
          "https://mjlcamulmtvseegaihce.supabase.co/storage/v1/object/public/public-images/images/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mjlcamulmtvseegaihce.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
