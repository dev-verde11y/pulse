import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Aumentar limite para uploads de vídeos (moved from experimental)
  serverExternalPackages: ['@aws-sdk/client-s3'],
  
  experimental: {
    // Configurações para uploads grandes
    serverActions: {
      bodySizeLimit: '5gb',
    },
  },
};

export default nextConfig;
