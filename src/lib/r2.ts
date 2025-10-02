import { S3Client } from '@aws-sdk/client-s3'

// Validar apenas em runtime (não durante build)
if (process.env.NODE_ENV !== 'production' || typeof window === 'undefined') {
  if (!process.env.CLOUDFLARE_R2_ACCOUNT_ID && process.env.NODE_ENV === 'production') {
    console.warn('CLOUDFLARE_R2_ACCOUNT_ID is not configured')
  }
  if (!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && process.env.NODE_ENV === 'production') {
    console.warn('CLOUDFLARE_R2_ACCESS_KEY_ID is not configured')
  }
  if (!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY && process.env.NODE_ENV === 'production') {
    console.warn('CLOUDFLARE_R2_SECRET_ACCESS_KEY is not configured')
  }
  if (!process.env.CLOUDFLARE_R2_BUCKET_NAME && process.env.NODE_ENV === 'production') {
    console.warn('CLOUDFLARE_R2_BUCKET_NAME is not configured')
  }
}

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID || 'placeholder'}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || 'placeholder',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || 'placeholder',
  },
})

export const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME

// Helper para gerar URL pública do arquivo
export function getPublicUrl(key: string): string {
  return `${process.env.API_URL_pub}/${key}`
}