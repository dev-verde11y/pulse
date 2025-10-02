'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Episode {
  id: string
  episodeNumber: number
  title: string
  description?: string
  duration?: number
  thumbnail?: string
  thumbnailUrl?: string
  videoUrl?: string
  r2Key?: string
  r2VideoPath?: string
  thumbnailR2Key?: string
  airDate?: string
  createdAt: string
  updatedAt: string
  season: {
    id: string
    seasonNumber: number
    title?: string
    anime: {
      id: string
      title: string
      posterUrl?: string
      thumbnail?: string
    }
  }
}

interface EditEpisodeModalProps {
  episode: Episode | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type FormData = {
  episodeNumber: number
  title: string
  description: string
  duration: string
  thumbnailUrl: string
  videoUrl: string
  airDate: string
  seasonId: string
  r2Key: string
  r2VideoPath: string
}

export function EditEpisodeModal({ episode, isOpen, onClose, onSuccess }: EditEpisodeModalProps) {
  const [loading, setLoading] = useState(false)
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }
  const [formData, setFormData] = useState<FormData>({
    episodeNumber: 1,
    title: '',
    description: '',
    duration: '',
    thumbnailUrl: '',
    videoUrl: '',
    airDate: '',
    seasonId: '',
    r2Key: '',
    r2VideoPath: ''
  })

  // Populate form when episode changes
  useEffect(() => {
    if (episode) {
      setFormData({
        episodeNumber: episode.episodeNumber || 1,
        title: episode.title || '',
        description: episode.description || '',
        duration: episode.duration ? Math.floor(episode.duration / 60).toString() : '',
        thumbnailUrl: episode.thumbnailUrl || episode.thumbnail || '',
        videoUrl: episode.videoUrl || '',
        airDate: episode.airDate ? new Date(episode.airDate).toISOString().split('T')[0] : '',
        seasonId: episode.season?.id || '',
        r2Key: episode.r2Key || '',
        r2VideoPath: episode.r2VideoPath || ''
      })
    }
  }, [episode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!episode) return
    
    setLoading(true)

    try {
      const payload = {
        episodeNumber: formData.episodeNumber,
        title: formData.title,
        description: formData.description || null,
        duration: formData.duration ? parseInt(formData.duration) * 60 : null,
        thumbnailUrl: formData.thumbnailUrl || null,
        videoUrl: formData.videoUrl || null,
        airDate: formData.airDate ? new Date(formData.airDate).toISOString() : null,
        seasonId: formData.seasonId || null,
        r2Key: formData.r2Key || null,
        r2VideoPath: formData.r2VideoPath || null
      }

      const response = await fetch(`/api/episodes/${episode.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar episódio')
      }

      onSuccess()
    } catch (error) {
      console.error('Error updating episode:', error)
      alert(error instanceof Error ? error.message : 'Erro ao atualizar episódio')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !episode) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Editar Episódio</h2>
              <p className="text-sm text-gray-400 mt-1">
                {episode.season.anime.title} - Temporada {episode.season.seasonNumber}
                {episode.season.title && ` (${episode.season.title})`}
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duração (minutos)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
                  placeholder="Ex: 24 para 24 minutos"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.duration && !isNaN(parseInt(formData.duration)) && (
                    <>Aprox. {parseInt(formData.duration) * 60} segundos</>
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

            {/* Season ID Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Season ID *
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  required
                  value={formData.seasonId}
                  onChange={(e) => setFormData(prev => ({ ...prev, seasonId: e.target.value }))}
                  className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none font-mono"
                  placeholder="ID da temporada para vincular o episódio"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(formData.seasonId)}
                  disabled={!formData.seasonId}
                  className="px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-colors border border-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Copiar Season ID"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">ID da temporada à qual este episódio pertence</p>
            </div>

            {/* R2 Fields */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-2">
                Cloudflare R2 Storage
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    R2 Key
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={formData.r2Key}
                      onChange={(e) => setFormData(prev => ({ ...prev, r2Key: e.target.value }))}
                      className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none font-mono"
                      placeholder="chave-do-arquivo-no-r2"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(formData.r2Key)}
                      disabled={!formData.r2Key}
                      className="px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-colors border border-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Copiar R2 Key"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Chave do arquivo de vídeo no R2</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    R2 Video Path
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={formData.r2VideoPath}
                      onChange={(e) => setFormData(prev => ({ ...prev, r2VideoPath: e.target.value }))}
                      className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none font-mono"
                      placeholder="pasta/arquivo-video.mp4"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(formData.r2VideoPath)}
                      disabled={!formData.r2VideoPath}
                      className="px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-colors border border-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Copiar R2 Video Path"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Caminho do vídeo no bucket R2</p>
                </div>
              </div>
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
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Current Episode Info */}
            <div className="bg-gradient-to-br from-blue-600/10 via-blue-700/5 to-blue-800/5 border border-blue-500/20 rounded-xl p-4">
              <h4 className="text-sm font-medium text-blue-400 mb-3">Informações Atuais</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">ID:</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-300 font-mono">{episode.id}</p>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(episode.id)}
                      className="p-1 text-gray-400 hover:text-gray-300 rounded transition-colors"
                      title="Copiar ID completo do episódio"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400">Criado em:</p>
                  <p className="text-gray-300">
                    {new Date(episode.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Última atualização:</p>
                  <p className="text-gray-300">
                    {new Date(episode.updatedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Temporada ID:</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-300 font-mono">{episode.season.id}</p>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(episode.season.id)}
                      className="p-1 text-gray-400 hover:text-gray-300 rounded transition-colors"
                      title="Copiar Season ID completo"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
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
            disabled={loading || !formData.title || !formData.seasonId}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center space-x-2"
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