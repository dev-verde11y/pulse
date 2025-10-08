'use client'

import { useState, useEffect } from 'react'

interface Anime {
  id: string
  title: string
  description: string
  year: number
  status: 'FINISHED' | 'ONGOING' | 'UPCOMING' | 'CANCELLED'
  type: 'ANIME' | 'FILME' | 'SERIE'
  rating: string
  genres: string[]
  slug: string
  totalEpisodes?: number
  isSubbed: boolean
  isDubbed: boolean
  tags: string[]
  director?: string
  studio?: string
  posterUrl?: string
  thumbnail?: string
  bannerUrl?: string
  logoUrl?: string
}

interface EditAnimeModalProps {
  anime: Anime | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type FormData = {
  title: string
  description: string
  year: number
  status: 'FINISHED' | 'ONGOING' | 'UPCOMING' | 'CANCELLED'
  type: 'ANIME' | 'FILME' | 'SERIE'
  rating: string
  genres: string[]
  slug: string
  totalEpisodes: string
  isSubbed: boolean
  isDubbed: boolean
  tags: string[]
  director: string
  studio: string
  posterUrl: string
  bannerUrl: string
  logoUrl: string
}

export function EditAnimeModal({ anime, isOpen, onClose, onSuccess }: EditAnimeModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    year: new Date().getFullYear(),
    status: 'ONGOING',
    type: 'ANIME',
    rating: '',
    genres: [],
    slug: '',
    totalEpisodes: '',
    isSubbed: true,
    isDubbed: false,
    tags: [],
    director: '',
    studio: '',
    posterUrl: '',
    bannerUrl: '',
    logoUrl: ''
  })
  
  const [genreInput, setGenreInput] = useState('')
  const [tagInput, setTagInput] = useState('')

  // Populate form when anime changes
  useEffect(() => {
    if (anime) {
      setFormData({
        title: anime.title,
        description: anime.description,
        year: anime.year,
        status: anime.status,
        type: anime.type,
        rating: anime.rating,
        genres: [...anime.genres],
        slug: anime.slug,
        totalEpisodes: anime.totalEpisodes?.toString() || '',
        isSubbed: anime.isSubbed,
        isDubbed: anime.isDubbed,
        tags: [...anime.tags],
        director: anime.director || '',
        studio: anime.studio || '',
        posterUrl: anime.posterUrl || anime.thumbnail || '',
        bannerUrl: anime.bannerUrl || '',
        logoUrl: anime.logoUrl || ''
      })
    }
  }, [anime])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!anime) return
    
    setLoading(true)

    try {
      const payload = {
        ...formData,
        totalEpisodes: formData.totalEpisodes ? parseInt(formData.totalEpisodes) : null,
        posterUrl: formData.posterUrl || null,
        bannerUrl: formData.bannerUrl || null,
        logoUrl: formData.logoUrl || null,
        director: formData.director || null,
        studio: formData.studio || null
      }

      const response = await fetch(`/api/animes/${anime.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar anime')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating anime:', error)
      alert(error instanceof Error ? error.message : 'Erro ao atualizar anime')
    } finally {
      setLoading(false)
    }
  }

  const addGenre = () => {
    if (genreInput.trim() && !formData.genres.includes(genreInput.trim())) {
      setFormData(prev => ({
        ...prev,
        genres: [...prev.genres, genreInput.trim()]
      }))
      setGenreInput('')
    }
  }

  const removeGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.filter(g => g !== genre)
    }))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[áàâãä]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[íìîï]/g, 'i')
      .replace(/[óòôõö]/g, 'o')
      .replace(/[úùûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      // Only auto-update slug if it matches the current generated slug
      slug: prev.slug === generateSlug(prev.title) ? generateSlug(title) : prev.slug
    }))
  }

  if (!isOpen || !anime) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Editar Anime</h2>
              <p className="text-sm text-gray-400 mt-1">Atualize as informações do anime</p>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
                  placeholder="Digite o título do anime"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
                  placeholder="url-amigavel-do-anime"
                />
                <p className="text-xs text-gray-500 mt-1">Usado na URL. Apenas letras minúsculas, números e hífens</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none resize-none"
                placeholder="Descreva o anime..."
              />
            </div>

            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ano *
                </label>
                <input
                  type="number"
                  required
                  min="1900"
                  max="2100"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'FINISHED' | 'ONGOING' | 'UPCOMING' | 'CANCELLED' }))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
                >
                  <option value="ONGOING">Em Andamento</option>
                  <option value="FINISHED">Finalizado</option>
                  <option value="UPCOMING">Em Breve</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'ANIME' | 'FILME' | 'SERIE' }))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
                >
                  <option value="ANIME">Anime</option>
                  <option value="FILME">Filme</option>
                  <option value="SERIE">Série</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Classificação Indicativa *
                </label>
                <select
                  required
                  value={formData.rating}
                  onChange={(e) => setFormData(prev => ({ ...prev, rating: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
                >
                  <option value="">Selecione...</option>
                  <option value="Livre">Livre</option>
                  <option value="10+">10+</option>
                  <option value="12+">12+</option>
                  <option value="14+">14+</option>
                  <option value="16+">16+</option>
                  <option value="18+">18+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Total de Episódios
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalEpisodes}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalEpisodes: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
                  placeholder="Deixe vazio se desconhecido"
                />
              </div>
            </div>

            {/* URLs */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white">Imagens</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL do Poster
                  </label>
                  <input
                    type="url"
                    value={formData.posterUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, posterUrl: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL do Banner
                  </label>
                  <input
                    type="url"
                    value={formData.bannerUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, bannerUrl: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL do Logo
                  </label>
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Genres */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gêneros *
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={genreInput}
                  onChange={(e) => setGenreInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre())}
                  className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
                  placeholder="Digite um gênero e pressione Enter"
                />
                <button
                  type="button"
                  onClick={addGenre}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Adicionar
                </button>
              </div>
              {formData.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.genres.map((genre) => (
                    <span
                      key={genre}
                      className="inline-flex items-center space-x-1 bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm border border-blue-500/30"
                    >
                      <span>{genre}</span>
                      <button
                        type="button"
                        onClick={() => removeGenre(genre)}
                        className="hover:text-blue-300"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {formData.genres.length === 0 && (
                <p className="text-red-400 text-sm">Pelo menos um gênero é obrigatório</p>
              )}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Diretor
                </label>
                <input
                  type="text"
                  value={formData.director}
                  onChange={(e) => setFormData(prev => ({ ...prev, director: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
                  placeholder="Nome do diretor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estúdio
                </label>
                <input
                  type="text"
                  value={formData.studio}
                  onChange={(e) => setFormData(prev => ({ ...prev, studio: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
                  placeholder="Nome do estúdio"
                />
              </div>
            </div>

            {/* Content Flags */}
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.isSubbed}
                  onChange={(e) => setFormData(prev => ({ ...prev, isSubbed: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                />
                <span>Legendado</span>
              </label>
              <label className="flex items-center space-x-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.isDubbed}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDubbed: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                />
                <span>Dublado</span>
              </label>
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
            disabled={loading || formData.genres.length === 0}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center space-x-2"
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