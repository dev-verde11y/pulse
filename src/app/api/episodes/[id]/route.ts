import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateEpisodeSchema = z.object({
  episodeNumber: z.number().int().positive().optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  duration: z.number().int().positive().optional(),
  thumbnailUrl: z.string().url().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  r2Key: z.string().optional().nullable(),
  thumbnailR2Key: z.string().optional().nullable(),
  airDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null)
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const episode = await prisma.episode.findUnique({
      where: { id },
      include: {
        season: {
          include: {
            anime: {
              include: {
                seasons: {
                  include: {
                    episodes: {
                      orderBy: { episodeNumber: 'asc' }
                    }
                  },
                  orderBy: { seasonNumber: 'asc' }
                }
              }
            }
          }
        }
      }
    })

    if (!episode) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      )
    }

    // Adicionar seasonNumber ao episódio para facilitar o uso no frontend
    const episodeWithSeason = {
      ...episode,
      seasonNumber: episode.season.seasonNumber
    }

    return NextResponse.json(episodeWithSeason)
  } catch (error) {
    console.error('Error fetching episode:', error)
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
    
    // Validate request body
    const validatedData = updateEpisodeSchema.parse(body)
    
    // Check if episode exists
    const existingEpisode = await prisma.episode.findUnique({
      where: { id },
      include: { season: true }
    })
    
    if (!existingEpisode) {
      return NextResponse.json(
        { error: 'Episódio não encontrado' },
        { status: 404 }
      )
    }
    
    // If changing episode number, check for conflicts
    if (validatedData.episodeNumber && validatedData.episodeNumber !== existingEpisode.episodeNumber) {
      const conflictingEpisode = await prisma.episode.findFirst({
        where: {
          seasonId: existingEpisode.seasonId,
          episodeNumber: validatedData.episodeNumber,
          id: { not: id }
        }
      })
      
      if (conflictingEpisode) {
        return NextResponse.json(
          { 
            error: `Já existe o episódio ${validatedData.episodeNumber} nesta temporada`,
            conflictType: 'episodeNumber'
          },
          { status: 409 }
        )
      }
    }
    
    // Update episode
    const updateData: Partial<typeof validatedData> & { thumbnail?: string | null } = { ...validatedData }
    
    // Update legacy thumbnail field if thumbnailUrl is provided
    if (validatedData.thumbnailUrl !== undefined) {
      updateData.thumbnail = validatedData.thumbnailUrl
    }
    
    const updatedEpisode = await prisma.episode.update({
      where: { id },
      data: updateData,
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
    
    return NextResponse.json(updatedEpisode)
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
    
    console.error('Error updating episode:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
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
    
    // Check if episode exists
    const existingEpisode = await prisma.episode.findUnique({
      where: { id },
      include: {
        season: {
          include: {
            anime: {
              select: {
                title: true
              }
            }
          }
        }
      }
    })
    
    if (!existingEpisode) {
      return NextResponse.json(
        { error: 'Episódio não encontrado' },
        { status: 404 }
      )
    }
    
    // Delete episode
    await prisma.episode.delete({
      where: { id }
    })
    
    return NextResponse.json(
      { 
        message: 'Episódio excluído com sucesso',
        deletedEpisode: {
          id: existingEpisode.id,
          title: existingEpisode.title,
          episodeNumber: existingEpisode.episodeNumber,
          anime: existingEpisode.season.anime.title,
          seasonNumber: existingEpisode.season.seasonNumber
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting episode:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}