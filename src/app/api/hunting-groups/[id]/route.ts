import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const group = await prisma.huntingGroup.findUnique({
            where: { id },
            include: {
                leader: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true
                            }
                        }
                    }
                },
                episode: {
                    include: {
                        season: true
                    }
                }
            }
        })

        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 })
        }

        return NextResponse.json(group)
    } catch (error) {
        console.error('Error fetching group:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        // Body can contain: { isPlaying: boolean, currentTime: number, episodeId: string }

        const userId = request.headers.get('x-user-id')
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify if user is leader
        const group = await prisma.huntingGroup.findUnique({
            where: { id },
            select: { leaderId: true }
        })

        if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

        if (group.leaderId !== userId) {
            return NextResponse.json({ error: 'Only the leader can update group state' }, { status: 403 })
        }

        const updatedGroup = await prisma.huntingGroup.update({
            where: { id },
            data: {
                isPlaying: body.isPlaying,
                currentTime: body.currentTime,
                episodeId: body.episodeId,
                status: body.status, // e.g. 'HUNTING'
                updatedAt: new Date()
            }
        })

        return NextResponse.json(updatedGroup)
    } catch (error) {
        console.error('Error updating group:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
