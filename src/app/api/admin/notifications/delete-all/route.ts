import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE - Excluir todas as notificações (admin)
export async function DELETE(request: NextRequest) {
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

    // Contar quantas notificações existem antes de deletar
    const totalNotifications = await prisma.notification.count()

    // Excluir todas as notificações
    const result = await prisma.notification.deleteMany({})

    // Log da ação para auditoria
    console.log(`[ADMIN] ${session.user.id} deletou ${result.count} notificações do sistema`)

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      totalBefore: totalNotifications,
      message: `${result.count} notificações foram excluídas com sucesso`
    })
  } catch (error) {
    console.error('Erro ao excluir todas as notificações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}