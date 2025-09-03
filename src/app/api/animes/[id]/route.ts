import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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