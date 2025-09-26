import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar se a assinatura existe
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        },
        plan: {
          select: {
            id: true,
            name: true,
            type: true,
            maxScreens: true,
            offlineViewing: true,
            gameVaultAccess: true,
            adFree: true
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

    // Verificar se a assinatura pode ser reativada
    if (existingSubscription.status !== 'CANCELLED') {
      return NextResponse.json(
        { error: 'Only cancelled subscriptions can be reactivated' },
        { status: 409 }
      )
    }

    // Verificar se ainda não expirou
    const now = new Date()
    const endDate = new Date(existingSubscription.endDate)
    
    if (endDate < now) {
      return NextResponse.json(
        { error: 'Cannot reactivate expired subscription' },
        { status: 409 }
      )
    }

    // Reativar assinatura
    const reactivatedSubscription = await prisma.$transaction(async (tx) => {
      // Atualizar assinatura
      const updatedSubscription = await tx.subscription.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          cancelledAt: null,
          cancellationReason: null,
          autoRenewal: true,
          // Recalcular próximo faturamento se necessário
          nextBillingDate: endDate > now ? endDate : null
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

      // Atualizar dados do usuário baseado no plano
      const planType = existingSubscription.plan.type
      await tx.user.update({
        where: { id: existingSubscription.userId },
        data: {
          subscriptionStatus: 'ACTIVE',
          currentPlan: planType,
          autoRenewal: true,
          // Restaurar benefícios baseado no plano
          adFree: existingSubscription.plan.adFree,
          maxScreens: existingSubscription.plan.maxScreens,
          offlineViewing: existingSubscription.plan.offlineViewing,
          gameVaultAccess: existingSubscription.plan.gameVaultAccess
        }
      })

      return updatedSubscription
    })
    
    return NextResponse.json({
      message: 'Subscription reactivated successfully',
      subscription: reactivatedSubscription
    })
  } catch (error) {
    console.error('Error reactivating subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}