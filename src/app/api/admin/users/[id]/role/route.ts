import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateRoleSchema = z.object({
  role: z.enum(['USER', 'PREMIUM', 'SUPER_PREMIUM', 'ADMIN'], {
    required_error: 'Role is required',
    invalid_type_error: 'Invalid role type'
  })
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const { role } = updateRoleSchema.parse(body)
    
    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        role: true
      }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Se está tentando remover papel de admin, verificar se não é o último
    if (existingUser.role === 'ADMIN' && role !== 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
      })
      
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove admin role from the last admin user' },
          { status: 409 }
        )
      }
    }

    // Atualizar papel do usuário
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { 
        role,
        // Atualizar campos relacionados baseado no papel
        ...(role === 'PREMIUM' || role === 'SUPER_PREMIUM' || role === 'ADMIN' ? {
          adFree: true,
          maxScreens: role === 'SUPER_PREMIUM' || role === 'ADMIN' ? 4 : 2,
          offlineViewing: true,
          gameVaultAccess: role === 'SUPER_PREMIUM' || role === 'ADMIN'
        } : {
          adFree: false,
          maxScreens: 1,
          offlineViewing: false,
          gameVaultAccess: false
        })
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionStatus: true,
        currentPlan: true,
        maxScreens: true,
        offlineViewing: true,
        gameVaultAccess: true,
        adFree: true,
        updatedAt: true
      }
    })
    
    return NextResponse.json({
      message: 'User role updated successfully',
      user: updatedUser
    })
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
    
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}