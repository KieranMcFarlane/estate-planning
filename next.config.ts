import type { NextConfig } from "next";

const directusBaseUrl = process.env.DIRECTUS_URL ?? process.env.ESTATE_DIRECTUS_URL ?? "";
const directusUrl = directusBaseUrl ? new URL(directusBaseUrl) : null;

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
