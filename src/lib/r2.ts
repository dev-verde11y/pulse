import { S3Client } from '@aws-sdk/client-s3'

if (!process.env.CLOUDFLARE_R2_ACCOUNT_ID) {
  throw new Error('CLOUDFLARE_R2_ACCOUNT_ID is required')
}
if (!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID) {
  throw new Error('CLOUDFLARE_R2_ACCESS_KEY_ID is required')
}
if (!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
  throw new Error('CLOUDFLARE_R2_SECRET_ACCESS_KEY is required')
}
if (!process.env.CLOUDFLARE_R2_BUCKET_NAME) {
  throw new Error('CLOUDFLARE_R2_BUCKET_NAME is required')
}

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
})

export const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME

// Helper para gerar URL pública do arquivo
export function getPublicUrl(key: string): string {
  return `${process.env.API_URL_pub}/${key}`
}