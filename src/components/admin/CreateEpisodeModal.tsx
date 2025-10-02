'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface CreateEpisodeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Season {
  id: string
  seasonNumber: number
  title?: string
  anime: {
    id: string
    title: string
  }
}

type FormData = {
  seasonId: string
  episodeNumber: number
  title: string
  description: string
  duration: string
  thumbnailUrl: string
  videoUrl: string
  airDate: string
}

export function CreateEpisodeModal({ isOpen, onClose, onSuccess }: CreateEpisodeModalProps) {
  const [loading, setLoading] = useState(false)
  const [loadingSeasons, setLoadingSeasons] = useState(false)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [formData, setFormData] = useState<FormData>({
    seasonId: '',
    episodeNumber: 1,
    title: '',
    description: '',
    duration: '',
    thumbnailUrl: '',
    videoUrl: '',
    airDate: ''
  })

  // Fetch seasons for selection
  const fetchSeasons = async () => {
    setLoadingSeasons(true)
    try {
      const response = await fetch('/api/seasons?limit=100&sortBy=seasonNumber&sortOrder=asc')
      if (!response.ok) throw new Error('Failed to fetch seasons')
      
      const data = await response.json()
      setSeasons(data.seasons)
    } catch (error) {
      console.error('Error fetching seasons:', error)
    } finally {
      setLoadingSeasons(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchSeasons()
    }
  }, [isOpen])

  // Get next episode number for selected season
  const getNextEpisodeNumber = async (seasonId: string) => {
    if (!seasonId) return

    try {
      const response = await fetch(`/api/episodes?season=${seasonId}&limit=1&sortBy=episodeNumber&sortOrder=desc`)
      if (!response.ok) return
      
      const data = await response.json()
      const lastEpisode = data.episodes[0]
      const nextNumber = lastEpisode ? lastEpisode.episodeNumber + 1 : 1
      
      setFormData(prev => ({ ...prev, episodeNumber: nextNumber }))
    } catch (error) {
      console.error('Error getting next episode number:', error)
    }
  }

  const handleSeasonChange = (seasonId: string) => {
    setFormData(prev => ({ ...prev, seasonId }))
    getNextEpisodeNumber(seasonId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        seasonId: formData.seasonId,
        episodeNumber: formData.episodeNumber,
        title: formData.title,
        description: formData.description || null,
        duration: formData.duration ? parseInt(formData.duration) : null,
        thumbnailUrl: formData.thumbnailUrl || null,
        videoUrl: formData.videoUrl || null,
        airDate: formData.airDate ? new Date(formData.airDate).toISOString() : null
      }

      const response = await fetch('/api/episodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar episódio')
      }

      onSuccess()
      onClose()
      
      // Reset form
      setFormData({
        seasonId: '',
        episodeNumber: 1,
        title: '',
        description: '',
        duration: '',
        thumbnailUrl: '',
        videoUrl: '',
        airDate: ''
      })
    } catch (error) {
      console.error('Error creating episode:', error)
      alert(error instanceof Error ? error.message : 'Erro ao criar episódio')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const selectedSeason = seasons.find(s => s.id === formData.seasonId)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Criar Novo Episódio</h2>
              <p className="text-sm text-gray-400 mt-1">Adicione um novo episódio ao catálogo</p>
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
            {/* Season Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Temporada *
              </label>
              <select
                required
                value={formData.seasonId}
                onChange={(e) => handleSeasonChange(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
                disabled={loadingSeasons}
              >
                <option value="">
                  {loadingSeasons ? 'Carregando temporadas...' : 'Selecione uma temporada...'}
                </option>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.anime.title} - Temporada {season.seasonNumber}
                    {season.title && ` (${season.title})`}
                  </option>
                ))}
              </select>
              {selectedSeason && (
                <p className="text-xs text-blue-400 mt-1">
                  Selecionado: {selectedSeason.anime.title} - Temporada {selectedSeason.seasonNumber}
                </p>
              )}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Número do Episódio *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.episodeNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, episodeNumber: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Será automaticamente definido como o próximo número disponível
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duração (segundos)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
                  placeholder="Ex: 1440 para 24 minutos"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.duration && !isNaN(parseInt(formData.duration)) && (
                    <>Aprox. {Math.floor(parseInt(formData.duration) / 60)} minutos</>
                  )}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
                placeholder="Digite o título do episódio"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none resize-none"
                placeholder="Descreva o episódio..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data de Lançamento
              </label>
              <input
                type="date"
                value={formData.airDate}
                onChange={(e) => setFormData(prev => ({ ...prev, airDate: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
              />
            </div>

            {/* Media URLs */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-2">
                URLs de Mídia
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL do Vídeo
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
                  placeholder="https://exemplo.com/video.mp4"
                />
                <p className="text-xs text-gray-500 mt-1">URL completa do arquivo de vídeo</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL da Thumbnail
                </label>
                <input
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
                  placeholder="https://exemplo.com/thumb.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">URL da imagem de preview do episódio</p>
              </div>

              {/* Thumbnail Preview */}
              {formData.thumbnailUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-300 mb-2">Preview da Thumbnail</p>
                  <div className="w-48 h-28 bg-gray-700 rounded-lg overflow-hidden relative">
                    <Image
                      src={formData.thumbnailUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
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

            {/* Upload Tips */}
            <div className="bg-gradient-to-br from-yellow-600/10 via-yellow-700/5 to-yellow-800/5 border border-yellow-500/20 rounded-xl p-4">
              <h4 className="text-sm font-medium text-yellow-400 mb-2 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Dicas para Upload</span>
              </h4>
              <ul className="text-sm text-yellow-300 space-y-1">
                <li>• Use URLs diretas para os arquivos de vídeo (ex: .mp4, .mkv)</li>
                <li>• Thumbnails devem estar em formato de imagem (ex: .jpg, .png)</li>
                <li>• Certifique-se de que os arquivos estão acessíveis publicamente</li>
                <li>• Duração em segundos (ex: 1440 = 24 minutos)</li>
              </ul>
            </div>
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
            disabled={loading || !formData.seasonId || !formData.title}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            )}
            <span>{loading ? 'Criando...' : 'Criar Episódio'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}