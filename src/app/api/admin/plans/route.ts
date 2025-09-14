import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createPlanSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['FREE', 'FAN', 'MEGA_FAN', 'MEGA_FAN_ANNUAL']),
  billingCycle: z.enum(['MONTHLY', 'ANNUALLY', 'LIFETIME']),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Preço deve ser um valor decimal válido'),
  currency: z.string().min(3).max(3).default('BRL'),
  maxScreens: z.number().int().min(1).max(10).default(1),
  offlineViewing: z.boolean().default(false),
  gameVaultAccess: z.boolean().default(false),
  adFree: z.boolean().default(false),
  description: z.string().min(1, 'Descrição é obrigatória'),
  features: z.array(z.string()).default([]),
  active: z.boolean().default(true),
  displayOrder: z.number().int().min(0).default(0),
  popular: z.boolean().default(false)
})

const plansQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  type: z.enum(['FREE', 'FAN', 'MEGA_FAN', 'MEGA_FAN_ANNUAL']).optional(),
  billingCycle: z.enum(['MONTHLY', 'ANNUALLY', 'LIFETIME']).optional(),
  active: z.string().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'price', 'displayOrder', 'createdAt']).optional().default('displayOrder'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc')
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams)
    
    const {
      page,
      limit,
      type,
      billingCycle,
      active,
      search,
      sortBy,
      sortOrder
    } = plansQuerySchema.parse(params)

    const skip = (page - 1) * limit
    
    const where: any = {}
    
    // Filtro por tipo
    if (type) {
      where.type = type
    }
    
    // Filtro por ciclo de cobrança
    if (billingCycle) {
      where.billingCycle = billingCycle
    }
    
    // Filtro por status ativo
    if (active !== undefined) {
      where.active = active
    }
    
    // Filtro por busca de texto
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    const orderBy: any = {}
    switch (sortBy) {
      case 'name':
        orderBy.name = sortOrder
        break
      case 'price':
        orderBy.price = sortOrder
        break
      case 'displayOrder':
        orderBy.displayOrder = sortOrder
        break
      case 'createdAt':
        orderBy.createdAt = sortOrder
        break
      default:
        orderBy.displayOrder = 'asc'
        break
    }

    const [plans, total] = await Promise.all([
      prisma.plan.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: {
              subscriptions: true
            }
          }
        }
      }),
      prisma.plan.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      plans,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validatedData = createPlanSchema.parse(body)
    
    // Verificar se o tipo de plano é único
    const existingPlan = await prisma.plan.findUnique({
      where: { type: validatedData.type }
    })
    
    if (existingPlan) {
      return NextResponse.json(
        { error: 'Um plano com este tipo já existe' },
        { status: 409 }
      )
    }
    
    // Criar plano
    const newPlan = await prisma.plan.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            subscriptions: true
          }
        }
      }
    })
    
    return NextResponse.json(newPlan, { status: 201 })
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
    
    console.error('Error creating plan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}