import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verifica autenticação e se é admin
    const authResult = await auth()
    if (!authResult || authResult.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { id: userId } = await params

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        currentPlan: true,
        subscriptionStatus: true,
        subscriptionExpiry: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Não permite expirar admin
    if (user.email === authResult.user.email) {
      return NextResponse.json(
        { error: 'Você não pode expirar sua própria conta' },
        { status: 400 }
      )
    }

    // Expira a assinatura imediatamente
    const now = new Date()

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'EXPIRED',
        subscriptionExpiry: now, // Define como agora (expirado)
        gracePeriodEnd: null, // Remove período de graça
        adFree: false,
        offlineViewing: false,
        gameVaultAccess: false,
        // Não mexe no currentPlan para manter histórico
      },
      select: {
        id: true,
        email: true,
        name: true,
        currentPlan: true,
        subscriptionStatus: true,
        subscriptionExpiry: true,
      }
    })

    console.log('='.repeat(80))
    console.log('SUBSCRIPTION MANUALLY EXPIRED')
    console.log('='.repeat(80))
    console.log('Admin:', authResult.user.email)
    console.log('User affected:', updatedUser.email)
    console.log('Previous status:', user.subscriptionStatus)
    console.log('New status:', updatedUser.subscriptionStatus)
    console.log('Expired at:', now.toISOString())
    console.log('='.repeat(80))

    return NextResponse.json({
      message: 'Assinatura expirada com sucesso',
      user: updatedUser
    })

  } catch (error) {
    console.error('Expire subscription error:', error)
    return NextResponse.json(
      { error: 'Erro ao expirar assinatura' },
      { status: 500 }
    )
  }
}
