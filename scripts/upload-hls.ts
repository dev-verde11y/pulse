import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import fs from 'fs'
import path from 'path'
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

// Configuration: Change this to point to your local HLS folder
const LOCAL_FOLDER_PATH = String.raw`C:\Users\verde\Downloads\testes\output`
// Configuration: Change this to the destination folder in R2 (e.g., 'animes/slug/hls')
const R2_DESTINATION_FOLDER = 'hls-test'

async function uploadFile(filePath: string, r2Path: string) {
    const fileContent = fs.readFileSync(filePath)
    const contentType = filePath.endsWith('.m3u8')
        ? 'application/vnd.apple.mpegurl'
        : filePath.endsWith('.ts')
            ? 'video/MP2T'
            : filePath.endsWith('.vtt')
                ? 'text/vtt'
                : 'application/octet-stream'

    console.log(`📤 Uploading: ${r2Path} (${contentType})...`)

    try {
        await s3Client.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: r2Path,
            Body: fileContent,
            ContentType: contentType,
            ACL: 'public-read' // Ensure it's public if passing public URLs
        }))
        console.log(`✅ Success: ${r2Path}`)
    } catch (error) {
        console.error(`❌ Failed to upload ${r2Path}:`, error)
    }
}

async function uploadFolder(folderPath: string, r2Prefix: string) {
    if (!fs.existsSync(folderPath)) {
        console.error(`❌ Folder not found: ${folderPath}`)
        return
    }

    const files = fs.readdirSync(folderPath)

    for (const file of files) {
        const fullPath = path.join(folderPath, file)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
            await uploadFolder(fullPath, `${r2Prefix}/${file}`)
        } else {
            // Normalizing path separators for R2 keys
            const r2Key = `${r2Prefix}/${file}`.replace(/\\/g, '/')
            await uploadFile(fullPath, r2Key)
        }
    }
}

console.log('🚀 Starting HLS Bulk Upload...')
console.log(`📂 Source: ${LOCAL_FOLDER_PATH}`)
console.log(`☁️  Destination: ${R2_DESTINATION_FOLDER}`)

uploadFolder(LOCAL_FOLDER_PATH, R2_DESTINATION_FOLDER)
    .then(() => {
        console.log('✨ All uploads completed!')
        const publicUrl = process.env.API_URL_pub
        if (publicUrl) {
            console.log('\n🔗  Public URLs (Copy these to Admin):')
            console.log(`📺 Playlist: ${publicUrl}/${R2_DESTINATION_FOLDER}/master.m3u8`)
            console.log(`📝 Subtitle: ${publicUrl}/${R2_DESTINATION_FOLDER}/legenda_ptbr.vtt`)
            console.log(`\n(Adjust filenames if yours are different)`)
        } else {
            console.log('\n⚠️ API_URL_pub not found in .env. Cannot generate public URLs.')
        }
    })
    .catch((err) => console.error('❌ Fatal error:', err))
