import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createEpisodeSchema = z.object({
  seasonId: z.string().uuid(),
  episodeNumber: z.number().int().positive(),
  title: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  duration: z.number().int().positive(),
  thumbnailUrl: z.string().url().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  r2Key: z.string().optional().nullable(),
  thumbnailR2Key: z.string().optional().nullable(),
  airDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null)
})

export async function GET(request: NextRequest) {
  try {
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

    // Get episodes with pagination
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
    console.error('Error fetching episodes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = createEpisodeSchema.parse(body)

    // Check if season exists
    const season = await prisma.season.findUnique({
      where: { id: validatedData.seasonId },
      include: { anime: true }
    })

    if (!season) {
      return NextResponse.json(
        { error: 'Temporada não encontrada' },
        { status: 404 }
      )
    }

    // Check for duplicate episode number in the same season
    const existingEpisode = await prisma.episode.findFirst({
      where: {
        seasonId: validatedData.seasonId,
        episodeNumber: validatedData.episodeNumber
      }
    })

    if (existingEpisode) {
      return NextResponse.json(
        { 
          error: `Já existe o episódio ${validatedData.episodeNumber} nesta temporada`,
          conflictType: 'episodeNumber'
        },
        { status: 409 }
      )
    }

    // Create episode
    const episode = await prisma.episode.create({
      data: {
        seasonId: validatedData.seasonId,
        episodeNumber: validatedData.episodeNumber,
        title: validatedData.title,
        description: validatedData.description,
        duration: validatedData.duration,
        thumbnail: validatedData.thumbnailUrl, // Legacy field
        thumbnailUrl: validatedData.thumbnailUrl,
        videoUrl: validatedData.videoUrl,
        r2Key: validatedData.r2Key,
        thumbnailR2Key: validatedData.thumbnailR2Key,
        airDate: validatedData.airDate
      },
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
      }
    })

    return NextResponse.json(episode, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: error.errors
        },
        { status: 400 }
      )
    }

    console.error('Error creating episode:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}