import { PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { r2Client, BUCKET_NAME, getPublicUrl } from './r2'
import { randomUUID } from 'crypto'

export interface UploadOptions {
  contentType?: string
  metadata?: Record<string, string>
}

export interface UploadResult {
  key: string
  url: string
  size: number
}

export class R2UploadService {
  // Upload de arquivo buffer/stream
  async uploadFile(
    file: Buffer | Uint8Array, 
    path: string, 
    filename: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const fileExtension = filename.split('.').pop()
    const uniqueFilename = `${randomUUID()}.${fileExtension}`
    const key = `${path}/${uniqueFilename}`
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: options.contentType || this.getMimeType(fileExtension || ''),
      Metadata: options.metadata || {},
    })

    await r2Client.send(command)

    return {
      key,
      url: getPublicUrl(key),
      size: file.length
    }
  }

  // Upload de vídeo com estrutura específica para animes
  async uploadVideo(
    videoBuffer: Buffer,
    animeSlug: string,
    seasonNumber: number,
    episodeNumber: number,
    quality = '1080p'
  ): Promise<UploadResult> {
    const path = `animes/${animeSlug}/season-${seasonNumber}/episode-${episodeNumber}`
    const filename = `video-${quality}.mp4`
    
    return this.uploadFile(videoBuffer, path, filename, {
      contentType: 'video/mp4',
      metadata: {
        anime: animeSlug,
        season: seasonNumber.toString(),
        episode: episodeNumber.toString(),
        quality
      }
    })
  }

  // Upload de thumbnail
  async uploadThumbnail(
    imageBuffer: Buffer,
    animeSlug: string,
    seasonNumber?: number,
    episodeNumber?: number,
    type: 'poster' | 'banner' | 'episode' = 'poster'
  ): Promise<UploadResult> {
    let path = `animes/${animeSlug}/images`
    let filename = `${type}.jpg`
    
    if (seasonNumber && episodeNumber) {
      path += `/season-${seasonNumber}`
      filename = `episode-${episodeNumber}-${type}.jpg`
    } else if (seasonNumber) {
      path += `/season-${seasonNumber}`
      filename = `season-${type}.jpg`
    }
    
    return this.uploadFile(imageBuffer, path, filename, {
      contentType: 'image/jpeg',
      metadata: {
        anime: animeSlug,
        season: seasonNumber?.toString() || '',
        episode: episodeNumber?.toString() || '',
        type
      }
    })
  }

  // Verificar se arquivo existe
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
      
      await r2Client.send(command)
      return true
    } catch (error) {
      return false
    }
  }

  // Deletar arquivo
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
    
    await r2Client.send(command)
  }

  // Gerar URL pública
  getUrl(key: string): string {
    return getPublicUrl(key)
  }

  // Helper para determinar MIME type
  private getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      'mp4': 'video/mp4',
      'mkv': 'video/x-matroska',
      'avi': 'video/x-msvideo',
      'webm': 'video/webm',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'gif': 'image/gif',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg'
    }
    
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream'
  }
}

// Instância singleton do serviço
export const uploadService = new R2UploadService()