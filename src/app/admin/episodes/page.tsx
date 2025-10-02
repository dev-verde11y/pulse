'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { CreateEpisodeModal } from '@/components/admin/CreateEpisodeModal'
import { ViewEpisodeModal } from '@/components/admin/ViewEpisodeModal'
import { EditEpisodeModal } from '@/components/admin/EditEpisodeModal'

interface Episode {
  id: string
  episodeNumber: number
  title: string
  description?: string
  duration?: number
  thumbnail?: string
  thumbnailUrl?: string
  videoUrl?: string
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

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNext: boolean
  hasPrevious: boolean
}

export default function EpisodesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
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
  const [seasonFilter, setSeasonFilter] = useState('')
  const [sortBy, setSortBy] = useState('episodeNumber')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)

  const fetchEpisodes = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(animeFilter && { anime: animeFilter }),
        ...(seasonFilter && { season: seasonFilter })
      })

      const response = await fetch(`/api/episodes?${params}`)
      if (!response.ok) throw new Error('Failed to fetch episodes')
      
      const data = await response.json()
      setEpisodes(data.episodes)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching episodes:', error)
    } finally {
      setLoading(false)
    }
  }

  const closeAllModals = () => {
    setShowCreateModal(false)
    setShowViewModal(false)
    setShowEditModal(false)
    setSelectedEpisode(null)
  }

  const handleSuccess = () => {
    fetchEpisodes(pagination.currentPage)
    closeAllModals()
  }

  const handleView = (episode: Episode) => {
    setSelectedEpisode(episode)
    setShowViewModal(true)
  }

  const handleEdit = (episode: Episode) => {
    setSelectedEpisode(episode)
    setShowEditModal(true)
  }

  const handleDelete = async (episode: Episode) => {
    if (!confirm(`Tem certeza que deseja excluir o episódio "${episode.title}"?`)) return

    try {
      const response = await fetch(`/api/episodes/${episode.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir episódio')
      }

      fetchEpisodes(pagination.currentPage)
    } catch (error) {
      console.error('Error deleting episode:', error)
      alert(error instanceof Error ? error.message : 'Erro ao excluir episódio')
    }
  }

  useEffect(() => {
    fetchEpisodes()
  }, [sortBy, sortOrder, searchTerm, animeFilter, seasonFilter])

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds === 0) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    }
    return `${minutes}m`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-100">
            Episódios
          </h1>
          <p className="text-gray-400 mt-1">Gerencie todos os episódios do catálogo</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Novo Episódio</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600/20 via-blue-700/10 to-blue-800/5 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Episódios</p>
              <p className="text-xl font-bold text-blue-400">{pagination.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 via-green-700/10 to-green-800/5 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Com Vídeo</p>
              <p className="text-xl font-bold text-green-400">
                {episodes.filter(ep => ep.videoUrl).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-600/20 via-yellow-700/10 to-yellow-800/5 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Pendentes</p>
              <p className="text-xl font-bold text-yellow-400">
                {episodes.filter(ep => !ep.videoUrl).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 via-purple-700/10 to-purple-800/5 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Páginas</p>
              <p className="text-xl font-bold text-purple-400">{pagination.totalPages}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Buscar</label>
            <input
              type="text"
              placeholder="Título do episódio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Anime</label>
            <input
              type="text"
              placeholder="Filtrar por anime..."
              value={animeFilter}
              onChange={(e) => setAnimeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Temporada</label>
            <input
              type="text"
              placeholder="Número da temporada..."
              value={seasonFilter}
              onChange={(e) => setSeasonFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
            >
              <option value="episodeNumber">Número</option>
              <option value="title">Título</option>
              <option value="airDate">Data de Lançamento</option>
              <option value="createdAt">Data de Criação</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ordem</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
            >
              <option value="asc">Crescente</option>
              <option value="desc">Decrescente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Episodes Table */}
      <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
              <span className="ml-2 text-gray-400">Carregando episódios...</span>
            </div>
          ) : episodes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Nenhum episódio encontrado</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Episódio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Anime / Temporada
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Duração
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Lançamento
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {episodes.map((episode) => (
                  <tr key={episode.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-8 bg-gray-700 rounded overflow-hidden flex-shrink-0 relative">
                          {(episode.thumbnailUrl || episode.thumbnail) ? (
                            <Image
                              src={(episode.thumbnailUrl || episode.thumbnail)!}
                              alt={episode.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-700">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            Ep. {episode.episodeNumber} - {episode.title}
                          </p>
                          {episode.description && (
                            <p className="text-sm text-gray-400 truncate max-w-xs">
                              {episode.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-white font-medium">{episode.season.anime.title}</p>
                        <p className="text-sm text-gray-400">
                          Temporada {episode.season.seasonNumber}
                          {episode.season.title && ` - ${episode.season.title}`}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-300">{formatDuration(episode.duration)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        episode.videoUrl 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {episode.videoUrl ? 'Disponível' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-300">{formatDate(episode.airDate)}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleView(episode)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                          title="Visualizar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(episode)}
                          className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-all duration-200"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(episode)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                          title="Excluir"
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
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-700/30 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                disabled={!pagination.hasPrevious}
                onClick={() => fetchEpisodes(pagination.currentPage - 1)}
                className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-400 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                disabled={!pagination.hasNext}
                onClick={() => fetchEpisodes(pagination.currentPage + 1)}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-400 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Mostrando {(pagination.currentPage - 1) * 10 + 1} a {Math.min(pagination.currentPage * 10, pagination.totalItems)} de {pagination.totalItems} resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    disabled={!pagination.hasPrevious}
                    onClick={() => fetchEpisodes(pagination.currentPage - 1)}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const pageNum = index + 1
                    const isCurrentPage = pageNum === pagination.currentPage
                    
                    if (pagination.totalPages > 7) {
                      if (pageNum === 1 || pageNum === pagination.totalPages || 
                          (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => fetchEpisodes(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              isCurrentPage
                                ? 'z-10 bg-blue-600 border-blue-600 text-white'
                                : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      } else if (pageNum === pagination.currentPage - 2 || pageNum === pagination.currentPage + 2) {
                        return <span key={pageNum} className="relative inline-flex items-center px-4 py-2 border border-gray-600 bg-gray-800 text-sm font-medium text-gray-400">...</span>
                      }
                      return null
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchEpisodes(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          isCurrentPage
                            ? 'z-10 bg-blue-600 border-blue-600 text-white'
                            : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  
                  <button
                    disabled={!pagination.hasNext}
                    onClick={() => fetchEpisodes(pagination.currentPage + 1)}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateEpisodeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleSuccess}
      />
      
      <ViewEpisodeModal
        episode={selectedEpisode}
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
      />
      
      <EditEpisodeModal
        episode={selectedEpisode}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}