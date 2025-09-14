import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const paymentsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  status: z.string().optional(),
  paymentMethod: z.string().optional(),
  search: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = paymentsQuerySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      status: searchParams.get('status') || undefined,
      paymentMethod: searchParams.get('paymentMethod') || undefined,
      search: searchParams.get('search') || undefined
    })

    const page = parseInt(query.page)
    const limit = parseInt(query.limit)
    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (query.status) {
      where.status = query.status
    }
    
    if (query.paymentMethod) {
      where.paymentMethod = query.paymentMethod
    }

    if (query.search) {
      where.OR = [
        { externalId: { contains: query.search, mode: 'insensitive' } },
        { subscription: { 
          user: { 
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } }
            ]
          }
        }}
      ]
    }

    // Get payments with pagination
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: {
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

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}