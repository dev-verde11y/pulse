import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user with subscription data directly from users table
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get plan details
    const plan = await prisma.plan.findUnique({
      where: {
        type: user.currentPlan
      }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Check if user has no active subscription (FREE plan)
    if (user.currentPlan === 'FREE' || user.subscriptionStatus === 'EXPIRED' || user.subscriptionStatus === 'CANCELLED') {
      return NextResponse.json(
        { message: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Calculate period dates based on billing cycle
    const currentPeriodStart = user.lastPaymentDate || user.createdAt
    const currentPeriodEnd = user.subscriptionExpiry || user.nextBillingDate

    // Format response
    const response = {
      id: user.id,
      planType: user.currentPlan,
      status: user.subscriptionStatus.toLowerCase(), // Convert to lowercase for consistency
      currentPeriodStart: currentPeriodStart,
      currentPeriodEnd: currentPeriodEnd,
      cancelAt: user.subscriptionStatus === 'CANCELLED' ? user.subscriptionExpiry : null,
      canceledAt: null,
      externalId: null,
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        billingCycle: plan.billingCycle,
        features: plan.features,
        maxScreens: plan.maxScreens,
        offlineViewing: plan.offlineViewing,
        gameVaultAccess: plan.gameVaultAccess
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching user subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}