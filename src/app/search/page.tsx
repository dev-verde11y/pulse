'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { MediumAnimeCard } from '@/components/streaming/AnimeCards'
import { api } from '@/lib/api'
import { Anime } from '@/types/anime'
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const GENRES = [
  'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Horror', 
  'Romance', 'Ficção Científica', 'Slice of Life', 'Esporte',
  'Sobrenatural', 'Suspense', 'Thriller', 'Militar', 'Escola',
  'Música', 'Família', 'Histórico', 'Psicológico', 'Gore'
]

const RATINGS = [
  { value: 'Livre', label: 'Livre' },
  { value: '10+', label: '10+' },
  { value: '12+', label: '12+' },
  { value: '14+', label: '14+' },
  { value: '16+', label: '16+' },
  { value: '18+', label: '18+' }
]

const STATUSES = [
  { value: 'FINISHED', label: 'Finalizado' },
  { value: 'ONGOING', label: 'Em Exibição' },
  { value: 'UPCOMING', label: 'Em Breve' },
  { value: 'CANCELLED', label: 'Cancelado' }
]

const TYPES = [
  { value: 'ANIME', label: 'Anime' },
  { value: 'FILME', label: 'Filme' },
  { value: 'SERIE', label: 'Série' }
]

const SORT_OPTIONS = [
  { value: 'title', label: 'Título A-Z' },
  { value: 'title-desc', label: 'Título Z-A' },
  { value: 'year', label: 'Ano (Mais Recente)' },
  { value: 'year-asc', label: 'Ano (Mais Antigo)' },
  { value: 'rating', label: 'Classificação' }
]

