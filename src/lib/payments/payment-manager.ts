import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { SubscriptionManager } from '@/lib/subscription-utils'
import { PlanType } from '@prisma/client'
import Stripe from 'stripe'

export class PaymentManager {
  /**
   * Create checkout session record in database
   */
  static async createCheckoutSessionRecord(
    sessionData: Stripe.Checkout.Session,
    userId?: string
  ) {
    try {
      const priceId = sessionData.line_items?.data[0]?.price?.id || 'unknown'
      const amount = sessionData.amount_total ? sessionData.amount_total / 100 : 0
      
      return await prisma.checkoutSession.create({
      data: {
        stripeSessionId: sessionData.id,
        userId: userId || null,
        stripeStatus: sessionData.status || 'open',
        paymentStatus: sessionData.payment_status || 'unpaid',
        mode: sessionData.mode,
        priceId: priceId,
        amount: amount,
        currency: sessionData.currency?.toUpperCase() || 'BRL',
        successUrl: sessionData.success_url,
        cancelUrl: sessionData.cancel_url,
        stripeData: sessionData as any,
        expiresAt: sessionData.expires_at ? new Date(sessionData.expires_at * 1000) : null
      }
    })
    } catch (error) {
      console.error('Failed to save checkout session to database:', error)
      console.log('This might be because the CheckoutSession table does not exist yet.')
      console.log('Please run: npx prisma migrate dev --name add-checkout-sessions')
      throw error
    }
  }

  /**
   * Update checkout session when completed
   */
  static async completeCheckoutSession(sessionId: string) {
    console.log('🔍 Retrieving Stripe session:', sessionId)
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    console.log('📋 Session details:', {
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      mode: session.mode,
      subscription: session.subscription,
      client_reference_id: session.client_reference_id
    })
    
    console.log('🔍 Looking for session in database...')
    const dbSession = await prisma.checkoutSession.findUnique({
      where: { stripeSessionId: sessionId },
      include: { user: true }
    })

    if (!dbSession) {
      console.error('❌ Checkout session not found in database:', sessionId)
      console.log('💡 This might be normal if checkout was created before database tracking was enabled')
      return null
    }
    
    console.log('✅ Found database session:', {
      id: dbSession.id,
      userId: dbSession.userId,
      status: dbSession.stripeStatus
    })

    // Update session status
    console.log('📝 Updating checkout session status...')
    await prisma.checkoutSession.update({
      where: { id: dbSession.id },
      data: {
        stripeStatus: session.status || 'complete',
        paymentStatus: session.payment_status || 'paid',
        completedAt: new Date(),
        stripeData: session as any
      }
    })
    console.log('✅ Checkout session updated')

    // Handle subscription creation
    if (session.mode === 'subscription' && session.subscription) {
      console.log('🚀 Processing subscription creation...')
      const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string)
      console.log('📋 Stripe subscription details:', {
        id: stripeSubscription.id,
        status: stripeSubscription.status,
        customer: stripeSubscription.customer,
        current_period_start: stripeSubscription.current_period_start,
        current_period_end: stripeSubscription.current_period_end
      })
      
      await this.processSubscriptionFromCheckout(stripeSubscription, dbSession.userId, dbSession.id)
    } else {
      console.log('ℹ️ Not a subscription or no subscription ID found')
    }

