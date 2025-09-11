'use client'

import { useState, useEffect, useCallback } from 'react'
import { CreateHeroBannerModal } from '@/components/admin/CreateHeroBannerModal'
import { EditHeroBannerModal } from '@/components/admin/EditHeroBannerModal'

interface HeroBanner {
  id: string
  title: string
  subtitle: string
  description: string
  backgroundImage: string
  logo?: string
  type: string
  year: number
  rating: string
  duration: string
  episode?: string
  genres: string[]
  displayOrder: number
  isActive: boolean
  animeId?: string
  anime?: {
    id: string
    title: string
    posterUrl?: string
    thumbnail?: string
  }
  createdAt: string
  updatedAt: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNext: boolean
  hasPrevious: boolean
}

export default function HeroBannersPage() {
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([])
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
  const [sortBy, setSortBy] = useState('displayOrder')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState<HeroBanner | null>(null)

  const fetchHeroBanners = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { isActive: statusFilter }),
        ...(typeFilter && { type: typeFilter })
      })

      const response = await fetch(`/api/hero-banners?${params}`)
      if (!response.ok) throw new Error('Failed to fetch hero banners')
      
      const data = await response.json()
      setHeroBanners(data.heroBanners)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching hero banners:', error)
    } finally {
      setLoading(false)
    }
  }, [sortBy, sortOrder, searchTerm, statusFilter, typeFilter])

  const closeAllModals = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setSelectedBanner(null)
  }

  const handleSuccess = () => {
    fetchHeroBanners(pagination.currentPage)
    closeAllModals()
  }

  const handleEdit = (banner: HeroBanner) => {
    setSelectedBanner(banner)
    setShowEditModal(true)
  }

  const handleDelete = async (banner: HeroBanner) => {
    if (!confirm(`Tem certeza que deseja excluir o hero banner "${banner.title}"?`)) return

    try {
      const response = await fetch(`/api/hero-banners/${banner.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir hero banner')
      }

      fetchHeroBanners(pagination.currentPage)
    } catch (error) {
      console.error('Error deleting hero banner:', error)
      alert(error instanceof Error ? error.message : 'Erro ao excluir hero banner')
    }
  }

  const handleToggleActive = async (banner: HeroBanner) => {
    try {
      const response = await fetch(`/api/hero-banners/${banner.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !banner.isActive })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar status')
      }

      fetchHeroBanners(pagination.currentPage)
    } catch (error) {
      console.error('Error toggling banner status:', error)
      alert(error instanceof Error ? error.message : 'Erro ao atualizar status')
    }
  }

  useEffect(() => {
    fetchHeroBanners()
  }, [fetchHeroBanners])

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-red-100">
            Hero Banners
          </h1>
          <p className="text-gray-400 mt-1">Gerencie os banners principais da homepage</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Novo Banner</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-600/20 via-orange-700/10 to-orange-800/5 border border-orange-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Banners</p>
              <p className="text-xl font-bold text-orange-400">{pagination.totalItems}</p>
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
              <p className="text-sm text-gray-400">Ativos</p>
              <p className="text-xl font-bold text-green-400">
                {heroBanners.filter(b => b.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-600/20 via-red-700/10 to-red-800/5 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Inativos</p>
              <p className="text-xl font-bold text-red-400">
                {heroBanners.filter(b => !b.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600/20 via-blue-700/10 to-blue-800/5 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM3 8v12a1 1 0 001 1h16a1 1 0 001-1V8H3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Com Anime</p>
              <p className="text-xl font-bold text-blue-400">
                {heroBanners.filter(b => b.animeId).length}
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
              placeholder="Título do banner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-orange-500/50 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-orange-500/50 focus:outline-none"
            >
              <option value="">Todos</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-orange-500/50 focus:outline-none"
            >
              <option value="">Todos</option>
              <option value="anime">Anime</option>
              <option value="filme">Filme</option>
              <option value="serie">Série</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-orange-500/50 focus:outline-none"
            >
              <option value="displayOrder">Ordem de Exibição</option>
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
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-orange-500/50 focus:outline-none"
            >
              <option value="asc">Crescente</option>
              <option value="desc">Decrescente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Banners Table */}
      <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"></div>
              <span className="ml-2 text-gray-400">Carregando banners...</span>
            </div>
          ) : heroBanners.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Nenhum banner encontrado</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Banner
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Informações
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Anime Relacionado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ordem
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {heroBanners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-12 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={banner.backgroundImage} 
                            alt={banner.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.parentElement!.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-gray-700 text-gray-500">
                                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              `
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-white font-medium">{banner.title}</p>
                          <p className="text-sm text-gray-400">{banner.subtitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-white text-sm">{banner.type} • {banner.year}</p>
                        <p className="text-gray-400 text-sm">{banner.rating} • {banner.duration}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {banner.genres.slice(0, 3).map((genre) => (
                            <span
                              key={genre}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30"
                            >
                              {genre}
                            </span>
                          ))}
                          {banner.genres.length > 3 && (
                            <span className="text-xs text-gray-500">+{banner.genres.length - 3}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {banner.anime ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-10 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                            {banner.anime.posterUrl || banner.anime.thumbnail ? (
                              <img 
                                src={banner.anime.posterUrl || banner.anime.thumbnail} 
                                alt={banner.anime.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-500">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{banner.anime.title}</p>
                            <p className="text-gray-400 text-xs">ID: {banner.anime.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Não vinculado</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggleActive(banner)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          banner.isActive
                            ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                        } transition-colors`}
                      >
                        {banner.isActive ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-white font-medium">{banner.displayOrder}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(banner)}
                          className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-all duration-200"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(banner)}
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
                onClick={() => fetchHeroBanners(pagination.currentPage - 1)}
                className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-400 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                disabled={!pagination.hasNext}
                onClick={() => fetchHeroBanners(pagination.currentPage + 1)}
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
                    onClick={() => fetchHeroBanners(pagination.currentPage - 1)}
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
                            onClick={() => fetchHeroBanners(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              isCurrentPage
                                ? 'z-10 bg-orange-600 border-orange-600 text-white'
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
                        onClick={() => fetchHeroBanners(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          isCurrentPage
                            ? 'z-10 bg-orange-600 border-orange-600 text-white'
                            : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  
                  <button
                    disabled={!pagination.hasNext}
                    onClick={() => fetchHeroBanners(pagination.currentPage + 1)}
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
      <CreateHeroBannerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleSuccess}
      />
      
      <EditHeroBannerModal
        banner={selectedBanner}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}