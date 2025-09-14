import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const subscriptionsQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  status: z.enum(['PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'GRACE_PERIOD']).optional(),
  plan: z.enum(['FREE', 'FAN', 'MEGA_FAN', 'MEGA_FAN_ANNUAL']).optional(),
  paymentMethod: z.enum(['credit_card', 'pix', 'boleto']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'startDate', 'endDate', 'amount']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams)
    
    const {
      page,
      limit,
      status,
      plan,
      paymentMethod,
      search,
      sortBy,
      sortOrder
    } = subscriptionsQuerySchema.parse(params)

    const skip = (page - 1) * limit
    
    const where: any = {}
    
    // Filtro por status
    if (status) {
      where.status = status
    }
    
    // Filtro por plano
    if (plan) {
      where.plan = {
        type: plan
      }
    }
    
    // Filtro por método de pagamento
    if (paymentMethod) {
      where.paymentMethod = paymentMethod
    }
    
    // Filtro por busca de texto (email do usuário)
    if (search) {
      where.user = {
        OR: [
          {
            email: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ]
      }
    }

    const orderBy: any = {}
    switch (sortBy) {
      case 'createdAt':
        orderBy.createdAt = sortOrder
        break
      case 'startDate':
        orderBy.startDate = sortOrder
        break
      case 'endDate':
        orderBy.endDate = sortOrder
        break
      case 'amount':
        orderBy.amount = sortOrder
        break
      default:
        orderBy.createdAt = 'desc'
        break
    }

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
      }),
      prisma.subscription.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      subscriptions,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}