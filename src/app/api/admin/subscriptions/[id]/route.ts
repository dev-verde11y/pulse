import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSubscriptionSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'GRACE_PERIOD']).optional(),
  endDate: z.string().datetime().optional(),
  autoRenewal: z.boolean().optional(),
  nextBillingDate: z.string().datetime().optional().nullable(),
  cancellationReason: z.string().optional().nullable()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        plan: {
          select: {
            id: true,
            name: true,
            type: true,
            price: true,
            currency: true,
            description: true,
            features: true
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            paymentMethod: true,
            paidAt: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validatedData = updateSubscriptionSchema.parse(body)
    
    // Verificar se a assinatura existe
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id: params.id }
    })
    
    if (!existingSubscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }
    
    // Atualizar assinatura
    const updatedSubscription = await prisma.subscription.update({
      where: { id: params.id },
      data: validatedData,
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
            type: true,
            price: true,
            currency: true
          }
        }
      }
    })
    
    return NextResponse.json(updatedSubscription)
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
    
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se a assinatura existe
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
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

    // Excluir assinatura (cascade delete vai cuidar dos payments)
    await prisma.subscription.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({
      message: 'Subscription deleted successfully',
      deletedSubscription: {
        id: existingSubscription.id,
        userEmail: existingSubscription.user.email
      }
    })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}