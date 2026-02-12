import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: List active groups
export async function GET(request: Request) {
    try {
        const groups = await prisma.huntingGroup.findMany({
            where: {
                status: {
                    in: ['OPEN', 'HUNTING']
                }
            },
            include: {
                leader: {
                    select: {
                        name: true,
                        avatar: true
                    }
                },
                members: {
                    include: {
                        user: {
                            select: {
                                avatar: true
                            }
                        }
                    }
                },
                _count: {
                    select: { members: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(groups)
    } catch (error) {
        console.error('Error fetching groups:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}

// POST: Create or Update a group
export async function POST(request: Request) {
    try {
        const userId = request.headers.get('x-user-id')

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, animeId, episodeId } = body

        if (!animeId) {
            return NextResponse.json({ error: 'Anime ID is required' }, { status: 400 })
        }

        // Check if user already has an active group
        const existingGroup = await prisma.huntingGroup.findFirst({
            where: {
                leaderId: userId,
                status: { in: ['OPEN', 'HUNTING'] }
            }
        })

        if (existingGroup) {
            // Update existing group with new episode and redirect there
            const updatedGroup = await prisma.huntingGroup.update({
                where: { id: existingGroup.id },
                data: {
                    episodeId: episodeId || existingGroup.episodeId, // Update episode if provided
                    animeId: animeId || existingGroup.animeId, // Update anime context
                    status: 'OPEN', // Reset status to OPEN if it was HUNTING? Or keep it? Let's keep it simple.
                    updatedAt: new Date()
                }
            })
            return NextResponse.json(updatedGroup)
        }

        // Create new group
        const group = await prisma.huntingGroup.create({
            data: {
                name: name || 'Grupo de Caça',
                animeId,
                episodeId,
                leaderId: userId,
                status: 'OPEN',
                members: {
                    create: {
                        userId: userId,
                        role: 'LEADER'
                    }
                }
            }
        })

        return NextResponse.json(group)
    } catch (error) {
        console.error('Error creating/updating group:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
