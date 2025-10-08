'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Notification } from '@/hooks/useNotifications'

interface NotificationFormProps {
  notification?: Notification
  onSubmit: (data: Omit<Notification, 'id' | 'timestamp' | 'time'>) => Promise<void>
  onCancel: () => void
}

const notificationTypes = [
  { value: 'NEW_EPISODE', label: 'Novo Episódio', color: 'text-green-400' },
  { value: 'NEW_SEASON', label: 'Nova Temporada', color: 'text-blue-400' },
  { value: 'RECOMMENDATION', label: 'Recomendação', color: 'text-purple-400' },
  { value: 'SYSTEM', label: 'Sistema', color: 'text-gray-400' },
  { value: 'WATCH_REMINDER', label: 'Lembrete', color: 'text-yellow-400' }
]

const targetOptions = [
  { value: 'all', label: 'Todos os usuários' },
  { value: 'specific', label: 'Usuários específicos' },
  { value: 'plan', label: 'Por plano de assinatura' }
]

const planTypes = [
  { value: 'FREE', label: 'Grátis' },
  { value: 'FAN', label: 'Fan' },
  { value: 'MEGA_FAN', label: 'Mega Fan' },
  { value: 'MEGA_FAN_ANNUAL', label: 'Mega Fan Anual' }
]

type FormData = {
  type: 'NEW_EPISODE' | 'NEW_SEASON' | 'RECOMMENDATION' | 'SYSTEM' | 'WATCH_REMINDER'
  title: string
  message: string
  actionUrl: string
  imageUrl: string
  targetType: string
  specificUserIds: string
  targetPlans: string[]
  data: string
}

export function NotificationForm({ notification, onSubmit, onCancel }: NotificationFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    type: 'SYSTEM',
    title: '',
    message: '',
    actionUrl: '',
    imageUrl: '',
    targetType: 'all',
    specificUserIds: '',
    targetPlans: [],
    data: '{}'
  })

  useEffect(() => {
    if (notification) {
      setFormData({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        actionUrl: notification.actionUrl || '',
        imageUrl: notification.imageUrl || '',
        targetType: 'specific', // Para edição, sempre específico
        specificUserIds: notification.userId || '',
        targetPlans: [],
        data: notification.data ? JSON.stringify(notification.data, null, 2) : '{}'
      })
    }
  }, [notification])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData: Record<string, unknown> = {
        type: formData.type,
        title: formData.title,
        message: formData.message,
        read: false
      }

      if (formData.actionUrl) submitData.actionUrl = formData.actionUrl
      if (formData.imageUrl) submitData.imageUrl = formData.imageUrl

      // Parse data JSON
      try {
        if (formData.data.trim()) {
          submitData.data = JSON.parse(formData.data)
        }
      } catch {
        alert('JSON inválido no campo "Dados Adicionais"')
        return
      }

      // Target configuration
      if (!notification) { // Apenas para criação
        switch (formData.targetType) {
          case 'all':
            submitData.sendToAll = true
            break
          case 'specific':
            if (formData.specificUserIds.trim()) {
              submitData.userIds = formData.specificUserIds.split(',').map(id => id.trim()).filter(Boolean)
            } else {
              alert('Informe os IDs dos usuários')
              return
            }
            break
          case 'plan':
            if (formData.targetPlans.length > 0) {
              submitData.targetPlans = formData.targetPlans
            } else {
              alert('Selecione pelo menos um plano')
              return
            }
            break
        }
      }

      await onSubmit(submitData as Omit<Notification, 'id' | 'timestamp' | 'time'>)
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar notificação')
    } finally {
      setLoading(false)
    }
  }

  const handlePlanChange = (planValue: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      targetPlans: checked
        ? [...prev.targetPlans, planValue]
        : prev.targetPlans.filter(p => p !== planValue)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tipo */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tipo de Notificação
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'NEW_EPISODE' | 'NEW_SEASON' | 'RECOMMENDATION' | 'SYSTEM' | 'WATCH_REMINDER' }))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          {notificationTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Título
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ex: Novo episódio disponível!"
          maxLength={200}
          required
        />
      </div>

      {/* Mensagem */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Mensagem
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Ex: Attack on Titan - Episódio 25 'Final' já está disponível para assistir."
          maxLength={1000}
          required
        />
      </div>

      {/* URL de Ação */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          URL de Ação (Opcional)
        </label>
        <input
          type="url"
          value={formData.actionUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, actionUrl: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ex: /watch/attack-on-titan-ep-25"
        />
      </div>

      {/* URL da Imagem */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          URL da Imagem (Opcional)
        </label>
        <input
          type="url"
          value={formData.imageUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ex: https://example.com/image.jpg"
        />
      </div>

      {/* Target - Apenas para criação */}
      {!notification && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Enviar Para
          </label>
          <select
            value={formData.targetType}
            onChange={(e) => setFormData(prev => ({ ...prev, targetType: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {targetOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* IDs Específicos */}
          {formData.targetType === 'specific' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                IDs dos Usuários (separados por vírgula)
              </label>
              <input
                type="text"
                value={formData.specificUserIds}
                onChange={(e) => setFormData(prev => ({ ...prev, specificUserIds: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: user1, user2, user3"
              />
            </div>
          )}

          {/* Planos */}
          {formData.targetType === 'plan' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Planos de Assinatura
              </label>
              <div className="grid grid-cols-2 gap-2">
                {planTypes.map(plan => (
                  <label key={plan.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.targetPlans.includes(plan.value)}
                      onChange={(e) => handlePlanChange(plan.value, e.target.checked)}
                      className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">{plan.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dados Adicionais */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Dados Adicionais (JSON)
        </label>
        <textarea
          value={formData.data}
          onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
          rows={4}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          placeholder='{"animeId": "123", "episodeId": "456"}'
        />
        <p className="text-xs text-gray-500 mt-1">
          JSON opcional para dados estruturados
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={loading}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          {notification ? 'Atualizar' : 'Criar'} Notificação
        </Button>
      </div>
    </form>
  )
}