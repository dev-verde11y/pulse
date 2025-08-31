import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { loginRateLimiter } from '@/lib/rateLimit'
import { SubscriptionManager } from '@/lib/subscription-utils'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validação básica
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Rate limiting baseado no email do usuário
    const rateLimitResult = loginRateLimiter.isRateLimited(email)
    
    if (rateLimitResult.limited) {
      const resetTime = new Date(rateLimitResult.resetTime!).toLocaleTimeString()
      return NextResponse.json(
        { 
          error: `Muitas tentativas de login para este usuário. Tente novamente às ${resetTime}`,
          resetTime: rateLimitResult.resetTime
        },
        { status: 429 }
      )
    }

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verifica a senha
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verificar status da assinatura e atualizar se necessário
    const now = new Date()
    
    // Se o usuário tem data de expiração e ela já passou
    if (user.subscriptionExpiry && user.subscriptionExpiry < now) {
      // Atualizar status do usuário expirado
      if (user.subscriptionStatus === 'ACTIVE') {
        await SubscriptionManager.handleExpiredUser(user.id)
        // Recarregar dados do usuário atualizado
        const updatedUser = await prisma.user.findUnique({
          where: { email }
        })
        if (updatedUser) {
          Object.assign(user, updatedUser)
        }
      }
    }

    // Permitir login para todos os usuários, mas marcar se está expirado
    const isExpired = user.subscriptionStatus === 'EXPIRED'

    // Se estiver em período de graça, permitir login mas notificar
    const isInGracePeriod = SubscriptionManager.isInGracePeriod(user)
    const daysUntilExpiry = SubscriptionManager.getDaysUntilExpiry(user)

    // Gera JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '2h' } // Reduzido para 2 horas
    )

    // Retorna dados do usuário (sem senha)
    const { password: _, ...userWithoutPassword } = user

    const response = {
      message: 'Login successful',
      user: userWithoutPassword,
      token,
      subscriptionInfo: {
        isExpired,
        isInGracePeriod,
        daysUntilExpiry,
        subscriptionStatus: user.subscriptionStatus
      }
    }

    // Adicionar informações específicas baseado no status
    if (isExpired) {
      response.message = 'Login realizado - Assinatura expirada'
      
      // Buscar planos disponíveis
      const availablePlans = await prisma.plan.findMany({
        where: { 
          active: true,
          type: { not: 'FREE' }
        },
        orderBy: { displayOrder: 'asc' }
      })

      Object.assign(response.subscriptionInfo, {
        expiredWarning: 'Sua assinatura expirou. Renove para continuar acessando todo o conteúdo do Pulse.',
        showRenewalModal: true,
        availablePlans
      })
    } else if (isInGracePeriod) {
      response.message = 'Login realizado - Atenção: Sua assinatura está em período de graça'
      const graceDaysLeft = user.gracePeriodEnd ? 
        Math.ceil((user.gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0
      
      Object.assign(response.subscriptionInfo, {
        gracePeriodWarning: `Sua assinatura expirou. Você tem ${graceDaysLeft} dias para renovar antes de perder o acesso.`,
        graceDaysLeft,
        showRenewalModal: true
      })
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}