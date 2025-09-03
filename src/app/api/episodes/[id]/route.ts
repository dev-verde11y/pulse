import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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