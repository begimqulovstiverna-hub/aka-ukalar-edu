import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['10.0.2.15', 'localhost', '*.local', '*.localhost'],
};

export default nextConfig;
