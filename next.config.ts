import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Admins upload course materials (PDF, datasets, slides) through server actions.
    serverActions: { bodySizeLimit: "50mb" },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
};

export default nextConfig;
