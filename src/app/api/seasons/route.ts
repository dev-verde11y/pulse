import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSeasonSchema = z.object({
  animeId: z.string().uuid('ID do anime é obrigatório'),
  seasonNumber: z.number().int().positive('Número da temporada deve ser positivo'),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  releaseDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
  endDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
  bannerUrl: z.string().url().optional().nullable(),
  bannerR2Key: z.string().optional().nullable(),
  r2BucketPath: z.string().optional().nullable()
})

const seasonsQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  animeId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['seasonNumber', 'title', 'releaseDate', 'createdAt']).optional().default('seasonNumber'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc')
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams)
    
    const {
      page,
      limit,
      animeId,
      search,
      sortBy,
      sortOrder
    } = seasonsQuerySchema.parse(params)

    const skip = (page - 1) * limit
    
    const where: Record<string, unknown> = {}
    
    // Filtro por anime específico
    if (animeId) {
      where.animeId = animeId
    }
    
    // Filtro por busca de texto
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          anime: {
            title: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ]
    }

    const orderBy: Record<string, string> = {}
    switch (sortBy) {
      case 'seasonNumber':
        orderBy.seasonNumber = sortOrder
        break
      case 'title':
        orderBy.title = sortOrder
        break
      case 'releaseDate':
        orderBy.releaseDate = sortOrder
        break
      case 'createdAt':
        orderBy.createdAt = sortOrder
        break
      default:
        orderBy.seasonNumber = 'asc'
        break
    }

    const [seasons, total] = await Promise.all([
      prisma.season.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          anime: {
            select: {
              id: true,
              title: true,
              posterUrl: true,
              thumbnail: true
            }
          },
          _count: {
            select: {
              episodes: true
            }
          }
        }
      }),
      prisma.season.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      seasons,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching seasons:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validatedData = createSeasonSchema.parse(body)
    
    // Verificar se o anime existe
    const anime = await prisma.anime.findUnique({
      where: { id: validatedData.animeId }
    })
    
    if (!anime) {
      return NextResponse.json(
        { error: 'Anime não encontrado' },
        { status: 404 }
      )
    }
    
    // Verificar se já existe uma temporada com esse número para esse anime
    const existingSeason = await prisma.season.findFirst({
      where: {
        animeId: validatedData.animeId,
        seasonNumber: validatedData.seasonNumber
      }
    })
    
    if (existingSeason) {
      return NextResponse.json(
        { error: `Já existe a temporada ${validatedData.seasonNumber} para este anime` },
        { status: 409 }
      )
    }
    
    // Criar temporada
    const newSeason = await prisma.season.create({
      data: validatedData,
      include: {
        anime: {
          select: {
            id: true,
            title: true,
            posterUrl: true,
            thumbnail: true
          }
        },
        _count: {
          select: {
            episodes: true
          }
        }
      }
    })
    
    return NextResponse.json(newSeason, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    console.error('Error creating season:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}