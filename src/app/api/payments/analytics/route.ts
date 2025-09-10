import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PaymentManager } from '@/lib/payments/payment-manager'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    // Only admins can access analytics
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const endDate = new Date()

    const analytics = await PaymentManager.getPaymentAnalytics(startDate, endDate)

    // Get checkout session stats
    const checkoutStats = await prisma.checkoutSession.groupBy({
      by: ['stripeStatus'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // Get abandoned checkouts
    const abandonedCheckouts = await prisma.checkoutSession.count({
      where: {
        stripeStatus: 'expired',
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    return NextResponse.json({
      period: {
        startDate,
        endDate,
        days
      },
      payments: analytics,
      checkoutSessions: {
        byStatus: checkoutStats.reduce((acc, stat) => {
          acc[stat.stripeStatus] = stat._count.id
          return acc
        }, {} as Record<string, number>),
        abandoned: abandonedCheckouts
      }
    })

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    )
  }
}