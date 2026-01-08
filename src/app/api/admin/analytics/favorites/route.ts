import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Get most favorited animes ranking
        const favoriteStats = await prisma.favorite.groupBy({
            by: ['animeId'],
            _count: {
                animeId: true
            },
            orderBy: {
                _count: {
                    animeId: 'desc'
                }
            },
            take: 20
        })

        // Fetch anime details for these favorites
        const animeIds = favoriteStats.map(stat => stat.animeId)
        const animes = await prisma.anime.findMany({
            where: {
                id: {
                    in: animeIds
                }
            },
            select: {
                id: true,
                title: true,
                thumbnail: true,
                banner: true,
                slug: true,
                type: true,
                year: true
            }
        })

        // Merge stats with details
        const favoritesRanking = favoriteStats.map(stat => {
            const anime = animes.find(a => a.id === stat.animeId)
            return {
                count: stat._count.animeId,
                ...anime
            }
        })

        return NextResponse.json({
            ranking: favoritesRanking
        })
    } catch (error) {
        console.error('Error fetching admin favorites stats:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