    return dbSession
  }

  /**
   * Process subscription after checkout completion
   */
  static async processSubscriptionFromCheckout(
    stripeSubscription: Stripe.Subscription,
    userId: string | null,
    checkoutSessionId: string
  ) {
    console.log('🎯 Processing subscription from checkout...')
    console.log('User ID:', userId)
    console.log('Checkout Session ID:', checkoutSessionId)
    
    if (!userId) {
      console.error('❌ No user ID for subscription creation')
      return null
    }

    const priceId = stripeSubscription.items.data[0]?.price.id
    if (!priceId) {
      console.error('No price ID found in subscription')
      return null
    }

    // Map price ID to plan type (você precisa ajustar esses IDs)
    let planType: PlanType
    if (priceId === process.env.STRIPE_PRICE_ID) {
      planType = 'FAN' // Mensal
    } else if (priceId === process.env.STRIPE_SUBSCRIPTION_PRICE_ID) {
      planType = 'MEGA_FAN_ANNUAL' // Anual
    } else {
      // Try to find plan by looking up price in our database or mapping
      console.warn('Unknown price ID, defaulting to FAN:', priceId)
      planType = 'FAN'
    }

    // Create subscription using existing manager
    const subscription = await SubscriptionManager.upgradeUser(userId, planType, 'stripe')

    // Update with Stripe data
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        externalId: stripeSubscription.id,
        externalData: stripeSubscription as any,
        transactionId: stripeSubscription.id
      }
    })

    // Link checkout session to subscription
    await prisma.checkoutSession.update({
      where: { id: checkoutSessionId },
      data: { subscriptionId: subscription.id }
    })

    // Create initial payment record
    await this.createPaymentRecord({
      subscriptionId: subscription.id,
      amount: (stripeSubscription.items.data[0]?.price.unit_amount || 0) / 100,
      currency: stripeSubscription.currency.toUpperCase(),
      status: 'completed',
      paymentMethod: 'stripe',
      externalId: stripeSubscription.latest_invoice as string,
      paidAt: new Date()
    })

    return subscription
  }

  /**
   * Create payment record
   */
  static async createPaymentRecord(data: {
    subscriptionId: string
    amount: number
    currency: string
    status: string
    paymentMethod: string
    externalId?: string
    paidAt?: Date
    dueDate?: Date
  }) {
    return await prisma.payment.create({
      data: {
        subscriptionId: data.subscriptionId,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        paymentMethod: data.paymentMethod,
        externalId: data.externalId,
        paidAt: data.paidAt,
        dueDate: data.dueDate
      }
    })
  }

  /**
   * Handle payment succeeded (renewals)
   */
  static async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string | null
    
    if (!subscriptionId) return

    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId)
    const dbSubscription = await prisma.subscription.findFirst({
      where: { externalId: stripeSubscription.id }
    })

    if (!dbSubscription) {
      console.error('Subscription not found in database:', stripeSubscription.id)
      return
    }

    // Create payment record for renewal
    await this.createPaymentRecord({
      subscriptionId: dbSubscription.id,
      amount: (invoice.amount_paid || 0) / 100,
      currency: invoice.currency.toUpperCase(),
      status: 'completed',
      paymentMethod: 'stripe',
      externalId: invoice.id,
      paidAt: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : new Date()
    })

    // Renew subscription
    if (dbSubscription) {
      await SubscriptionManager.renewSubscription(dbSubscription.id)
    }
  }

  /**
   * Handle payment failed
   */
  static async handlePaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string | null
    
    if (!subscriptionId) return

    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId)
    const dbSubscription = await prisma.subscription.findFirst({
      where: { externalId: stripeSubscription.id }
    })

    if (!dbSubscription) return

    // Create failed payment record
    await this.createPaymentRecord({
      subscriptionId: dbSubscription.id,
      amount: (invoice.amount_due || 0) / 100,
      currency: invoice.currency.toUpperCase(),
      status: 'failed',
      paymentMethod: 'stripe',
      externalId: invoice.id,
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : undefined
    })

    // Handle user downgrade/grace period
    await SubscriptionManager.handleExpiredUser(dbSubscription.userId)
  }

  /**
   * Handle abandoned checkouts (expired sessions)
   */
  static async handleAbandonedCheckouts() {
    const expiredSessions = await prisma.checkoutSession.findMany({
      where: {
        stripeStatus: 'open',
        expiresAt: {
          lt: new Date()
        }
      }
    })

    for (const session of expiredSessions) {
      try {
        const stripeSession = await stripe.checkout.sessions.retrieve(session.stripeSessionId)
        
        await prisma.checkoutSession.update({
          where: { id: session.id },
          data: {
            stripeStatus: stripeSession.status || 'expired',
            stripeData: stripeSession as any
          }
        })
      } catch (error) {
        console.error('Error updating abandoned checkout:', error)
      }
    }

    return expiredSessions.length
  }

  /**
   * Get payment analytics
   */
  static async getPaymentAnalytics(startDate: Date, endDate: Date) {
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        subscription: {
          include: {
            plan: true,
            user: true
          }
        }
      }
    })

    const analytics = {
      totalRevenue: payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount), 0),
      
      totalPayments: payments.length,
      successfulPayments: payments.filter(p => p.status === 'completed').length,
      failedPayments: payments.filter(p => p.status === 'failed').length,
      
      paymentsByMethod: payments.reduce((acc, p) => {
        acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    return analytics
  }
}