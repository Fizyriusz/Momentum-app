import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Zezwolenie na połączenie HMR przez Tailscale
  allowedDevOrigins: ['100.112.91.99'],
};

export default nextConfig;
