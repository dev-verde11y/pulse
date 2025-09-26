import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateUserSchema = z.object({
  name: z.string().optional().nullable(),
  role: z.enum(['USER', 'PREMIUM', 'SUPER_PREMIUM', 'ADMIN']).optional(),
  subscriptionStatus: z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING', 'GRACE_PERIOD']).optional(),
  currentPlan: z.enum(['FREE', 'FAN', 'MEGA_FAN', 'MEGA_FAN_ANNUAL']).optional(),
  maxScreens: z.number().int().positive().optional(),
  offlineViewing: z.boolean().optional(),
  gameVaultAccess: z.boolean().optional(),
  adFree: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  language: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
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
        lastPaymentDate: true,
        nextBillingDate: true,
        autoRenewal: true,
        gracePeriodEnd: true,
        language: true,
        emailNotifications: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            subscriptions: true,
            watchHistory: true,
            favorites: true,
            checkoutSessions: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validar dados de entrada
    const validatedData = updateUserSchema.parse(body)

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: validatedData,
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
    })
    
    return NextResponse.json(updatedUser)
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
    
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        _count: {
          select: {
            subscriptions: true,
            watchHistory: true,
            favorites: true
          }
        }
      }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verificar se não é o último admin
    if (existingUser.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
      })
      
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last admin user' },
          { status: 409 }
        )
      }
    }
    
    // Excluir usuário (cascade delete vai cuidar das relações)
    await prisma.user.delete({
      where: { id }
    })
    
    return NextResponse.json({
      message: 'User deleted successfully',
      deletedUser: {
        id: existingUser.id,
        email: existingUser.email
      }
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}