import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

    const where: Prisma.PaymentWhereInput = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { subscription: { user: { name: { contains: search, mode: 'insensitive' } } } },
        { subscription: { user: { email: { contains: search, mode: 'insensitive' } } } },
        { externalId: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          subscription: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  avatar: true
                }
              },
              plan: {
                select: {
                  name: true,
                  type: true
                }
              }
            }
          }
        }
      }),
      prisma.payment.count({ where })
    ])

    return NextResponse.json({
      payments: payments.map((p) => ({
        id: p.id,
        amount: parseFloat(p.amount.toString()),
        currency: p.currency,
        status: p.status,
        paymentMethod: p.paymentMethod,
        externalId: p.externalId,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
        user: {
          name: p.subscription.user.name || p.subscription.user.email,
          email: p.subscription.user.email,
          avatar: p.subscription.user.avatar
        },
        plan: {
          name: p.subscription.plan.name,
          type: p.subscription.plan.type
        }
      })),
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    })
  } catch (error) {
    console.error('Error fetching admin payments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}