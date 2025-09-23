'use client'

import { Notification } from '@/hooks/useNotifications'
import Link from 'next/link'
import Image from 'next/image'

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: number) => void
  onRemove?: (id: number) => void
}

export function NotificationItem({ notification, onMarkAsRead, onRemove }: NotificationItemProps) {
  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'NEW_EPISODE':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )
      case 'NEW_SEASON':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9l-5 4.87L18.18 21 12 17.77 5.82 21 7 13.87 2 9l6.91-1.74L12 2z"/>
          </svg>
        )
      case 'RECOMMENDATION':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        )
      case 'WATCH_REMINDER':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM12.5 8H11v6l4.75 2.85.75-1.23-4-2.37V8zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        )
    }
  }

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'NEW_EPISODE':
        return 'bg-green-600/20 text-green-400'
      case 'NEW_SEASON':
        return 'bg-blue-600/20 text-blue-400'
      case 'RECOMMENDATION':
        return 'bg-purple-600/20 text-purple-400'
      case 'WATCH_REMINDER':
        return 'bg-yellow-600/20 text-yellow-400'
      default:
        return 'bg-gray-600/20 text-gray-400'
    }
  }

  const getTypeLabel = (type: Notification['type']) => {
    switch (type) {
      case 'NEW_EPISODE':
        return 'Novo Episódio'
      case 'NEW_SEASON':
        return 'Nova Temporada'
      case 'RECOMMENDATION':
        return 'Recomendação'
      case 'WATCH_REMINDER':
        return 'Lembrete'
      default:
        return 'Sistema'
    }
  }

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onRemove) {
      onRemove(notification.id)
    }
  }

  return (
    <div
      className={`group p-4 border-b border-gray-800/50 hover:bg-gray-800/30 transition-all duration-200 cursor-pointer relative ${
        !notification.read ? 'bg-blue-600/10 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Notification Icon/Image */}
        <div className="flex-shrink-0">
          {notification.imageUrl ? (
            <div className="relative w-10 h-10 rounded-lg overflow-hidden">
              <Image
                src={notification.imageUrl}
                alt={notification.title}
                fill
                className="object-cover"
                onError={(e) => {
                  // Fallback para ícone se a imagem falhar
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          ) : (
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(notification.type)}`}>
              {getTypeIcon(notification.type)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-white mb-1 line-clamp-1">{notification.title}</h4>

            {/* Unread indicator */}
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
            )}
          </div>

          <p className="text-sm text-gray-300 mb-2 line-clamp-2">{notification.message}</p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{notification.time}</span>

            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getTypeColor(notification.type)}`}>
                {getTypeIcon(notification.type)}
                {getTypeLabel(notification.type)}
              </span>
            </div>
          </div>
        </div>

        {/* Remove button (visible on hover) */}
        {onRemove && (
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-red-600/20 text-gray-400 hover:text-red-400"
            title="Remover notificação"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Action indicator */}
      {notification.actionUrl && (
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  )
}