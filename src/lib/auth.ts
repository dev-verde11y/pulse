import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export interface User {
  id: string
  email: string
  name: string | null
  role: string
}

export async function auth(): Promise<{ user: User } | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return null
    }

    const payload = AuthUtils.verifyToken(token)
    
    if (!payload) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    if (!user) {
      return null
    }

    return { user }
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

export class AuthUtils {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' }) // Reduzido para 2 horas
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as JWTPayload
      return payload
    } catch (error) {
      // Log apenas o tipo de erro, não dados sensíveis
      console.log('[AuthUtils] Token verification failed:', error instanceof Error ? error.name : 'Unknown error')
      return null
    }
  }

  static getTokenFromHeader(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    return authHeader.substring(7)
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 12) {
      return { isValid: false, message: 'Senha deve ter pelo menos 12 caracteres' }
    }

    if (password.length > 128) {
      return { isValid: false, message: 'Senha deve ter menos de 128 caracteres' }
    }

    // Verificar se tem pelo menos uma letra minúscula
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Senha deve conter pelo menos uma letra minúscula' }
    }

    // Verificar se tem pelo menos uma letra maiúscula
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Senha deve conter pelo menos uma letra maiúscula' }
    }

    // Verificar se tem pelo menos um número
    if (!/\d/.test(password)) {
      return { isValid: false, message: 'Senha deve conter pelo menos um número' }
    }

    // Verificar se tem pelo menos um caractere especial
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { isValid: false, message: 'Senha deve conter pelo menos um caractere especial (!@#$%^&*...)' }
    }

    // Verificar senhas comuns/fracas
    const commonPasswords = ['123456789012', 'password123!', 'admin123456!', 'qwerty123456']
    if (commonPasswords.includes(password.toLowerCase())) {
      return { isValid: false, message: 'Senha muito comum. Escolha uma senha mais segura' }
    }

    return { isValid: true }
  }
}