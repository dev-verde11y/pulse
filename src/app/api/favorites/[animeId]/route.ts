import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ animeId: string }> }
) {
  try {
    const { animeId } = await params
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_animeId: {
          userId: session.user.id,
          animeId
        }
      }
    })

    if (!favorite) {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      )
    }

    await prisma.favorite.delete({
      where: {
        userId_animeId: {
          userId: session.user.id,
          animeId
        }
      }
    })

    return NextResponse.json({ message: 'Favorite removed successfully' })
  } catch (error) {
    console.error('Error removing from favorites:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}