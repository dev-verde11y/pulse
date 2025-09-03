import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { SubscriptionManager } from '@/lib/subscription-utils'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const cancelSchema = z.object({
  reason: z.string().optional(),
  immediate: z.boolean().default(false) // Cancel immediately vs at end of billing period
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { reason, immediate } = cancelSchema.parse(body)

    // Get user with current subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const activeSubscription = user.subscriptions[0]
    if (!activeSubscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    if (immediate) {
      // Cancel immediately - downgrade to free
      await SubscriptionManager.downgradeToFree(user.id)
      
      await prisma.subscription.update({
        where: { id: activeSubscription.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason: reason || 'User requested immediate cancellation'
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Subscription cancelled immediately',
        effectiveDate: new Date().toISOString()
      })
    } else {
      // Cancel at end of billing period
      await SubscriptionManager.cancelSubscription(activeSubscription.id, reason)
      
      return NextResponse.json({
        success: true,
        message: 'Subscription will be cancelled at the end of your billing period',
        effectiveDate: activeSubscription.endDate.toISOString(),
        daysRemaining: Math.ceil((activeSubscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      })
    }

  } catch (error) {
    console.error('Subscription cancellation error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' }, 
      { status: 500 }
    )
  }
}