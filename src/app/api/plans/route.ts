import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: {
        active: true
      },
      orderBy: {
        displayOrder: 'asc'
      },
      select: {
        id: true,
        name: true,
        type: true,
        billingCycle: true,
        price: true,
        description: true,
        features: true,
        popular: true,
        maxScreens: true,
        offlineViewing: true,
        gameVaultAccess: true,
        adFree: true,
      },
    })

    // Converte Decimal para number
    const formattedPlans = plans.map(plan => ({
      ...plan,
      price: Number(plan.price),
    }))

    return NextResponse.json({ plans: formattedPlans })
  } catch (error) {
    console.error('Erro ao buscar planos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}