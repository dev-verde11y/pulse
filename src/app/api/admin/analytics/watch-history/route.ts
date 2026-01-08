import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search')
        const skip = (page - 1) * limit

        const where: Prisma.WatchHistoryWhereInput = {}

        if (search) {
            where.OR = [
                { user: { name: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { anime: { title: { contains: search, mode: 'insensitive' } } }
            ]
        }

        const [history, total] = await Promise.all([
            prisma.watchHistory.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    watchedAt: 'desc'
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            avatar: true
                        }
                    },
                    anime: {
                        select: {
                            title: true,
                            thumbnail: true,
                            slug: true
                        }
                    }
                }
            }),
            prisma.watchHistory.count({ where })
        ])

        return NextResponse.json({
            history: history.map(h => ({
                id: h.id,
                progress: h.progress,
                watchedAt: h.watchedAt,
                completed: h.completed,
                user: {
                    name: h.user.name || h.user.email,
                    email: h.user.email,
                    avatar: h.user.avatar
                },
                anime: {
                    title: h.anime.title,
                    thumbnail: h.anime.thumbnail,
                    slug: h.anime.slug
                }
            })),
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        })
    } catch (error) {
        console.error('Error fetching admin watch history:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
