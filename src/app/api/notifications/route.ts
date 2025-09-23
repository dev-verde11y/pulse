import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validação para criar notificação
const createNotificationSchema = z.object({
  type: z.enum(['NEW_EPISODE', 'NEW_SEASON', 'RECOMMENDATION', 'SYSTEM', 'WATCH_REMINDER']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  actionUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  data: z.record(z.any()).optional(),
  userId: z.string().optional(), // Para enviar para usuário específico
  userIds: z.array(z.string()).optional(), // Para enviar para múltiplos usuários
  sendToAll: z.boolean().optional(), // Para enviar para todos os usuários
  targetPlans: z.array(z.enum(['FREE', 'FAN', 'MEGA_FAN', 'MEGA_FAN_ANNUAL'])).optional() // Para enviar por planos
})

// GET - Buscar notificações do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const where: any = {
      userId: session.user.id
    }

    if (unreadOnly) {
      where.read = false
    }

    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.notification.count({ where })
    ])

    return NextResponse.json({
      notifications: notifications.map(notification => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        time: formatTimeAgo(notification.createdAt),
        timestamp: notification.createdAt.getTime(),
        read: notification.read,
        actionUrl: notification.actionUrl,
        imageUrl: notification.imageUrl,
        data: notification.data
      })),
      totalCount,
      unreadCount: await prisma.notification.count({
        where: { userId: session.user.id, read: false }
      })
    })
  } catch (error) {
    console.error('Erro ao buscar notificações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova notificação (apenas admins)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createNotificationSchema.parse(body)

    let targetUserIds: string[] = []

    if (validatedData.sendToAll) {
      // Buscar todos os usuários ativos
      const users = await prisma.user.findMany({
        where: {
          // Apenas usuários com planos ativos
          OR: [
            { currentPlan: 'FAN' },
            { currentPlan: 'MEGA_FAN' },
            { currentPlan: 'MEGA_FAN_ANNUAL' },
            { currentPlan: 'FREE' }
          ]
        },
        select: { id: true }
      })
      targetUserIds = users.map(u => u.id)
    } else if (validatedData.targetPlans && validatedData.targetPlans.length > 0) {
      // Buscar usuários com planos específicos
      const users = await prisma.user.findMany({
        where: {
          currentPlan: {
            in: validatedData.targetPlans
          }
        },
        select: { id: true }
      })
      targetUserIds = users.map(u => u.id)
    } else if (validatedData.userIds && validatedData.userIds.length > 0) {
      targetUserIds = validatedData.userIds
    } else if (validatedData.userId) {
      targetUserIds = [validatedData.userId]
    } else {
      return NextResponse.json(
        { error: 'Deve especificar userId, userIds, targetPlans ou sendToAll' },
        { status: 400 }
      )
    }

    // Criar notificações para todos os usuários alvo
    const notifications = await prisma.notification.createMany({
      data: targetUserIds.map(userId => ({
        type: validatedData.type,
        title: validatedData.title,
        message: validatedData.message,
        actionUrl: validatedData.actionUrl,
        imageUrl: validatedData.imageUrl,
        data: validatedData.data as any,
        userId,
        read: false
      }))
    })

    return NextResponse.json({
      success: true,
      notificationsCreated: notifications.count,
      targetUsers: targetUserIds.length
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar notificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Agora'
  if (minutes < 60) return `${minutes} min atrás`
  if (hours < 24) return `${hours} hora${hours > 1 ? 's' : ''} atrás`
  return `${days} dia${days > 1 ? 's' : ''} atrás`
}