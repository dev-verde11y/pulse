'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface CreateHeroBannerModalProps {
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
  title: string
  subtitle: string
  description: string
  backgroundImage: string
  logo: string
  type: string
  year: number
  rating: string
  duration: string
  episode: string
  genres: string[]
  displayOrder: number
  isActive: boolean
  animeId: string
}

export function CreateHeroBannerModal({ isOpen, onClose, onSuccess }: CreateHeroBannerModalProps) {
  const [loading, setLoading] = useState(false)
  const [loadingAnimes, setLoadingAnimes] = useState(false)
  const [animes, setAnimes] = useState<Anime[]>([])
  const [formData, setFormData] = useState<FormData>({
    title: '',
    subtitle: '',
    description: '',
    backgroundImage: '',
    logo: '',
    type: 'anime',
    year: new Date().getFullYear(),
    rating: '16+',
    duration: '24 min',
    episode: '',
    genres: [],
    displayOrder: 0,
    isActive: true,
    animeId: ''
  })

  const [genreInput, setGenreInput] = useState('')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        backgroundImage: formData.backgroundImage,
        logo: formData.logo || null,
        type: formData.type,
        year: formData.year,
        rating: formData.rating,
        duration: formData.duration,
        episode: formData.episode || null,
        genres: formData.genres,
        displayOrder: formData.displayOrder,
        isActive: formData.isActive,
        animeId: formData.animeId || null
      }

      const response = await fetch('/api/hero-banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar hero banner')
      }

      onSuccess()
      onClose()
      
      // Reset form
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        backgroundImage: '',
        logo: '',
        type: 'anime',
        year: new Date().getFullYear(),
        rating: '16+',
        duration: '24 min',
        episode: '',
        genres: [],
        displayOrder: 0,
        isActive: true,
        animeId: ''
      })
      setGenreInput('')
    } catch (error) {
      console.error('Error creating hero banner:', error)
      alert(error instanceof Error ? error.message : 'Erro ao criar hero banner')
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

  if (!isOpen) return null

  const selectedAnime = animes.find(a => a.id === formData.animeId)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Criar Hero Banner</h2>
              <p className="text-sm text-gray-400 mt-1">Adicione um novo banner à homepage</p>
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
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-orange-500/50 focus:outline-none"
                  placeholder="Digite o título principal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subtítulo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-orange-500/50 focus:outline-none"
                  placeholder="Digite o subtítulo"
                />
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
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-orange-500/50 focus:outline-none resize-none"
                placeholder="Descreva o conteúdo do banner..."
              />
            </div>

            {/* Media URLs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-2">
                Mídia
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Imagem de Fundo *
                </label>
                <input
                  type="url"
                  required
                  value={formData.backgroundImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, backgroundImage: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-orange-500/50 focus:outline-none"
                  placeholder="https://exemplo.com/background.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Logo (Opcional)
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-orange-500/50 focus:outline-none"
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>

              {/* Preview */}
              {formData.backgroundImage && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-300 mb-2">Preview da Imagem</p>
                  <div className="w-full max-w-md h-40 bg-gray-700 rounded-lg overflow-hidden relative">
                    <Image
                      src={formData.backgroundImage}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Meta Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-2">
                Informações
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-orange-500/50 focus:outline-none"
                  >
                    <option value="anime">Anime</option>
                    <option value="filme">Filme</option>
                    <option value="serie">Série</option>
                  </select>
                </div>

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
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-orange-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Classificação *
                  </label>
                  <select
                    required
                    value={formData.rating}
                    onChange={(e) => setFormData(prev => ({ ...prev, rating: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-orange-500/50 focus:outline-none"
                  >
                    <option value="Livre">Livre</option>
                    <option value="10+">10+</option>
                    <option value="12+">12+</option>
                    <option value="14+">14+</option>
                    <option value="16+">16+</option>
                    <option value="18+">18+</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duração *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-orange-500/50 focus:outline-none"
                    placeholder="Ex: 24 min, 2h 30min"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Episódio (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.episode}
                    onChange={(e) => setFormData(prev => ({ ...prev, episode: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-orange-500/50 focus:outline-none"
                    placeholder="Ex: EP 12, Episódio Final"
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
                  className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-orange-500/50 focus:outline-none"
                  placeholder="Digite um gênero e pressione Enter"
                />
                <button
                  type="button"
                  onClick={addGenre}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  Adicionar
                </button>
              </div>
              {formData.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.genres.map((genre) => (
                    <span
                      key={genre}
                      className="inline-flex items-center space-x-1 bg-orange-600/20 text-orange-400 px-3 py-1 rounded-full text-sm border border-orange-500/30"
                    >
                      <span>{genre}</span>
                      <button
                        type="button"
                        onClick={() => removeGenre(genre)}
                        className="hover:text-orange-300"
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

            {/* Anime Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Anime Relacionado (Opcional)
              </label>
              <select
                value={formData.animeId}
                onChange={(e) => setFormData(prev => ({ ...prev, animeId: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-orange-500/50 focus:outline-none"
                disabled={loadingAnimes}
              >
                <option value="">
                  {loadingAnimes ? 'Carregando animes...' : 'Selecione um anime (opcional)'}
                </option>
                {animes.map((anime) => (
                  <option key={anime.id} value={anime.id}>
                    {anime.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Display Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-2">
                Configurações de Exibição
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ordem de Exibição *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-orange-500/50 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Menor número aparece primeiro</p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-orange-600 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-300">
                    Ativo (visível na homepage)
                  </label>
                </div>
              </div>
            </div>

            {/* Selected Anime Preview */}
            {selectedAnime && (
              <div className="bg-gradient-to-br from-orange-600/10 via-orange-700/5 to-orange-800/5 border border-orange-500/20 rounded-xl p-4">
                <h4 className="text-sm font-medium text-orange-400 mb-3">Anime Selecionado</h4>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-16 bg-gray-700 rounded overflow-hidden flex-shrink-0 relative">
                    {(selectedAnime.posterUrl || selectedAnime.thumbnail) ? (
                      <Image
                        src={(selectedAnime.posterUrl || selectedAnime.thumbnail)!}
                        alt={selectedAnime.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedAnime.title}</p>
                    <p className="text-orange-400 text-sm font-mono">ID: {selectedAnime.id.slice(0, 8)}...</p>
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
            disabled={loading || formData.genres.length === 0}
            className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            )}
            <span>{loading ? 'Criando...' : 'Criar Banner'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}