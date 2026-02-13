import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params
        const userId = request.headers.get('x-user-id')
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = params // Group ID

        // Check if group exists and is open
        const group = await prisma.huntingGroup.findUnique({
            where: { id },
            include: { members: true }
        })

        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 })
        }

        if (group.status === 'CLOSED') {
            return NextResponse.json({ error: 'Group is closed' }, { status: 403 })
        }

        // Check if user is already a member
        const existingMember = await prisma.groupMember.findFirst({
            where: {
                groupId: id,
                userId: userId
            }
        })

        if (existingMember) {
            return NextResponse.json({ message: 'Already a member' }, { status: 200 })
        }

        // Add user to group
        const member = await prisma.groupMember.create({
            data: {
                groupId: id,
                userId: userId,
                role: 'MEMBER'
            }
        })

        return NextResponse.json(member)
    } catch (error) {
        console.error('Error joining group:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
