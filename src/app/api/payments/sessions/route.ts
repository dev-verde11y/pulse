import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {
      userId: session.user.id
    }

    if (status) {
      where.stripeStatus = status
    }

    const sessions = await prisma.checkoutSession.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        subscription: {
          include: {
            plan: true
          }
        }
      }
    })

    return NextResponse.json({
      sessions: sessions.map(s => ({
        id: s.id,
        stripeSessionId: s.stripeSessionId,
        status: s.stripeStatus,
        paymentStatus: s.paymentStatus,
        mode: s.mode,
        amount: s.amount,
        currency: s.currency,
        createdAt: s.createdAt,
        completedAt: s.completedAt,
        expiresAt: s.expiresAt,
        subscription: s.subscription ? {
          id: s.subscription.id,
          planName: s.subscription.plan.name,
          status: s.subscription.status
        } : null
      }))
    })

  } catch (error) {
    console.error('Sessions error:', error)
    return NextResponse.json(
      { error: 'Failed to get sessions' },
      { status: 500 }
    )
  }
}