import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Aumentar limite para uploads de vídeos
    serverComponentsExternalPackages: ['@aws-sdk/client-s3'],
  },
  // Configurações para uploads grandes
  api: {
    bodyParser: {
      sizeLimit: '5gb', // Limite de 5GB para uploads
    },
    responseLimit: false,
  },
  // Timeout para uploads longos
  serverActions: {
    bodySizeLimit: '5gb',
  },
};

export default nextConfig;
