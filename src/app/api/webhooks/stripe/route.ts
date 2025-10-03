import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('❌ No Stripe signature found')
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }

    // Verifica a assinatura do webhook
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    console.log('='.repeat(80))
    console.log('📥 STRIPE WEBHOOK RECEIVED')
    console.log('='.repeat(80))
    console.log('Event Type:', event.type)
    console.log('Event ID:', event.id)

    // Processa eventos de checkout completado
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      console.log('Session ID:', session.id)
      console.log('Payment Status:', session.payment_status)
      console.log('Metadata:', session.metadata)

      // Verifica se é uma renovação
      const isRenewal = session.metadata?.isRenewal === 'true'
      const userId = session.metadata?.userId
      const planId = session.metadata?.planId

      if (!userId || !planId) {
        console.error('❌ Missing userId or planId in metadata')
        return NextResponse.json({ received: true })
      }

      // Busca o plano
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
      })

      if (!plan) {
        console.error('❌ Plan not found:', planId)
        return NextResponse.json({ received: true })
      }

      // Calcula nova data de expiração
      const now = new Date()
      const expiryDate = new Date(now)

      if (plan.billingCycle === 'MONTHLY') {
        expiryDate.setMonth(expiryDate.getMonth() + 1)
      } else if (plan.billingCycle === 'YEARLY') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1)
      }

      // Calcula grace period (7 dias após expiração)
      const gracePeriodEnd = new Date(expiryDate)
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7)

      if (isRenewal) {
        console.log('🔄 PROCESSING RENEWAL')
        console.log('User ID:', userId)
        console.log('Plan:', plan.name)
        console.log('Previous Plan:', session.metadata?.previousPlan)
        console.log('Previous Status:', session.metadata?.previousStatus)

        // Atualiza o usuário existente (RENOVAÇÃO)
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: 'ACTIVE',
            currentPlan: plan.type,
            subscriptionExpiry: expiryDate,
            gracePeriodEnd: gracePeriodEnd,
            lastPaymentDate: now,
            nextBillingDate: expiryDate,
            stripeCustomerId: session.customer as string || undefined,
            stripeSubscriptionId: session.subscription as string || undefined,

            // Benefícios do plano
            adFree: plan.adFree,
            offlineViewing: plan.offlineViewing,
            gameVaultAccess: plan.gameVaultAccess,
            maxScreens: plan.maxScreens,
          },
        })

        console.log('✅ USER RENEWED SUCCESSFULLY')
        console.log('Email:', updatedUser.email)
        console.log('New Status:', updatedUser.subscriptionStatus)
        console.log('New Expiry:', updatedUser.subscriptionExpiry)
        console.log('New Plan:', updatedUser.currentPlan)

        // Cria registro de Subscription
        const subscription = await prisma.subscription.create({
          data: {
            userId: userId,
            planId: planId,
            status: 'ACTIVE',
            startDate: now,
            endDate: expiryDate,
            amount: plan.price,
            currency: 'BRL',
            paymentMethod: 'credit_card',
            transactionId: session.payment_intent as string || undefined,
            externalId: session.subscription as string || undefined,
            externalData: session as any,
            nextBillingDate: expiryDate,
          },
        })

        console.log('✅ SUBSCRIPTION RECORD CREATED:', subscription.id)

        // Cria registro de Payment
        const payment = await prisma.payment.create({
          data: {
            subscriptionId: subscription.id,
            amount: plan.price,
            currency: 'BRL',
            status: 'completed',
            paymentMethod: 'credit_card',
            externalId: session.payment_intent as string || undefined,
            paidAt: now,
          },
        })

        console.log('✅ PAYMENT RECORD CREATED:', payment.id)

        // Atualiza a sessão de checkout
        await prisma.checkoutSession.updateMany({
          where: { stripeSessionId: session.id },
          data: {
            stripeStatus: 'complete',
            paymentStatus: session.payment_status,
            subscriptionId: subscription.id,
          },
        })

      } else {
        console.log('🆕 PROCESSING NEW SUBSCRIPTION')

        // Nova assinatura (comportamento existente)
        const customerEmail = session.customer_details?.email || session.customer_email

        if (!customerEmail) {
          console.error('❌ No customer email found')
          return NextResponse.json({ received: true })
        }

        // Verifica se o usuário já existe
        let user = await prisma.user.findUnique({
          where: { email: customerEmail },
        })

        if (user) {
          // Atualiza usuário existente
          user = await prisma.user.update({
            where: { email: customerEmail },
            data: {
              subscriptionStatus: 'ACTIVE',
              currentPlan: plan.type,
              subscriptionExpiry: expiryDate,
              gracePeriodEnd: gracePeriodEnd,
              lastPaymentDate: now,
              nextBillingDate: expiryDate,
              stripeCustomerId: session.customer as string || undefined,
              stripeSubscriptionId: session.subscription as string || undefined,

              adFree: plan.adFree,
              offlineViewing: plan.offlineViewing,
              gameVaultAccess: plan.gameVaultAccess,
              maxScreens: plan.maxScreens,
            },
          })

          console.log('✅ EXISTING USER UPDATED')
          console.log('Email:', user.email)

          // Cria registro de Subscription
          const subscription = await prisma.subscription.create({
            data: {
              userId: user.id,
              planId: planId,
              status: 'ACTIVE',
              startDate: now,
              endDate: expiryDate,
              amount: plan.price,
              currency: 'BRL',
              paymentMethod: 'credit_card',
              transactionId: session.payment_intent as string || undefined,
              externalId: session.subscription as string || undefined,
              externalData: session as any,
              nextBillingDate: expiryDate,
            },
          })

          console.log('✅ SUBSCRIPTION RECORD CREATED:', subscription.id)

          // Cria registro de Payment
          const payment = await prisma.payment.create({
            data: {
              subscriptionId: subscription.id,
              amount: plan.price,
              currency: 'BRL',
              status: 'completed',
              paymentMethod: 'credit_card',
              externalId: session.payment_intent as string || undefined,
              paidAt: now,
            },
          })

          console.log('✅ PAYMENT RECORD CREATED:', payment.id)

          // Atualiza a sessão de checkout
          await prisma.checkoutSession.updateMany({
            where: { stripeSessionId: session.id },
            data: {
              stripeStatus: 'complete',
              paymentStatus: session.payment_status,
              subscriptionId: subscription.id,
            },
          })
        } else {
          console.log('⚠️ User not found for email:', customerEmail)
        }
      }
    }

    // Processa eventos de assinatura deletada/cancelada
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription

      console.log('🗑️ SUBSCRIPTION DELETED')
      console.log('Subscription ID:', subscription.id)

      // Busca usuário pela subscriptionId
      const user = await prisma.user.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      })

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: 'EXPIRED',
            adFree: false,
            offlineViewing: false,
            gameVaultAccess: false,
          },
        })

        console.log('✅ User subscription expired:', user.email)
      }
    }

    console.log('='.repeat(80))
    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
