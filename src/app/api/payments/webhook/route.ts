import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { SubscriptionManager } from '@/lib/subscription-utils'
import { PlanType } from '@prisma/client'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Received webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as any)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as any)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout completed:', session.id)

  const userId = session.client_reference_id || session.metadata?.userId
  if (!userId) {
    console.error('No user ID found in checkout session')
    return
  }

  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    console.error('User not found:', userId)
    return
  }

  if (session.mode === 'subscription' && session.subscription) {
    // Handle subscription
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    await processSubscription(subscription, userId)
  } else if (session.mode === 'payment') {
    // Handle one-time payment
    // For now, we'll treat this as a monthly subscription
    await handleOneTimePayment(session, userId)
  }
}

async function handlePaymentSucceeded(invoice: any) {
  console.log('Processing payment succeeded:', invoice.id)

  // Check if invoice has subscription (for subscription payments)
  const subscriptionId = invoice.subscription as string | null
  
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const userId = subscription.metadata?.userId

    if (userId) {
      // Renew/activate subscription
      const dbSubscription = await prisma.subscription.findFirst({
        where: {
          externalId: subscription.id,
          userId: userId
        }
      })

      if (dbSubscription) {
        await SubscriptionManager.renewSubscription(dbSubscription.id)
      }
    }
  }
}

async function handlePaymentFailed(invoice: any) {
  console.log('Processing payment failed:', invoice.id)

  // Check if invoice has subscription (for subscription payments)  
  const subscriptionId = invoice.subscription as string | null
  
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const userId = subscription.metadata?.userId

    if (userId) {
      // Handle failed payment - could put in grace period
      await SubscriptionManager.handleExpiredUser(userId)
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing subscription updated:', subscription.id)

  const userId = subscription.metadata?.userId
  if (!userId) return

  // Update subscription status based on Stripe status
  const dbSubscription = await prisma.subscription.findFirst({
    where: {
      externalId: subscription.id,
      userId: userId
    }
  })

  if (dbSubscription) {
    let status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED'
    
    switch (subscription.status) {
      case 'active':
        status = 'ACTIVE'
        break
      case 'canceled':
      case 'unpaid':
        status = 'CANCELLED'
        break
      default:
        status = 'EXPIRED'
    }

    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        status: status,
        ...(status === 'CANCELLED' && {
          cancelledAt: new Date(),
          cancellationReason: 'Cancelled via Stripe'
        })
      }
    })

    // Update user status
    if (status === 'CANCELLED' || status === 'EXPIRED') {
      await SubscriptionManager.downgradeToFree(userId)
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing subscription deleted:', subscription.id)

  const userId = subscription.metadata?.userId
  if (!userId) return

  // Mark subscription as cancelled and downgrade user
  const dbSubscription = await prisma.subscription.findFirst({
    where: {
      externalId: subscription.id,
      userId: userId
    }
  })

  if (dbSubscription) {
    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: 'Cancelled via Stripe'
      }
    })

    await SubscriptionManager.downgradeToFree(userId)
  }
}

async function processSubscription(subscription: Stripe.Subscription, userId: string) {
  const priceId = subscription.items.data[0]?.price.id
  if (!priceId) return

  // Map price IDs to plan types
  let planType: PlanType
  if (priceId === process.env.STRIPE_PRICE_ID) {
    planType = 'FAN' // Monthly
  } else if (priceId === process.env.STRIPE_SUBSCRIPTION_PRICE_ID) {
    planType = 'MEGA_FAN_ANNUAL' // Annual
  } else {
    console.error('Unknown price ID:', priceId)
    return
  }

  // Create or update subscription
  const dbSubscription = await SubscriptionManager.upgradeUser(userId, planType, 'stripe')

  // Link to Stripe subscription
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      externalId: subscription.id,
      externalData: subscription as any
    }
  })
}

async function handleOneTimePayment(session: Stripe.Checkout.Session, userId: string) {
  // For one-time payments, create a monthly subscription
  // This is a simplified approach - you might want different logic
  await SubscriptionManager.upgradeUser(userId, 'FAN', 'stripe')
}