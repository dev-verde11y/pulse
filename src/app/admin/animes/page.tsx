'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { CreateAnimeModal } from '@/components/admin/CreateAnimeModal'
import { ViewAnimeModal } from '@/components/admin/ViewAnimeModal'
import { EditAnimeModal } from '@/components/admin/EditAnimeModal'
// Removed lucide-react import - using inline SVGs instead

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
  createdAt: string
  updatedAt: string
  _count: {
    seasons: number
    favorites: number
  }
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNext: boolean
  hasPrevious: boolean
}

export default function AnimesPage() {
  const [animes, setAnimes] = useState<Anime[]>([])
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
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sortBy, setSortBy] = useState('title')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)

  const fetchAnimes = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter })
      })

      const response = await fetch(`/api/animes?${params}`)
      if (!response.ok) throw new Error('Failed to fetch animes')
      
      const data = await response.json()
      setAnimes(data.animes)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching animes:', error)
    } finally {
      setLoading(false)
    }
  }, [sortBy, sortOrder, searchTerm, statusFilter, typeFilter])

  const closeAllModals = () => {
    setShowCreateModal(false)
    setShowViewModal(false)
    setShowEditModal(false)
    setSelectedAnime(null)
  }

  const handleDeleteAnime = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${title}"?`)) return

    try {
      const response = await fetch(`/api/animes/${id}`, { method: 'DELETE' })
      const result = await response.json()

      if (!response.ok) {
        if (response.status === 409 && result.hasEpisodes) {
          alert('Não é possível excluir este anime pois ele possui episódios. Delete os episódios primeiro.')
          return
        }
        throw new Error(result.error || 'Failed to delete anime')
      }

      // Refresh the list
      fetchAnimes(pagination.currentPage)
      alert('Anime excluído com sucesso!')
    } catch (error) {
      console.error('Error deleting anime:', error)
      alert('Erro ao excluir anime. Tente novamente.')
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      FINISHED: 'bg-green-500/20 text-green-400 border-green-500/30',
      ONGOING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      UPCOMING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30'
    }
    return colors[status as keyof typeof colors] || colors.ONGOING
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      ANIME: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      FILME: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      SERIE: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    }
    return colors[type as keyof typeof colors] || colors.ANIME
  }

  useEffect(() => {
    fetchAnimes()
  }, [fetchAnimes])

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-green-100">
            Animes
          </h1>
          <p className="text-gray-400 mt-1">Gerencie todos os animes do catálogo</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Novo Anime</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600/20 via-blue-700/10 to-blue-800/5 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Animes</p>
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
              <p className="text-sm text-gray-400">Finalizados</p>
              <p className="text-xl font-bold text-green-400">
                {animes.filter(anime => anime.status === 'FINISHED').length}
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
              <p className="text-sm text-gray-400">Em Andamento</p>
              <p className="text-xl font-bold text-yellow-400">
                {animes.filter(anime => anime.status === 'ONGOING').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 via-purple-700/10 to-purple-800/5 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Temporadas</p>
              <p className="text-xl font-bold text-purple-400">
                {animes.reduce((total, anime) => total + anime._count.seasons, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Buscar</label>
            <input
              type="text"
              placeholder="Nome do anime..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
            >
              <option value="">Todos</option>
              <option value="ONGOING">Em Andamento</option>
              <option value="FINISHED">Finalizado</option>
              <option value="UPCOMING">Em Breve</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
            >
              <option value="">Todos</option>
              <option value="ANIME">Anime</option>
              <option value="FILME">Filme</option>
              <option value="SERIE">Série</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
            >
              <option value="title">Título</option>
              <option value="year">Ano</option>
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

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('')
                setTypeFilter('')
                setSortBy('title')
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

      {/* Animes List */}
      <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500"></div>
            <p className="text-gray-400 mt-2">Carregando animes...</p>
          </div>
        ) : animes.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">Nenhum anime encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-medium">Anime</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Tipo</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Ano</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Episódios</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Temporadas</th>
                  <th className="text-right p-4 text-gray-300 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {animes.map((anime, index) => (
                  <tr key={anime.id} className={`border-t border-gray-700/50 hover:bg-gray-800/30 transition-colors ${index % 2 === 0 ? 'bg-gray-800/20' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden relative">
                          {(anime.posterUrl || anime.thumbnail) ? (
                            <Image
                              src={(anime.posterUrl || anime.thumbnail)!}
                              alt={anime.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="text-gray-500 text-xs text-center p-1">
                              <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Sem Imagem
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-white font-medium truncate">{anime.title}</h3>
                          <p className="text-sm text-gray-400 truncate">{anime.genres.join(', ')}</p>
                          <p className="text-xs text-gray-500">Classificação: {anime.rating}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(anime.status)}`}>
                        {anime.status === 'FINISHED' && 'Finalizado'}
                        {anime.status === 'ONGOING' && 'Em Andamento'}
                        {anime.status === 'UPCOMING' && 'Em Breve'}
                        {anime.status === 'CANCELLED' && 'Cancelado'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getTypeBadge(anime.type)}`}>
                        {anime.type}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">{anime.year}</td>
                    <td className="p-4 text-gray-300">{anime.totalEpisodes || 'N/A'}</td>
                    <td className="p-4 text-gray-300">{anime._count.seasons}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedAnime(anime)
                            setShowViewModal(true)
                          }}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Visualizar anime"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedAnime(anime)
                            setShowEditModal(true)
                          }}
                          className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                          title="Editar anime"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteAnime(anime.id, anime.title)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Excluir anime"
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
        {!loading && animes.length > 0 && (
          <div className="p-4 border-t border-gray-700/50 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Mostrando {animes.length} de {pagination.totalItems} animes
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchAnimes(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevious}
                className="px-3 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50 transition-colors"
              >
                Anterior
              </button>
              <span className="text-white text-sm">
                Página {pagination.currentPage} de {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchAnimes(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50 transition-colors"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateAnimeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchAnimes(1) // Refresh list and go to first page
          alert('Anime criado com sucesso!')
        }}
      />

      {/* View Modal */}
      <ViewAnimeModal
        anime={selectedAnime}
        isOpen={showViewModal}
        onClose={closeAllModals}
      />

      {/* Edit Modal */}
      <EditAnimeModal
        anime={selectedAnime}
        isOpen={showEditModal}
        onClose={closeAllModals}
        onSuccess={() => {
          fetchAnimes(pagination.currentPage) // Refresh current page
          alert('Anime atualizado com sucesso!')
        }}
      />
    </div>
  )
}