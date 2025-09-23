import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// Schema de validação para edição
const updateNotificationSchema = z.object({
  type: z.enum(['NEW_EPISODE', 'NEW_SEASON', 'RECOMMENDATION', 'SYSTEM', 'WATCH_REMINDER']).optional(),
  title: z.string().min(1).max(200).optional(),
  message: z.string().min(1).max(1000).optional(),
  actionUrl: z.string().url().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  data: z.record(z.any()).optional().nullable()
})

// PUT - Editar notificação (admin)
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params
    const notificationId = parseInt(id)
    if (isNaN(notificationId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updateNotificationSchema.parse(body)

    // Verificar se a notificação existe
    const existingNotification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!existingNotification) {
      return NextResponse.json({ error: 'Notificação não encontrada' }, { status: 404 })
    }

    // Atualizar a notificação
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        ...validatedData,
        data: validatedData.data as any
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      notification: {
        id: updatedNotification.id,
        type: updatedNotification.type,
        title: updatedNotification.title,
        message: updatedNotification.message,
        actionUrl: updatedNotification.actionUrl,
        imageUrl: updatedNotification.imageUrl,
        data: updatedNotification.data,
        read: updatedNotification.read,
        userId: updatedNotification.userId,
        user: updatedNotification.user,
        createdAt: updatedNotification.createdAt,
        updatedAt: updatedNotification.updatedAt
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao editar notificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir notificação (admin)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params
    const notificationId = parseInt(id)
    if (isNaN(notificationId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Verificar se a notificação existe
    const existingNotification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!existingNotification) {
      return NextResponse.json({ error: 'Notificação não encontrada' }, { status: 404 })
    }

    // Excluir a notificação
    await prisma.notification.delete({
      where: { id: notificationId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir notificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}