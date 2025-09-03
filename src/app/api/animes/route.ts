import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const animesQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  genre: z.string().optional(),
  genres: z.string().optional(), // Para múltiplos gêneros separados por vírgula
  year: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  yearFrom: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  yearTo: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  status: z.enum(['FINISHED', 'ONGOING', 'UPCOMING', 'CANCELLED']).optional(),
  type: z.enum(['ANIME', 'FILME', 'SERIE']).optional(),
  rating: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'year', 'rating', 'createdAt']).optional().default('title'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc')
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams)
    
    const {
      page,
      limit,
      genre,
      genres,
      year,
      yearFrom,
      yearTo,
      status,
      type,
      rating,
      search,
      sortBy,
      sortOrder
    } = animesQuerySchema.parse(params)

    const skip = (page - 1) * limit
    
    const where: any = {}
    
    // Filtro por gêneros (múltiplos)
    if (genre) {
      where.genres = {
        has: genre
      }
    } else if (genres) {
      const genreList = genres.split(',').map(g => g.trim())
      where.genres = {
        hasEvery: genreList // Deve ter TODOS os gêneros
      }
    }
    
    // Filtro por ano específico
    if (year) {
      where.year = year
    }
    
    // Filtro por range de anos
    if (yearFrom || yearTo) {
      where.year = {}
      if (yearFrom) where.year.gte = yearFrom
      if (yearTo) where.year.lte = yearTo
    }
    
    // Filtro por status
    if (status) {
      where.status = status
    }
    
    // Filtro por tipo
    if (type) {
      where.type = type
    }
    
    // Filtro por classificação
    if (rating) {
      where.rating = rating
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
          genres: {
            hasSome: [search] // Busca também nos gêneros
          }
        }
      ]
    }

    const orderBy: any = {}
    switch (sortBy) {
      case 'title':
        orderBy.title = sortOrder
        break
      case 'year':
        orderBy.year = sortOrder
        break
      case 'rating':
        orderBy.rating = sortOrder
        break
      case 'createdAt':
        orderBy.createdAt = sortOrder
        break
      default:
        orderBy.title = 'asc'
        break
    }

    const [animes, total] = await Promise.all([
      prisma.anime.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: {
              seasons: true,
              favorites: true
            }
          }
        }
      }),
      prisma.anime.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      animes,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching animes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}