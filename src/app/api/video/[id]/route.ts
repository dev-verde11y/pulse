import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

// Configuração do diretório local dos vídeos
const VIDEO_BASE_PATH = 'E:\\animes\\Kaiju.No.8.S01.1080p'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const quality = searchParams.get('quality') || '1080p'

    // Buscar episódio no banco
    const episode = await prisma.episode.findUnique({
      where: { id },
      include: {
        season: {
          include: {
            anime: true
          }
        }
      }
    })

    if (!episode) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      )
    }

    // Para Kaiju No. 8, mapear episódios para arquivos locais
    if (episode.season.anime.title.includes('Kaiju') || episode.season.anime.slug === 'kaiju-no-8') {
      const episodeNumber = episode.episodeNumber.toString().padStart(2, '0')
      const filename = `Kaiju.No.8.S01E${episodeNumber}.1080p.CR.WEB-DL.AAC2.0.H.264.DUAL-Anitsu.mkv`
      const videoPath = path.join(VIDEO_BASE_PATH, filename)

      // Verificar se arquivo existe
      if (!fs.existsSync(videoPath)) {
        return NextResponse.json(
          { error: 'Video file not found' },
          { status: 404 }
        )
      }

      // Obter informações do arquivo
      const stat = fs.statSync(videoPath)
      const fileSize = stat.size
      const range = request.headers.get('range')

      if (range) {
        // Suporte para streaming com range requests
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
        const chunkSize = (end - start) + 1

        const file = fs.createReadStream(videoPath, { start, end })
        
        return new Response(file as unknown as ReadableStream, {
          status: 206,
          headers: {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize.toString(),
            'Content-Type': 'video/x-matroska',
            'Cache-Control': 'public, max-age=3600'
          }
        })
      } else {
        // Servir arquivo completo
        const file = fs.createReadStream(videoPath)
        
        return new Response(file as unknown as ReadableStream, {
          status: 200,
          headers: {
            'Content-Length': fileSize.toString(),
            'Content-Type': 'video/x-matroska',
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=3600'
          }
        })
      }
    }

    // Para outros animes, usar URLs do Cloudflare R2 (futuro)
    if (episode.season.anime.r2BucketPath) {
      const r2VideoUrl = `https://your-r2-domain.com/${episode.season.anime.r2BucketPath}/season-${episode.season.seasonNumber}/episode-${episode.episodeNumber}/video.mp4`
      
      return NextResponse.redirect(r2VideoUrl)
    }

    // Para outros animes, retornar mensagem informativa
    return NextResponse.json(
      { 
        error: 'Video not available',
        message: `Vídeo não disponível para ${episode.season.anime.title}. Apenas Kaiju No. 8 tem arquivos locais configurados.`
      },
      { status: 404 }
    )

  } catch (error) {
    console.error('Error serving video:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}