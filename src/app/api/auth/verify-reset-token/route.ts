import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      )
    }

    // Busca usuário pelo token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token ainda não expirou
        },
      },
      select: {
        id: true,
        email: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      email: user.email,
    })

  } catch (error) {
    console.error('Verify token error:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar token' },
      { status: 500 }
    )
  }
}
