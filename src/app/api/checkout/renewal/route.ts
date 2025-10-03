import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação
    const authResult = await auth()
    if (!authResult) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { planId } = await request.json()

    if (!planId) {
      return NextResponse.json(
        { error: 'planId é obrigatório' },
        { status: 400 }
      )
    }

    // Busca o plano
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      )
    }

    // Busca o usuário completo
    const user = await prisma.user.findUnique({
      where: { id: authResult.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        currentPlan: true,
        subscriptionStatus: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // URLs de retorno
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const successUrl = `${baseUrl}/dashboard?renewal=success`
    const cancelUrl = `${baseUrl}/login?renewal=cancelled`

    // Cria sessão do Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: Math.round(Number(plan.price) * 100), // Converte para centavos
            recurring: {
              interval: plan.billingCycle === 'MONTHLY' ? 'month' : 'year',
            },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
        planId: plan.id,
        planType: plan.type,
        isRenewal: 'true', // Flag importante para webhook
        previousPlan: user.currentPlan,
        previousStatus: user.subscriptionStatus,
      },
    })

    // Salva a sessão no banco
    await prisma.checkoutSession.create({
      data: {
        stripeSessionId: session.id,
        stripeStatus: session.status || 'open',
        paymentStatus: session.payment_status,
        mode: session.mode,
        priceId: planId,
        amount: plan.price,
        currency: 'BRL',
        successUrl,
        cancelUrl,
        userId: user.id,
        stripeData: session as any,
      },
    })

    console.log('='.repeat(80))
    console.log('RENEWAL CHECKOUT SESSION CREATED')
    console.log('='.repeat(80))
    console.log('User:', user.email)
    console.log('Plan:', plan.name)
    console.log('Previous Plan:', user.currentPlan)
    console.log('Previous Status:', user.subscriptionStatus)
    console.log('Session ID:', session.id)
    console.log('Session URL:', session.url)
    console.log('='.repeat(80))

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    })

  } catch (error) {
    console.error('Renewal checkout error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar sessão de renovação' },
      { status: 500 }
    )
  }
}
