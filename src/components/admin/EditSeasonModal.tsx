'use client'

import { useState, useEffect } from 'react'

interface Season {
  id: string
  animeId: string
  seasonNumber: number
  title?: string
  description?: string
  releaseDate?: string
  endDate?: string
  bannerUrl?: string
  bannerR2Key?: string
  r2BucketPath?: string
  createdAt: string
  updatedAt: string
  anime: {
    id: string
    title: string
    posterUrl?: string
    thumbnail?: string
  }
  _count: {
    episodes: number
  }
}

interface EditSeasonModalProps {
  season: Season | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type FormData = {
  seasonNumber: number
  title: string
  description: string
  releaseDate: string
  endDate: string
  bannerUrl: string
  r2BucketPath: string
}

export function EditSeasonModal({ season, isOpen, onClose, onSuccess }: EditSeasonModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    seasonNumber: 1,
    title: '',
    description: '',
    releaseDate: '',
    endDate: '',
    bannerUrl: '',
    r2BucketPath: ''
  })

  // Populate form when season changes
  useEffect(() => {
    if (season) {
      setFormData({
        seasonNumber: season.seasonNumber,
        title: season.title || '',
        description: season.description || '',
        releaseDate: season.releaseDate ? new Date(season.releaseDate).toISOString().split('T')[0] : '',
        endDate: season.endDate ? new Date(season.endDate).toISOString().split('T')[0] : '',
        bannerUrl: season.bannerUrl || '',
        r2BucketPath: season.r2BucketPath || ''
      })
    }
  }, [season])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!season) return
    
    setLoading(true)

    try {
      const payload = {
        seasonNumber: formData.seasonNumber,
        title: formData.title || null,
        description: formData.description || null,
        releaseDate: formData.releaseDate ? new Date(formData.releaseDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        bannerUrl: formData.bannerUrl || null,
        r2BucketPath: formData.r2BucketPath || null
      }

      const response = await fetch(`/api/seasons/${season.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar temporada')
      }

      onSuccess()
    } catch (error) {
      console.error('Error updating season:', error)
      alert(error instanceof Error ? error.message : 'Erro ao atualizar temporada')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !season) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Editar Temporada</h2>
              <p className="text-sm text-gray-400 mt-1">
                {season.anime.title} - Temporada {season.seasonNumber}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Número da Temporada *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.seasonNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, seasonNumber: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Número único para este anime</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título da Temporada
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
                  placeholder="Ex: Segunda Temporada, Final Season"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none resize-none"
                placeholder="Descreva esta temporada..."
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data de Lançamento
                </label>
                <input
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, releaseDate: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data de Término
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Deixe vazio se ainda em exibição</p>
              </div>
            </div>

            {/* Media URLs */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-2">
                Mídia e Armazenamento
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL do Banner
                </label>
                <input
                  type="url"
                  value={formData.bannerUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, bannerUrl: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
                  placeholder="https://exemplo.com/banner.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">URL da imagem de banner da temporada</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Caminho do Bucket R2
                </label>
                <input
                  type="text"
                  value={formData.r2BucketPath}
                  onChange={(e) => setFormData(prev => ({ ...prev, r2BucketPath: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
                  placeholder="seasons/anime-name/season-1"
                />
                <p className="text-xs text-gray-500 mt-1">Caminho personalizado para armazenamento no R2</p>
              </div>

              {/* Banner Preview */}
              {formData.bannerUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-300 mb-2">Preview do Banner</p>
                  <div className="w-full max-w-md h-32 bg-gray-700 rounded-lg overflow-hidden">
                    <img 
                      src={formData.bannerUrl} 
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentElement!.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-gray-700 text-gray-400">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        `
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Current Season Info */}
            <div className="bg-gradient-to-br from-purple-600/10 via-purple-700/5 to-purple-800/5 border border-purple-500/20 rounded-xl p-4">
              <h4 className="text-sm font-medium text-purple-400 mb-3">Informações Atuais</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">ID da Temporada:</p>
                  <p className="text-gray-300 font-mono">{season.id.slice(0, 8)}...</p>
                </div>
                <div>
                  <p className="text-gray-400">Anime:</p>
                  <p className="text-gray-300">{season.anime.title}</p>
                </div>
                <div>
                  <p className="text-gray-400">Episódios:</p>
                  <p className="text-gray-300">{season._count.episodes}</p>
                </div>
                <div>
                  <p className="text-gray-400">Criado em:</p>
                  <p className="text-gray-300">
                    {new Date(season.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Última atualização:</p>
                  <p className="text-gray-300">
                    {new Date(season.updatedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Anime ID:</p>
                  <p className="text-gray-300 font-mono">{season.anime.id.slice(0, 8)}...</p>
                </div>
              </div>
            </div>

            {/* Warning for episodes */}
            {season._count.episodes > 0 && (
              <div className="bg-gradient-to-br from-yellow-600/10 via-yellow-700/5 to-yellow-800/5 border border-yellow-500/20 rounded-xl p-4">
                <h4 className="text-sm font-medium text-yellow-400 mb-2 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span>Atenção</span>
                </h4>
                <p className="text-yellow-300 text-sm">
                  Esta temporada possui {season._count.episodes} episódios. Alterar o número da temporada pode afetar a organização dos episódios.
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700/50 flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            )}
            <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}