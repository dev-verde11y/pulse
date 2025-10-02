'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { CreateSeasonModal } from '@/components/admin/CreateSeasonModal'
import { ViewSeasonModal } from '@/components/admin/ViewSeasonModal'
import { EditSeasonModal } from '@/components/admin/EditSeasonModal'

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

  const fetchSeasons = useCallback(async (page = 1) => {
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
  }, [sortBy, sortOrder, searchTerm, animeFilter])

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
  }, [fetchSeasons])

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-blue-100">
            Temporadas
          </h1>
          <p className="text-gray-400 mt-1">Gerencie todas as temporadas do catálogo</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nova Temporada</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600/20 via-blue-700/10 to-blue-800/5 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Temporadas</p>
              <p className="text-xl font-bold text-blue-400">{pagination.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 via-green-700/10 to-green-800/5 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Com Episódios</p>
              <p className="text-xl font-bold text-green-400">
                {seasons.filter(season => season._count.episodes > 0).length}
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
              <p className="text-sm text-gray-400">Sem Episódios</p>
              <p className="text-xl font-bold text-yellow-400">
                {seasons.filter(season => season._count.episodes === 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 via-purple-700/10 to-purple-800/5 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM6 6v12h12V6H6zm3-2V2h6v2H9z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Episódios</p>
              <p className="text-xl font-bold text-purple-400">
                {seasons.reduce((total, season) => total + season._count.episodes, 0)}
              </p>
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
              placeholder="Título da temporada..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Anime</label>
            <input
              type="text"
              placeholder="Nome do anime..."
              value={animeFilter}
              onChange={(e) => setAnimeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
            >
              <option value="seasonNumber">Número da Temporada</option>
              <option value="title">Título</option>
              <option value="releaseDate">Data de Lançamento</option>
              <option value="createdAt">Data de Criação</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ordem</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
            >
              <option value="asc">Crescente</option>
              <option value="desc">Decrescente</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setAnimeFilter('')
                setSortBy('seasonNumber')
                setSortOrder('asc')
              }}
              className="w-full px-3 py-2 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Limpar</span>
            </button>
          </div>
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
                        <div className="w-8 h-12 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                          {(season.anime.posterUrl || season.anime.thumbnail) ? (
                            <Image
                              src={(season.anime.posterUrl || season.anime.thumbnail)!}
                              alt={season.anime.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="text-gray-500 text-xs">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
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

      {/* Modals */}
      <CreateSeasonModal
        isOpen={showCreateModal}
        onClose={closeAllModals}
        onSuccess={() => {
          fetchSeasons(pagination.currentPage)
          closeAllModals()
        }}
      />
      
      <ViewSeasonModal
        season={selectedSeason}
        isOpen={showViewModal}
        onClose={closeAllModals}
      />
      
      <EditSeasonModal
        season={selectedSeason}
        isOpen={showEditModal}
        onClose={closeAllModals}
        onSuccess={() => {
          fetchSeasons(pagination.currentPage)
          closeAllModals()
        }}
      />
    </div>
  )
}