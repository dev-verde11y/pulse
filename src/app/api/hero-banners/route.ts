import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const heroBanners = await prisma.heroBanner.findMany({
      where: {
        isActive: true,
      },
      include: {
        anime: {
          include: {
            seasons: {
              include: {
                episodes: true
              }
            }
          }
        }
      },
      orderBy: {
        displayOrder: 'asc'
      }
    })

    return NextResponse.json(heroBanners)
  } catch (error) {
    console.error('Error fetching hero banners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hero banners' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const heroBanner = await prisma.heroBanner.create({
      data: {
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        backgroundImage: body.backgroundImage,
        logo: body.logo,
        type: body.type || 'anime',
        year: body.year,
        rating: body.rating || '16+',
        duration: body.duration || '24 min',
        episode: body.episode,
        genres: body.genres || [],
        displayOrder: body.displayOrder || 0,
        isActive: body.isActive !== undefined ? body.isActive : true,
        animeId: body.animeId
      },
      include: {
        anime: true
      }
    })

    return NextResponse.json(heroBanner, { status: 201 })
  } catch (error) {
    console.error('Error creating hero banner:', error)
    return NextResponse.json(
      { error: 'Failed to create hero banner' },
      { status: 500 }
    )
  }
}