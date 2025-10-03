import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// API pública - retorna apenas informações não sensíveis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const genre = searchParams.get('genre')
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    const skip = (page - 1) * limit

    // Filtros seguros
    const where: any = {}

    if (genre) {
      where.genres = {
        has: genre
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (type) {
      where.type = type
    }

    if (status) {
      where.status = status
    }

    // Busca animes com campos públicos apenas
    const [animes, total] = await Promise.all([
      prisma.anime.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          thumbnail: true,
          posterUrl: true,
          bannerUrl: true,
          year: true,
          status: true,
          type: true,
          rating: true,
          genres: true,
          tags: true,
          isSubbed: true,
          isDubbed: true,
          slug: true,
          // NÃO expor: r2BucketPath, posterR2Key, bannerR2Key, logoR2Key, etc
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip,
      }),
      prisma.anime.count({ where })
    ])

    return NextResponse.json({
      animes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Public animes API error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar animes' },
      { status: 500 }
    )
  }
}
