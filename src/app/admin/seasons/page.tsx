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

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNext: boolean
  hasPrevious: boolean
}

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrevious: false
  })
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [animeFilter, setAnimeFilter] = useState('')
  const [sortBy, setSortBy] = useState('seasonNumber')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null)

  const fetchSeasons = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(animeFilter && { animeId: animeFilter })
      })

      const response = await fetch(`/api/seasons?${params}`)
      if (!response.ok) throw new Error('Failed to fetch seasons')
      
      const data = await response.json()
      setSeasons(data.seasons)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching seasons:', error)
    } finally {
      setLoading(false)
    }
  }

  const closeAllModals = () => {
    setShowCreateModal(false)
    setShowViewModal(false)
    setShowEditModal(false)
    setSelectedSeason(null)
  }

  const handleDeleteSeason = async (id: string, seasonNumber: number, animeTitle: string) => {
    if (!confirm(`Tem certeza que deseja excluir a temporada ${seasonNumber} de "${animeTitle}"?`)) return

    try {
      const response = await fetch(`/api/seasons/${id}`, { method: 'DELETE' })
      const result = await response.json()

      if (!response.ok) {
        if (response.status === 409 && result.hasEpisodes) {
          alert(`Não é possível excluir esta temporada pois ela possui ${result.episodeCount} episódios. Delete os episódios primeiro.`)
          return
        }
        throw new Error(result.error || 'Failed to delete season')
      }

      // Refresh the list
      fetchSeasons(pagination.currentPage)
      alert('Temporada excluída com sucesso!')
    } catch (error) {
      console.error('Error deleting season:', error)
      alert('Erro ao excluir temporada. Tente novamente.')
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  useEffect(() => {
    fetchSeasons()
  }, [searchTerm, animeFilter, sortBy, sortOrder])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Gerenciar Temporadas</h1>
          <p className="text-sm text-gray-400">Criar, editar e gerenciar temporadas dos animes</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nova Temporada</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-900/60 border border-gray-700/40 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-400">{pagination.totalItems} temporadas encontradas</span>
          <button
            onClick={() => {
              setSearchTerm('')
              setAnimeFilter('')
              setSortBy('seasonNumber')
              setSortOrder('asc')
            }}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Limpar filtros
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar temporadas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Anime Filter */}
          <input
            type="text"
            placeholder="Filtrar por anime..."
            value={animeFilter}
            onChange={(e) => setAnimeFilter(e.target.value)}
            className="px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none transition-colors"
          />

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none transition-colors"
          >
            <option value="seasonNumber">Número da Temporada</option>
            <option value="title">Título</option>
            <option value="releaseDate">Data de Lançamento</option>
            <option value="createdAt">Data de Criação</option>
          </select>

          {/* Sort Direction */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white hover:bg-gray-700/50 transition-colors flex items-center justify-center"
            title={sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sortOrder === 'asc' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Seasons List */}
      <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-purple-500"></div>
            <p className="text-gray-400 mt-2">Carregando temporadas...</p>
          </div>
        ) : seasons.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">Nenhuma temporada encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-medium">Temporada</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Anime</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Título</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Episódios</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Lançamento</th>
                  <th className="text-right p-4 text-gray-300 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {seasons.map((season, index) => (
                  <tr key={season.id} className={`border-t border-gray-700/50 hover:bg-gray-800/30 transition-colors ${index % 2 === 0 ? 'bg-gray-800/20' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-600/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                          <span className="text-purple-400 font-bold text-sm">{season.seasonNumber}</span>
                        </div>
                        <div>
                          <div className="text-white font-medium">Temporada {season.seasonNumber}</div>
                          <div className="text-xs text-gray-500">#{season.seasonNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-12 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {season.anime.posterUrl || season.anime.thumbnail ? (
                            <img 
                              src={season.anime.posterUrl || season.anime.thumbnail} 
                              alt={season.anime.title} 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`text-gray-500 text-xs ${season.anime.posterUrl || season.anime.thumbnail ? 'hidden' : ''}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-white font-medium truncate">{season.anime.title}</h3>
                          <p className="text-xs text-gray-500">ID: {season.anime.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-white font-medium">{season.title || 'Sem título'}</div>
                      {season.description && (
                        <p className="text-sm text-gray-400 truncate max-w-xs">{season.description}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-bold">{season._count.episodes}</span>
                        <span className="text-gray-400 text-sm">eps</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">
                      <div className="text-sm">
                        <div>{formatDate(season.releaseDate)}</div>
                        {season.endDate && (
                          <div className="text-xs text-gray-500">até {formatDate(season.endDate)}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedSeason(season)
                            setShowViewModal(true)
                          }}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Visualizar temporada"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedSeason(season)
                            setShowEditModal(true)
                          }}
                          className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                          title="Editar temporada"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteSeason(season.id, season.seasonNumber, season.anime.title)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Excluir temporada"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && seasons.length > 0 && (
          <div className="p-4 border-t border-gray-700/50 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Mostrando {seasons.length} de {pagination.totalItems} temporadas
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchSeasons(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevious}
                className="px-3 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50 transition-colors"
              >
                Anterior
              </button>
              <span className="text-white text-sm">
                Página {pagination.currentPage} de {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchSeasons(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50 transition-colors"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals will be added here */}
    </div>
  )
}