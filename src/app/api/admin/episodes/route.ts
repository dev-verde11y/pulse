import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('📋 [ADMIN EPISODES] Requisição de episódios para admin')

    const { searchParams } = new URL(request.url)

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Filters
    const search = searchParams.get('search')
    const anime = searchParams.get('anime')
    const season = searchParams.get('season')

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'episodeNumber'
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc'

    // Build where clause
    const where: {
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
      }>;
      season?: {
        anime?: {
          title?: { contains: string; mode: 'insensitive' };
        };
        title?: { contains: string; mode: 'insensitive' };
        seasonNumber?: number;
      };
    } = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (anime) {
      where.season = {
        anime: {
          title: { contains: anime, mode: 'insensitive' }
        }
      }
    }

    if (season) {
      where.season = {
        seasonNumber: parseInt(season)
      }
    }

    // Build orderBy clause
    let orderBy: {
      title?: 'asc' | 'desc';
      airDate?: 'asc' | 'desc';
      createdAt?: 'asc' | 'desc';
      episodeNumber?: 'asc' | 'desc';
    } = {}

    switch (sortBy) {
      case 'title':
        orderBy = { title: sortOrder }
        break
      case 'airDate':
        orderBy = { airDate: sortOrder }
        break
      case 'createdAt':
        orderBy = { createdAt: sortOrder }
        break
      case 'episodeNumber':
      default:
        orderBy = { episodeNumber: sortOrder }
    }

    // 🔓 ADMIN: Get episodes with ALL fields including videoUrl
    const [episodes, totalCount] = await Promise.all([
      prisma.episode.findMany({
        where,
        include: {
          season: {
            include: {
              anime: {
                select: {
                  id: true,
                  title: true,
                  posterUrl: true,
                  thumbnail: true
                }
              }
            }
          }
        },
        orderBy,
        skip: offset,
        take: limit
      }),
      prisma.episode.count({ where })
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNext = page < totalPages
    const hasPrevious = page > 1

    console.log(`✅ [ADMIN EPISODES] Retornando ${episodes.length} episódios COM URLs sensíveis`)

    return NextResponse.json({
      episodes,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        hasNext,
        hasPrevious
      }
    })

  } catch (error) {
    console.error('❌ [ADMIN EPISODES] Erro:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}