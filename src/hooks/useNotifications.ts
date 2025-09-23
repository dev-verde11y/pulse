'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Notification {
  id: number
  type: 'NEW_EPISODE' | 'NEW_SEASON' | 'RECOMMENDATION' | 'SYSTEM' | 'WATCH_REMINDER'
  title: string
  message: string
  time: string
  timestamp: number
  read: boolean
  userId?: string
  actionUrl?: string
  imageUrl?: string
  data?: Record<string, any>
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (notificationId: number) => void
  markAllAsRead: () => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (notificationId: number) => void
  clearAllNotifications: () => void
  refreshNotifications: () => Promise<void>
  loading: boolean
  error: string | null
}

const STORAGE_KEY = 'user_notifications'
const MAX_NOTIFICATIONS = 50

// Mock data inicial
const initialMockNotifications: Notification[] = [
  {
    id: 1,
    type: 'NEW_EPISODE',
    title: 'Novo episódio disponível!',
    message: 'Dr. Stone - Episódio 24 "Science Future" já está disponível.',
    time: '2 min atrás',
    timestamp: Date.now() - 2 * 60 * 1000,
    read: false,
    actionUrl: '/watch/dr-stone-ep-24',
    imageUrl: '/images/dr-stone.jpg'
  },
  {
    id: 2,
    type: 'NEW_SEASON',
    title: 'Nova temporada lançada!',
    message: 'One Piece - Temporada 21 "Wano Arc" acaba de ser lançada.',
    time: '1 hora atrás',
    timestamp: Date.now() - 60 * 60 * 1000,
    read: false,
    actionUrl: '/anime/one-piece',
    imageUrl: '/images/one-piece.jpg'
  },
  {
    id: 3,
    type: 'RECOMMENDATION',
    title: 'Recomendação para você',
    message: 'Com base no que você assistiu, recomendamos "Attack on Titan".',
    time: '3 horas atrás',
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    read: false,
    actionUrl: '/anime/attack-on-titan',
    imageUrl: '/images/attack-on-titan.jpg'
  },
  {
    id: 4,
    type: 'SYSTEM',
    title: 'Conta Premium ativada',
    message: 'Sua conta Premium foi ativada com sucesso. Aproveite!',
    time: '1 dia atrás',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    read: true,
    actionUrl: '/dashboard/subscription'
  },
  {
    id: 5,
    type: 'NEW_EPISODE',
    title: 'Episódio adicionado à sua lista',
    message: 'Chainsaw Man - Episódio 12 foi adicionado à sua lista.',
    time: '2 dias atrás',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    read: true,
    actionUrl: '/favorites',
    imageUrl: '/images/chainsaw-man.jpg'
  }
]

