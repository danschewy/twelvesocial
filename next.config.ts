import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.twelvelabs.io",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static.twelvelabs.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
