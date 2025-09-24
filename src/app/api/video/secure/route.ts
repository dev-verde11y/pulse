import { NextRequest, NextResponse } from 'next/server'
import { validateSecureVideoToken } from '@/lib/videoSecurity'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token obrigatório' },
        { status: 400 }
      )
    }

    // 🔍 Validar token
    const validation = validateSecureVideoToken(token)

    if (!validation.valid) {
      console.log(`🚫 [SECURE VIDEO] Token inválido: ${validation.error}`)
      return NextResponse.json(
        { error: validation.error },
        { status: 403 }
      )
    }

    const { episodeId, quality, userId } = validation.data!

    // 📋 Buscar episódio
    const episode = await prisma.episode.findUnique({
      where: { id: episodeId },
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
        { error: 'Episódio não encontrado' },
        { status: 404 }
      )
    }

    console.log(`🎬 [SECURE VIDEO] Acesso autorizado: ${episode.title} (${quality})`)

    // 🎥 Proxificar vídeo do R2 (reutilizar a função existente)
    if (episode.videoUrl) {
      return proxyVideoFromR2(episode.videoUrl, request)
    }

    return NextResponse.json(
      { error: 'Vídeo não disponível' },
      { status: 404 }
    )

  } catch (error) {
    console.error('❌ [SECURE VIDEO] Erro:', error)
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}

// 📡 Reutilizar função de proxy (copiada da rota original)
async function proxyVideoFromR2(r2Url: string, request: NextRequest) {
  try {
    const range = request.headers.get('range')

    const headers: Record<string, string> = {
      'Accept': 'video/*',
      'User-Agent': 'SecureVideoPlayer/1.0'
    }

    if (range) {
      headers['Range'] = range
    }

    const r2Response = await fetch(r2Url, {
      method: 'GET',
      headers,
      cache: 'no-store'
    })

    if (!r2Response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch from R2' },
        { status: r2Response.status }
      )
    }

    const stream = r2Response.body

    if (!stream) {
      return NextResponse.json(
        { error: 'No stream from R2' },
        { status: 500 }
      )
    }

    const responseHeaders: Record<string, string> = {
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
      'Cache-Control': 'private, max-age=300', // 🔐 Cache mais restrito
      'X-Secure-Video': 'true'
    }

    if (r2Response.headers.get('content-length')) {
      responseHeaders['Content-Length'] = r2Response.headers.get('content-length')!
    }

    if (r2Response.headers.get('content-range')) {
      responseHeaders['Content-Range'] = r2Response.headers.get('content-range')!
    }

    const status = r2Response.status === 206 ? 206 : 200

    return new Response(stream, {
      status,
      headers: responseHeaders
    })

  } catch (error) {
    console.error('❌ [SECURE PROXY] Erro:', error)
    return NextResponse.json(
      { error: 'Proxy error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type'
    }
  })
}