function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Estados
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Filtros
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedRating, setSelectedRating] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [sortBy, setSortBy] = useState('title')
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')

  // Função de busca
  const performSearch = useCallback(async (page = 1) => {
    console.log('performSearch called with:', { query, page, selectedGenres, selectedRating, selectedStatus, selectedType })
    
    // Tratar q=* como busca por todos os animes
    const shouldShowAll = query.trim() === '*'
    const hasSearchCriteria = query.trim() || selectedGenres.length > 0 || selectedRating || selectedStatus || selectedType || shouldShowAll
    
    if (!hasSearchCriteria) {
      console.log('No search criteria, clearing results')
      setAnimes([])
      setTotalResults(0)
      return
    }

    console.log('Starting search with query:', query)
    setLoading(true)
    try {
      const [sortField, sortOrder] = sortBy.includes('-desc') 
        ? [sortBy.replace('-desc', ''), 'desc'] 
        : sortBy.includes('-asc')
        ? [sortBy.replace('-asc', ''), 'asc']
        : [sortBy, 'asc']

      const filters = {
        // Se for *, não enviar parâmetro de busca para retornar todos
        search: shouldShowAll ? undefined : (query.trim() || undefined),
        genre: selectedGenres.length > 0 ? selectedGenres[0] : undefined, // API só suporta 1 gênero por vez
        rating: selectedRating || undefined,
        status: selectedStatus as "FINISHED" | "ONGOING" | "UPCOMING" | "CANCELLED" | undefined,
        type: selectedType as "ANIME" | "FILME" | "SERIE" | undefined,
        sortBy: sortField as "title" | "year" | "rating" | "createdAt" | undefined,
        sortOrder: sortOrder as "asc" | "desc",
        page,
        limit: 20
      }

      console.log('API call with filters:', filters)
      const response = await api.getAnimes(filters)
      console.log('API response:', response)
      
      // Filtrar por múltiplos gêneros no frontend se necessário
      let filteredAnimes = response.animes
      if (selectedGenres.length > 1) {
        filteredAnimes = response.animes.filter(anime => 
          selectedGenres.every(genre => anime.genres?.includes(genre))
        )
      }

      // Filtrar por ano
      if (yearFrom || yearTo) {
        filteredAnimes = filteredAnimes.filter(anime => {
          const animeYear = anime.year
          const fromYear = yearFrom ? parseInt(yearFrom) : 0
          const toYear = yearTo ? parseInt(yearTo) : 9999
          return animeYear >= fromYear && animeYear <= toYear
        })
      }

      console.log('Final filtered animes:', filteredAnimes)
      console.log('About to call setAnimes with:', filteredAnimes)
      setAnimes(filteredAnimes)
      setTotalResults(response.pagination.totalItems)
      setCurrentPage(response.pagination.currentPage)
      setTotalPages(response.pagination.totalPages)
      console.log('State updated - animes count:', filteredAnimes.length)
      console.log('After setAnimes, animes state should be:', filteredAnimes.length)
    } catch (error) {
      console.error('Search error:', error)
      setAnimes([])
      setTotalResults(0)
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
    }
  }, [query, selectedGenres, selectedRating, selectedStatus, selectedType, sortBy, yearFrom, yearTo])

  // Search effect to trigger search when params change
  useEffect(() => {
    const executeSearch = async () => {
      // Tratar q=* como busca por todos os animes
      const shouldShowAll = query.trim() === '*'
      const hasSearchCriteria = query.trim() || selectedGenres.length > 0 || selectedRating || selectedStatus || selectedType || shouldShowAll
      
      if (!hasSearchCriteria) {
        setAnimes([])
        setTotalResults(0)
        return
      }

      setLoading(true)

      const [sortField, sortOrder] = sortBy.includes('-desc')
        ? [sortBy.replace('-desc', ''), 'desc']
        : sortBy.includes('-asc')
        ? [sortBy.replace('-asc', ''), 'asc']
        : [sortBy, 'asc']

      const filters = {
          // Se for *, não enviar parâmetro de busca para retornar todos
          search: shouldShowAll ? undefined : (query.trim() || undefined),
          genre: selectedGenres.length > 0 ? selectedGenres[0] : undefined,
          rating: selectedRating || undefined,
          status: selectedStatus as "FINISHED" | "ONGOING" | "UPCOMING" | "CANCELLED" | undefined,
          type: selectedType as "ANIME" | "FILME" | "SERIE" | undefined,
          sortBy: sortField as "title" | "year" | "rating" | "createdAt" | undefined,
          sortOrder: sortOrder as "asc" | "desc",
          page: currentPage,
          limit: 20
        }

      try {
        const response = await api.getAnimes(filters)
        
        // Filter on frontend if needed
        let filteredAnimes = response.animes
        if (selectedGenres.length > 1) {
          filteredAnimes = response.animes.filter(anime => 
            selectedGenres.every(genre => anime.genres?.includes(genre))
          )
        }

        // Filter by year
        if (yearFrom || yearTo) {
          filteredAnimes = filteredAnimes.filter(anime => {
            const animeYear = anime.year
            const fromYear = yearFrom ? parseInt(yearFrom) : 0
            const toYear = yearTo ? parseInt(yearTo) : 9999
            return animeYear >= fromYear && animeYear <= toYear
          })
        }

        setAnimes(filteredAnimes)
        setTotalResults(response.pagination.totalItems)
        setCurrentPage(response.pagination.currentPage)
        setTotalPages(response.pagination.totalPages)
      } catch (error) {
        console.error('Search error:', error)
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          filters,
          query,
          selectedGenres,
          selectedStatus,
          selectedType
        })
        setAnimes([])
        setTotalResults(0)
      } finally {
        setLoading(false)
      }
    }

    executeSearch()
  }, [query, selectedGenres, selectedRating, selectedStatus, selectedType, sortBy, yearFrom, yearTo, currentPage])

  // Atualizar URL com parâmetros de busca
  useEffect(() => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (selectedGenres.length > 0) params.set('genres', selectedGenres.join(','))
    if (selectedRating) params.set('rating', selectedRating)
    if (selectedStatus) params.set('status', selectedStatus)
    if (selectedType) params.set('type', selectedType)
    if (sortBy !== 'title') params.set('sort', sortBy)
    if (yearFrom) params.set('yearFrom', yearFrom)
    if (yearTo) params.set('yearTo', yearTo)
    if (currentPage > 1) params.set('page', currentPage.toString())

    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search'
    router.replace(newUrl, { scroll: false })
  }, [query, selectedGenres, selectedRating, selectedStatus, selectedType, sortBy, yearFrom, yearTo, currentPage, router])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    performSearch(1)
  }

  const clearFilters = () => {
    setSelectedGenres([])
    setSelectedRating('')
    setSelectedStatus('')
    setSelectedType('')
    setSortBy('title')
    setYearFrom('')
    setYearTo('')
    setCurrentPage(1)
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="bg-black text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Título */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Buscar Animes</h1>
            <p className="text-gray-400">
              {totalResults > 0 && (
                `${totalResults} resultado${totalResults !== 1 ? 's' : ''} encontrado${totalResults !== 1 ? 's' : ''}`
              )}
            </p>
          </div>

          {/* Barra de Busca */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por título, descrição ou gênero..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                Filtros
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </form>

          {/* Painel de Filtros */}
          {showFilters && (
            <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-xl font-bold text-white">Filtros</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1 rounded-lg hover:bg-white/5"
                >
                  Limpar Tudo
                </button>
              </div>

              <div className="space-y-6">
                
                {/* Row 1: Gêneros */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">Gêneros</label>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map(genre => (
                      <button
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                          selectedGenres.includes(genre)
                            ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-transparent border-white/20 text-gray-300 hover:border-white/40 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row 2: Filtros Principais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-white mb-2">Classificação</label>
                    <select
                      value={selectedRating}
                      onChange={(e) => setSelectedRating(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                    >
                      <option value="">Todas</option>
                      {RATINGS.map(rating => (
                        <option key={rating.value} value={rating.value} className="bg-gray-800">{rating.label}</option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-[42px] h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-white mb-2">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                    >
                      <option value="">Todos</option>
                      {STATUSES.map(status => (
                        <option key={status.value} value={status.value} className="bg-gray-800">{status.label}</option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-[42px] h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-white mb-2">Tipo</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                    >
                      <option value="">Todos</option>
                      {TYPES.map(type => (
                        <option key={type.value} value={type.value} className="bg-gray-800">{type.label}</option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-[42px] h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-white mb-2">Ordenar por</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                    >
                      {SORT_OPTIONS.map(option => (
                        <option key={option.value} value={option.value} className="bg-gray-800">{option.label}</option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-[42px] h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Row 3: Período */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Período</label>
                  <div className="flex items-center gap-3 max-w-xs">
                    <input
                      type="number"
                      placeholder="De"
                      value={yearFrom}
                      onChange={(e) => setYearFrom(e.target.value)}
                      min="1960"
                      max="2030"
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                    <span className="text-gray-400 text-sm">até</span>
                    <input
                      type="number"
                      placeholder="Até"
                      value={yearTo}
                      onChange={(e) => setYearTo(e.target.value)}
                      min="1960"
                      max="2030"
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Filtros Ativos */}
              {(selectedGenres.length > 0 || selectedRating || selectedStatus || selectedType || yearFrom || yearTo) && (
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400 mb-3">Filtros ativos:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedGenres.map(genre => (
                      <span key={genre} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm rounded-lg">
                        {genre}
                        <button onClick={() => toggleGenre(genre)} className="hover:text-blue-200 transition-colors">
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                    {selectedRating && (
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm rounded-lg">
                        {selectedRating}
                        <button onClick={() => setSelectedRating('')} className="hover:text-purple-200 transition-colors">
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </span>
                    )}
                    {selectedStatus && (
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-300 text-sm rounded-lg">
                        {STATUSES.find(s => s.value === selectedStatus)?.label}
                        <button onClick={() => setSelectedStatus('')} className="hover:text-green-200 transition-colors">
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </span>
                    )}
                    {selectedType && (
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-sm rounded-lg">
                        {TYPES.find(t => t.value === selectedType)?.label}
                        <button onClick={() => setSelectedType('')} className="hover:text-orange-200 transition-colors">
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </span>
                    )}
                    {(yearFrom || yearTo) && (
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-lg">
                        {yearFrom || '0'} - {yearTo || 'atual'}
                        <button onClick={() => { setYearFrom(''); setYearTo('') }} className="hover:text-red-200 transition-colors">
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Resultados */}
          {!loading && animes.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
                {animes.map(anime => (
                  <MediumAnimeCard key={anime.id} anime={anime} />
                ))}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12 mb-8">
                  {/* Informações da Página */}
                  <div className="text-sm text-gray-400 order-2 sm:order-1">
                    Página {currentPage} de {totalPages} ({totalResults} resultados)
                  </div>
                  
                  {/* Controles de Navegação */}
                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    {/* Primeira Página */}
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 hover:border-white/20 transition-all"
                      title="Primeira página"
                    >
                      ««
                    </button>
                    
                    {/* Página Anterior */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2"
                    >
                      <ChevronDownIcon className="h-4 w-4 rotate-90" />
                      <span className="hidden sm:inline">Anterior</span>
                    </button>

                    {/* Números das Páginas */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 text-sm rounded-lg transition-all ${
                              currentPage === pageNum
                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 border border-blue-400'
                                : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>

                    {/* Próxima Página */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2"
                    >
                      <span className="hidden sm:inline">Próxima</span>
                      <ChevronDownIcon className="h-4 w-4 -rotate-90" />
                    </button>
                    
                    {/* Última Página */}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 hover:border-white/20 transition-all"
                      title="Última página"
                    >
                      »»
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Sem Resultados */}
          {!loading && animes.length === 0 && (query || selectedGenres.length > 0 || selectedRating || selectedStatus || selectedType) && (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum resultado encontrado</h3>
              <p className="text-gray-400 mb-4">
                Tente ajustar seus filtros ou usar termos de busca diferentes.
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          )}

          {/* Estado Inicial */}
          {!loading && animes.length === 0 && !query && selectedGenres.length === 0 && !selectedRating && !selectedStatus && !selectedType && (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Comece sua busca</h3>
              <p className="text-gray-400">
                Digite um termo na barra de busca ou use os filtros para encontrar animes.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SearchPageContent />
    </Suspense>
  )
}