import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSeasonSchema = z.object({
  seasonNumber: z.number().int().positive().optional(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  releaseDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
  endDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
  bannerUrl: z.string().url().optional().nullable(),
  bannerR2Key: z.string().optional().nullable(),
  r2BucketPath: z.string().optional().nullable()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const season = await prisma.season.findUnique({
      where: { id },
      include: {
        anime: {
          select: {
            id: true,
            title: true,
            thumbnail: true
          }
        },
        episodes: {
          orderBy: { episodeNumber: 'asc' }
        }
      }
    })

    if (!season) {
      return NextResponse.json(
        { error: 'Season not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(season)
  } catch (error) {
    console.error('Error fetching season:', error)
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
    const validatedData = updateSeasonSchema.parse(body)
    
    // Verificar se a temporada existe
    const existingSeason = await prisma.season.findUnique({
      where: { id },
      include: { anime: true }
    })
    
    if (!existingSeason) {
      return NextResponse.json(
        { error: 'Temporada não encontrada' },
        { status: 404 }
      )
    }
    
    // Se está mudando o número da temporada, verificar conflitos
    if (validatedData.seasonNumber && validatedData.seasonNumber !== existingSeason.seasonNumber) {
      const conflictingSeason = await prisma.season.findFirst({
        where: {
          animeId: existingSeason.animeId,
          seasonNumber: validatedData.seasonNumber,
          id: { not: id }
        }
      })
      
      if (conflictingSeason) {
        return NextResponse.json(
          { error: `Já existe a temporada ${validatedData.seasonNumber} para este anime` },
          { status: 409 }
        )
      }
    }
    
    // Atualizar temporada
    const updatedSeason = await prisma.season.update({
      where: { id },
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
    
    return NextResponse.json(updatedSeason)
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
    
    console.error('Error updating season:', error)
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
    
    // Verificar se a temporada existe e tem episódios
    const existingSeason = await prisma.season.findUnique({
      where: { id },
      include: {
        episodes: true,
        anime: {
          select: {
            title: true
          }
        }
      }
    })
    
    if (!existingSeason) {
      return NextResponse.json(
        { error: 'Temporada não encontrada' },
        { status: 404 }
      )
    }
    
    // Verificar se há episódios associados
    if (existingSeason.episodes.length > 0) {
      return NextResponse.json(
        { 
          error: `Não é possível excluir a temporada ${existingSeason.seasonNumber} pois ela possui ${existingSeason.episodes.length} episódios. Delete os episódios primeiro.`,
          hasEpisodes: true,
          episodeCount: existingSeason.episodes.length
        },
        { status: 409 }
      )
    }
    
    // Deletar temporada
    await prisma.season.delete({
      where: { id }
    })
    
    return NextResponse.json(
      { message: 'Temporada excluída com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting season:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}