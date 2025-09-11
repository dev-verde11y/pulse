import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateAnimeSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  thumbnail: z.string().url().optional().nullable(),
  banner: z.string().url().optional().nullable(),
  logo: z.string().url().optional().nullable(),
  year: z.number().int().min(1900).max(2100).optional(),
  status: z.enum(['FINISHED', 'ONGOING', 'UPCOMING', 'CANCELLED']).optional(),
  type: z.enum(['ANIME', 'FILME', 'SERIE']).optional(),
  rating: z.string().optional(),
  totalEpisodes: z.number().int().positive().optional().nullable(),
  isSubbed: z.boolean().optional(),
  isDubbed: z.boolean().optional(),
  genres: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  director: z.string().optional().nullable(),
  studio: z.string().optional().nullable(),
  slug: z.string().min(1).optional(),
  posterUrl: z.string().url().optional().nullable(),
  posterR2Key: z.string().optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),
  bannerR2Key: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  logoR2Key: z.string().optional().nullable(),
  r2BucketPath: z.string().optional().nullable()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const anime = await prisma.anime.findUnique({
      where: { id },
      include: {
        seasons: {
          orderBy: { seasonNumber: 'asc' },
          include: {
            episodes: {
              orderBy: { episodeNumber: 'asc' }
            }
          }
        },
        _count: {
          select: {
            favorites: true,
            watchHistory: true
          }
        }
      }
    })

    if (!anime) {
      return NextResponse.json(
        { error: 'Anime not found' },
        { status: 404 }
      )
    }


    return NextResponse.json(anime)
  } catch (error) {
    console.error('Error fetching anime:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Validar dados de entrada
    const validatedData = updateAnimeSchema.parse(body)
    
    // Verificar se o anime existe
    const existingAnime = await prisma.anime.findUnique({
      where: { id }
    })
    
    if (!existingAnime) {
      return NextResponse.json(
        { error: 'Anime not found' },
        { status: 404 }
      )
    }
    
    // Verificar se slug é único (se foi fornecido e é diferente do atual)
    if (validatedData.slug && validatedData.slug !== existingAnime.slug) {
      const slugExists = await prisma.anime.findFirst({
        where: { 
          slug: validatedData.slug,
          id: { not: id }
        }
      })
      
      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug já está em uso' },
          { status: 409 }
        )
      }
    }
    
    // Atualizar anime
    const updatedAnime = await prisma.anime.update({
      where: { id },
      data: validatedData,
      include: {
        seasons: {
          orderBy: { seasonNumber: 'asc' },
          include: {
            episodes: {
              orderBy: { episodeNumber: 'asc' }
            }
          }
        },
        _count: {
          select: {
            favorites: true,
            watchHistory: true
          }
        }
      }
    })
    
    return NextResponse.json(updatedAnime)
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
    
    console.error('Error updating anime:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verificar se o anime existe
    const existingAnime = await prisma.anime.findUnique({
      where: { id },
      include: {
        seasons: {
          include: {
            episodes: true
          }
        }
      }
    })
    
    if (!existingAnime) {
      return NextResponse.json(
        { error: 'Anime not found' },
        { status: 404 }
      )
    }
    
    // Verificar se há episódios associados
    const hasEpisodes = existingAnime.seasons.some(season => season.episodes.length > 0)
    
    if (hasEpisodes) {
      return NextResponse.json(
        { 
          error: 'Não é possível excluir anime com episódios. Delete os episódios primeiro.',
          hasEpisodes: true
        },
        { status: 409 }
      )
    }
    
    // Deletar anime (cascata irá deletar seasons, favorites, watchHistory automaticamente)
    await prisma.anime.delete({
      where: { id }
    })
    
    return NextResponse.json(
      { message: 'Anime deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting anime:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}