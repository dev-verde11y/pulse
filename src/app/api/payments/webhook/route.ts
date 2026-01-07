import { NextRequest, NextResponse } from 'next/server'
import { PaymentManager } from '@/lib/payments/payment-manager'
import { StripeGateway } from '@/lib/payments/gateways/stripe-gateway'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    console.log('🔔 Webhook received!')
    console.log('Body length:', body.length)
    console.log('Signature:', signature ? 'present' : 'missing')

    const gateway = new StripeGateway()
    const { isValid, event } = await gateway.verifyWebhook(body, signature, webhookSecret)

    if (!isValid) {
      console.error('❌ Webhook signature verification failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('✅ Webhook signature verified')

    console.log('🎯 Processing event:', event.type, 'ID:', event.id)

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('💳 Processing checkout completion...')
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Session ID:', session.id)
        console.log('Payment status:', session.payment_status)
        console.log('Mode:', session.mode)

        const result = await PaymentManager.completeCheckoutSession(session.id)
        console.log('✅ Checkout processed, result:', result ? 'success' : 'no result')
        break

      case 'invoice.payment_succeeded':
        console.log('✅ Processing payment succeeded...')
        await PaymentManager.handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        console.log('✅ Payment succeeded processed')
        break

      case 'invoice.payment_failed':
        console.log('❌ Processing payment failed...')
        await PaymentManager.handlePaymentFailed(event.data.object as Stripe.Invoice)
        console.log('✅ Payment failed processed')
        break

      case 'customer.subscription.updated':
        console.log('🔄 Processing subscription updated...')
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        console.log('🗑️ Processing subscription deleted...')
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      default:
        console.log('ℹ️ Unhandled event type:', event.type)
    }

    console.log('✅ Webhook processing completed successfully')
    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('💥 Webhook processing error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Legacy webhook handlers - now handled by PaymentManager
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing subscription updated:', subscription.id)
  // TODO: Implement subscription update logic in PaymentManager
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing subscription deleted:', subscription.id)
  // TODO: Implement subscription deletion logic in PaymentManager
}