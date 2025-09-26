'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { NotificationForm } from '@/components/admin/NotificationForm'
import { NotificationList } from '@/components/admin/NotificationList'
import { useNotifications, Notification } from '@/hooks/useNotifications'

export default function NotificationsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null)
  const [allNotifications, setAllNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    today: 0
  })

  // Função para buscar todas as notificações (incluindo de outros usuários) para admin
  const fetchAllNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/notifications')
      if (!response.ok) {
        throw new Error('Erro ao buscar notificações')
      }
      const data = await response.json()
      setAllNotifications(data.notifications || [])
      setStats(data.stats || { total: 0, unread: 0, today: 0 })
    } catch (err) {
      setError('Erro ao carregar notificações')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllNotifications()
  }, [])

  const handleCreateNotification = async (notificationData: Omit<Notification, 'id' | 'timestamp' | 'time'>) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      })

      if (!response.ok) {
        throw new Error('Erro ao criar notificação')
      }

      await fetchAllNotifications() // Recarregar lista
      setIsCreateModalOpen(false)
    } catch (err) {
      console.error('Erro ao criar notificação:', err)
      throw err
    }
  }

  const handleEditNotification = async (id: number, notificationData: Partial<Omit<Notification, 'id' | 'timestamp'>>) => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      })

      if (!response.ok) {
        throw new Error('Erro ao editar notificação')
      }

      await fetchAllNotifications() // Recarregar lista
      setEditingNotification(null)
    } catch (err) {
      console.error('Erro ao editar notificação:', err)
      throw err
    }
  }

  const handleDeleteNotification = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta notificação?')) return

    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir notificação')
      }

      await fetchAllNotifications() // Recarregar lista
    } catch (err) {
      console.error('Erro ao excluir notificação:', err)
      alert('Erro ao excluir notificação')
    }
  }

  const handleDeleteAllNotifications = async () => {
    // Confirmação dupla para segurança
    const firstConfirm = confirm('⚠️ ATENÇÃO: Você está prestes a excluir TODAS as notificações do sistema. Esta ação não pode ser desfeita!')
    if (!firstConfirm) return

    const secondConfirm = confirm('Tem ABSOLUTA CERTEZA? Digite "DELETAR TODAS" se realmente deseja continuar.')
    if (!secondConfirm) return

    // Solicitar confirmação por texto
    const confirmationText = prompt('Para confirmar, digite "DELETAR TODAS" (em maiúsculas):')
    if (confirmationText !== 'DELETAR TODAS') {
      alert('Confirmação incorreta. Operação cancelada.')
      return
    }

    try {
      const response = await fetch('/api/admin/notifications/delete-all', {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir todas as notificações')
      }

      const data = await response.json()
      alert(`✅ ${data.deletedCount} notificações foram excluídas com sucesso.`)
      await fetchAllNotifications() // Recarregar lista
    } catch (err) {
      console.error('Erro ao excluir todas as notificações:', err)
      alert('Erro ao excluir todas as notificações')
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gerenciar Notificações</h1>
          <p className="text-gray-400 mt-1">Crie e gerencie notificações para os usuários</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Botão Deletar Todas - só mostra se há notificações */}
          {allNotifications.length > 0 && (
            <Button
              onClick={handleDeleteAllNotifications}
              variant="outline"
              className="text-red-400 border-red-700 hover:bg-red-600/20 hover:border-red-600 hover:text-red-300"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Deletar Todas
            </Button>
          )}

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Notificação
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-600/20 rounded-lg">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 4h16M4 12h16M4 20h7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Não Lidas</p>
              <p className="text-2xl font-bold text-white">{stats.unread}</p>
            </div>
            <div className="p-3 bg-red-600/20 rounded-lg">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Hoje</p>
              <p className="text-2xl font-bold text-white">{stats.today}</p>
            </div>
            <div className="p-3 bg-green-600/20 rounded-lg">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {error ? (
        <div className="bg-red-900/20 border border-red-700 rounded-xl p-4">
          <p className="text-red-400">{error}</p>
          <Button
            onClick={fetchAllNotifications}
            className="mt-3 bg-red-600 hover:bg-red-700"
            size="sm"
          >
            Tentar Novamente
          </Button>
        </div>
      ) : (
        <NotificationList
          notifications={allNotifications}
          loading={loading}
          onEdit={setEditingNotification}
          onDelete={handleDeleteNotification}
          onRefresh={fetchAllNotifications}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nova Notificação"
        size="lg"
      >
        <NotificationForm
          onSubmit={handleCreateNotification}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingNotification}
        onClose={() => setEditingNotification(null)}
        title="Editar Notificação"
        size="lg"
      >
        {editingNotification && (
          <NotificationForm
            notification={editingNotification}
            onSubmit={(data) => handleEditNotification(editingNotification.id, data)}
            onCancel={() => setEditingNotification(null)}
          />
        )}
      </Modal>
    </div>
  )
}