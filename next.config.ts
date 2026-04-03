import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cover.openbd.jp',
      },
      {
        protocol: 'https',
        hostname: 'ndlsearch.ndl.go.jp',
        pathname: '/thumbnail/**',  // èëâeÉpÉXÇ…å¿íË
      },
    ],
  },
};

export default nextConfig;
