import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

// Configuração do diretório local dos vídeos
const VIDEO_BASE_PATH = 'E:\\animes\\Kaiju.No.8.S01.1080p'

// Função helper para proxificar vídeo do R2
async function proxyVideoFromR2(r2Url: string, request: NextRequest) {
  try {
    const range = request.headers.get('range')
    console.log(`📡 [R2 PROXY] Range request: ${range || 'none'}`)

    const headers: Record<string, string> = {
      'Accept': 'video/*',
      'User-Agent': 'VideoPlayer/1.0'
    }

    if (range) {
      headers['Range'] = range
    }

    console.log(`📡 [R2 PROXY] Fazendo request para: ${r2Url}`)

    const r2Response = await fetch(r2Url, {
      method: 'GET',
      headers,
      cache: 'no-store'
    })

    if (!r2Response.ok) {
      console.error(`❌ [R2 PROXY] Erro do R2: ${r2Response.status}`)
      return NextResponse.json(
        { error: 'Failed to fetch from R2' },
        { status: r2Response.status }
      )
    }

    console.log(`✅ [R2 PROXY] Response status: ${r2Response.status}`)

    // Get the response body as a stream
    const stream = r2Response.body

    if (!stream) {
      return NextResponse.json(
        { error: 'No stream from R2' },
        { status: 500 }
      )
    }

    // Prepare headers for the response
    const responseHeaders: Record<string, string> = {
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
      'Cache-Control': 'public, max-age=3600'
    }

    // Copy important headers from R2 response
    if (r2Response.headers.get('content-length')) {
      responseHeaders['Content-Length'] = r2Response.headers.get('content-length')!
    }

    if (r2Response.headers.get('content-range')) {
      responseHeaders['Content-Range'] = r2Response.headers.get('content-range')!
    }

    const status = r2Response.status === 206 ? 206 : 200

    console.log(`📤 [R2 PROXY] Enviando response com status ${status}`)

    return new Response(stream, {
      status,
      headers: responseHeaders
    })

  } catch (error) {
    console.error('❌ [R2 PROXY] Erro:', error)
    return NextResponse.json(
      { error: 'Proxy error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Função helper para servir arquivos de vídeo
function serveVideoFile(videoPath: string, request: NextRequest) {
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
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, Content-Type'
      }
    })
  } else {
    // Servir arquivo completo
    const file = fs.createReadStream(videoPath)
    
    return new Response(file as unknown as ReadableStream, {
      status: 200,
      headers: {
        'Content-Length': fileSize.toString(),
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, Content-Type'
      }
    })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const quality = searchParams.get('quality') || '1080p'

    console.log(`🎬 [VIDEO API] Solicitação para episódio: ${id}`)
    console.log(`🎬 [VIDEO API] Quality solicitada: ${quality}`)

    // 🛡️ VALIDAÇÃO DE SEGURANÇA
    const origin = request.headers.get('origin')

    // Verificar se vem do nosso domínio
    const allowedOrigins = [
      'http://localhost:3004',
      'http://localhost:3000',
      process.env.NEXT_PUBLIC_APP_URL
    ].filter(Boolean)

    if (origin && !allowedOrigins.includes(origin)) {
      console.log(`🚫 [SECURITY] Origin não autorizado: ${origin}`)
      return NextResponse.json(
        { error: 'Origin not allowed' },
        { status: 403 }
      )
    }

    // Rate limiting básico por IP
    const clientIP = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    console.log(`🔍 [SECURITY] Request de IP: ${clientIP}`)

    // TODO: Implementar rate limiting mais robusto com Redis
    // Por enquanto só logamos para monitoramento

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
      console.log(`❌ [VIDEO API] Episódio não encontrado: ${id}`)
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      )
    }

    console.log(`✅ [VIDEO API] Episódio encontrado: ${episode.title} - ${episode.season.anime.title}`)

    // Prioridade 1: Verificar se tem videoUrl do Cloudflare R2
    if (episode.videoUrl) {
      console.log(`🔗 [VIDEO API] Proxificando vídeo do R2: ${episode.videoUrl}`)
      return proxyVideoFromR2(episode.videoUrl, request)
    }

    // Prioridade 2: Para Kaiju No. 8, mapear episódios para arquivos locais (fallback)
    if (episode.season.anime.title.includes('Kaiju') || episode.season.anime.slug === 'kaiju-no-8') {
      const episodeNumber = episode.episodeNumber.toString().padStart(2, '0')
      const filename = `Kaiju.No.8.S01E${episodeNumber}.1080p.CR.WEB-DL.AAC2.0.H.264.DUAL-Anitsu.mkv`
      const videoPath = path.join(VIDEO_BASE_PATH, filename)

      console.log(`📁 [VIDEO API] Tentando arquivo local: ${videoPath}`)

      // Verificar se arquivo existe
      if (!fs.existsSync(videoPath)) {
        console.log(`❌ [VIDEO API] Arquivo não encontrado: ${videoPath}`)
        return NextResponse.json(
          { error: 'Video file not found', path: videoPath },
          { status: 404 }
        )
      }

      console.log(`✅ [VIDEO API] Servindo arquivo local: ${filename}`)
      return serveVideoFile(videoPath, request)
    }

    // Prioridade 3: Fallback construir URL baseado no caminho do bucket
    if (episode.season.anime.r2BucketPath) {
      const r2VideoUrl = `${process.env.API_URL_pub}/animes/${episode.season.anime.slug}/season-${episode.season.seasonNumber}/episode-${episode.episodeNumber}/video-${quality}.mp4`
      
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

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type'
    }
  })
}