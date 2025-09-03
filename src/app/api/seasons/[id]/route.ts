import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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