function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Agora'
  if (minutes < 60) return `${minutes} min atrás`
  if (hours < 24) return `${hours} hora${hours > 1 ? 's' : ''} atrás`
  return `${days} dia${days > 1 ? 's' : ''} atrás`
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Função para buscar notificações da API
  const fetchNotificationsFromAPI = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications')
      if (!response.ok) {
        throw new Error('Erro ao buscar notificações')
      }
      const data = await response.json()
      return data.notifications || []
    } catch (err) {
      console.error('Erro ao buscar notificações da API:', err)
      return null
    }
  }, [])

  // Carregar notificações: primeiro tenta da API, fallback para localStorage ou mock data
  const loadNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Tentar buscar da API primeiro
      const apiNotifications = await fetchNotificationsFromAPI()

      if (apiNotifications) {
        // Se conseguiu da API, usar essas notificações
        setNotifications(apiNotifications)
        // Salvar no localStorage como backup
        localStorage.setItem(STORAGE_KEY, JSON.stringify(apiNotifications))
      } else {
        // Fallback: usar localStorage
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsedNotifications = JSON.parse(stored) as Notification[]
          // Atualizar os tempos relativos
          const updatedNotifications = parsedNotifications.map(notification => ({
            ...notification,
            time: formatTimeAgo(notification.timestamp)
          }))
          setNotifications(updatedNotifications)
        } else {
          // Última opção: usar mock data
          const mockWithTimestamps = initialMockNotifications.map(notification => ({
            ...notification,
            time: formatTimeAgo(notification.timestamp)
          }))
          setNotifications(mockWithTimestamps)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mockWithTimestamps))
        }
      }
    } catch (err) {
      console.error('Erro ao carregar notificações:', err)
      setError('Erro ao carregar notificações')
      setNotifications(initialMockNotifications)
    } finally {
      setLoading(false)
    }
  }, [fetchNotificationsFromAPI])

  // Carregar notificações na inicialização
  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // Salvar no localStorage sempre que as notificações mudarem
  const saveToStorage = useCallback((newNotifications: Notification[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotifications))
    } catch (err) {
      console.error('Erro ao salvar notificações:', err)
      setError('Erro ao salvar notificações')
    }
  }, [])

  // Atualizar tempos relativos a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => prev.map(notification => ({
        ...notification,
        time: formatTimeAgo(notification.timestamp)
      })))
    }, 60000) // 1 minuto

    return () => clearInterval(interval)
  }, [])

  const markAsRead = useCallback(async (notificationId: number) => {
    // Atualizar localmente primeiro para resposta rápida
    setNotifications(prev => {
      const updated = prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
      saveToStorage(updated)
      return updated
    })

    // Tentar sincronizar com a API
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      })
      if (!response.ok) {
        console.error('Erro ao marcar notificação como lida na API')
      }
    } catch (err) {
      console.error('Erro na API:', err)
    }
  }, [saveToStorage])

  const markAllAsRead = useCallback(async () => {
    // Atualizar localmente primeiro
    setNotifications(prev => {
      const updated = prev.map(notification => ({ ...notification, read: true }))
      saveToStorage(updated)
      return updated
    })

    // Tentar sincronizar com a API
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH'
      })
      if (!response.ok) {
        console.error('Erro ao marcar todas as notificações como lidas na API')
      }
    } catch (err) {
      console.error('Erro na API:', err)
    }
  }, [saveToStorage])

  const addNotification = useCallback((newNotification: Omit<Notification, 'id' | 'timestamp'>) => {
    setNotifications(prev => {
      const id = Math.max(...prev.map(n => n.id), 0) + 1
      const timestamp = Date.now()
      const notification: Notification = {
        ...newNotification,
        id,
        timestamp,
        time: 'Agora'
      }

      // Manter apenas as últimas MAX_NOTIFICATIONS
      const updated = [notification, ...prev].slice(0, MAX_NOTIFICATIONS)
      saveToStorage(updated)
      return updated
    })
  }, [saveToStorage])

  const removeNotification = useCallback(async (notificationId: number) => {
    // Remover localmente primeiro
    setNotifications(prev => {
      const updated = prev.filter(notification => notification.id !== notificationId)
      saveToStorage(updated)
      return updated
    })

    // Tentar sincronizar com a API
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        console.error('Erro ao remover notificação na API')
      }
    } catch (err) {
      console.error('Erro na API:', err)
    }
  }, [saveToStorage])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
    saveToStorage([])
  }, [saveToStorage])

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    clearAllNotifications,
    refreshNotifications: loadNotifications,
    loading,
    error
  }
}

// Hook para buscar notificações do servidor (para implementação futura)
export function useNotificationsFromAPI(userId?: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!userId) return []

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/notifications?userId=${userId}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar notificações')
      }

      const data = await response.json()
      return data.notifications || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return []
    } finally {
      setLoading(false)
    }
  }, [userId])

  const markAsReadAPI = useCallback(async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      })

      if (!response.ok) {
        throw new Error('Erro ao marcar notificação como lida')
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    }
  }, [])

  return {
    fetchNotifications,
    markAsReadAPI,
    loading,
    error
  }
}