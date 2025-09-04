import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ animeId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { animeId } = await params

    if (!animeId) {
      return NextResponse.json(
        { error: 'Anime ID is required' },
        { status: 400 }
      )
    }

    // Buscar todos os episódios assistidos deste anime pelo usuário
    const watchHistory = await prisma.watchHistory.findMany({
      where: {
        userId: session.user.id,
        animeId
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    if (watchHistory.length === 0) {
      return NextResponse.json(
        { error: 'No watch history found for this anime' },
        { status: 404 }
      )
    }

    // Buscar informações completas do anime para análise
    const anime = await prisma.anime.findUnique({
      where: { id: animeId },
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
    })

    if (!anime) {
      return NextResponse.json(
        { error: 'Anime not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      watchHistory,
      anime,
      lastWatched: watchHistory[0] // Mais recente
    })
  } catch (error) {
    console.error('Error fetching anime watch history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}