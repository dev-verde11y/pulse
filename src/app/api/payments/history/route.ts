import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get URL parameters for pagination
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Find all payments for user's subscriptions
    const payments = await prisma.payment.findMany({
      where: {
        subscription: {
          userId: session.user.id
        }
      },
      include: {
        subscription: {
          include: {
            plan: {
              select: {
                name: true,
                type: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Format response
    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      paidAt: payment.paidAt,
      dueDate: payment.dueDate,
      createdAt: payment.createdAt,
      externalId: payment.externalId,
      subscription: {
        id: payment.subscription.id,
        planType: payment.subscription.plan.type, // Get from plan.type instead
        plan: {
          name: payment.subscription.plan.name,
          type: payment.subscription.plan.type
        }
      }
    }))

    // Get total count for pagination
    const totalCount = await prisma.payment.count({
      where: {
        subscription: {
          userId: session.user.id
        }
      }
    })

    return NextResponse.json({
      payments: formattedPayments,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + payments.length < totalCount
      }
    })

  } catch (error) {
    console.error('Error fetching payment history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}