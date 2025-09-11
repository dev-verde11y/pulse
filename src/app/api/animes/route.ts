import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createAnimeSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  year: z.number().int().min(1900, 'Ano deve ser maior que 1900').max(2100, 'Ano deve ser menor que 2100'),
  status: z.enum(['FINISHED', 'ONGOING', 'UPCOMING', 'CANCELLED']).default('ONGOING'),
  type: z.enum(['ANIME', 'FILME', 'SERIE']).default('ANIME'),
  rating: z.string().min(1, 'Classificação é obrigatória'),
  genres: z.array(z.string()).min(1, 'Pelo menos um gênero é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  
  // Campos opcionais
  thumbnail: z.string().url().optional().nullable(),
  banner: z.string().url().optional().nullable(),
  logo: z.string().url().optional().nullable(),
  totalEpisodes: z.number().int().positive().optional().nullable(),
  isSubbed: z.boolean().default(true),
  isDubbed: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  director: z.string().optional().nullable(),
  studio: z.string().optional().nullable(),
  
  // Cloudflare R2 fields
  posterUrl: z.string().url().optional().nullable(),
  posterR2Key: z.string().optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),
  bannerR2Key: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  logoR2Key: z.string().optional().nullable(),
  r2BucketPath: z.string().optional().nullable()
})

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validatedData = createAnimeSchema.parse(body)
    
    // Verificar se slug é único
    const existingSlug = await prisma.anime.findUnique({
      where: { slug: validatedData.slug }
    })
    
    if (existingSlug) {
      return NextResponse.json(
        { error: 'Slug já está em uso' },
        { status: 409 }
      )
    }
    
    // Criar anime
    const newAnime = await prisma.anime.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            seasons: true,
            favorites: true
          }
        }
      }
    })
    
    return NextResponse.json(newAnime, { status: 201 })
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
    
    console.error('Error creating anime:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}