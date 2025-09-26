import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const cancelSubscriptionSchema = z.object({
  cancellationReason: z.string().min(1, 'Cancellation reason is required')
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validar dados de entrada
    const { cancellationReason } = cancelSubscriptionSchema.parse(body)

    // Verificar se a assinatura existe
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })
    
    if (!existingSubscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Verificar se a assinatura pode ser cancelada
    if (existingSubscription.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Subscription is already cancelled' },
        { status: 409 }
      )
    }

    if (existingSubscription.status === 'EXPIRED') {
      return NextResponse.json(
        { error: 'Cannot cancel an expired subscription' },
        { status: 409 }
      )
    }

    // Cancelar assinatura
    const cancelledSubscription = await prisma.$transaction(async (tx) => {
      // Atualizar assinatura
      const updatedSubscription = await tx.subscription.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason,
          autoRenewal: false,
          nextBillingDate: null
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          plan: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      })

      // Atualizar dados do usuário
      await tx.user.update({
        where: { id: existingSubscription.userId },
        data: {
          subscriptionStatus: 'CANCELLED',
          currentPlan: 'FREE',
          autoRenewal: false,
          // Remover benefícios premium
          adFree: false,
          maxScreens: 1,
          offlineViewing: false,
          gameVaultAccess: false
        }
      })

      return updatedSubscription
    })
    
    return NextResponse.json({
      message: 'Subscription cancelled successfully',
      subscription: cancelledSubscription
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    console.error('Error cancelling subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}