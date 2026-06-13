import type { NextConfig } from "next";

const directusUrl = process.env.DIRECTUS_URL ? new URL(process.env.DIRECTUS_URL) : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(directusUrl
        ? [
            {
              protocol: directusUrl.protocol.replace(":", "") as "http" | "https",
              hostname: directusUrl.hostname,
              port: directusUrl.port,
              pathname: "/assets/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
