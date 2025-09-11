'use client'

import { useState, useEffect } from 'react'
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

  const fetchAnimes = async (page = 1) => {
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
  }

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
  }, [searchTerm, statusFilter, typeFilter, sortBy, sortOrder])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Gerenciar Animes</h1>
          <p className="text-sm text-gray-400">Criar, editar e gerenciar seus animes</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Novo Anime</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-900/60 border border-gray-700/40 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-400">{pagination.totalItems} animes encontrados</span>
          <button
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('')
              setTypeFilter('')
              setSortBy('title')
              setSortOrder('asc')
            }}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Limpar filtros
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar animes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none transition-colors"
          >
            <option value="">Todos os Status</option>
            <option value="ONGOING">Em Andamento</option>
            <option value="FINISHED">Finalizado</option>
            <option value="UPCOMING">Em Breve</option>
            <option value="CANCELLED">Cancelado</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none transition-colors"
          >
            <option value="">Todos os Tipos</option>
            <option value="ANIME">Anime</option>
            <option value="FILME">Filme</option>
            <option value="SERIE">Série</option>
          </select>

          {/* Sort */}
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 focus:outline-none transition-colors"
            >
              <option value="title">Título</option>
              <option value="year">Ano</option>
              <option value="createdAt">Data</option>
            </select>
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
                        <div className="w-12 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                          {anime.posterUrl || anime.thumbnail ? (
                            <img 
                              src={anime.posterUrl || anime.thumbnail} 
                              alt={anime.title} 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`text-gray-500 text-xs text-center p-1 ${anime.posterUrl || anime.thumbnail ? 'hidden' : ''}`}>
                            <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Sem Imagem
                          </div>
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