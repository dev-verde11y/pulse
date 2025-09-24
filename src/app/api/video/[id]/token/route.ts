import { NextRequest, NextResponse } from 'next/server'
import { generateSecureVideoToken } from '@/lib/videoSecurity'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const quality = searchParams.get('quality') || '1080p'

    // 🛡️ Validações de segurança
    const origin = request.headers.get('origin')
    const allowedOrigins = [
      'http://localhost:3004',
      'http://localhost:3000',
      process.env.NEXT_PUBLIC_APP_URL
    ].filter(Boolean)

    if (origin && !allowedOrigins.includes(origin)) {
      return NextResponse.json(
        { error: 'Origin not allowed' },
        { status: 403 }
      )
    }

    // 📋 Verificar se episódio existe
    const episode = await prisma.episode.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        videoUrl: true
      }
    })

    if (!episode) {
      return NextResponse.json(
        { error: 'Episódio não encontrado' },
        { status: 404 }
      )
    }

    if (!episode.videoUrl) {
      return NextResponse.json(
        { error: 'Vídeo não disponível' },
        { status: 404 }
      )
    }

    // 🔐 Gerar token temporário (válido por 1 hora)
    const token = generateSecureVideoToken(id, quality, undefined, 60)

    console.log(`🎟️ Token gerado para: ${episode.title} (${quality})`)

    return NextResponse.json({
      token,
      videoUrl: `/api/video/secure?token=${token}`,
      expiresInMinutes: 60,
      episodeTitle: episode.title,
      quality
    })

  } catch (error) {
    console.error('❌ Erro ao gerar token:', error)
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}