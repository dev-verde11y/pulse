import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const watchHistoryQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20)
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams)
    const { page, limit } = watchHistoryQuerySchema.parse(params)
    
    const skip = (page - 1) * limit

    const [history, total] = await Promise.all([
      prisma.watchHistory.findMany({
        where: { userId: session.user.id },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          anime: {
            include: {
              _count: {
                select: {
                  seasons: true
                }
              }
            }
          }
        }
      }),
      prisma.watchHistory.count({
        where: { userId: session.user.id }
      })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      history,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching watch history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { animeId, episodeId, watchedAt, progress } = await request.json()

    if (!animeId || !episodeId) {
      return NextResponse.json(
        { error: 'Anime ID and Episode ID are required' },
        { status: 400 }
      )
    }

    const watchHistory = await prisma.watchHistory.upsert({
      where: {
        userId_animeId_episodeId: {
          userId: session.user.id,
          animeId,
          episodeId
        }
      },
      update: {
        watchedAt: watchedAt ? new Date(watchedAt) : new Date(),
        progress: progress || null
      },
      create: {
        userId: session.user.id,
        animeId,
        episodeId,
        watchedAt: watchedAt ? new Date(watchedAt) : new Date(),
        progress: progress || null
      },
      include: {
        anime: true
      }
    })

    return NextResponse.json(watchHistory, { status: 201 })
  } catch (error) {
    console.error('Error updating watch history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}