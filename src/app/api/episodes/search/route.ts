import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ episodes: [] })
    }

    const episodes = await prisma.episode.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            season: {
              anime: {
                title: {
                  contains: query,
                  mode: 'insensitive'
                }
              }
            }
          }
        ]
      },
      include: {
        season: {
          include: {
            anime: {
              select: {
                id: true,
                title: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: [
        {
          season: {
            anime: {
              title: 'asc'
            }
          }
        },
        {
          season: {
            seasonNumber: 'asc'
          }
        },
        {
          episodeNumber: 'asc'
        }
      ],
      take: 50
    })

    const formattedEpisodes = episodes.map(episode => ({
      id: episode.id,
      episodeNumber: episode.episodeNumber,
      title: episode.title,
      animeId: episode.season.anime.id,
      animeTitle: episode.season.anime.title,
      animeSlug: episode.season.anime.slug,
      seasonId: episode.season.id,
      seasonNumber: episode.season.seasonNumber,
      hasVideo: !!episode.videoUrl,
      hasThumbnail: !!episode.thumbnailUrl
    }))

    return NextResponse.json({
      episodes: formattedEpisodes,
      total: formattedEpisodes.length
    })

  } catch (error) {
    console.error('Episode search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}