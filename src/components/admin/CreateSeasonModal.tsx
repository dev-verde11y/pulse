'use client'

import { useState, useEffect } from 'react'

interface CreateSeasonModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Anime {
  id: string
  title: string
  posterUrl?: string
  thumbnail?: string
}

type FormData = {
  animeId: string
  seasonNumber: number
  title: string
  description: string
  releaseDate: string
  endDate: string
  bannerUrl: string
  r2BucketPath: string
}

export function CreateSeasonModal({ isOpen, onClose, onSuccess }: CreateSeasonModalProps) {
  const [loading, setLoading] = useState(false)
  const [loadingAnimes, setLoadingAnimes] = useState(false)
  const [animes, setAnimes] = useState<Anime[]>([])
  const [formData, setFormData] = useState<FormData>({
    animeId: '',
    seasonNumber: 1,
    title: '',
    description: '',
    releaseDate: '',
    endDate: '',
    bannerUrl: '',
    r2BucketPath: ''
  })

  // Fetch animes for selection
  const fetchAnimes = async () => {
    setLoadingAnimes(true)
    try {
      const response = await fetch('/api/animes?limit=100&sortBy=title&sortOrder=asc')
      if (!response.ok) throw new Error('Failed to fetch animes')
      
      const data = await response.json()
      setAnimes(data.animes)
    } catch (error) {
      console.error('Error fetching animes:', error)
    } finally {
      setLoadingAnimes(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchAnimes()
    }
  }, [isOpen])

  // Get next season number for selected anime
  const getNextSeasonNumber = async (animeId: string) => {
    if (!animeId) return

    try {
      const response = await fetch(`/api/seasons?animeId=${animeId}&limit=1&sortBy=seasonNumber&sortOrder=desc`)
      if (!response.ok) return
      
      const data = await response.json()
      const lastSeason = data.seasons[0]
      const nextNumber = lastSeason ? lastSeason.seasonNumber + 1 : 1
      
      setFormData(prev => ({ ...prev, seasonNumber: nextNumber }))
    } catch (error) {
      console.error('Error getting next season number:', error)
    }
  }

  const handleAnimeChange = (animeId: string) => {
    setFormData(prev => ({ ...prev, animeId }))
    getNextSeasonNumber(animeId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        animeId: formData.animeId,
        seasonNumber: formData.seasonNumber,
        title: formData.title || null,
        description: formData.description || null,
        releaseDate: formData.releaseDate ? new Date(formData.releaseDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        bannerUrl: formData.bannerUrl || null,
        r2BucketPath: formData.r2BucketPath || null
      }

      const response = await fetch('/api/seasons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar temporada')
      }

      onSuccess()
      onClose()
      
      // Reset form
      setFormData({
        animeId: '',
        seasonNumber: 1,
        title: '',
        description: '',
        releaseDate: '',
        endDate: '',
        bannerUrl: '',
        r2BucketPath: ''
      })
    } catch (error) {
      console.error('Error creating season:', error)
      alert(error instanceof Error ? error.message : 'Erro ao criar temporada')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const selectedAnime = animes.find(a => a.id === formData.animeId)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Criar Nova Temporada</h2>
              <p className="text-sm text-gray-400 mt-1">Adicione uma nova temporada ao catálogo</p>
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
            {/* Anime Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Anime *
              </label>
              <select
                required
                value={formData.animeId}
                onChange={(e) => handleAnimeChange(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                disabled={loadingAnimes}
              >
                <option value="">
                  {loadingAnimes ? 'Carregando animes...' : 'Selecione um anime...'}
                </option>
                {animes.map((anime) => (
                  <option key={anime.id} value={anime.id}>
                    {anime.title}
                  </option>
                ))}
              </select>
              {selectedAnime && (
                <p className="text-xs text-purple-400 mt-1">
                  Selecionado: {selectedAnime.title}
                </p>
              )}
            </div>

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
                <p className="text-xs text-gray-500 mt-1">
                  Será automaticamente definido como o próximo número disponível
                </p>
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
                <p className="text-xs text-gray-500 mt-1">Opcional - título específico da temporada</p>
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

            {/* Season Creation Tips */}
            <div className="bg-gradient-to-br from-blue-600/10 via-blue-700/5 to-blue-800/5 border border-blue-500/20 rounded-xl p-4">
              <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Dicas para Criação de Temporadas</span>
              </h4>
              <ul className="text-sm text-blue-300 space-y-1">
                <li>• O número da temporada deve ser único para cada anime</li>
                <li>• Use títulos descritivos como &quot;Segunda Temporada&quot;, &quot;Final Season&quot;, etc.</li>
                <li>• Banner deve ser uma imagem widescreen (16:9 recomendado)</li>
                <li>• O caminho R2 ajuda na organização dos arquivos de vídeo</li>
                <li>• Deixe a data de término vazia para temporadas em andamento</li>
              </ul>
            </div>

            {/* Selected Anime Preview */}
            {selectedAnime && (
              <div className="bg-gradient-to-br from-purple-600/10 via-purple-700/5 to-purple-800/5 border border-purple-500/20 rounded-xl p-4">
                <h4 className="text-sm font-medium text-purple-400 mb-3">Anime Selecionado</h4>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-20 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                    {selectedAnime.posterUrl || selectedAnime.thumbnail ? (
                      <img 
                        src={selectedAnime.posterUrl || selectedAnime.thumbnail} 
                        alt={selectedAnime.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedAnime.title}</p>
                    <p className="text-gray-400 text-sm">Temporada {formData.seasonNumber}</p>
                    <p className="text-purple-400 text-sm font-mono">ID: {selectedAnime.id.slice(0, 8)}...</p>
                  </div>
                </div>
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
            disabled={loading || !formData.animeId}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            )}
            <span>{loading ? 'Criando...' : 'Criar Temporada'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}