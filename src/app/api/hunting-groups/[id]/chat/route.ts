import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const messages = await prisma.chatMessage.findMany({
            where: { groupId: id },
            orderBy: { createdAt: 'asc' },
            take: 50, // Limit last 50 messages
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        })
        return NextResponse.json(messages)
    } catch (error) {
        console.error('[API Chat Error] Failed to fetch messages:', error)
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = request.headers.get('x-user-id')
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const { content } = await request.json()

        if (!content || !content.trim()) {
            return NextResponse.json({ error: 'Message empty' }, { status: 400 })
        }

        const message = await prisma.chatMessage.create({
            data: {
                content,
                groupId: id,
                userId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        })

        return NextResponse.json(message)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }
}
