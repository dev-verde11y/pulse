import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const usersQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  role: z.enum(['USER', 'PREMIUM', 'SUPER_PREMIUM', 'ADMIN']).optional(),
  plan: z.enum(['FREE', 'FAN', 'MEGA_FAN', 'MEGA_FAN_ANNUAL']).optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING', 'GRACE_PERIOD']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['email', 'name', 'role', 'createdAt']).optional().default('email'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc')
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams)
    
    const {
      page,
      limit,
      role,
      plan,
      status,
      search,
      sortBy,
      sortOrder
    } = usersQuerySchema.parse(params)

    const skip = (page - 1) * limit
    
    const where: any = {}
    
    // Filtro por papel
    if (role) {
      where.role = role
    }
    
    // Filtro por plano
    if (plan) {
      where.currentPlan = plan
    }
    
    // Filtro por status
    if (status) {
      where.subscriptionStatus = status
    }
    
    // Filtro por busca de texto
    if (search) {
      where.OR = [
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

    const orderBy: any = {}
    switch (sortBy) {
      case 'email':
        orderBy.email = sortOrder
        break
      case 'name':
        orderBy.name = sortOrder
        break
      case 'role':
        orderBy.role = sortOrder
        break
      case 'createdAt':
        orderBy.createdAt = sortOrder
        break
      default:
        orderBy.email = 'asc'
        break
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          subscriptionStatus: true,
          currentPlan: true,
          subscriptionExpiry: true,
          maxScreens: true,
          offlineViewing: true,
          gameVaultAccess: true,
          adFree: true,
          language: true,
          emailNotifications: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              subscriptions: true,
              watchHistory: true,
              favorites: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}