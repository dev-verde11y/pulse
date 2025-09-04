import { NextRequest, NextResponse } from 'next/server'
import { uploadService } from '@/lib/upload'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'video' | 'thumbnail'
    const animeId = formData.get('animeId') as string
    const seasonId = formData.get('seasonId') as string
    const episodeId = formData.get('episodeId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!animeId) {
      return NextResponse.json(
        { error: 'Anime ID is required' },
        { status: 400 }
      )
    }

    // Validação de tamanho do arquivo
    const MAX_VIDEO_SIZE = 5 * 1024 * 1024 * 1024 // 5GB
    const MAX_IMAGE_SIZE = 50 * 1024 * 1024 // 50MB
    
    if (type === 'video' && file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { 
          error: `Video file too large. Maximum size is ${MAX_VIDEO_SIZE / 1024 / 1024 / 1024}GB`,
          maxSize: '5GB',
          currentSize: `${(file.size / 1024 / 1024 / 1024).toFixed(2)}GB`
        },
        { status: 413 }
      )
    }

    if (type === 'thumbnail' && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { 
          error: `Image file too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
          maxSize: '50MB',
          currentSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`
        },
        { status: 413 }
      )
    }

    // Converter arquivo para buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Buscar informações do anime
    const anime = await prisma.anime.findUnique({
      where: { id: animeId }
    })

    if (!anime) {
      return NextResponse.json(
        { error: 'Anime not found' },
        { status: 404 }
      )
    }

    let uploadResult

    if (type === 'video' && episodeId) {
      // Upload de vídeo
      const episode = await prisma.episode.findUnique({
        where: { id: episodeId },
        include: { season: true }
      })

      if (!episode) {
        return NextResponse.json(
          { error: 'Episode not found' },
          { status: 404 }
        )
      }

      uploadResult = await uploadService.uploadVideo(
        buffer,
        anime.slug,
        episode.season.seasonNumber,
        episode.episodeNumber
      )

      // Atualizar o episódio com a URL do vídeo
      await prisma.episode.update({
        where: { id: episodeId },
        data: {
          videoUrl: uploadResult.url,
          r2Key: uploadResult.key
        }
      })

    } else if (type === 'thumbnail') {
      // Upload de thumbnail
      let seasonNumber: number | undefined
      let episodeNumber: number | undefined

      if (episodeId) {
        const episode = await prisma.episode.findUnique({
          where: { id: episodeId },
          include: { season: true }
        })
        
        if (episode) {
          seasonNumber = episode.season.seasonNumber
          episodeNumber = episode.episodeNumber
        }
      } else if (seasonId) {
        const season = await prisma.season.findUnique({
          where: { id: seasonId }
        })
        
        if (season) {
          seasonNumber = season.seasonNumber
        }
      }

      const thumbnailType = episodeId ? 'episode' : seasonId ? 'banner' : 'poster'
      
      uploadResult = await uploadService.uploadThumbnail(
        buffer,
        anime.slug,
        seasonNumber,
        episodeNumber,
        thumbnailType
      )

      // Atualizar o registro apropriado com a URL do thumbnail
      if (episodeId) {
        console.log('📸 Atualizando thumbnail do episódio:', episodeId)
        await prisma.episode.update({
          where: { id: episodeId },
          data: {
            thumbnailUrl: uploadResult.url,
            thumbnailR2Key: uploadResult.key
          }
        })
        console.log('✅ Episódio atualizado com thumbnail')
      } else if (seasonId) {
        console.log('🏞️ Atualizando banner da season:', seasonId)
        await prisma.season.update({
          where: { id: seasonId },
          data: {
            bannerUrl: uploadResult.url,
            bannerR2Key: uploadResult.key
          }
        })
        console.log('✅ Season atualizada com banner')
      } else {
        console.log('🎭 Atualizando poster do anime:', animeId)
        const updatedAnime = await prisma.anime.update({
          where: { id: animeId },
          data: {
            posterUrl: uploadResult.url,
            posterR2Key: uploadResult.key
          }
        })
        console.log('✅ Anime atualizado com poster:', updatedAnime.posterUrl)
      }

    } else {
      return NextResponse.json(
        { error: 'Invalid upload type or missing required fields' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      file: {
        key: uploadResult.key,
        url: uploadResult.url,
        size: uploadResult.size,
        type: file.type,
        name: file.name
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { error: 'File key is required' },
        { status: 400 }
      )
    }

    await uploadService.deleteFile(key)

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    )
  }
}