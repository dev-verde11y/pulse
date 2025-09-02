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
      }
    })
    
    return NextResponse.json(plans)
  } catch (error) {
    console.error('Erro ao buscar planos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}