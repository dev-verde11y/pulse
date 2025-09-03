import { User, Subscription, Plan, SubscriptionStatus, PlanType } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export interface UserWithSubscription extends User {
  subscriptions: (Subscription & { plan: Plan })[]
}

export class SubscriptionManager {
  /**
   * Check if user subscription is expired and update status
   */
  static async checkAndUpdateExpiredSubscriptions() {
    const now = new Date()
    
    // Find users with expired subscriptions
    const expiredUsers = await prisma.user.findMany({
      where: {
        subscriptionExpiry: {
          lt: now
        },
        subscriptionStatus: {
          in: ['ACTIVE', 'GRACE_PERIOD']
        }
      }
    })

    for (const user of expiredUsers) {
      await this.handleExpiredUser(user.id)
    }

    return expiredUsers.length
  }

  /**
   * Handle expired user - set to grace period or downgrade
   */
  static async handleExpiredUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) return

    const now = new Date()
    const gracePeriodDays = 5
    const gracePeriodEnd = new Date(now.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000)

    if (user.subscriptionStatus === 'ACTIVE') {
      // Set to grace period
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: 'GRACE_PERIOD',
          gracePeriodEnd: gracePeriodEnd
        }
      })
    } else if (user.subscriptionStatus === 'GRACE_PERIOD' && user.gracePeriodEnd && user.gracePeriodEnd < now) {
      // Grace period ended - downgrade to free
      await this.downgradeToFree(userId)
    }
  }

  /**
   * Downgrade user to free plan
   */
  static async downgradeToFree(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'EXPIRED',
        currentPlan: 'FREE',
        role: 'USER',
        maxScreens: 1,
        offlineViewing: false,
        gameVaultAccess: false,
        adFree: false,
        autoRenewal: false,
        gracePeriodEnd: null,
        nextBillingDate: null
      }
    })

    // Mark current subscription as expired
    await prisma.subscription.updateMany({
      where: {
        userId: userId,
        status: {
          in: ['ACTIVE', 'GRACE_PERIOD']
        }
      },
      data: {
        status: 'EXPIRED',
        cancelledAt: new Date(),
        cancellationReason: 'Expired due to non-payment'
      }
    })
  }

  /**
   * Upgrade user to a paid plan
   */
  static async upgradeUser(userId: string, planType: PlanType, paymentMethod: string) {
    const plan = await prisma.plan.findUnique({
      where: { type: planType }
    })

    if (!plan) {
      throw new Error('Plan not found')
    }

    const now = new Date()
    let endDate: Date

    // Calculate end date based on billing cycle
    if (plan.billingCycle === 'MONTHLY') {
      endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
    } else if (plan.billingCycle === 'ANNUALLY') {
      endDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 365 days
    } else {
      throw new Error('Unsupported billing cycle')
    }

    // Update user
    const userRole = this.getPlanRole(planType)
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'ACTIVE',
        currentPlan: planType,
        role: userRole,
        subscriptionExpiry: endDate,
        maxScreens: plan.maxScreens,
        offlineViewing: plan.offlineViewing,
        gameVaultAccess: plan.gameVaultAccess,
        adFree: plan.adFree,
        autoRenewal: true,
        lastPaymentDate: now,
        nextBillingDate: endDate,
        gracePeriodEnd: null
      }
    })

    // Create subscription record
    const subscription = await prisma.subscription.create({
      data: {
        userId: userId,
        planId: plan.id,
        status: 'ACTIVE',
        startDate: now,
        endDate: endDate,
        amount: plan.price,
        currency: plan.currency,
        paymentMethod: paymentMethod,
        nextBillingDate: endDate
      }
    })

    return subscription
  }

  /**
   * Renew subscription
   */
  static async renewSubscription(subscriptionId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true, user: true }
    })

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    const now = new Date()
    let newEndDate: Date

    // Calculate new end date
    if (subscription.plan.billingCycle === 'MONTHLY') {
      newEndDate = new Date(subscription.endDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    } else {
      newEndDate = new Date(subscription.endDate.getTime() + 365 * 24 * 60 * 60 * 1000)
    }

    // Update subscription
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        endDate: newEndDate,
        renewalCount: subscription.renewalCount + 1,
        lastRenewalDate: now,
        nextBillingDate: newEndDate
      }
    })

    // Update user
    await prisma.user.update({
      where: { id: subscription.userId },
      data: {
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiry: newEndDate,
        lastPaymentDate: now,
        nextBillingDate: newEndDate,
        gracePeriodEnd: null
      }
    })

    return newEndDate
  }

  /**
   * Cancel subscription (at end of billing period)
   */
  static async cancelSubscription(subscriptionId: string, reason?: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId }
    })

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    // Update subscription to cancel at end of period
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        autoRenewal: false,
        cancellationReason: reason || 'User cancelled'
      }
    })

    // Update user auto-renewal
    await prisma.user.update({
      where: { id: subscription.userId },
      data: {
        autoRenewal: false
      }
    })
  }

  /**
   * Get plan role based on plan type
   */
  static getPlanRole(planType: PlanType) {
    switch (planType) {
      case 'FREE':
        return 'USER'
      case 'FAN':
        return 'PREMIUM'
      case 'MEGA_FAN':
      case 'MEGA_FAN_ANNUAL':
        return 'SUPER_PREMIUM'
      default:
        return 'USER'
    }
  }

  /**
   * Check if user can access feature
   */
  static canAccessFeature(user: User, feature: string): boolean {
    switch (feature) {
      case 'ad_free':
        return user.adFree
      case 'offline_viewing':
        return user.offlineViewing
      case 'game_vault':
        return user.gameVaultAccess
      case 'multiple_screens':
        return user.maxScreens > 1
      case 'hd_quality':
        return user.currentPlan !== 'FREE'
      case '4k_quality':
        return user.currentPlan === 'MEGA_FAN' || user.currentPlan === 'MEGA_FAN_ANNUAL'
      default:
        return false
    }
  }

  /**
   * Get days until expiry
   */
  static getDaysUntilExpiry(user: User): number | null {
    if (!user.subscriptionExpiry) return null
    
    const now = new Date()
    const diffTime = user.subscriptionExpiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays > 0 ? diffDays : 0
  }

  /**
   * Check if user is in grace period
   */
  static isInGracePeriod(user: User): boolean {
    return user.subscriptionStatus === 'GRACE_PERIOD' && 
           !!user.gracePeriodEnd && 
           user.gracePeriodEnd > new Date()
  }
}