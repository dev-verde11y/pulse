import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Buscar todas as notificações (admin)
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Buscar notificações com informações do usuário
    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.notification.count()
    ])

    // Calcular estatísticas
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [unreadCount, todayCount] = await Promise.all([
      prisma.notification.count({
        where: { read: false }
      }),
      prisma.notification.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      })
    ])

    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      time: formatTimeAgo(notification.createdAt),
      timestamp: notification.createdAt.getTime(),
      read: notification.read,
      actionUrl: notification.actionUrl,
      imageUrl: notification.imageUrl,
      data: notification.data,
      userId: notification.userId,
      user: notification.user,
      createdAt: notification.createdAt,
      readAt: notification.readAt
    }))

    return NextResponse.json({
      notifications: formattedNotifications,
      totalCount,
      stats: {
        total: totalCount,
        unread: unreadCount,
        today: todayCount
      }
    })
  } catch (error) {
    console.error('Erro ao buscar notificações (admin):', error)
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