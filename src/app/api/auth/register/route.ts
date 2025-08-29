import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { AuthUtils } from '@/lib/auth'
import { registerRateLimiter } from '@/lib/rateLimit'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Rate limiting baseado no IP
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    
    const rateLimitResult = registerRateLimiter.isRateLimited(clientIP)
    
    if (rateLimitResult.limited) {
      const resetTime = new Date(rateLimitResult.resetTime!).toLocaleTimeString()
      return NextResponse.json(
        { 
          error: `Muitas tentativas de registro. Tente novamente às ${resetTime}`,
          resetTime: rateLimitResult.resetTime
        },
        { status: 429 }
      )
    }

    // Validação básica
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Validação de email
    if (!AuthUtils.validateEmail(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Validação rigorosa de senha
    const passwordValidation = AuthUtils.validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      )
    }

    // Verifica se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })

    // Gera JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '2h' } // Reduzido para 2 horas
    )

    return NextResponse.json({
      message: 'User created successfully',
      user,
      token
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}