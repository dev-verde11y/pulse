import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
    console.error('❌ Missing R2 environment variables provided in .env')
    process.exit(1)
}

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
})

async function setupCors() {
    console.log(`🔒 Configuring CORS for bucket: ${R2_BUCKET_NAME}...`)

    const corsParams = {
        Bucket: R2_BUCKET_NAME,
        CORSConfiguration: {
            CORSRules: [
                {
                    AllowedHeaders: ['*'],
                    AllowedMethods: ['GET', 'HEAD'],
                    AllowedOrigins: ['*'], // Allow all origins (or restring to your domains)
                    ExposeHeaders: ['Content-Length', 'Content-Type', 'Content-Range', 'ETag'],
                    MaxAgeSeconds: 3000
                }
            ]
        }
    }

    try {
        await s3Client.send(new PutBucketCorsCommand(corsParams))
        console.log('✅ CORS configuration successfully applied!')
        console.log('   Now external subtitles (VTT) and simple GET requests should work from any domain.')
    } catch (error) {
        console.error('❌ Failed to set CORS configuration:', error)
    }
}

setupCors()
