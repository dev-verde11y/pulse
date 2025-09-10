import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
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
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      })

      if (user) {
        customerEmail = user.email
        clientReferenceId = user.id
        metadata = { userId: user.id }
      }
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

    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url 
    })

  } catch (error) {
    console.error('Checkout creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' }, 
      { status: 500 }
    )
  }
}