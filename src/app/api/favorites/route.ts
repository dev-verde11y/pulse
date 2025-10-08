import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        anime: {
          include: {
            _count: {
              select: {
                seasons: true,
                favorites: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(favorites.map(fav => fav.anime))
  } catch (error) {
    console.error('Error fetching favorites:', error)
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

    const { animeId } = await request.json()

    if (!animeId) {
      return NextResponse.json(
        { error: 'Anime ID is required' },
        { status: 400 }
      )
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_animeId: {
          userId: session.user.id,
          animeId
        }
      }
    })

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Anime already in favorites' },
        { status: 409 }
      )
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        animeId
      },
      include: {
        anime: true
      }
    })

    return NextResponse.json(favorite, { status: 201 })
  } catch (error) {
    console.error('Error adding to favorites:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const deletedCount = await prisma.favorite.deleteMany({
      where: { userId: session.user.id }
    })

    return NextResponse.json({ 
      message: 'All favorites cleared successfully',
      deletedCount: deletedCount.count 
    })
  } catch (error) {
    console.error('Error clearing all favorites:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}