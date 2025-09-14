import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updatePlanSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  type: z.enum(['FREE', 'FAN', 'MEGA_FAN', 'MEGA_FAN_ANNUAL']).optional(),
  billingCycle: z.enum(['MONTHLY', 'ANNUALLY', 'LIFETIME']).optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Preço deve ser um valor decimal válido').optional(),
  currency: z.string().min(3).max(3).optional(),
  maxScreens: z.number().int().min(1).max(10).optional(),
  offlineViewing: z.boolean().optional(),
  gameVaultAccess: z.boolean().optional(),
  adFree: z.boolean().optional(),
  description: z.string().min(1, 'Descrição é obrigatória').optional(),
  features: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
  popular: z.boolean().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const plan = await prisma.plan.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            subscriptions: true
          }
        },
        subscriptions: {
          take: 10,
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error fetching plan:', error)
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
    const validatedData = updatePlanSchema.parse(body)
    
    // Verificar se o plano existe
    const existingPlan = await prisma.plan.findUnique({
      where: { id: params.id }
    })
    
    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Se está mudando o tipo, verificar se o novo tipo já existe
    if (validatedData.type && validatedData.type !== existingPlan.type) {
      const planWithNewType = await prisma.plan.findUnique({
        where: { type: validatedData.type }
      })
      
      if (planWithNewType) {
        return NextResponse.json(
          { error: 'Um plano com este tipo já existe' },
          { status: 409 }
        )
      }
    }
    
    // Atualizar plano
    const updatedPlan = await prisma.plan.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        _count: {
          select: {
            subscriptions: true
          }
        }
      }
    })
    
    return NextResponse.json(updatedPlan)
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
    
    console.error('Error updating plan:', error)
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
    // Verificar se o plano existe
    const existingPlan = await prisma.plan.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            subscriptions: true
          }
        },
        subscriptions: {
          where: {
            status: {
              in: ['ACTIVE', 'PENDING']
            }
          }
        }
      }
    })
    
    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Verificar se há assinaturas ativas
    if (existingPlan.subscriptions.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete plan with active subscriptions',
          hasActiveSubscriptions: true
        },
        { status: 409 }
      )
    }

    // Não permitir excluir plano FREE se for o único
    if (existingPlan.type === 'FREE') {
      const freePlansCount = await prisma.plan.count({
        where: { type: 'FREE' }
      })
      
      if (freePlansCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the only free plan' },
          { status: 409 }
        )
      }
    }
    
    // Excluir plano
    await prisma.plan.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({
      message: 'Plan deleted successfully',
      deletedPlan: {
        id: existingPlan.id,
        name: existingPlan.name,
        type: existingPlan.type
      }
    })
  } catch (error) {
    console.error('Error deleting plan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}