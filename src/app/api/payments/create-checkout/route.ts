import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { PaymentManager } from '@/lib/payments/payment-manager'
import { z } from 'zod'

const checkoutSchema = z.object({
  priceId: z.string(),
  mode: z.enum(['subscription', 'payment']).default('subscription')
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()
    const { priceId, mode } = checkoutSchema.parse(body)

    let customerEmail = 'usuario@sememail.com'
    let clientReferenceId = 'guest_user'
    let metadata = { userId: 'guest_user' }

    // If user is authenticated, use their data
    if (session?.user?.id) {
      customerEmail = session.user.email
      clientReferenceId = session.user.id
      metadata = { userId: session.user.id }
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: mode,
      customer_email: customerEmail,
      client_reference_id: clientReferenceId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payments/cancel`,
      metadata: metadata,
    })

    // Save session to database
    try {
      await PaymentManager.createCheckoutSessionRecord(
        checkoutSession, 
        session?.user?.id
      )
      console.log('Checkout session saved to database successfully')
    } catch (dbError) {
      console.error('Database save error (non-blocking):', dbError)
      // Continue anyway - Stripe checkout session was created successfully
      // The webhook will handle the completion tracking
    }

    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url 
    })

  } catch (error) {
    console.error('Checkout creation error:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}