import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { SubscriptionManager } from '@/lib/subscription-utils'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user with subscription details
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          where: {
            status: {
              in: ['ACTIVE', 'GRACE_PERIOD', 'CANCELLED']
            }
          },
          include: {
            plan: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5 // Last 5 subscriptions
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentSubscription = user.subscriptions.find(s => s.status === 'ACTIVE' || s.status === 'GRACE_PERIOD')
    const daysUntilExpiry = SubscriptionManager.getDaysUntilExpiry(user)
    const isInGracePeriod = SubscriptionManager.isInGracePeriod(user)

    // Get available plans
    const availablePlans = await prisma.plan.findMany({
      where: { active: true },
      orderBy: { displayOrder: 'asc' }
    })

    const response = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        currentPlan: user.currentPlan,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiry: user.subscriptionExpiry,
        daysUntilExpiry: daysUntilExpiry,
        isInGracePeriod: isInGracePeriod,
        features: {
          maxScreens: user.maxScreens,
          offlineViewing: user.offlineViewing,
          gameVaultAccess: user.gameVaultAccess,
          adFree: user.adFree
        },
        billing: {
          autoRenewal: user.autoRenewal,
          nextBillingDate: user.nextBillingDate,
          lastPaymentDate: user.lastPaymentDate
        }
      },
      currentSubscription: currentSubscription ? {
        id: currentSubscription.id,
        plan: currentSubscription.plan,
        status: currentSubscription.status,
        startDate: currentSubscription.startDate,
        endDate: currentSubscription.endDate,
        amount: currentSubscription.amount,
        currency: currentSubscription.currency,
        autoRenewal: currentSubscription.autoRenewal,
        renewalCount: currentSubscription.renewalCount
      } : null,
      subscriptionHistory: user.subscriptions.map(sub => ({
        id: sub.id,
        planName: sub.plan.name,
        status: sub.status,
        startDate: sub.startDate,
        endDate: sub.endDate,
        amount: sub.amount,
        cancelledAt: sub.cancelledAt,
        cancellationReason: sub.cancellationReason
      })),
      availablePlans: availablePlans.map(plan => ({
        id: plan.id,
        name: plan.name,
        type: plan.type,
        billingCycle: plan.billingCycle,
        price: plan.price,
        currency: plan.currency,
        description: plan.description,
        features: plan.features,
        popular: plan.popular,
        maxScreens: plan.maxScreens,
        offlineViewing: plan.offlineViewing,
        gameVaultAccess: plan.gameVaultAccess,
        adFree: plan.adFree
      })),
      featureAccess: {
        canAccessAdFree: SubscriptionManager.canAccessFeature(user, 'ad_free'),
        canAccessOffline: SubscriptionManager.canAccessFeature(user, 'offline_viewing'),
        canAccessGameVault: SubscriptionManager.canAccessFeature(user, 'game_vault'),
        canAccessMultipleScreens: SubscriptionManager.canAccessFeature(user, 'multiple_screens'),
        canAccessHD: SubscriptionManager.canAccessFeature(user, 'hd_quality'),
        canAccess4K: SubscriptionManager.canAccessFeature(user, '4k_quality')
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Subscription status error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription status' }, 
      { status: 500 }
    )
  }
}