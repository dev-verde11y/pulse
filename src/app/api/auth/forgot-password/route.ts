import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Rate limiting simples (em produção, usar Redis ou similar)
const resetAttempts = new Map<string, { count: number; timestamp: number }>()

function checkRateLimit(email: string): boolean {
  const now = Date.now()
  const attempt = resetAttempts.get(email)

  if (attempt) {
    // Limpa depois de 1 hora
    if (now - attempt.timestamp > 60 * 60 * 1000) {
      resetAttempts.delete(email)
      return true
    }

    // Máximo 3 tentativas por hora
    if (attempt.count >= 3) {
      return false
    }

    attempt.count++
    return true
  }

  resetAttempts.set(email, { count: 1, timestamp: now })
  return true
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validação
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    const emailRegex = /\S+@\S+\.\S+/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Rate limiting
    if (!checkRateLimit(email)) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em 1 hora.' },
        { status: 429 }
      )
    }

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Por segurança, sempre retorna sucesso mesmo se o email não existir
    // Isso previne enumeração de usuários
    if (!user) {
      // Aguarda um tempo aleatório para parecer processamento real
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))

      return NextResponse.json({
        message: 'Se o email existir, um link de recuperação será enviado',
      })
    }

    // Gera token de reset
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    // Salva token no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // TODO: Enviar email com link de reset
    // Por enquanto, apenas loga o token (em produção, usar serviço de email)
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password/${resetToken}`

    console.log('='.repeat(80))
    console.log('PASSWORD RESET REQUEST')
    console.log('='.repeat(80))
    console.log('Email:', email)
    console.log('Reset URL:', resetUrl)
    console.log('Token expires in: 1 hour')
    console.log('='.repeat(80))

    // Em produção, aqui você enviaria o email com o link
    // Exemplo com Nodemailer, SendGrid, etc:
    /*
    await sendEmail({
      to: email,
      subject: 'Recuperação de Senha - Pulse',
      html: `
        <h1>Recuperação de Senha</h1>
        <p>Você solicitou a recuperação de senha da sua conta Pulse.</p>
        <p>Clique no link abaixo para criar uma nova senha:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Este link expira em 1 hora.</p>
        <p>Se você não solicitou esta recuperação, ignore este email.</p>
      `
    })
    */

    return NextResponse.json({
      message: 'Se o email existir, um link de recuperação será enviado',
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}
